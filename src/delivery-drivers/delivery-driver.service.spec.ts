import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryDriverService } from './delivery-driver.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateDeliveryDriverDto } from './dto/create-delivery-driver.dto';
import { UpdateDeliveryDriverDto } from './dto/update-delivery-driver.dto';
import { FilterDeliveryDriverDto } from './dto/filter-delivery-driver.dto';
import { ForbiddenException } from '@nestjs/common';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { PrismaErrorCodes } from '@src/errors/prisma-error-codes.enum';

describe('DeliveryDriverService', () => {
  let service: DeliveryDriverService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryDriverService,
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn().mockResolvedValue(undefined),
            $disconnect: jest.fn().mockResolvedValue(undefined),
            deliveryDriver: {
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

    service = module.get<DeliveryDriverService>(DeliveryDriverService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDeliveryDriver', () => {
    it('should create a delivery driver', async () => {
      const dto: CreateDeliveryDriverDto = {
        name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789',
        dni: '12345678A',
        mobility: 'car', // Asegúrate de que este campo esté presente
      };
      const expected = {
        id: 1,
        ...dto,
        notes: '',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
        mobility: 'car',
      };
      jest.spyOn(prismaService.deliveryDriver, 'create').mockResolvedValue(expected);

      expect(await service.createDeliveryDriver(dto)).toEqual(expected);
      expect(prismaService.deliveryDriver.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw ForbiddenException if DNI is already registered', async () => {
      const dto: CreateDeliveryDriverDto = {
        name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789',
        dni: '12345678A',
        mobility: 'car', // Asegúrate de que este campo esté presente
      };
      jest.spyOn(prismaService.deliveryDriver, 'create').mockRejectedValue({ code: PrismaErrorCodes.UNIQUE_CONSTRAINT_FAILED });

      await expect(service.createDeliveryDriver(dto)).rejects.toThrow(ForbiddenException);
      await expect(service.createDeliveryDriver(dto)).rejects.toThrow(ErrorCodes.DNI_ALREADY_REGISTERED);
    });
  });

  describe('findAllDeliveryDriver', () => {
    it('should return all delivery drivers without filters', async () => {
      const expected = [{
        id: 1,
        name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789',
        dni: '12345678A',
        notes: '',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
        mobility: 'car',
      }];
      jest.spyOn(prismaService.deliveryDriver, 'findMany').mockResolvedValue(expected);

      const filters: FilterDeliveryDriverDto = {};
      expect(await service.findAllDeliveryDriver(filters)).toEqual(expected);
      expect(prismaService.deliveryDriver.findMany).toHaveBeenCalledWith({
        where: {},
        include: { route: true }
      });
    });

    it('should return delivery drivers with packages', async () => {
      const expected = [{
        id: 1,
        name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789',
        dni: '12345678A',
        notes: '',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
        mobility: 'car',
      }];
      jest.spyOn(prismaService.deliveryDriver, 'findMany').mockResolvedValue(expected);

      const filters: FilterDeliveryDriverDto = { with_packages: true };
      expect(await service.findAllDeliveryDriver(filters)).toEqual(expected);
      expect(prismaService.deliveryDriver.findMany).toHaveBeenCalledWith({
        where: {
          route: {
            some: {
              package: {
                some: {
                  assigned: true,
                  route_id: { not: null },
                }
              }
            }
          }
        },
        include: { route: true }
      });
    });
  });

  describe('findDeliveryDriverById', () => {
    it('should return a delivery driver by id', async () => {
      const expected = {
        id: 1,
        name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789',
        dni: '12345678A',
        notes: '',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
        mobility: 'car', // Asegúrate de que este campo esté presente
      };
      jest.spyOn(prismaService.deliveryDriver, 'findUnique').mockResolvedValue(expected);

      expect(await service.findDeliveryDriverById(1)).toEqual(expected);
      expect(prismaService.deliveryDriver.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('updateDeliveryDriver', () => {
    it('should update a delivery driver', async () => {
      const dto: UpdateDeliveryDriverDto = {
        name: 'Juan',
        last_name: 'González',
        phone: '987654321',  // Asegúrate de que este campo esté presente
        dni: '87654321B',
        mobility: 'bike', // Asegúrate de que este campo esté presente
      };
      const expected = {
        id: 1,
        name: 'John',
        last_name: 'Doe',
        phone: '123456789', // Ensure this is included
        dni: '12345678',
        notes: 'Test note',
        active: true,
        mobility: 'car',
        created_at: new Date(),
        updated_at: new Date(),
        route: [
          {
            id: 1,
            delivery_driver_id: 1,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      };
      
      jest.spyOn(prismaService.deliveryDriver, 'update').mockResolvedValue(expected);

      expect(await service.updateDeliveryDriver(1, dto)).toEqual(expected);
      expect(prismaService.deliveryDriver.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto
      });
    });
  });

  describe('deleteDeliveryDriver', () => {
    it('should delete a delivery driver', async () => {
      const expected = {
        id: 1,
        name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789',
        dni: '12345678A',
        notes: '',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
        mobility: 'car', // Asegúrate de que este campo esté presente
      };
      jest.spyOn(prismaService.deliveryDriver, 'delete').mockResolvedValue(expected);

      expect(await service.deleteDeliveryDriver(1)).toEqual(expected);
      expect(prismaService.deliveryDriver.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('onModuleInit', () => {
    it('should initialize the service correctly', async () => {
      const initSpy = jest.spyOn(service, 'onModuleInit');
      await service.onModuleInit();
      expect(initSpy).toHaveBeenCalled();
      // Aquí puedes agregar más expectativas según la lógica de inicialización
    });
  });

  describe('onModuleDestroy', () => {
    it('should clean up resources correctly', async () => {
      const destroySpy = jest.spyOn(service, 'onModuleDestroy');
      await service.onModuleDestroy();
      expect(destroySpy).toHaveBeenCalled();
      // Aquí puedes agregar más expectativas según la lógica de limpieza
    });
  });
});
