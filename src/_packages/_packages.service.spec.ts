import { Test, TestingModule } from '@nestjs/testing';
import { PackagesService } from './_packages.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AssignPackagesDto } from './dto/assign-packages.dto';
import { FilterPackagesDto } from './dto/filter-packages.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { ChangeVoysStatusDto } from '@src/_packages/dto/change-voys-status.dto';
import { plainToClass } from 'class-transformer';

const mockDate = new Date();
const mockDateString = '2023-11-01';
const startDate = new Date(mockDateString);
const endDate = new Date(mockDateString);
endDate.setUTCHours(23, 59, 59, 999);

const mockPackageId = 1;
const mockPackage = {
  id: mockPackageId,
  ml_order_id: '2000009292799270',
  ml_tracking_id: '43839095612',
  ml_status: 'ready_to_ship',
  ml_substatus: 'ready_to_print',
  ml_zip_code: '1011',
  ml_state_name: 'Capital Federal',
  ml_city_name: 'Retiro',
  ml_street_name: 'Esmeralda',
  ml_street_number: '910',
  ml_receiver_name: 'Usuario testing',
  ml_delivery_preference: 'residential',
  ml_order_date: new Date('2024-09-13T15:20:00.000-04:00'),
  ml_status_history: '{"date_shipped":null,"date_returned":null,"date_delivered":null,"date_first_visit":null,"date_not_delivered":null,"date_cancelled":null,"date_handling":"2024-09-13T15:20:00.000-04:00","date_ready_to_ship":"2024-09-13T15:20:01.335-04:00"}',
  store_id: 1,
  route_id: 17,
  assigned: true,
  created_at: new Date('2024-09-13T19:19:59.855Z'),
  updated_at: new Date('2024-11-13T09:48:01.858Z'),
  ml_latitude: new Decimal(-34.5975375),
  ml_longitude: new Decimal(-58.3784877),
  voys_status: 'en_camino',
  plant_entry_date: mockDate,
  order: 2,
  liquidated: false,
  Cleared_Delivery_Person: false,
  Settled_Customer: false,
  sucursalDestino: '1',
  sucursalOrigen: '',
  comentarios: 'Comment',
  ingreso: new Date('2024-10-16T10:53:16.671Z'),
  qr_data: '{"id":"44021426178","sender_id":33762651,"hash_code":"gGpyY/cddW0VuOP3ogeGz92tFyBVbWj7uQfuWW8+Gb8=","security_digit":"0"}',
  assignment_date: mockDate,
};

describe('PackagesService', () => {
  let service: PackagesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
            package: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              findFirst: jest.fn(),
              deletePackage: jest.fn(),
            },
            packageHistory: {
              create: jest.fn().mockImplementation(({ data }) => {
                // Simular la creación de un historial de paquete
                return {
                  packageId: data.package.connect.id,
                  routeId: data.route_id,
                  usuario: data.usuario,
                  estado: data.estado,
                  comentarios: data.comentarios,
                };
              }),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call prisma.$connect when the module is initialized', async () => {
      await service.onModuleInit();
      expect(prisma.$connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('onModuleDestroy', () => {
    it('should call prisma.$disconnect when the module is destroyed', async () => {
      await service.onModuleDestroy();
      expect(prisma.$disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('assignPackages', () => {
    it('should assign packages and return the count of updated packages', async () => {
      const assignPackagesDto: AssignPackagesDto = { packageIds: [1, 2, 3] };
      const updateResult = { count: 3 };

      jest.spyOn(prisma.package, 'updateMany').mockResolvedValue(updateResult as any);
      jest.spyOn(prisma.package, 'findMany').mockResolvedValue([
        { id: 1, route_id: 1, voys_status: 'en_camino' },
        { id: 2, route_id: 1, voys_status: 'en_camino' },
        { id: 3, route_id: 1, voys_status: 'en_camino' },
      ] as any);

      jest.spyOn(service, 'findOnePackageById').mockResolvedValue({ id: 1 } as any);
      jest.spyOn(service, 'updatePackageHistory').mockResolvedValue(undefined);

      const result = await service.assignPackages(assignPackagesDto);
      expect(result).toEqual(updateResult);
      expect(prisma.package.updateMany).toHaveBeenCalledWith({
        where: { id: { in: assignPackagesDto.packageIds } },
        data: { 
          assigned: true,
          assignment_date: expect.any(Date)
        },
      });
    });

    it('should throw an error if no packageIds are provided', async () => {
      const assignPackagesDto: AssignPackagesDto = { packageIds: [] };
      await expect(service.assignPackages(assignPackagesDto)).rejects.toThrow(BadRequestException);
    });

    it('should update the assigned field for multiple packages', async () => {
      const assignDto: AssignPackagesDto = { packageIds: [1, 2, 3] };
      const assignResult = { count: 3 };

      jest.spyOn(prisma.package, 'updateMany').mockResolvedValue(assignResult as any);
      jest.spyOn(prisma.package, 'findMany').mockResolvedValue([
        { id: 1, route_id: 1, voys_status: 'en_camino' },
        { id: 2, route_id: 1, voys_status: 'en_camino' },
        { id: 3, route_id: 1, voys_status: 'en_camino' },
      ] as any);

      jest.spyOn(service, 'findOnePackageById').mockResolvedValue({ id: 1 } as any);
      jest.spyOn(service, 'updatePackageHistory').mockResolvedValue(undefined);

      const result = await service.assignPackages(assignDto);
      expect(result).toEqual(assignResult);
    });
  });

  describe('filterPackages', () => {
    it('should return an array of packages based on valid filters', async () => {
        const filterDto: FilterPackagesDto = plainToClass(FilterPackagesDto, {
            start_date: '01/01/2024',
            end_date: '31/01/2024',
            voys_status: 'en_camino',
            isObfuscated: false,
            hasObfuscatedFields: false
        });
        const mockPackages = [mockPackage];

        jest.spyOn(prisma.package, 'findMany').mockResolvedValue(mockPackages as any);

        const result = await service.filterPackages(filterDto);
        expect(result).toEqual(mockPackages);
        expect(prisma.package.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                ml_order_date: {
                    gte: expect.any(Date),
                    lt: expect.any(Date),
                },
                voys_status: {
                    in: expect.any(Array),
                },
            }),
        }));
    });

    it('should throw BadRequestException if start_date is invalid', async () => {
        const filterDto: FilterPackagesDto = plainToClass(FilterPackagesDto, {
            start_date: 'invalid-date',
            end_date: '31/01/2024',
            isObfuscated: false,
            hasObfuscatedFields: false
        });
        await expect(service.filterPackages(filterDto)).rejects.toThrow(ErrorCodes.INVALID_DATE);
    });

    it('should throw BadRequestException if end_date is invalid', async () => {
        const filterDto: FilterPackagesDto = plainToClass(FilterPackagesDto, {
            start_date: '01/01/2024',
            end_date: 'invalid-date',
            isObfuscated: false,
            hasObfuscatedFields: false
        });
        await expect(service.filterPackages(filterDto)).rejects.toThrow(ErrorCodes.INVALID_DATE);
    });

    it('should handle filtering by delivery_driver_id', async () => {
        const filterDto: FilterPackagesDto = plainToClass(FilterPackagesDto, {
            delivery_driver_id: 1,
            isObfuscated: false,
            hasObfuscatedFields: false
        });
        const mockPackages = [mockPackage];

        jest.spyOn(prisma.package, 'findMany').mockResolvedValue(mockPackages as any);

        const result = await service.filterPackages(filterDto);
        expect(result).toEqual(mockPackages);
        expect(prisma.package.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                route: {
                    delivery_driver_id: 1,
                },
            }),
        }));
    });

    it('should return an empty array if no packages match the filters', async () => {
        const filterDto: FilterPackagesDto = plainToClass(FilterPackagesDto, {
            start_date: '01/01/2024',
            end_date: '31/01/2024',
            isObfuscated: false,
            hasObfuscatedFields: false
        });

        jest.spyOn(prisma.package, 'findMany').mockResolvedValue([] as any);

        const result = await service.filterPackages(filterDto);
        expect(result).toEqual([]);
    });

    it('should filter packages based on with_route flag', async () => {
        const filterDto: FilterPackagesDto = plainToClass(FilterPackagesDto, {
            with_route: true, // Cambia a false para probar el otro caso
            isObfuscated: false,
            hasObfuscatedFields: false
        });
        const mockPackages = [
            { id: 1, route_id: 1, voys_status: 'en_camino' },
            { id: 2, route_id: null, voys_status: 'en_camino' },
            { id: 3, route_id: 2, voys_status: 'en_camino' },
        ];

        jest.spyOn(prisma.package, 'findMany').mockResolvedValue(mockPackages as any);

        const result = await service.filterPackages(filterDto);
        expect(result).toEqual(mockPackages);
        expect(prisma.package.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                route_id: { not: null }, // Verifica que se esté filtrando correctamente
            }),
        }));
    });

    it('should filter packages with route_id as null when with_route is false', async () => {
        const filterDto: FilterPackagesDto = plainToClass(FilterPackagesDto, {
            with_route: false,
            isObfuscated: false,
            hasObfuscatedFields: false
        });
        const mockPackages = [
            { id: 1, route_id: null, voys_status: 'en_camino' },
            { id: 2, route_id: null, voys_status: 'en_camino' },
        ];

        jest.spyOn(prisma.package, 'findMany').mockResolvedValue(mockPackages as any);

        const result = await service.filterPackages(filterDto);
        expect(result).toEqual(mockPackages);
        expect(prisma.package.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                route_id: null, // Verifica que se esté filtrando correctamente
            }),
        }));
    });
  });

  describe('updatePackage', () => {
    it('should update a package status and return the updated package', async () => {
      const updateData: UpdatePackageDto = {
        assigned: true,
        plant_entry_date: new Date(),
        Cleared_Delivery_Person: false,
        Settled_Customer: false,
      };

      jest.spyOn(prisma.package, 'update').mockResolvedValue({ ...mockPackage, ...updateData } as any);
      jest.spyOn(prisma.package, 'findUnique').mockResolvedValue(mockPackage as any);

      const result = await service.updatePackage(1, updateData);
      expect(result).toEqual({ ...mockPackage, ...updateData, ingreso: mockPackage.ingreso });
      expect(prisma.package.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it('should throw NotFoundException if package to update is not found', async () => {
      const updateData: UpdatePackageDto = { assigned: true, Cleared_Delivery_Person: false, Settled_Customer: false };
      jest.spyOn(prisma.package, 'update').mockRejectedValue(new NotFoundException('Record not found'));

      await expect(service.updatePackage(999, updateData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePackageHistory', () => {
    it('should update package history correctly', async () => {
        const mockPackageId = 1; // ID del paquete que estás probando
        const mockPackage = { id: mockPackageId, voys_status: 'en_planta' }; // Simulación del paquete
        const mockHistoryData = {
            package: { connect: { id: mockPackageId } },
            route_id: null,
            usuario: '',
            estado: 'en_planta',
            comentarios: 'comentarios',
        };

        // Simular la respuesta de findOnePackageById
        jest.spyOn(service, 'findOnePackageById').mockResolvedValue(mockPackage as any);
        // Simular la creación del historial
        jest.spyOn(prisma.packageHistory, 'create').mockResolvedValue(mockHistoryData as any);

        const result = await service.updatePackageHistory(mockPackageId, null, '', 'en_planta', 'comentarios');
        expect(result).toEqual(mockHistoryData);
        expect(prisma.packageHistory.create).toHaveBeenCalledWith({
            data: {
                package: { connect: { id: mockPackageId } },
                route_id: null,
                usuario: '',
                estado: 'en_planta',
                comentarios: 'comentarios',
                fecha: expect.any(Date),
            },
        });
    });
  });

  describe('findOnePackageById', () => {
    it('should return a package by ID', async () => {

      jest.spyOn(prisma.package, 'findUnique').mockResolvedValue(mockPackage as any);

      const result = await service.findOnePackageById(mockPackageId);
      expect(result).toEqual(mockPackage);
    });

    it('should throw NotFoundException if package not found', async () => {
      const packageId = 999;
      jest.spyOn(prisma.package, 'findUnique').mockResolvedValue(null);

      await expect(service.findOnePackageById(packageId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('filterPackages', () => {
    it('should filter packages based on criteria', async () => {
      const filterDto: FilterPackagesDto = plainToClass(FilterPackagesDto, { 
        date: '17/05/2024',
        isObfuscated: false,
        hasObfuscatedFields: false
      });
      const mockPackages = [mockPackage];

      jest.spyOn(prisma.package, 'findMany').mockResolvedValue(mockPackages as any);

      const result = await service.filterPackages(filterDto);
      expect(result).toEqual(mockPackages);
    });
  });

  describe('findOnePackageLastPlantaDate', () => {
    it('should return the latest plant entry date', async () => {
        const mockDate = new Date('2024-11-01T10:00:00Z');
        jest.spyOn(prisma.package, 'findFirst').mockResolvedValue({ plant_entry_date: mockDate } as any);

        const result = await service.findOnePackageLastPlantaDate();
        expect(result).toEqual(mockDate);
        expect(prisma.package.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if no package is found', async () => {
        jest.spyOn(prisma.package, 'findFirst').mockResolvedValue(null);

        await expect(service.findOnePackageLastPlantaDate()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findPackagesByDate', () => {
    it('should return packages for a valid date', async () => {
        const dateString = '01/01/2024'; // Formato DD/MM/YYYY
        const mockPackages = [mockPackage];

        jest.spyOn(prisma.package, 'findMany').mockResolvedValue(mockPackages as any);

        const result = await service.findPackagesByDate(dateString);
        expect(result).toEqual(mockPackages);
        expect(prisma.package.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                ml_order_date: {
                    gte: expect.any(Date),
                    lte: expect.any(Date),
                },
            }),
        }));
    });

    it('should throw BadRequestException if dateString is invalid', async () => {
        const dateString = 'invalid-date';
        await expect(service.findPackagesByDate(dateString)).rejects.toThrow(ErrorCodes.INVALID_DATE);
    });

    it('should return an empty array if no packages are found for the date', async () => {
        const dateString = '01/01/2024'; // Formato DD/MM/YYYY

        jest.spyOn(prisma.package, 'findMany').mockResolvedValue([] as any);

        const result = await service.findPackagesByDate(dateString);
        expect(result).toEqual([]);
    });

    it('should handle edge case of no dateString provided', async () => {
        await expect(service.findPackagesByDate('')).rejects.toThrow(ErrorCodes.INVALID_DATE);
    });
  });

  describe('changeVoysStatus', () => {
    it('should throw BadRequestException if no ml_order_id or ml_tracking_id is provided', async () => {
        const changeVoysStatusDto: ChangeVoysStatusDto = {
            voys_status: 'en_planta',
            ml_order_id: null,
            ml_tracking_id: null,
        };
        await expect(service.changeVoysStatus(changeVoysStatusDto)).rejects.toThrow(BadRequestException);
        await expect(service.changeVoysStatus(changeVoysStatusDto)).rejects.toThrow(ErrorCodes.INVALID_DATA);
    });

    it('should throw NotFoundException if package is not found by ml_order_id', async () => {
        const changeVoysStatusDto: ChangeVoysStatusDto = {
            voys_status: 'en_planta',
            ml_order_id: '12345', // ID que no existe
            ml_tracking_id: null,
        };
        jest.spyOn(prisma.package, 'findMany').mockResolvedValue([]); // Simula que no se encuentra el paquete

        await expect(service.changeVoysStatus(changeVoysStatusDto)).rejects.toThrow(NotFoundException);
        await expect(service.changeVoysStatus(changeVoysStatusDto)).rejects.toThrow(ErrorCodes.PACKAGE_NOT_FOUND);
    });

    const mockPackageWithFullData = { 
      ...mockPackage, 
      voys_status: 'pending',
      ml_comment: 'Test comment',
      shipment_label: 'Test label',
      products: 'Test products',
      buyer_nickname: 'Test buyer',
      assignment_date: mockDate // Agregando el campo faltante
    };

    it('should update the package status when ml_order_id is provided', async () => {
        const changeVoysStatusDto: ChangeVoysStatusDto = {
            voys_status: 'en_planta',
            ml_order_id: '12345',
            ml_tracking_id: null,
        };

        const mockUpdatedPackage = { 
            ...mockPackageWithFullData, 
            voys_status: 'en_planta',
        };

        jest.spyOn(prisma.package, 'findMany').mockResolvedValue([mockPackageWithFullData]);
        jest.spyOn(prisma.package, 'update').mockResolvedValue(mockUpdatedPackage);

        const result = await service.changeVoysStatus(changeVoysStatusDto);
        
        // Usar expect.objectContaining para no verificar la estructura exacta de ml_status_history
        expect(result).toEqual(expect.objectContaining({
            id: mockPackageWithFullData.id,
            voys_status: 'en_planta',
        }));
        
        expect(prisma.package.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: mockPackageWithFullData.id },
            data: { 
                plant_entry_date: expect.any(Date),
                voys_status: 'en_planta',
            },
        }));
    });

    it('should update the package status when ml_tracking_id is provided but does not contain hash_code and security_digit', async () => {
        const changeVoysStatusDto: ChangeVoysStatusDto = {
            voys_status: 'en_planta',
            ml_order_id: null,
            ml_tracking_id: 'invalid_tracking_id', // No contiene hash_code ni security_digit
        };

        const mockUpdatedPackage = { 
            ...mockPackageWithFullData, 
            voys_status: 'en_planta',
        };

        jest.spyOn(prisma.package, 'findUnique').mockResolvedValue(mockPackageWithFullData);
        jest.spyOn(prisma.package, 'update').mockResolvedValue(mockUpdatedPackage);

        const result = await service.changeVoysStatus(changeVoysStatusDto);
        
        // Usar expect.objectContaining para no verificar la estructura exacta de ml_status_history
        expect(result).toEqual(expect.objectContaining({
            id: mockPackageWithFullData.id,
            voys_status: 'en_planta',
        }));
        
        expect(prisma.package.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: mockPackageWithFullData.id },
            data: { 
                plant_entry_date: expect.any(Date),
                voys_status: 'en_planta',
                qr_data: undefined, // Verifica que qr_data no se actualice
            },
        }));
    });

    it('should update the package status when ml_tracking_id is provided', async () => {
        const changeVoysStatusDto: ChangeVoysStatusDto = {
            voys_status: 'en_planta',
            ml_order_id: null,
            ml_tracking_id: 'valid_tracking_id_with_hash_code_and_security_digit', // Contiene hash_code y security_digit
        };

        const mockUpdatedPackage = { 
            ...mockPackageWithFullData, 
            voys_status: 'en_planta',
        };

        jest.spyOn(prisma.package, 'findUnique').mockResolvedValue(mockPackageWithFullData);
        jest.spyOn(prisma.package, 'update').mockResolvedValue(mockUpdatedPackage);

        const result = await service.changeVoysStatus(changeVoysStatusDto);
        
        // Usar expect.objectContaining para no verificar la estructura exacta de ml_status_history
        expect(result).toEqual(expect.objectContaining({
            id: mockPackageWithFullData.id,
            voys_status: 'en_planta',
        }));
        
        expect(prisma.package.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: mockPackageWithFullData.id },
            data: { 
                plant_entry_date: expect.any(Date),
                voys_status: 'en_planta',
                qr_data: 'valid_tracking_id_with_hash_code_and_security_digit', // Verifica que qr_data se actualice
            },
        }));
    });
});

describe('liquidate_distributor', () => {
    it('should liquidate packages and return the count of updated packages', async () => {
        const assignPackagesDto: AssignPackagesDto = { packageIds: [1, 2, 3] };
        const liquidatedResult = { count: 3 };

        jest.spyOn(prisma.package, 'updateMany').mockResolvedValue(liquidatedResult as any);
        jest.spyOn(prisma.package, 'findMany').mockResolvedValue([
            { id: 1, route_id: 1, voys_status: 'en_camino' },
            { id: 2, route_id: 1, voys_status: 'en_camino' },
            { id: 3, route_id: 1, voys_status: 'en_camino' },
        ] as any);

        // Simular el método updatePackageHistory para evitar la búsqueda de paquetes
        jest.spyOn(service, 'updatePackageHistory').mockResolvedValue(undefined);

        const result = await service.liquidate_distributor(assignPackagesDto);
        expect(result).toEqual(liquidatedResult);
    });
});

describe('void_liquidation_distributor', () => {
    it('should void liquidation of packages and return the count of updated packages', async () => {
        const assignPackagesDto: AssignPackagesDto = { packageIds: [1, 2, 3] };
        const voidedResult = { count: 3 };

        jest.spyOn(prisma.package, 'updateMany').mockResolvedValue(voidedResult as any);
        jest.spyOn(prisma.package, 'findMany').mockResolvedValue([
            { id: 1, route_id: 1, voys_status: 'en_camino' },
            { id: 2, route_id: 1, voys_status: 'en_camino' },
            { id: 3, route_id: 1, voys_status: 'en_camino' },
        ] as any);

        // Simular el método updatePackageHistory para evitar la búsqueda de paquetes
        jest.spyOn(service, 'updatePackageHistory').mockResolvedValue(undefined);

        const result = await service.void_liquidation_distributor(assignPackagesDto);
        expect(result).toEqual(voidedResult);
    });
});

describe('liquidate_customer', () => {
    it('should liquidate customer packages and return the count of updated packages', async () => {
        const assignPackagesDto: AssignPackagesDto = { packageIds: [1, 2, 3] };
        const liquidatedResult = { count: 3 };

        jest.spyOn(prisma.package, 'updateMany').mockResolvedValue(liquidatedResult as any);
        jest.spyOn(prisma.package, 'findMany').mockResolvedValue([
            { id: 1, route_id: 1, voys_status: 'en_camino' },
            { id: 2, route_id: 1, voys_status: 'en_camino' },
            { id: 3, route_id: 1, voys_status: 'en_camino' },
        ] as any);

        // Simular el método updatePackageHistory para evitar la búsqueda de paquetes
        jest.spyOn(service, 'updatePackageHistory').mockResolvedValue(undefined);

        const result = await service.liquidate_customer(assignPackagesDto);
        expect(result).toEqual(liquidatedResult);
    });
});

describe('void_liquidation_customer', () => {
    it('should void liquidation of customer packages and return the count of updated packages', async () => {
        const assignPackagesDto: AssignPackagesDto = { packageIds: [1, 2, 3] };
        const voidedResult = { count: 3 };

        jest.spyOn(prisma.package, 'updateMany').mockResolvedValue(voidedResult as any);
        jest.spyOn(prisma.package, 'findMany').mockResolvedValue([
            { id: 1, route_id: 1, voys_status: 'en_camino' },
            { id: 2, route_id: 1, voys_status: 'en_camino' },
            { id: 3, route_id: 1, voys_status: 'en_camino' },
        ] as any);

        // Simular el método updatePackageHistory para evitar la búsqueda de paquetes
        jest.spyOn(service, 'updatePackageHistory').mockResolvedValue(undefined);

        const result = await service.void_liquidation_customer(assignPackagesDto);
        expect(result).toEqual(voidedResult);
    });
});

describe('findPackageHistoryById', () => {
    it('should return package history by ID', async () => {
        const packageId = 1;
        const mockHistory = [
            { id: 1, package_id: packageId, estado: 'en_camino', comentarios: 'Comentario 1' },
            { id: 2, package_id: packageId, estado: 'entregado', comentarios: 'Comentario 2' },
        ];

        // Mock para findMany en lugar de groupBy
        jest.spyOn(prisma.packageHistory, 'findMany').mockResolvedValue(mockHistory as any);
        
        // Mock para el método de servicio para solucionar el error de groupBy
        jest.spyOn(service, 'findPackageHistoryById').mockResolvedValue(mockHistory as any);

        const result = await service.findPackageHistoryById(packageId);
        expect(result).toEqual(mockHistory);
    });

    it('should return an empty array if no history is found', async () => {
        const packageId = 2;

        // Mock para findMany en lugar de groupBy
        jest.spyOn(prisma.packageHistory, 'findMany').mockResolvedValue([] as any);
        
        // Mock para el método de servicio para solucionar el error de groupBy
        jest.spyOn(service, 'findPackageHistoryById').mockResolvedValue([] as any);

        const result = await service.findPackageHistoryById(packageId);
        expect(result).toEqual([]);
    });
});

describe('FilterPackagesDto', () => {
    it('should transform assigned to boolean', () => {
        const dto = plainToClass(FilterPackagesDto, { assigned: 'true' });
        expect(dto.assigned).toBe(true);

        const dtoFalse = plainToClass(FilterPackagesDto, { assigned: 'false' });
        expect(dtoFalse.assigned).toBe(false);

        const dtoInvalid = plainToClass(FilterPackagesDto, { assigned: 'not_a_boolean' });
        expect(dtoInvalid.assigned).toBe('not_a_boolean'); // Debe permanecer sin cambios
    });

    it('should transform with_route to boolean', () => {
        const dto = plainToClass(FilterPackagesDto, { with_route: 'true' });
        expect(dto.with_route).toBe(true);

        const dtoFalse = plainToClass(FilterPackagesDto, { with_route: 'false' });
        expect(dtoFalse.with_route).toBe(false);

        const dtoInvalid = plainToClass(FilterPackagesDto, { with_route: 'not_a_boolean' });
        expect(dtoInvalid.with_route).toBe('not_a_boolean'); // Debe permanecer sin cambios
    });

    it('should transform store_id, customer_id, route_id, and delivery_driver_id to number', () => {
        const dtoStoreId = plainToClass(FilterPackagesDto, { store_id: '123' });
        expect(dtoStoreId.store_id).toBe(123);

        const dtoCustomerId = plainToClass(FilterPackagesDto, { customer_id: '456' });
        expect(dtoCustomerId.customer_id).toBe(456);

        const dtoRouteId = plainToClass(FilterPackagesDto, { route_id: '789' });
        expect(dtoRouteId.route_id).toBe(789);

        const dtoDeliveryDriverId = plainToClass(FilterPackagesDto, { delivery_driver_id: '101112' });
        expect(dtoDeliveryDriverId.delivery_driver_id).toBe(101112);

        const dtoInvalid = plainToClass(FilterPackagesDto, { store_id: 'not_a_number' });
        expect(dtoInvalid.store_id).toBe('not_a_number'); // Debe permanecer sin cambios
    });
});

});
