import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaErrorCodes } from '@src/errors/prisma-error-codes.enum';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import * as bcryptUtil from '@src/utils/bcrypt.util';

jest.mock('@src/utils/bcrypt.util');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 1,
    name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    role_id: 1,
    active: true,
    password: 'hashedPassword',
    role: { name: 'User' }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role_id: 1,
      };
      (bcryptUtil.hashPassword as jest.Mock).mockReturnValue('hashedPassword');
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.createUser(createUserDto);
      expect(result).toEqual(mockUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserDto.name,
          last_name: createUserDto.last_name,
          email: createUserDto.email,
          password: 'hashedPassword',
          role: { connect: { id: createUserDto.role_id } }
        }
      });
    });

    it('should throw an error if email is already registered', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
      };
      const error: any = new Error('Unique constraint failed');
      error.code = PrismaErrorCodes.UNIQUE_CONSTRAINT_FAILED;
      (prismaService.user.create as jest.Mock).mockRejectedValue(error);

      await expect(service.createUser(createUserDto)).rejects.toThrow('Unique constraint failed');
    });
  });

  describe('findAllUsers', () => {
    it('should return an array of users', async () => {
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([mockUser]);

      const result = await service.findAllUsers();
      expect(result).toEqual([mockUser]);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        omit: { password: true },
        include: { role: { select: { name: true } } }
      });
    });
  });

  describe('findUserById', () => {
    it('should return a user if it exists', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findUserById(1);
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { role: { select: { name: true } } }
      });
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user if it exists', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findUserByEmail('john@example.com');
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        include: { role: { select: { name: true } } }
      });
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const updatedUser = { ...mockUser, password: 'newHashedPassword' };
      (bcryptUtil.hashPassword as jest.Mock).mockReturnValue('newHashedPassword');
      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.changePassword(1, 'newPassword');
      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        omit: { password: true },
        data: { password: 'newHashedPassword' }
      });
    });
  });

  describe('updateUser', () => {
    it('should update user without changing password', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'John Updated',
        last_name: 'Doe Updated',
        password: 'currentPassword',
      };
      const updatedUser = { ...mockUser, name: updateUserDto.name, last_name: updateUserDto.last_name };
      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);
      (bcryptUtil.hashPassword as jest.Mock).mockReturnValue('newHashedPassword');

      const result = await service.updateUser(1, updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        omit: { password: true },
        data: { name: updateUserDto.name, last_name: updateUserDto.last_name, password: 'newHashedPassword' }
      });
    });

    it('should update user and change password', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'John Updated',
        password: 'currentPassword',
        new_password: 'newPassword',
      };
      const updatedUser = { ...mockUser, name: 'John Updated' };
      (bcryptUtil.hashPassword as jest.Mock).mockReturnValue('newHashedPassword');
      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.updateUser(1, updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        omit: { password: true },
        data: expect.objectContaining({
          name: 'John Updated',
          password: 'newHashedPassword'
        })
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete and return the user', async () => {
      (prismaService.user.delete as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.deleteUser(1);
      expect(result).toEqual(mockUser);
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        omit: { password: true }
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const error: any = new Error('Record not found');
      error.code = PrismaErrorCodes.REQUIRED_RECORDS_NOT_FOUND;
      (prismaService.user.delete as jest.Mock).mockRejectedValue(error);

      await expect(service.deleteUser(1)).rejects.toThrow(NotFoundException);
    });
  });
});