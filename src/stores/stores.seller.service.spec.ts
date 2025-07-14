import { Test, TestingModule } from '@nestjs/testing';
import { StoresSellerService } from './stores.seller.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { PrismaErrorCodes } from '@src/errors/prisma-error-codes.enum';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

describe('StoresSellerService', () => {
  let service: StoresSellerService;
  let prismaService: PrismaService;

  const mockStore = {
    id: 1,
    cut_schedule: '18:00',
    active: true,
    notes: 'Test store',
    shipping_method_id: 1,
    customer: {
      id: 1,
      user: {
        id: 1,
        name: 'Test User',
      }
    },
    shipping_method: {
      name: 'Test Shipping Method',
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresSellerService,
        {
          provide: PrismaService,
          useValue: {
            customer: {
              findUnique: jest.fn(),
            },
            store: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $connect: jest.fn().mockResolvedValue(undefined),
            $disconnect: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<StoresSellerService>(StoresSellerService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createStore', () => {
    it('should create a store', async () => {
      const createStoreDto: CreateStoreDto = {
        cut_schedule: '18:00',
        active: true,
        notes: 'Test store',
        shipping_method_id: 1,
      };
      (prismaService.customer.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prismaService.store.create as jest.Mock).mockResolvedValue(mockStore);
      const result = await service.createStore(createStoreDto, 1);
      expect(result).toEqual(mockStore);
    });

    it('should throw ForbiddenException if email is already registered', async () => {
      const createStoreDto: CreateStoreDto = {
        cut_schedule: '18:00',
        active: true,
        notes: 'Test store',
        shipping_method_id: 1,
      };
      const error = new Error('Unique constraint failed');
      (error as any).code = PrismaErrorCodes.UNIQUE_CONSTRAINT_FAILED;
      (prismaService.customer.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prismaService.store.create as jest.Mock).mockRejectedValue(error);
      await expect(service.createStore(createStoreDto, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllStores', () => {
    it('should return an array of stores', async () => {
      (prismaService.store.findMany as jest.Mock).mockResolvedValue([mockStore]);
      const result = await service.findAllStores(1);
      expect(result).toEqual([mockStore]);
    });

    it('should return an empty array if no stores found', async () => {
      (prismaService.store.findMany as jest.Mock).mockResolvedValue(null);
      const result = await service.findAllStores(1);
      expect(result).toEqual([]);
    });
  });

  describe('findStoreById', () => {
    it('should return a store if found', async () => {
      (prismaService.store.findUnique as jest.Mock).mockResolvedValue(mockStore);
      const result = await service.findStoreById(1, 1);
      expect(result).toEqual(mockStore);
    });

    it('should throw NotFoundException if store not found', async () => {
      (prismaService.store.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findStoreById(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStore', () => {
    it('should update and return the store', async () => {
      const updateStoreDto: UpdateStoreDto = {
        cut_schedule: '19:00',
        active: false,
        notes: 'Updated notes',
        shipping_method_id: 2,
      };
      (prismaService.store.findFirst as jest.Mock).mockResolvedValue(mockStore);
      const updatedStore = { ...mockStore, ...updateStoreDto };
      (prismaService.store.update as jest.Mock).mockResolvedValue(updatedStore);
      const result = await service.updateStore(1, updateStoreDto, 1);
      expect(result).toEqual(updatedStore);
    });

    it('should throw NotFoundException if store not found', async () => {
      const updateStoreDto: UpdateStoreDto = {
        shipping_method_id: 2,
      };
      (prismaService.store.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(service.updateStore(1, updateStoreDto, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteStore', () => {
    it('should delete and return the store', async () => {
      (prismaService.store.findFirst as jest.Mock).mockResolvedValue(mockStore);
      (prismaService.store.delete as jest.Mock).mockResolvedValue(mockStore);
      const result = await service.deleteStore(1, 1);
      expect(result).toEqual(mockStore);
    });

    it('should throw NotFoundException if store not found', async () => {
      (prismaService.store.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(service.deleteStore(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if Prisma throws REQUIRED_RECORDS_NOT_FOUND', async () => {
      (prismaService.store.findFirst as jest.Mock).mockResolvedValue(mockStore);
      const error = new Error('Record not found');
      (error as any).code = PrismaErrorCodes.REQUIRED_RECORDS_NOT_FOUND;
      (prismaService.store.delete as jest.Mock).mockRejectedValue(error);
      await expect(service.deleteStore(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw the original error if it\'s not a "not found" error', async () => {
      (prismaService.store.findFirst as jest.Mock).mockResolvedValue(mockStore);
      const error = new Error('Some other error');
      (prismaService.store.delete as jest.Mock).mockRejectedValue(error);
      await expect(service.deleteStore(1, 1)).rejects.toThrow('Some other error');
    });
  });

  describe('onModuleInit', () => {
    it('should connect to the Prisma service', async () => {
      const connectSpy = jest.spyOn(prismaService, '$connect').mockResolvedValue(undefined);
      await service.onModuleInit();
      expect(connectSpy).toHaveBeenCalled();
      connectSpy.mockRestore(); // Restaurar el espía
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from the Prisma service', async () => {
      const disconnectSpy = jest.spyOn(prismaService, '$disconnect').mockResolvedValue(undefined);
      await service.onModuleDestroy();
      expect(disconnectSpy).toHaveBeenCalled();
      disconnectSpy.mockRestore(); // Restaurar el espía
    });
  });
});
