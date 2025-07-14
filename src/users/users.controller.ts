import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, HttpException, BadRequestException, Put, UseGuards, ParseIntPipe, InternalServerErrorException, UseFilters, All } from '@nestjs/common';
import { UsersService } from '@src/users/users.service';
import { UpdateUserDto } from '@src/users/dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { Roles } from '@src/roles/decorators/roles.decorator';
import { RolesGuard } from '@src/roles/roles.guard';
import { RoleNames } from '@src/roles/roles.enum';
import { CreateUserDto } from '@src/users/dto/create-user.dto';

@Controller('users')
@ApiTags('Usuarios')
@ApiBearerAuth()
@Roles(RoleNames.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)

export class UsersController {

  constructor(private readonly usersService: UsersService) { }
  /*
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
      
    return await this.usersService.createUser(createUserDto);
      
  }
  */
  @Get()
  async findAllUsers() {

    return await this.usersService.findAllUsers();

  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number){

    const user = await this.usersService.findUserById(id);
    if (!user) throw new NotFoundException(ErrorCodes.RESOURCE_NOT_FOUND);

    return user;

  }

  @Patch(':id')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {

    return await this.usersService.updateUser(id, updateUserDto);

  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {

    return await this.usersService.deleteUser(id);

  }

}
