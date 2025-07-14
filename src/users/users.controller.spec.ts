import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import { ErrorCodes } from '@src/errors/error-codes.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 1,
    name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    role_id: 1,
    active: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAllUsers: jest.fn().mockResolvedValue([mockUser]),
            findUserById: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllUsers', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAllUsers();
      expect(result).toEqual([mockUser]);
      expect(service.findAllUsers).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a user if it exists', async () => {
      (service.findUserById as jest.Mock).mockResolvedValue(mockUser);
      const result = await controller.getUserById(1);
      expect(result).toEqual(mockUser);
      expect(service.findUserById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      (service.findUserById as jest.Mock).mockResolvedValue(null);
      await expect(controller.getUserById(1)).rejects.toThrow(NotFoundException);
      expect(service.findUserById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateUser', () => {
    it('should update and return the user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'John Updated',
        last_name: 'Doe Updated',
        password: 'currentPassword',
        new_password: 'newPassword',
      };
      const updatedUser = { ...mockUser, name: updateUserDto.name, last_name: updateUserDto.last_name };
      (service.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      const result = await controller.updateUser(1, updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(service.updateUser).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('deleteUser', () => {
    it('should delete and return the user', async () => {
      (service.deleteUser as jest.Mock).mockResolvedValue(mockUser);
      const result = await controller.deleteUser(1);
      expect(result).toEqual(mockUser);
      expect(service.deleteUser).toHaveBeenCalledWith(1);
    });
  });
});
