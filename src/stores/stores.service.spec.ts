import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '@src/prisma/prisma.module';
import { StoresSellerService } from '@src/stores/stores.seller.service'

describe('StoresService', () => {
  let service: StoresSellerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoresSellerService],
      imports: [PrismaModule]
    }).compile();

    service = module.get<StoresSellerService>(StoresSellerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
