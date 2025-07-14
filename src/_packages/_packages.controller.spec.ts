import { Test, TestingModule } from '@nestjs/testing';
import { PackagesController } from './_packages.controller';
import { PackagesService } from './_packages.service';
import { FilterPackagesDto } from './dto/filter-packages.dto';
import { AssignPackagesDto } from './dto/assign-packages.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PackagesController', () => {
  let controller: PackagesController;
  let service: PackagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackagesController],
      providers: [
        {
          provide: PackagesService,
          useValue: {
            findOnePackageById: jest.fn(),
            assignPackages: jest.fn(),
            filterPackages: jest.fn(),
            liquidate_distributor: jest.fn(),
            void_liquidation_distributor: jest.fn(),
            liquidate_customer: jest.fn(),
            void_liquidation_customer: jest.fn(),
            findOnePackageLastPlantaDate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PackagesController>(PackagesController);
    service = module.get<PackagesService>(PackagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOnePackageById', () => {
    it('should return a package if found', async () => {
      const packageMock = { id: 1, ml_status: 'delivered' };
      jest.spyOn(service, 'findOnePackageById').mockResolvedValue(packageMock as any);

      const result = await controller.findOnePackageById(1);
      expect(result).toEqual(packageMock);
    });

    it('should throw NotFoundException if package not found', async () => {
      jest.spyOn(service, 'findOnePackageById').mockRejectedValue(new NotFoundException());

      await expect(controller.findOnePackageById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('filterPackages', () => {
    it('should return filtered packages based on FilterPackagesDto', async () => {
      const filterDto: FilterPackagesDto = { 
        date: '2023-01-01',
        isObfuscated: jest.fn().mockReturnValue(false),
        hasObfuscatedFields: jest.fn().mockReturnValue(false)
      };
      const packagesMock = [{ id: 1, ml_status: 'pending' }];
      jest.spyOn(service, 'filterPackages').mockResolvedValue(packagesMock as any);

      const result = await controller.filterPackages(filterDto);
      expect(result).toEqual(packagesMock);
    });

    it('should throw BadRequestException if filter criteria is invalid', async () => {
      jest.spyOn(service, 'filterPackages').mockRejectedValue(new BadRequestException());

      await expect(controller.filterPackages({} as FilterPackagesDto)).rejects.toThrow(BadRequestException);
    });
  });

  it('should assign packages and return success response', async () => {
    const assignDto: AssignPackagesDto = { packageIds: [1, 2, 3] };
    const assignResult = { count: 3 };

    // Asegurarse de que `assignPackages` esté correctamente "espíado" en el mock
    jest.spyOn(service, 'assignPackages').mockResolvedValue(assignResult);

    const result = await controller.assignPackage(assignDto);
    expect(result).toEqual(assignResult);
    //});
  });

  describe('assignPackage', () => {
    it('should throw BadRequestException if assignPackagesDto is invalid', async () => {
      jest.spyOn(service, 'assignPackages').mockRejectedValue(new BadRequestException());

      await expect(controller.assignPackage({} as AssignPackagesDto)).rejects.toThrow(BadRequestException);
    });
  });

  // Agregar pruebas para liquidate_distributor
  describe('liquidate_distributor', () => {
    it('should return success response', async () => {
      const assignDto: AssignPackagesDto = { packageIds: [1, 2, 3] };
      const liquidateResult = { count: 3 };

      jest.spyOn(service, 'liquidate_distributor').mockResolvedValue(liquidateResult);

      const result = await controller.liquidate_distributor(assignDto);
      expect(result).toEqual(liquidateResult);
    });

    it('should throw BadRequestException if liquidate request is invalid', async () => {
      jest.spyOn(service, 'liquidate_distributor').mockRejectedValue(new BadRequestException());

      await expect(controller.liquidate_distributor({} as AssignPackagesDto)).rejects.toThrow(BadRequestException);
    });
  });

  // Agregar pruebas para void_liquidation_distributor
  describe('void_liquidation_distributor', () => {
    it('should return success response', async () => {
      const assignDto: AssignPackagesDto = { packageIds: [1, 2, 3] };
      const voidResult = { count: 3 };

      jest.spyOn(service, 'void_liquidation_distributor').mockResolvedValue(voidResult);

      const result = await controller.void_liquidation_distributor(assignDto);
      expect(result).toEqual(voidResult);
    });

    it('should throw BadRequestException if void request is invalid', async () => {
      jest.spyOn(service, 'void_liquidation_distributor').mockRejectedValue(new BadRequestException());

      await expect(controller.void_liquidation_distributor({} as AssignPackagesDto)).rejects.toThrow(BadRequestException);
    });
  });

  // Agregar pruebas para liquidate_customer
  describe('liquidate_customer', () => {
    it('should return success response', async () => {
      const assignDto: AssignPackagesDto = { packageIds: [1, 2, 3] };
      const liquidateResult = { count: 3 };

      jest.spyOn(service, 'liquidate_customer').mockResolvedValue(liquidateResult);

      const result = await controller.liquidate_customer(assignDto);
      expect(result).toEqual(liquidateResult);
    });

    it('should throw BadRequestException if liquidate request is invalid', async () => {
      jest.spyOn(service, 'liquidate_customer').mockRejectedValue(new BadRequestException());

      await expect(controller.liquidate_customer({} as AssignPackagesDto)).rejects.toThrow(BadRequestException);
    });
  });

  // Agregar pruebas para void_liquidation_customer
  describe('void_liquidation_customer', () => {
    it('should return success response', async () => {
      const assignDto: AssignPackagesDto = { packageIds: [1, 2, 3] };
      const voidResult = { count: 3 };

      jest.spyOn(service, 'void_liquidation_customer').mockResolvedValue(voidResult);

      const result = await controller.void_liquidation_customer(assignDto);
      expect(result).toEqual(voidResult);
    });

    it('should throw BadRequestException if void request is invalid', async () => {
      jest.spyOn(service, 'void_liquidation_customer').mockRejectedValue(new BadRequestException());

      await expect(controller.void_liquidation_customer({} as AssignPackagesDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOnePackageLastPlantaDate', () => {
    it('should return the last planta date', async () => {
      const lastPlantaDateMock = new Date(); // Simulando una fecha
      jest.spyOn(service, 'findOnePackageLastPlantaDate').mockResolvedValue(lastPlantaDateMock);

      const result = await controller.findOnePackageLastPlantaDate();
      expect(result).toEqual(lastPlantaDateMock);
    });

    it('should throw BadRequestException if there is an error', async () => {
      jest.spyOn(service, 'findOnePackageLastPlantaDate').mockRejectedValue(new BadRequestException());

      await expect(controller.findOnePackageLastPlantaDate()).rejects.toThrow(BadRequestException);
    });
  });
});
