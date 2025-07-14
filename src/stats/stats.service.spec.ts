import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { ErrorCodes } from '@src/errors/error-codes.enum';

describe('StatsService', () => {
  let service: StatsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn().mockResolvedValue(undefined),
            $disconnect: jest.fn().mockResolvedValue(undefined),
            package: {
              findMany: jest.fn(),
            },
            voysStatus: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPackagesStatsByDate', () => {
    it('should throw BadRequestException if dateString is not provided', async () => {
      await expect(service.getPackagesStatsByDate('')).rejects.toThrow(BadRequestException);
    });

    it('should return global stats', async () => {
      const dateString = '01/01/2024';
      const mockPackages = [
        { id: 1, voys_status: 'delivered', store: { ml_fantazy_name: 'Store1' }, route: { deliveryDrivers: [{ name: 'Driver1' }] }, ml_order_id: '1', ml_tracking_id: '1', ml_status: 'delivered', ml_substatus: '', ml_zip_code: '12345', ml_state_name: 'State1', ml_city_name: 'City1', ml_street_name: 'Street1', created_at: new Date(), updated_at: new Date() },
        { id: 2, voys_status: 'pending', store: { ml_fantazy_name: 'Store2' }, route: { deliveryDrivers: [{ name: 'Driver2' }] }, ml_order_id: '2', ml_tracking_id: '2', ml_status: 'pending', ml_substatus: '', ml_zip_code: '67890', ml_state_name: 'State2', ml_city_name: 'City2', ml_street_name: 'Street2', created_at: new Date(), updated_at: new Date() },
      ];
      const mockVoysStatus = [
        { id: 1, name: 'Delivered', slug: 'delivered', ml_status_array: '["entregado"]', description: 'Delivered status', created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'Pending', slug: 'pending', ml_status_array: '["pendiente"]', description: 'Pending status', created_at: new Date(), updated_at: new Date() },
      ];

      jest.spyOn(prismaService.package, 'findMany').mockResolvedValueOnce(mockPackages as any);
      jest.spyOn(prismaService.package, 'findMany').mockResolvedValueOnce(mockPackages as any);
      jest.spyOn(prismaService.voysStatus, 'findMany').mockResolvedValueOnce(mockVoysStatus as any);

      const result = await service.getPackagesStatsByDate(dateString);

      expect(result).toHaveProperty('global');
      expect(result).toHaveProperty('stores');
      expect(result).toHaveProperty('drivers');
      expect(prismaService.package.findMany).toHaveBeenCalledTimes(2);
      expect(prismaService.voysStatus.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle packages with empty voys_status', async () => {
      const dateString = '01/01/2024';
      const mockPackages = [
        { id: 1, voys_status: '', store: { ml_fantazy_name: 'Store1' }, route: { deliveryDrivers: [{ name: 'Driver1' }] }, ml_order_id: '1', ml_tracking_id: '1', ml_status: '', ml_substatus: '', ml_zip_code: '12345', ml_state_name: 'State1', ml_city_name: 'City1', ml_street_name: 'Street1', created_at: new Date(), updated_at: new Date() },
        { id: 2, voys_status: 'pending', store: { ml_fantazy_name: 'Store2' }, route: { deliveryDrivers: [{ name: 'Driver2' }] }, ml_order_id: '2', ml_tracking_id: '2', ml_status: 'pending', ml_substatus: '', ml_zip_code: '67890', ml_state_name: 'State2', ml_city_name: 'City2', ml_street_name: 'Street2', created_at: new Date(), updated_at: new Date() },
      ];
      const mockVoysStatus = [
        { id: 1, name: 'Pending', slug: 'pending', ml_status_array: '["pendiente"]', description: 'Pending status', created_at: new Date(), updated_at: new Date() },
      ];

      jest.spyOn(prismaService.package, 'findMany').mockResolvedValueOnce(mockPackages as any);
      jest.spyOn(prismaService.package, 'findMany').mockResolvedValueOnce(mockPackages as any);
      jest.spyOn(prismaService.voysStatus, 'findMany').mockResolvedValueOnce(mockVoysStatus as any);

      const result = await service.getPackagesStatsByDate(dateString);

      expect(result.global.total).toBe(2);
      expect(result.global).toHaveProperty('pending');
      expect(result.global['pending']).toBe(1);
    });
  });

  describe('getStatusSummary', () => {
    it('should return correct status summary', () => {
      const packages = [
        { voys_status: 'delivered' },
        { voys_status: 'pending' },
        { voys_status: 'delivered' },
        { voys_status: 'unknown' },
      ];
      const voysStatus = [
        { slug: 'delivered' },
        { slug: 'pending' },
      ];

      const result = service.getStatusSummary(packages, voysStatus);

      expect(result).toEqual({
        total: 4,
        delivered: 2,
        pending: 1,
      });
    });
  });

  describe('getStoreSummary', () => {
    it('should return correct store summary', () => {
      const packages = [
        { voys_status: 'delivered', store: { ml_fantazy_name: 'Store1' } },
        { voys_status: 'pending', store: { ml_fantazy_name: 'Store1' } },
        { voys_status: 'delivered', store: { ml_fantazy_name: 'Store2' } },
        { voys_status: 'unknown', store: { ml_fantazy_name: 'Store2' } },
      ];
      const voysStatus = [
        { slug: 'delivered' },
        { slug: 'pending' },
      ];

      const result = service.getStoreSummary(packages, voysStatus);

      expect(result).toEqual([
        { store: 'Store1', total: 2, delivered: 1, pending: 1 },
        { store: 'Store2', total: 2, delivered: 1, pending: 0 },
      ]);
    });
  });

  describe('onModuleInit', () => {
    it('should connect to the database', async () => {
      await service.onModuleInit();
      expect(prismaService.$connect).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from the database', async () => {
      await service.onModuleDestroy();
      expect(prismaService.$disconnect).toHaveBeenCalled();
    });
  });
});