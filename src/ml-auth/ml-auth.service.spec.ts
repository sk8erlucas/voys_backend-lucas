import { Test, TestingModule } from '@nestjs/testing';
import { MLAuthService } from './ml-auth.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

jest.mock('axios');

describe('MLAuthService', () => {
  let service: MLAuthService;
  let prismaService: PrismaService;

  const mockStore = {
    id: 1,
    state: 'test-state',
    ml_fantazy_name: 'Test Store',
    real_name: 'Nombre Real',
    ml_user_id: 'ML123456',
    cut_schedule: '18:00',
    active: true,
    vinculated: false,
    notes: 'Test notes',
    customer_id: 1,
    shipping_method_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockMLToken = {
    id: 1,
    ml_access_token: 'access_token',
    ml_refresh_token: 'refresh_token',
    ml_token_type: 'bearer',
    ml_expires_in: 21600,
    ml_scope: 'offline_access read write',
    store_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MLAuthService,
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn().mockResolvedValue(undefined),
            $disconnect: jest.fn().mockResolvedValue(undefined),
            store: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            mLToken: {
              upsert: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'ML_CLIENT_ID') return 'test-client-id';
              if (key === 'ML_CLIENT_SECRET') return 'test-client-secret';
              if (key === 'ML_REDIRECT_URI') return 'http://test-redirect-uri.com';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MLAuthService>(MLAuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAccessToken', () => {
    it('should throw an error if state is undefined', async () => {
      await expect(service.getAccessToken('code', undefined)).rejects.toThrow('RESOURCE_NOT_FOUND');
    });

    it('should throw NotFoundException if store is not found', async () => {
      jest.spyOn(prismaService.store, 'findUnique').mockResolvedValue(null);
      await expect(service.getAccessToken('code', 'state')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if store is already vinculated', async () => {
      jest.spyOn(prismaService.store, 'findUnique').mockResolvedValue({ ...mockStore, vinculated: true });
      await expect(service.getAccessToken('code', 'state')).rejects.toThrow('ALREADY_VINCULATED_STORE');
    });

    it('should get access token and update store and MLToken', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'access_token',
          refresh_token: 'refresh_token',
          token_type: 'bearer',
          expires_in: 21600,
          scope: 'offline_access read write',
        },
      };
      const mockMLUserData = { id: 'ML123', nickname: 'TestUser' };

      jest.spyOn(prismaService.store, 'findUnique').mockResolvedValue(mockStore);
      (axios.post as jest.Mock).mockResolvedValue(mockTokenResponse);
      jest.spyOn(service, 'getMLUserData').mockResolvedValue(mockMLUserData);
      jest.spyOn(prismaService.store, 'update').mockResolvedValue({ ...mockStore, vinculated: true });
      jest.spyOn(prismaService.mLToken, 'upsert').mockResolvedValue(mockMLToken);

      const result = await service.getAccessToken('code', 'state');

      expect(result).toEqual(mockMLToken);
      expect(prismaService.store.update).toHaveBeenCalled();
      expect(prismaService.mLToken.upsert).toHaveBeenCalled();
    });

    it('should throw an error if API call to get ML user data fails', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'access_token',
          refresh_token: 'refresh_token',
          token_type: 'bearer',
          expires_in: 21600,
          scope: 'offline_access read write',
        },
      };

      jest.spyOn(prismaService.store, 'findUnique').mockResolvedValue(mockStore);
      (axios.post as jest.Mock).mockResolvedValue(mockTokenResponse);
      jest.spyOn(service, 'getMLUserData').mockRejectedValue(new Error('API Error'));

      await expect(service.getAccessToken('code', 'state')).rejects.toThrow('Failed to fetch access token: API Error');
    });
  });

  describe('refreshToken', () => {
    const mockTokenData = {
      id: 1,
      ml_access_token: 'old_access_token',
      ml_refresh_token: 'old_refresh_token',
      ml_token_type: 'bearer',
      ml_expires_in: 21600,
      ml_scope: 'offline_access read write',
      store_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should throw an error if token data is not found', async () => {
      jest.spyOn(prismaService.mLToken, 'findUnique').mockResolvedValue(null);
      await expect(service.refreshToken(1)).rejects.toThrow('Token data not found for the store');
    });

    it('should refresh token and update MLToken', async () => {
      jest.spyOn(prismaService.mLToken, 'findUnique').mockResolvedValue(mockTokenData);
      
      const mockRefreshResponse = {
        data: {
          access_token: 'new_access_token',
          refresh_token: 'new_refresh_token',
          expires_in: 21600,
          scope: 'offline_access read write',
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(mockRefreshResponse);

      const updateSpy = jest.spyOn(prismaService.mLToken, 'update').mockResolvedValue({
        ...mockTokenData,
        ml_access_token: 'new_access_token',
        ml_refresh_token: 'new_refresh_token',
      });

      const result = await service.refreshToken(1);

      expect(result).toEqual({
        ...mockTokenData,
        ml_access_token: 'new_access_token',
        ml_refresh_token: 'new_refresh_token',
      });
      expect(updateSpy).toHaveBeenCalledWith({
        where: { store_id: 1 },
        data: {
          ml_access_token: 'new_access_token',
          ml_refresh_token: 'new_refresh_token',
          ml_expires_in: 21600,
          ml_scope: 'offline_access read write',
        },
      });
    });

    it('should handle errors when refreshing token', async () => {
      jest.spyOn(prismaService.mLToken, 'findUnique').mockResolvedValue(mockTokenData);
      (axios.post as jest.Mock).mockRejectedValue(new Error('Refresh Token Error'));

      await expect(service.refreshToken(1)).rejects.toThrow('Failed to refresh token: Refresh Token Error');
    });

    it('should handle expired or invalid refresh tokens', async () => {
      jest.spyOn(prismaService.mLToken, 'findUnique').mockResolvedValue(mockTokenData);
      (axios.post as jest.Mock).mockRejectedValue({
        response: { data: { message: 'expired' } },
      });

      await expect(service.refreshToken(1)).rejects.toThrow('Refresh token is expired or invalid. Please reauthorize the application. Visit: https://auth.mercadolibre.com.ar/authorization');
    });
  });

  describe('getValidToken', () => {
    it('should throw an error if token data is not found', async () => {
      jest.spyOn(prismaService.mLToken, 'findUnique').mockResolvedValue(null);
      await expect(service.getValidToken(1)).rejects.toThrow('Token data not found for the store');
    });

    it('should return existing token if not expired', async () => {
      const mockTokenData = {
        ...mockMLToken,
        updated_at: new Date(),
        ml_expires_in: 21600,
      };
      jest.spyOn(prismaService.mLToken, 'findUnique').mockResolvedValue(mockTokenData);

      const result = await service.getValidToken(1);

      expect(result).toEqual(mockTokenData);
    });

    it('should refresh token if expired', async () => {
      const mockTokenData = {
        ...mockMLToken,
        updated_at: new Date(Date.now() - 22000 * 1000),
        ml_expires_in: 21600,
      };
      const mockRefreshedToken = { ...mockMLToken, ml_access_token: 'new_access_token' };

      jest.spyOn(prismaService.mLToken, 'findUnique').mockResolvedValue(mockTokenData);
      jest.spyOn(service, 'refreshToken').mockResolvedValue(mockRefreshedToken);

      const result = await service.getValidToken(1);

      expect(result).toEqual(mockRefreshedToken);
      expect(service.refreshToken).toHaveBeenCalled();
    });

    it('should throw an error if refreshToken fails', async () => {
      const mockTokenData = {
        ...mockMLToken,
        updated_at: new Date(Date.now() - 22000 * 1000),
        ml_expires_in: 21600,
      };

      jest.spyOn(prismaService.mLToken, 'findUnique').mockResolvedValue(mockTokenData);
      jest.spyOn(service, 'refreshToken').mockRejectedValue(new Error('Refresh Token Error'));

      await expect(service.getValidToken(1)).rejects.toThrow('Refresh Token Error');
    });
  });

  describe('getMLUserData', () => {
    it('should return user data', async () => {
      const mockUserData = { id: 'ML123', nickname: 'TestUser' };
      (axios.get as jest.Mock).mockResolvedValue({ data: mockUserData });

      const result = await service.getMLUserData('access_token');

      expect(result).toEqual(mockUserData);
      expect(axios.get).toHaveBeenCalledWith('https://api.mercadolibre.com/users/me', {
        headers: { Authorization: 'Bearer access_token' },
      });
    });

    it('should throw an error if API call fails', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('API Error'));

      await expect(service.getMLUserData('access_token')).rejects.toThrow('Failed to fetch ML user data: API Error');
    });
  });

  describe('onModuleInit', () => {
    it('should connect to the database', async () => {
      await service.onModuleInit();
      expect(prismaService.$connect).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from the database', async () => {
      await service.onModuleDestroy();
      expect(prismaService.$disconnect).toHaveBeenCalled();
    });
  });
});