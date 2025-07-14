import { Test, TestingModule } from '@nestjs/testing';
import { MLAuthController } from './ml-auth.controller';
import { MLAuthService } from './ml-auth.service';
import { StoresSellerService } from '@src/stores/stores.seller.service';
import { StoresAdminService } from '@src/stores/stores.admin.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { RoleNames } from '@src/roles/roles.enum';

describe('MLAuthController', () => {
    let controller: MLAuthController;
    let mlAuthService: MLAuthService;
    let storesSellerService: StoresSellerService;
    let storesAdminService: StoresAdminService;

    const mockStore = {
        id: 1,
        state: 'test-state',
        ml_fantazy_name: 'Test Store',
        real_name: 'Real Test Store',
        ml_user_id: 'ML123456',
        cut_schedule: '18:00',
        active: true,
        vinculated: false,
        notes: 'Test notes',
        customer_id: 1,
        shipping_method_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        customer: {
            user: {
                id: 1,
                name: 'Test',
                last_name: 'User',
                active: true,
                role_id: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
        },
        shipping_method: { name: 'Test Method' },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MLAuthController],
            providers: [
                {
                    provide: MLAuthService,
                    useValue: {
                        getAccessToken: jest.fn(),
                    },
                },
                {
                    provide: StoresSellerService,
                    useValue: {
                        findStoreById: jest.fn(),
                    },
                },
                {
                    provide: StoresAdminService,
                    useValue: {
                        findStoreById: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<MLAuthController>(MLAuthController);
        mlAuthService = module.get<MLAuthService>(MLAuthService);
        storesSellerService = module.get<StoresSellerService>(StoresSellerService);
        storesAdminService = module.get<StoresAdminService>(StoresAdminService);
    });

    describe('MLAuthController', () => {
      // ... configuración de pruebas (sin cambios)
  
      describe('generateAuthUrl', () => {
          it('should throw NotFoundException if store is not found', async () => {
              jest.spyOn(storesAdminService, 'findStoreById').mockResolvedValue(null);
              const req = { user: { role: RoleNames.ADMIN } };
  
              await expect(controller.generateAuthUrl(1, req)).rejects.toThrow(NotFoundException);
          });
  
          it('should throw NotFoundException if store is already vinculated', async () => {
            jest.spyOn(storesAdminService, 'findStoreById').mockImplementation(() => {
                throw new Error('Store is already vinculated');
            });
        
            const req = { user: { role: RoleNames.ADMIN } };
        
            await expect(controller.generateAuthUrl(1, req)).rejects.toThrow(NotFoundException);
            await expect(controller.generateAuthUrl(1, req)).rejects.toThrow('Error retrieving store: Store is already vinculated');
        });
        
  
          it('should return auth URL for ADMIN role', async () => {
              jest.spyOn(storesAdminService, 'findStoreById').mockResolvedValue(mockStore);
              const req = { user: { role: RoleNames.ADMIN } };
  
              const result = await controller.generateAuthUrl(1, req);
              expect(result).toHaveProperty('url');
              expect(result.url.href).toContain('https://auth.mercadolibre.com.ar/authorization');
              expect(result.url.href).toContain('state=test-state');
          });
  
          it('should return auth URL for SELLER role', async () => {
              jest.spyOn(storesSellerService, 'findStoreById').mockResolvedValue(mockStore);
              const req = { user: { role: RoleNames.SELLER, userId: 1 } };
  
              const result = await controller.generateAuthUrl(1, req);
              expect(result).toHaveProperty('url');
              expect(result.url.href).toContain('https://auth.mercadolibre.com.ar/authorization');
              expect(result.url.href).toContain('state=test-state');
          });
      });
  });
  
});
