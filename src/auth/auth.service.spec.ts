import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@src/auth/auth.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { UsersService } from '@src/users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { User } from '@prisma/client';
import { UpdateUserDto } from '@src/users/dto/update-user.dto';
import * as bcryptUtil from '@src/utils/bcrypt.util';

jest.mock('@src/utils/bcrypt.util');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
    } as unknown as PrismaService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findUserByEmail: jest.fn(),
            findUserById: jest.fn(),
            changePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const mockUser: User & { role: { name: string } } = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test',
        last_name: 'User',
        active: true,
        role_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        role: { name: 'user' }
      };
      jest.spyOn(usersService, 'findUserByEmail').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockToken');
      (bcryptUtil.comparePassword as jest.Mock).mockReturnValue(true);

      const result = await service.login({ email: 'test@example.com', password: 'correctPassword' });

      expect(result).toEqual({ access_token: 'mockToken' });
    });

    it('should throw INVALID_CREDENTIALS for non-existent user', async () => {
      jest.spyOn(usersService, 'findUserByEmail').mockResolvedValue(null);

      await expect(service.login({ email: 'nonexistent@example.com', password: 'anyPassword' }))
        .rejects.toEqual(ErrorCodes.INVALID_CREDENTIALS);
    });

    it('should throw INVALID_CREDENTIALS for incorrect password', async () => {
      const mockUser: User & { role: { name: string } } = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test',
        last_name: 'User',
        active: true,
        role_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        role: { name: 'user' }
      };
      jest.spyOn(usersService, 'findUserByEmail').mockResolvedValue(mockUser);
      (bcryptUtil.comparePassword as jest.Mock).mockReturnValue(false);

      await expect(service.login({ email: 'test@example.com', password: 'wrongPassword' }))
        .rejects.toEqual(ErrorCodes.INVALID_CREDENTIALS);
    });
  });

  describe('changePassword', () => {
    it('should change password for valid current password', async () => {
      const mockUser: User & { role: { name: string } } = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedOldPassword',
        name: 'Test',
        last_name: 'User',
        active: true,
        role_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        role: { name: 'user' }
      };
      jest.spyOn(usersService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(usersService, 'changePassword').mockResolvedValue({} as User);
      (bcryptUtil.comparePassword as jest.Mock).mockReturnValue(true);

      const updateUserDto: UpdateUserDto = {
        name: 'Test',
        last_name: 'User',
        password: 'oldPassword',
        new_password: 'newPassword'
      };

      await service.changePassword(1, updateUserDto);

      expect(usersService.changePassword).toHaveBeenCalledWith(1, 'newPassword');
    });

    it('should throw INVALID_CREDENTIALS for incorrect current password', async () => {
      const mockUser: User & { role: { name: string } } = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedOldPassword',
        name: 'Test',
        last_name: 'User',
        active: true,
        role_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        role: { name: 'user' }
      };
      jest.spyOn(usersService, 'findUserById').mockResolvedValue(mockUser);
      (bcryptUtil.comparePassword as jest.Mock).mockReturnValue(false);

      const updateUserDto: UpdateUserDto = {
        name: 'Test',
        last_name: 'User',
        password: 'wrongPassword',
        new_password: 'newPassword'
      };

      await expect(service.changePassword(1, updateUserDto))
        .rejects.toEqual(ErrorCodes.INVALID_CREDENTIALS);
    });
  });

  describe('verifyToken', () => {
    it('should return valid token message for existing user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({ id: 1 } as User);

      const result = await service.verifyToken(1);

      expect(result).toEqual({ valid: true, message: 'Token is valid' });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.verifyToken(999))
        .rejects.toThrow(UnauthorizedException);
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
