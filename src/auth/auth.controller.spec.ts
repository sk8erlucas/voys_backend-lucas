import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@src/auth/auth.controller';
import { AuthService } from '@src/auth/auth.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { UsersService } from '@src/users/users.service';
import { CreateUserDto } from '@src/users/dto/create-user.dto';
import { LoginAuthDto } from '@src/auth/dto/login-auth.dto';
import { UpdateUserDto } from '@src/users/dto/update-user.dto';
import { ForbiddenException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            verifyToken: jest.fn(),
            changePassword: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
          },
        },
        JwtService,
        PrismaService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = { email: 'test@example.com', password: 'password123', name: 'Test User' };
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
      jest.spyOn(usersService, 'createUser').mockResolvedValue(mockUser as any);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(mockUser);
      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginAuthDto: LoginAuthDto = { email: 'test@example.com', password: 'password123' };
      const mockLoginResult = { access_token: 'mock_token' };
      jest.spyOn(authService, 'login').mockResolvedValue(mockLoginResult);

      const result = await controller.login(loginAuthDto);

      expect(result).toEqual(mockLoginResult);
      expect(authService.login).toHaveBeenCalledWith(loginAuthDto);
    });

    it('should throw ForbiddenException on login error', async () => {
      const loginAuthDto: LoginAuthDto = { email: 'test@example.com', password: 'wrong_password' };
      jest.spyOn(authService, 'login').mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(loginAuthDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('verifyToken', () => {
    it('should verify a token', async () => {
      const mockUserId = 1;
      const mockRequest = { user: { userId: mockUserId } };
      const mockVerifyResult = { valid: true, message: 'Token is valid' };
      jest.spyOn(authService, 'verifyToken').mockResolvedValue(mockVerifyResult);

      const result = await controller.verifyToken(mockRequest);

      expect(result).toEqual(mockVerifyResult);
      expect(authService.verifyToken).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const updateUserDto: UpdateUserDto = { password: 'new_password123', name: 'Updated Name' };
      const mockUserId = 1;
      const mockRequest = { user: { userId: mockUserId } };
      const mockChangePasswordResult = { 
        id: 1, 
        email: 'test@example.com', 
        name: 'Updated Name', 
        last_name: 'Test', 
        active: true, 
        role_id: 1, 
        created_at: new Date(), 
        updated_at: new Date() 
      };
      jest.spyOn(authService, 'changePassword').mockResolvedValue(mockChangePasswordResult);

      const result = await controller.changePassword(updateUserDto, mockRequest);

      expect(result).toEqual(mockChangePasswordResult);
      expect(authService.changePassword).toHaveBeenCalledWith(mockUserId, updateUserDto);
    });

    it('should throw ForbiddenException on change password error', async () => {
      const updateUserDto: UpdateUserDto = { password: 'invalid_password', name: 'Test User' };
      const mockUserId = 1;
      const mockRequest = { user: { userId: mockUserId } };
      jest.spyOn(authService, 'changePassword').mockRejectedValue(new Error('Invalid password'));

      await expect(controller.changePassword(updateUserDto, mockRequest)).rejects.toThrow(ForbiddenException);
    });
  });
});
