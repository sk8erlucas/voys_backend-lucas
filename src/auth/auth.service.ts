import { BadRequestException, Body, Injectable, Param, ParseIntPipe, Patch, Request, UnauthorizedException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { UsersService } from '@src/users/users.service';
import { LoginAuthDto } from '@src/auth/dto/login-auth.dto';
import { comparePassword } from '@src/utils/bcrypt.util';
import { JwtService } from '@nestjs/jwt';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { UpdateUserDto } from '@src/users/dto/update-user.dto';
import { User } from '@prisma/client';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {

  constructor(
    private usersService: UsersService,
    private readonly prisma: PrismaService,
    private jwtService: JwtService
  ) { }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
  async login(loginAuthDto: LoginAuthDto) {

    const { email, password } = loginAuthDto;

    const user = await this.usersService.findUserByEmail(email);

    if (!user) {

      throw ErrorCodes.INVALID_CREDENTIALS;

    }

    if (comparePassword(password, user.password)) {

      const payload = { user_id: user.id, role: user.role.name };

      return {
        access_token: this.jwtService.sign(payload)
      }

    } else {

      throw ErrorCodes.INVALID_CREDENTIALS;

    }

  }

  async changePassword(userId: number, updateUserDto: UpdateUserDto) {

    const user: User = await this.usersService.findUserById(userId);

    if (comparePassword(updateUserDto.password, user.password)) {

      return await this.usersService.changePassword(userId, updateUserDto.new_password);

    } else {

      throw ErrorCodes.INVALID_CREDENTIALS;

    }

  }

  async verifyToken(user_id: number) {

    const user = await this.prisma.user.findUnique({
      where: {
        id: user_id
      }
    });

    if (!user) {

      throw new UnauthorizedException('Invalid Token');

    }

    return {
      valid: true,
      message: 'Token is valid'
    }

  }

}