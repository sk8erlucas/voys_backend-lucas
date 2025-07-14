import { Test, TestingModule } from '@nestjs/testing';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

describe('RoutesController', () => {
  let controller: RoutesController;
  let routesService: RoutesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoutesController],
      providers: [
        {
          provide: RoutesService,
          useValue: {
            createRoute: jest.fn(),
            getRouteById: jest.fn(),
            filterRoutes: jest.fn(),
            updateRoute: jest.fn(),
            deleteRoute: jest.fn(),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<RoutesController>(RoutesController);
    routesService = module.get<RoutesService>(RoutesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRoute', () => {
    it('should create a new route', async () => {
      const createRouteDto: CreateRouteDto = {
        packageIds: [1, 2],
        delivery_driver_id: 1,
      };
      const mockRoute = { id: 1, delivery_driver_id: 1, created_at: new Date(), updated_at: new Date() };
      jest.spyOn(routesService, 'createRoute').mockResolvedValue(mockRoute);

      const result = await controller.createRoute(createRouteDto);

      expect(result).toEqual(mockRoute);
      expect(routesService.createRoute).toHaveBeenCalledWith(createRouteDto);
    });
  });

  describe('getRouteById', () => {
    it('should return a route by id', async () => {
      const mockRoute = { 
        id: 1, 
        delivery_driver_id: 1, 
        created_at: new Date(), 
        updated_at: new Date(),
        delivery_driver: { 
          id: 1, 
          name: 'Driver 1', 
          last_name: 'Last', 
          phone: '1234567890', 
          dni: '12345678', 
          notes: '', 
          active: true, 
          created_at: new Date(), 
          updated_at: new Date(),
          mobility: 'Bicicleta', 
        },
        package: []
      };
      jest.spyOn(routesService, 'getRouteById').mockResolvedValue(mockRoute);

      const result = await controller.getRouteById('1');

      expect(result).toEqual(mockRoute);
      expect(routesService.getRouteById).toHaveBeenCalledWith(1);
    });
  });

  describe('filterRoutes', () => {
    it('should return all routes', async () => {
      const filterRoutesDto = {};
      const mockRoutes = [
        { id: 1, delivery_driver_id: 1, created_at: new Date(), updated_at: new Date(), packageCount: 2 },
        { id: 2, delivery_driver_id: 2, created_at: new Date(), updated_at: new Date(), packageCount: 3 }
      ];
      jest.spyOn(routesService, 'filterRoutes').mockResolvedValue(mockRoutes);

      const result = await controller.filterRoutes(filterRoutesDto);

      expect(result).toEqual(mockRoutes);
      expect(routesService.filterRoutes).toHaveBeenCalledWith(filterRoutesDto);
    });
  });

  describe('updateRoute', () => {
    it('should update a route', async () => {
      const updateRouteDto: UpdateRouteDto = {
        packageIds: [3, 4],
        delivery_driver_id: 2,
      };
      const mockUpdatedRoute = { id: 1, delivery_driver_id: 2, created_at: new Date(), updated_at: new Date() };
      jest.spyOn(routesService, 'updateRoute').mockResolvedValue(mockUpdatedRoute);

      const result = await controller.updateRoute('1', updateRouteDto);

      expect(result).toEqual(mockUpdatedRoute);
      expect(routesService.updateRoute).toHaveBeenCalledWith(1, updateRouteDto);
    });
  });

  describe('deleteRoute', () => {
    it('should delete a route', async () => {
      const mockDeleteResult = { message: 'Route deleted successfully' };
      jest.spyOn(routesService, 'deleteRoute').mockResolvedValue(mockDeleteResult);

      const result = await controller.deleteRoute('1');

      expect(result).toEqual(mockDeleteResult);
      expect(routesService.deleteRoute).toHaveBeenCalledWith(1);
    });
  });
});