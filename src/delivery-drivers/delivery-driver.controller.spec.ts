import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryDriverController } from './delivery-driver.controller';
import { DeliveryDriverService } from './delivery-driver.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateDeliveryDriverDto } from './dto/create-delivery-driver.dto';
import { UpdateDeliveryDriverDto } from './dto/update-delivery-driver.dto';
import { FilterDeliveryDriverDto } from './dto/filter-delivery-driver.dto';

describe('DeliveryDriverController', () => {
  let controller: DeliveryDriverController;
  let service: DeliveryDriverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryDriverController],
      providers: [
        {
          provide: DeliveryDriverService,
          useValue: {
            createDeliveryDriver: jest.fn(),
            findAllDeliveryDriver: jest.fn(),
            findDeliveryDriverById: jest.fn(),
            updateDeliveryDriver: jest.fn(),
            deleteDeliveryDriver: jest.fn(),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<DeliveryDriverController>(DeliveryDriverController);
    service = module.get<DeliveryDriverService>(DeliveryDriverService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a delivery driver', async () => {
      const dto: CreateDeliveryDriverDto = {
        name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789',
        dni: '12345678A',
        mobility: 'Bicicleta',
      };
      const expectedResult = {
        id: 1,
        ...dto,
        notes: '',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest.spyOn(service, 'createDeliveryDriver').mockResolvedValue(expectedResult);
      
      expect(await controller.create(dto)).toEqual(expectedResult);
      expect(service.createDeliveryDriver).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAllDeliveryDriver', () => {
    it('should return an array of delivery drivers', async () => {
      const result = [
        {
          id: 1,
          name: 'John',
          last_name: 'Doe',
          phone: '123456789',
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
        },
      ];
      
      const query: FilterDeliveryDriverDto = { with_packages: true };
      jest.spyOn(service, 'findAllDeliveryDriver').mockResolvedValue(result);
      
      expect(await controller.findAllDeliveryDriver(query)).toBe(result);
      expect(service.findAllDeliveryDriver).toHaveBeenCalledWith(query);
    });
  });

  describe('findDeliveryDriverById', () => {
    it('should return a delivery driver', async () => {
      const result = {
        id: 1,
        name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789',
        dni: '12345678A',
        notes: '',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
        mobility: 'Bicicleta',
      };
      jest.spyOn(service, 'findDeliveryDriverById').mockResolvedValue(result);
      
      expect(await controller.findDeliveryDriverById(1)).toBe(result);
      expect(service.findDeliveryDriverById).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a delivery driver', async () => {
      const dto: UpdateDeliveryDriverDto = {
        name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789',
        dni: '12345678A',
        mobility: 'Bicicleta',
      };
      const result = {
        id: 1,
        name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789',
        dni: '12345678A',
        notes: '',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
        mobility: 'Bicicleta',
      };
      jest.spyOn(service, 'updateDeliveryDriver').mockResolvedValue(result);
      
      expect(await controller.update(1, dto)).toBe(result);
      expect(service.updateDeliveryDriver).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a delivery driver', async () => {
      const result = {
        id: 1,
        name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789',
        dni: '12345678A',
        notes: '',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
        mobility: 'Bicicleta',
      };
      jest.spyOn(service, 'deleteDeliveryDriver').mockResolvedValue(result);
      
      expect(await controller.remove(1)).toBe(result);
      expect(service.deleteDeliveryDriver).toHaveBeenCalledWith(1);
    });
  });
});
