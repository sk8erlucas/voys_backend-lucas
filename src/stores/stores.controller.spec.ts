import { Test, TestingModule } from '@nestjs/testing';
import { StoresController } from './stores.controller';
import { StoresSellerService } from './stores.seller.service';
import { StoresAdminService } from './stores.admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { RoleNames } from '@src/roles/roles.enum';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('StoresController', () => {
  let controller: StoresController;
  let storesSellerService: Partial<StoresSellerService>;
  let storesAdminService: Partial<StoresAdminService>;
  let prismaService: Partial<PrismaService>;

  const mockStore = {
    id: 1,
    cut_schedule: '18:00',
    active: true,
    notes: 'Test notes',
    shipping_method_id: 1,
  };

  const mockUser = {
    id: 1,
    name: 'Test User',
  };

  const createStoreDto: CreateStoreDto = {
    cut_schedule: '19:00',
    active: true,
    notes: 'New store notes',
    shipping_method_id: 2,
  };

  const mockReq = { user: { userId: 1, role: RoleNames.SELLER } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [
        {
          provide: StoresSellerService,
          useValue: {
            createStore: jest.fn().mockResolvedValue(mockStore),
            findAllStores: jest.fn().mockResolvedValue([mockStore]),
            findStoreById: jest.fn().mockResolvedValue(mockStore),
            updateStore: jest.fn().mockResolvedValue(mockStore),
            deleteStore: jest.fn().mockResolvedValue(mockStore),
          },
        },
        {
          provide: StoresAdminService,
          useValue: {
            findAllStores: jest.fn().mockResolvedValue([mockStore]),
            findStoreById: jest.fn().mockResolvedValue(mockStore),
            updateStore: jest.fn().mockResolvedValue(mockStore),
            deleteStore: jest.fn().mockResolvedValue(mockStore),
            createStore: jest.fn().mockResolvedValue(mockStore),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            customer: {
              findFirst: jest.fn(),
            },
            store: {
              create: jest.fn(),
            },
            user: {
              findFirst: jest.fn().mockResolvedValue(mockUser),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<StoresController>(StoresController);
    storesSellerService = module.get<StoresSellerService>(StoresSellerService);
    storesAdminService = module.get<StoresAdminService>(StoresAdminService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createStore', () => {
    it('should create a store for a seller', async () => {
      const result = await controller.createStore(createStoreDto, mockReq);
      expect(result).toEqual(mockStore);
      expect(storesSellerService.createStore).toHaveBeenCalledWith(createStoreDto, 1);
    });

    it('should create a store for an admin', async () => {
      const req = { user: { userId: 1, role: RoleNames.ADMIN } };
      const result = await controller.createStore(createStoreDto, req);
      expect(result).toEqual(mockStore);
      expect(storesAdminService.createStore).toHaveBeenCalledWith(createStoreDto);
    });


  });

  describe('findAllStores', () => {
    it('should return all stores for a seller', async () => {
      const req = { user: { userId: 1, role: RoleNames.SELLER } };
      const result = await controller.findAllStores(req);
      expect(result).toEqual([mockStore]);
      expect(storesSellerService.findAllStores).toHaveBeenCalledWith(1);
    });

    it('should return all stores for an admin', async () => {
      const req = { user: { userId: 1, role: RoleNames.ADMIN } };
      const result = await controller.findAllStores(req);
      expect(result).toEqual([mockStore]);
      expect(storesAdminService.findAllStores).toHaveBeenCalled();
    });
  });

  describe('findStoreById', () => {
    it('should return a store by id for a seller', async () => {
      const req = { user: { userId: 1, role: RoleNames.SELLER } };
      const result = await controller.findStoreById(1, req);
      expect(result).toEqual(mockStore);
      expect(storesSellerService.findStoreById).toHaveBeenCalledWith(1, 1);
    });

    it('should return a store by id for an admin', async () => {
      const req = { user: { userId: 1, role: RoleNames.ADMIN } };
      const result = await controller.findStoreById(1, req);
      expect(result).toEqual(mockStore);
      expect(storesAdminService.findStoreById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateStore', () => {
    const updateStoreDto: UpdateStoreDto = {
      cut_schedule: '20:00',
      active: false,
      notes: 'Updated notes',
      shipping_method_id: 2,
    };

    it('should update a store for a seller', async () => {
      const req = { user: { userId: 1, role: RoleNames.SELLER } };
      const result = await controller.updateStore(1, updateStoreDto, req);
      expect(result).toEqual(mockStore);
      expect(storesSellerService.updateStore).toHaveBeenCalledWith(1, updateStoreDto, 1);
    });

    it('should update a store for an admin', async () => {
      const req = { user: { userId: 1, role: RoleNames.ADMIN } };
      const result = await controller.updateStore(1, updateStoreDto, req);
      expect(result).toEqual(mockStore);
      expect(storesAdminService.updateStore).toHaveBeenCalledWith(1, updateStoreDto);
    });
  });

  describe('deleteStore', () => {
    it('should delete a store for a seller', async () => {
      const req = { user: { userId: 1, role: RoleNames.SELLER } };
      const result = await controller.deleteStore(1, req);
      expect(result).toEqual(mockStore);
      expect(storesSellerService.deleteStore).toHaveBeenCalledWith(1, 1);
    });

    it('should delete a store for an admin', async () => {
      const req = { user: { userId: 1, role: RoleNames.ADMIN } };
      const result = await controller.deleteStore(1, req);
      expect(result).toEqual(mockStore);
      expect(storesAdminService.deleteStore).toHaveBeenCalledWith(1);
    });
  });
});
