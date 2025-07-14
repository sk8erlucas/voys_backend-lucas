import { Test, TestingModule } from '@nestjs/testing';
import { CustomerTypesService } from './customer-types.service';

describe('CustomerTypesService', () => {
  let service: CustomerTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerTypesService],
    }).compile();

    service = module.get<CustomerTypesService>(CustomerTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
