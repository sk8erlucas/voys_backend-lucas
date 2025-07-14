import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { NotFoundException } from '@nestjs/common';
import { PrismaErrorCodes } from '@src/errors/prisma-error-codes.enum';
import { ErrorCodes } from '@src/errors/error-codes.enum';

describe('RolesService', () => {
  let service: RolesService;
  let prismaService: PrismaService;

  const mockRole = {
    id: 1,
    name: 'Test Role',
    description: 'This is a test role',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: {
            role: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $connect: jest.fn(),
            $disconnect: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'Test Role',
        description: 'This is a test role',
      };
      (prismaService.role.create as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.createRole(createRoleDto);
      expect(result).toEqual(mockRole);
      expect(prismaService.role.create).toHaveBeenCalledWith({ data: createRoleDto });
    });
  });

  describe('findAllRoles', () => {
    it('should return an array of roles', async () => {
      (prismaService.role.findMany as jest.Mock).mockResolvedValue([mockRole]);

      const result = await service.findAllRoles();
      expect(result).toEqual([mockRole]);
      expect(prismaService.role.findMany).toHaveBeenCalled();
    });
  });

  describe('findRoleById', () => {
    it('should return a role if it exists', async () => {
      (prismaService.role.findUnique as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.findRoleById(1);
      expect(result).toEqual(mockRole);
      expect(prismaService.role.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null if role does not exist', async () => {
      (prismaService.role.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findRoleById(1);
      expect(result).toBeNull();
      expect(prismaService.role.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findRoleByName', () => {
    it('should return a role if it exists', async () => {
      (prismaService.role.findUnique as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.findRoleByName('Test Role');
      expect(result).toEqual(mockRole);
      expect(prismaService.role.findUnique).toHaveBeenCalledWith({ where: { name: 'Test Role' } });
    });

    it('should return null if role does not exist', async () => {
      (prismaService.role.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findRoleByName('Non-existent Role');
      expect(result).toBeNull();
      expect(prismaService.role.findUnique).toHaveBeenCalledWith({ where: { name: 'Non-existent Role' } });
    });
  });

  describe('updateRole', () => {
    it('should update and return the role', async () => {
      const updateRoleDto: CreateRoleDto = {
        name: 'Updated Role',
        description: 'This is an updated role',
      };
      const updatedRole = { ...mockRole, ...updateRoleDto };
      (prismaService.role.update as jest.Mock).mockResolvedValue(updatedRole);

      const result = await service.updateRole(1, updateRoleDto);
      expect(result).toEqual(updatedRole);
      expect(prismaService.role.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateRoleDto,
      });
    });
  });

  describe('deleteRole', () => {
    it('should delete and return the role', async () => {
      (prismaService.role.delete as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.deleteRole(1);
      expect(result).toEqual(mockRole);
      expect(prismaService.role.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if role does not exist', async () => {
      const error = new Error('Record not found');
      (error as any).code = PrismaErrorCodes.REQUIRED_RECORDS_NOT_FOUND;
      (prismaService.role.delete as jest.Mock).mockRejectedValue(error);

      await expect(service.deleteRole(1)).rejects.toThrow(NotFoundException);
      expect(prismaService.role.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw the original error for other errors', async () => {
      const error = new Error('Some other error');
      (prismaService.role.delete as jest.Mock).mockRejectedValue(error);

      await expect(service.deleteRole(1)).rejects.toThrow('Some other error');
      expect(prismaService.role.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('onModuleInit', () => {
    it('should perform initialization tasks', async () => {
      // Simular la conexión de Prisma
      (prismaService.$connect as jest.Mock).mockResolvedValue(undefined);
      
      await service.onModuleInit();
      expect(prismaService.$connect).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should perform cleanup tasks', async () => {
      // Simular la desconexión de Prisma
      (prismaService.$disconnect as jest.Mock).mockResolvedValue(undefined);
      
      await service.onModuleDestroy();
      expect(prismaService.$disconnect).toHaveBeenCalled();
    });
  });
});
