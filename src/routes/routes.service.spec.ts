import { Test, TestingModule } from '@nestjs/testing';
import { RoutesService } from './routes.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { FilterRoutesDto } from './dto/filter-routes.dto';
import { PackagesService } from '@src/_packages/_packages.service';

describe('RoutesService', () => {
  let service: RoutesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        {
          provide: PrismaService,
          useValue: {
            route: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
              update: jest.fn(),
            },
            package: {
              findMany: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              count: jest.fn(),
            },
            $connect: jest.fn().mockResolvedValue(undefined),
            $disconnect: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: PackagesService,
          useValue: {
            updatePackageHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoutesService>(RoutesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRoute', () => {
    it('should create a new route and update packages', async () => {
      const createRouteDto: CreateRouteDto = {
        packageIds: [1, 2],
        delivery_driver_id: 1,
      };
      const mockRoute = { id: 1, delivery_driver_id: 1 };
      
      prismaService.route.create = jest.fn().mockResolvedValue(mockRoute);
      prismaService.package.update = jest.fn().mockResolvedValue({});

      const result = await service.createRoute(createRouteDto);

      expect(result).toEqual(mockRoute);
      expect(prismaService.route.create).toHaveBeenCalledWith({
        data: { 
          delivery_driver_id: 1,
          updated_at: expect.any(Date)
        },
      });
      expect(prismaService.package.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('getRouteById', () => {
    it('should return a route if found', async () => {
      const mockRoute = { id: 1, package: [], delivery_driver: {} };
      prismaService.route.findUnique = jest.fn().mockResolvedValue(mockRoute);

      const result = await service.getRouteById(1);

      expect(result).toEqual(mockRoute);
    });

    it('should throw NotFoundException if route not found', async () => {
      prismaService.route.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.getRouteById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('filterRoutes', () => {
    it('should return filtered routes based on all parameters', async () => {
      const mockRoutes = [{ id: 1, delivery_driver: { name: 'Driver 1' } }];
      const mockPackages = [{ id: 1 }, { id: 2 }];

      prismaService.route.findMany = jest.fn().mockResolvedValue(mockRoutes);
      prismaService.package.findMany = jest.fn().mockResolvedValue(mockPackages);

      const filterRoutesDto = {
        start_date: '20/12/2024',
        end_date: '27/12/2024',
        delivery_driver_id: 1,
      };
      const result = await service.filterRoutes(filterRoutesDto);

      expect(result).toEqual([
        { 
          ...mockRoutes[0], 
          packageCount: mockPackages.length, 
          packages: mockPackages 
        }
      ]);
      expect(prismaService.route.findMany).toHaveBeenCalled();
      expect(prismaService.package.findMany).toHaveBeenCalled();
    });

    it('should return an empty array if no parameters are passed', async () => {
      const result = await service.filterRoutes({});
      expect(result).toEqual([]);
    });

    it('should throw an error for invalid date formats', async () => {
      const filterRoutesDto = {
        start_date: 'invalid-date',
        end_date: 'another-invalid-date',
      };
      await expect(service.filterRoutes(filterRoutesDto)).rejects.toThrow(Error);
    });

    it('should return an empty array for dates that do not match any routes', async () => {
      const filterRoutesDto = {
        start_date: '01/01/2025',
        end_date: '02/01/2025',
        delivery_driver_id: 999, // ID que no existe
      };
      const result = await service.filterRoutes(filterRoutesDto);
      expect(result).toEqual([]);
    });

    it('should return filtered routes with valid and invalid parameters', async () => {
      const mockRoutes = [{ id: 1, delivery_driver: { name: 'Driver 1' } }];
      const mockPackages = [{ id: 1 }, { id: 2 }];

      prismaService.route.findMany = jest.fn().mockResolvedValue(mockRoutes);
      prismaService.package.findMany = jest.fn().mockResolvedValue(mockPackages);

      const filterRoutesDto = {
        start_date: '20/12/2024',
        end_date: '27/12/2024',
        delivery_driver_id: null, // Parámetro válido pero sin valor
      };
      const result = await service.filterRoutes(filterRoutesDto);

      expect(result).toEqual([
        { 
          ...mockRoutes[0], 
          packageCount: mockPackages.length, 
          packages: mockPackages 
        }
      ]);
    });

    it('should use end_date when no start_date is passed', async () => {
      const filterRoutesDto = {
        end_date: '27/12/2024',
        delivery_driver_id: 1,
      };
      const mockRoutes = [{ id: 1, delivery_driver: { name: 'Driver 1' } }];
      const mockPackages = [{ id: 1 }, { id: 2 }];

      prismaService.route.findMany = jest.fn().mockResolvedValue(mockRoutes);
      prismaService.package.findMany = jest.fn().mockResolvedValue(mockPackages);

      const result = await service.filterRoutes(filterRoutesDto);

      expect(result).toEqual([
        { 
          ...mockRoutes[0], 
          packageCount: mockPackages.length, 
          packages: mockPackages 
        }
      ]);
      expect(prismaService.route.findMany).toHaveBeenCalled();
      expect(prismaService.package.findMany).toHaveBeenCalled();
    });

    it('should use start_date when no end_date is passed', async () => {
      const filterRoutesDto = {
        start_date: '20/12/2024',
        delivery_driver_id: 1,
      };
      const mockRoutes = [{ id: 1, delivery_driver: { name: 'Driver 1' } }];
      const mockPackages = [{ id: 1 }, { id: 2 }];

      prismaService.route.findMany = jest.fn().mockResolvedValue(mockRoutes);
      prismaService.package.findMany = jest.fn().mockResolvedValue(mockPackages);

      const result = await service.filterRoutes(filterRoutesDto);

      expect(result).toEqual([
        { 
          ...mockRoutes[0], 
          packageCount: mockPackages.length, 
          packages: mockPackages 
        }
      ]);
      expect(prismaService.route.findMany).toHaveBeenCalled();
      expect(prismaService.package.findMany).toHaveBeenCalled();
    });
  });

  describe('deleteRoute', () => {
    it('should delete a route and update packages', async () => {
      const mockRoute = { id: 1, packages: [{ id: 1 }, { id: 2 }] };
      prismaService.route.findUnique = jest.fn().mockResolvedValue(mockRoute);
      prismaService.package.updateMany = jest.fn().mockResolvedValue({});
      prismaService.route.delete = jest.fn().mockResolvedValue({});

      const result = await service.deleteRoute(1);

      expect(result).toEqual({ message: 'Route with ID 1 deleted successfully' });
      expect(prismaService.route.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prismaService.package.updateMany).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if route not found', async () => {
      prismaService.route.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.deleteRoute(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRoute', () => {
    it('should update a route and its packages', async () => {
      const updateRouteDto: UpdateRouteDto = {
        packageIds: [1, 2],
        delivery_driver_id: 2,
      };
      const mockRoute = { id: 1, delivery_driver_id: 2, created_at: new Date(), updated_at: new Date() };
      prismaService.route.findUnique = jest.fn().mockResolvedValue(mockRoute);
      prismaService.route.update = jest.fn().mockResolvedValue(mockRoute);
      prismaService.package.updateMany = jest.fn().mockResolvedValue({});
      prismaService.package.update = jest.fn().mockResolvedValue({});

      const result = await service.updateRoute(1, updateRouteDto);

      expect(result).toEqual(mockRoute);
    });

    it('should throw NotFoundException if route not found', async () => {
      prismaService.route.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.updateRoute(1, { packageIds: [], delivery_driver_id: 1 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('onModuleInit', () => {
    it('should perform initialization tasks', async () => {
      // Aquí puedes simular el comportamiento esperado de onModuleInit
      await service.onModuleInit();
      // Agrega tus expectativas aquí
    });
  });

  describe('onModuleDestroy', () => {
    it('should perform cleanup tasks', async () => {
      // Aquí puedes simular el comportamiento esperado de onModuleDestroy
      await service.onModuleDestroy();
      // Agrega tus expectativas aquí
    });
  });
});
