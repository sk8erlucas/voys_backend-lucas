import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, ForbiddenException, Request, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from '@src/auth/auth.service';
import { LoginAuthDto } from '@src/auth/dto/login-auth.dto';
import { UsersService } from '@src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from '@src/users/dto/update-user.dto';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService, 
    private readonly usersService: UsersService
  ) { }

  @Post('register')
  async register(@Body() CreateUserDto: CreateUserDto) {

    const user: User = await this.usersService.createUser(CreateUserDto);
    delete user.password;

    return user;

  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginAuthDto: LoginAuthDto) {

    try {

      return await this.authService.login(loginAuthDto);

    } catch (error) {

      throw new ForbiddenException(error);

    }

  }

  @Post('verify-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async verifyToken(@Request() req: any){

    return await this.authService.verifyToken(req.user.userId);

  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async changePassword(@Body() updateUserDto: UpdateUserDto, @Request() req: any) {

    try {

      return await this.authService.changePassword(req.user.userId, updateUserDto);

    } catch (error) {

      throw new ForbiddenException(error);

    }

  }

}