import { Injectable, NotFoundException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CreateRoleDto } from '@src/roles/dto/create-role.dto';
import { PrismaService } from '@src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { PrismaErrorCodes } from '@src/errors/prisma-error-codes.enum';

@Injectable()

export class RolesService implements OnModuleInit, OnModuleDestroy {

  constructor(private prisma: PrismaService) { }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async createRole(Role: CreateRoleDto): Promise<Role> {

    return await this.prisma.role.create({ data: { ...Role } });

  }

  async findAllRoles(): Promise<Role[]> {

    return await this.prisma.role.findMany();

  }

  async findRoleById(id: number): Promise<Role> {

    return await this.prisma.role.findUnique({
      where: { id }
    });

  }

  async findRoleByName(name: string): Promise<Role> {

    return await this.prisma.role.findUnique({
      where: { name }
    });

  }

  async updateRole(id: number, Role: CreateRoleDto): Promise<Role> {

    return await this.prisma.role.update({
      where: { id },
      data: { ...Role }
    });

  }

  async deleteRole(id: number): Promise<Role> {

    try {

      return await this.prisma.role.delete({
        where: { id }
      });

    } catch (error) {

      if (error?.code === PrismaErrorCodes.REQUIRED_RECORDS_NOT_FOUND) {

        throw new NotFoundException(ErrorCodes.RESOURCE_NOT_FOUND);

      }

      throw error;
    }

  }

}