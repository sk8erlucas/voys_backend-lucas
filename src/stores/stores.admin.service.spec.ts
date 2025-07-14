import { Test, TestingModule } from '@nestjs/testing';
import { StoresAdminService } from './stores.admin.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { PrismaErrorCodes } from '@src/errors/prisma-error-codes.enum';
import { UpdateStoreDto } from './dto/update-store.dto';
import { CreateStoreDto } from './dto/create-store.dto';

describe('StoresAdminService', () => {
  let service: StoresAdminService;
  let prismaService: PrismaService;

  const mockStore = {
    id: 1,
    cut_schedule: '18:00',
    active: true,
    notes: 'Test store',
    shipping_method_id: 1,
    customer: {
      user: {
        id: 1,
        name: 'Test User',
      }
    },
    shipping_method: {
      name: 'Test Shipping Method',
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresAdminService,
        {
          provide: PrismaService,
          useValue: {
            store: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              create: jest.fn(),
            },
            customer: {
              findFirst: jest.fn(),
            },
            $connect: jest.fn(),
            $disconnect: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StoresAdminService>(StoresAdminService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('debería conectar a la base de datos en onModuleInit', async () => {
    await service.onModuleInit();
    expect(prismaService.$connect).toHaveBeenCalled();
  });

  it('debería desconectar de la base de datos en onModuleDestroy', async () => {
    await service.onModuleDestroy();
    expect(prismaService.$disconnect).toHaveBeenCalled();
  });

  describe('findAllStores', () => {
    it('should return an array of stores', async () => {
      (prismaService.store.findMany as jest.Mock).mockResolvedValue([mockStore]);
      const result = await service.findAllStores();
      expect(result).toEqual([mockStore]);
    });

    it('should return an empty array if no stores found', async () => {
      (prismaService.store.findMany as jest.Mock).mockResolvedValue(null);
      const result = await service.findAllStores();
      expect(result).toEqual([]);
    });
  });

  describe('findStoreById', () => {
    it('should return a store if found', async () => {
      (prismaService.store.findUnique as jest.Mock).mockResolvedValue(mockStore);
      const result = await service.findStoreById(1);
      expect(result).toEqual(mockStore);
    });

    it('should throw NotFoundException if store not found', async () => {
      (prismaService.store.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findStoreById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStore', () => {
    it('should update and return the store', async () => {
      const updateStoreDto: UpdateStoreDto = {
        cut_schedule: '19:00',
        active: true,
        notes: 'Updated notes',
        shipping_method_id: 2
      };
      const updatedStore = { ...mockStore, ...updateStoreDto };
      (prismaService.store.update as jest.Mock).mockResolvedValue(updatedStore);
      const result = await service.updateStore(1, updateStoreDto);
      expect(result).toEqual(updatedStore);
    });

    it('debería lanzar NotFoundException si la tienda no existe', async () => {
      const updateStoreDto: UpdateStoreDto = {
        cut_schedule: '19:00',
        active: true,
        notes: 'Updated notes',
        shipping_method_id: 2
      };
      (prismaService.store.update as jest.Mock).mockRejectedValue(new NotFoundException('Record not found'));
      
      await expect(service.updateStore(1, updateStoreDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteStore', () => {
    it('should delete and return the store', async () => {
      (prismaService.store.delete as jest.Mock).mockResolvedValue(mockStore);
      const result = await service.deleteStore(1);
      expect(result).toEqual(mockStore);
    });

    it('should throw NotFoundException if store not found', async () => {
      const error = new Error('Record not found');
      (error as any).code = PrismaErrorCodes.REQUIRED_RECORDS_NOT_FOUND;
      (prismaService.store.delete as jest.Mock).mockRejectedValue(error);
      await expect(service.deleteStore(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw the original error if it\'s not a "not found" error', async () => {
      const error = new Error('Some other error');
      (prismaService.store.delete as jest.Mock).mockRejectedValue(error);
      await expect(service.deleteStore(1)).rejects.toThrow('Some other error');
    });

    it('debería lanzar NotFoundException si la tienda no existe', async () => {
      (prismaService.store.delete as jest.Mock).mockRejectedValue(new NotFoundException('Record not found'));
      
      await expect(service.deleteStore(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createStore', () => {
    it('debería crear y devolver una tienda', async () => {
      const createStoreDto: CreateStoreDto = {
        cut_schedule: '18:00',
        active: true,
        notes: 'New store',
        shipping_method_id: 1
      };
      const customer = { id: 1 };
      
      (prismaService.customer.findFirst as jest.Mock).mockResolvedValue(customer);

      const createdStore = { id: 2, ...createStoreDto, customer: { connect: { id: customer.id } } };
      (prismaService.store.create as jest.Mock).mockResolvedValue(createdStore);
      
      const result = await service.createStore(createStoreDto);
      expect(result).toEqual(createdStore);
    });

    it('debería lanzar NotFoundException si no se encuentra un cliente', async () => {
      const createStoreDto: CreateStoreDto = {
        cut_schedule: '18:00',
        active: true,
        notes: 'New store',
        shipping_method_id: 1
      };
      
      (prismaService.customer.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.createStore(createStoreDto)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si hay un error de UNIQUE_CONSTRAINT_FAILED', async () => {
      const createStoreDto: CreateStoreDto = {
        cut_schedule: '18:00',
        active: true,
        notes: 'New store',
        shipping_method_id: 1
      };
      
      (prismaService.customer.findFirst as jest.Mock).mockResolvedValue({ id: 1 });

      (prismaService.store.create as jest.Mock).mockRejectedValue({ code: PrismaErrorCodes.UNIQUE_CONSTRAINT_FAILED });

      await expect(service.createStore(createStoreDto)).rejects.toThrow(ForbiddenException);
      await expect(service.createStore(createStoreDto)).rejects.toThrow(ErrorCodes.EMAIL_ALREADY_REGISTERED);
    });
  });
});
