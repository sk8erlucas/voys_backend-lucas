import { Test, TestingModule } from '@nestjs/testing';
import { CustomerTypesController } from './customer-types.controller';
import { CustomerTypesService } from './customer-types.service';
import { CreateCustomerTypeDto } from './dto/create-customer-type.dto';
import { UpdateCustomerTypeDto } from './dto/update-customer-type.dto';

describe('CustomerTypesController', () => {
  let controller: CustomerTypesController;
  let service: CustomerTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerTypesController],
      providers: [CustomerTypesService],
    }).compile();

    controller = module.get<CustomerTypesController>(CustomerTypesController);
    service = module.get<CustomerTypesService>(CustomerTypesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('CreateCustomerTypeDto', () => {
    it('should allow setting name and description properties', () => {
      const dto = new CreateCustomerTypeDto();
      dto.name = 'Test Name';
      dto.description = 'Test Description';
      expect(dto.name).toBe('Test Name');
      expect(dto.description).toBe('Test Description');
    });
  });

  describe('UpdateCustomerTypeDto', () => {
    it('should be a partial type of CreateCustomerTypeDto', () => {
      const dto = new UpdateCustomerTypeDto();
      expect(dto).toEqual({});
    });

    it('should allow partial properties', () => {
      const partialDto = new UpdateCustomerTypeDto();
      partialDto.name = 'Test Name';
      expect(partialDto.name).toBe('Test Name');
      expect(partialDto.description).toBeUndefined();
    });
  });
});
