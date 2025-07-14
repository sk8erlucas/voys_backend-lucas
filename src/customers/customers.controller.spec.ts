import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { PrismaModule } from '@src/prisma/prisma.module';
import { UsersService } from '@src/users/users.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from '@prisma/client';

describe('CustomersController', () => {
  let controller: CustomersController;
  let customersService: CustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: {
            createCustomer: jest.fn(),
            findAllCustomers: jest.fn(),
            findCustomerById: jest.fn(),
            updateCustomer: jest.fn(),
            deleteCustomer: jest.fn(),
          },
        },
        UsersService,
      ],
      imports: [PrismaModule]
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    customersService = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a customer', async () => {
    const createCustomerDto: CreateCustomerDto = {
      company_name: 'Test Company',
      customer_type_id: 1,
      user: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }
    };
    const expectedResult: Partial<Customer> = { id: 1, ...createCustomerDto };
    jest.spyOn(customersService, 'createCustomer').mockResolvedValue(expectedResult as Customer);

    expect(await controller.createCustomer(createCustomerDto)).toBe(expectedResult);
    expect(customersService.createCustomer).toHaveBeenCalledWith(createCustomerDto);
  });

  it('should find all customers', async () => {
    const expectedResult: Partial<Customer & { user: { name: string; id: number; email: string; role_id: number } }>[] = [
      { 
        id: 1, 
        company_name: 'Test Company',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role_id: 2
        }
      }
    ];
    jest.spyOn(customersService, 'findAllCustomers').mockResolvedValue(expectedResult as (Customer & { user: { name: string; id: number; email: string; role_id: number } })[]);

    expect(await controller.findAllCustomers()).toBe(expectedResult);
    expect(customersService.findAllCustomers).toHaveBeenCalled();
  });

  it('should find a customer by id', async () => {
    const id = 1;
    const expectedResult: Partial<Customer> = { id, company_name: 'Test Company' };
    jest.spyOn(customersService, 'findCustomerById').mockResolvedValue(expectedResult as Customer);

    expect(await controller.findCustomerById(id)).toBe(expectedResult);
    expect(customersService.findCustomerById).toHaveBeenCalledWith(id);
  });

  it('should update a customer', async () => {
    const id = 1;
    const updateCustomerDto: UpdateCustomerDto = {
      company_name: 'Updated Company',
      customer_type_id: 2,
      user: {
        name: 'Updated User',
        password: 'newpassword123' // Agregamos la propiedad password
      }
    };
    const expectedResult: Partial<Customer> = { id, ...updateCustomerDto };
    jest.spyOn(customersService, 'updateCustomer').mockResolvedValue(expectedResult as Customer);

    expect(await controller.updateCustomer(id, updateCustomerDto)).toBe(expectedResult);
    expect(customersService.updateCustomer).toHaveBeenCalledWith(id, updateCustomerDto);
  });

  it('should delete a customer', async () => {
    const id = 1;
    const expectedResult: Partial<Customer> = { id, company_name: 'Deleted Company' };
    jest.spyOn(customersService, 'deleteCustomer').mockResolvedValue(expectedResult as Customer);

    expect(await controller.deleteCustomer(id)).toBe(expectedResult);
    expect(customersService.deleteCustomer).toHaveBeenCalledWith(id);
  });
});