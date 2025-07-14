import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards, NotFoundException } from '@nestjs/common';
import { RolesService } from '@src/roles/roles.service';
import { CreateRoleDto } from '@src/roles/dto/create-role.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { Roles } from '@src/roles/decorators/roles.decorator';
import { RoleNames } from '@src/roles/roles.enum';

@Controller('roles')
@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(RoleNames.ADMIN)

export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  async createRole(@Body() createRoleDto: CreateRoleDto) {

    return await this.rolesService.createRole(createRoleDto);

  }

  @Get()
  async findAllRoles() {

    return await this.rolesService.findAllRoles();

  }

  @Get(':id')
  async findRoleById(@Param('id', ParseIntPipe) id: number) {

    const role = await this.rolesService.findRoleById(id);
    
    if (role === null) throw new NotFoundException(ErrorCodes.RESOURCE_NOT_FOUND);

    return role;

  }

  @Delete(':id')
  async deleteRole(@Param('id', ParseIntPipe) id: number) {

    return await this.rolesService.deleteRole(id);

  }

}
