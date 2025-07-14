import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { NotFoundException } from '@nestjs/common';
import { ErrorCodes } from '@src/errors/error-codes.enum';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  const mockRole = {
    id: 1,
    name: 'Test Role',
    description: 'This is a test role',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: {
            createRole: jest.fn().mockResolvedValue(mockRole),
            findAllRoles: jest.fn().mockResolvedValue([mockRole]),
            findRoleById: jest.fn(),
            deleteRole: jest.fn().mockResolvedValue(mockRole),
          },
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'Test Role',
        description: 'This is a test role',
      };

      expect(await controller.createRole(createRoleDto)).toEqual(mockRole);
      expect(service.createRole).toHaveBeenCalledWith(createRoleDto);
    });
  });

  describe('findAllRoles', () => {
    it('should return an array of roles', async () => {
      expect(await controller.findAllRoles()).toEqual([mockRole]);
      expect(service.findAllRoles).toHaveBeenCalled();
    });
  });

  describe('findRoleById', () => {
    it('should return a role if it exists', async () => {
      (service.findRoleById as jest.Mock).mockResolvedValue(mockRole);

      expect(await controller.findRoleById(1)).toEqual(mockRole);
      expect(service.findRoleById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if role does not exist', async () => {
      (service.findRoleById as jest.Mock).mockResolvedValue(null);

      await expect(controller.findRoleById(1)).rejects.toThrow(NotFoundException);
      expect(service.findRoleById).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteRole', () => {
    it('should delete a role', async () => {
      expect(await controller.deleteRole(1)).toEqual(mockRole);
      expect(service.deleteRole).toHaveBeenCalledWith(1);
    });
  });
});
