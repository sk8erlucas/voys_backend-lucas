import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from '@src/customers/customers.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { UsersService } from '@src/users/users.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, User } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaErrorCodes } from '@src/errors/prisma-error-codes.enum';

describe('CustomersService', () => {
  let service: CustomersService;
  let prismaService: PrismaService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: {
            customer: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            store: {
              deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            },
            $connect: jest.fn().mockResolvedValue(undefined),
            $disconnect: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            updateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prismaService = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
    jest.spyOn(usersService, 'createUser').mockResolvedValue({ id: 1 } as User);
    jest.spyOn(prismaService.customer, 'create').mockResolvedValue(expectedResult as Customer);

    expect(await service.createCustomer(createCustomerDto)).toBe(expectedResult);
  });

  it('should find all customers', async () => {
    const expectedResult: Partial<Customer>[] = [{ id: 1, company_name: 'Test Company' }];
    jest.spyOn(prismaService.customer, 'findMany').mockResolvedValue(expectedResult as Customer[]);

    expect(await service.findAllCustomers()).toBe(expectedResult);
  });

  it('should find a customer by id', async () => {
    const id = 1;
    const expectedResult: Partial<Customer> = { id, company_name: 'Test Company' };
    jest.spyOn(prismaService.customer, 'findUnique').mockResolvedValue(expectedResult as Customer);

    expect(await service.findCustomerById(id)).toBe(expectedResult);
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
    jest.spyOn(service, 'findCustomerById').mockResolvedValue({ user_id: 1 } as Customer);
    jest.spyOn(usersService, 'updateUser').mockResolvedValue({} as User);
    jest.spyOn(prismaService.customer, 'update').mockResolvedValue(expectedResult as Customer);

    expect(await service.updateCustomer(id, updateCustomerDto)).toBe(expectedResult);
  });

  it('should delete a customer', async () => {
    const id = 1;
    const expectedResult: Partial<Customer> = { id, company_name: 'Deleted Company' };
    jest.spyOn(service, 'findCustomerById').mockResolvedValue(expectedResult as Customer);
    jest.spyOn(prismaService.store, 'deleteMany').mockResolvedValue({ count: 0 });
    jest.spyOn(prismaService.customer, 'delete').mockResolvedValue(expectedResult as Customer);

    expect(await service.deleteCustomer(id)).toBe(expectedResult);
  });

  it('should throw ForbiddenException when creating a customer with existing email', async () => {
    const createCustomerDto: CreateCustomerDto = {
      company_name: 'Test Company',
      customer_type_id: 1,
      user: {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      }
    };
    jest.spyOn(usersService, 'createUser').mockRejectedValue({ code: PrismaErrorCodes.UNIQUE_CONSTRAINT_FAILED });
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({ id: 1, email: 'existing@example.com' } as User);

    await expect(service.createCustomer(createCustomerDto)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException when deleting a non-existent customer', async () => {
    const id = 999;
    jest.spyOn(service, 'findCustomerById').mockResolvedValue(null);
    jest.spyOn(prismaService.customer, 'delete').mockRejectedValue({ code: PrismaErrorCodes.REQUIRED_RECORDS_NOT_FOUND });

    await expect(service.deleteCustomer(id)).rejects.toThrow(NotFoundException);
  });

  it('should connect to the database on module init', async () => {
    await service.onModuleInit();
    expect(prismaService.$connect).toHaveBeenCalled();
  });

  it('should disconnect from the database on module destroy', async () => {
    await service.onModuleDestroy();
    expect(prismaService.$disconnect).toHaveBeenCalled();
  });
});