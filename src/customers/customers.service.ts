import { ForbiddenException, Injectable, NotFoundException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CreateCustomerDto } from '@src/customers/dto/create-customer.dto';
import { PrismaService } from '@src/prisma/prisma.service';
import { Customer, User } from '@prisma/client';
import { UsersService } from '@src/users/users.service';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { PrismaErrorCodes } from '@src/errors/prisma-error-codes.enum';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService implements OnModuleInit, OnModuleDestroy {

  constructor(
    private prisma: PrismaService,
    private readonly usersService: UsersService,

  ) { }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
  
  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<Customer> {

    try {

      const { customer_type_id, ...customer } = createCustomerDto;

      /*
        Se puede crear el rest api de customer_types creando su modulo (controlador y servico), 
        por ahora se asignará el customer_type_id manualmente a valor 1 que corresponde a Seller (usuario vendedor)
      */

      const user: User = await this.usersService.createUser({ ...createCustomerDto.user, role_id: 2 });

      return await this.prisma.customer.create({
        data: {
          ...customer,
          user: {
            connect: { id: user.id },
          },
          customer_type: {
            connect: { id: 1 }
          }
        },
      })

    } catch (error) {

      if (error?.code === PrismaErrorCodes.UNIQUE_CONSTRAINT_FAILED) {

        const existingUser = await this.prisma.user.findUnique({
          where: { email: createCustomerDto.user.email },
          include: { customer: true },
        });

        if (existingUser && existingUser.customer === null) {
          await this.prisma.user.delete({ where: { id: existingUser.id } });
          return this.createCustomer(createCustomerDto);
        }
        
        throw new ForbiddenException(ErrorCodes.EMAIL_ALREADY_REGISTERED)

      }

      console.log(error);

      throw error;

    }

  }

  async findAllCustomers() {

    const customers = await this.prisma.customer.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role_id: true
          }
        }
      }

    })

    if (!customers) return [];

    return customers;

  }

  async findCustomerById(id: number): Promise<Customer> {

    return await this.prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            last_name: true,
            email: true,
            role_id: true
          }
        }
      }
    })

  }

  async updateCustomer(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {

    const { user, ...customerData } = updateCustomerDto;

    const customer = await this.findCustomerById(id);

    await this.usersService.updateUser(customer.user_id, updateCustomerDto.user);

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...customerData
      }
    })
  }

  async deleteCustomer(id: number): Promise<Customer> {
    try {
      // Primero verificamos si el cliente existe
      const customer = await this.findCustomerById(id);
      if (!customer) {
        throw new NotFoundException(ErrorCodes.RESOURCE_NOT_FOUND);
      }

      // Primero eliminamos las tiendas asociadas al cliente
      await this.prisma.store.deleteMany({
        where: { customer_id: id }
      });

      // Luego eliminamos el cliente
      return await this.prisma.customer.delete({
        where: { id }
      });

    } catch (error) {
      if (error?.code === PrismaErrorCodes.REQUIRED_RECORDS_NOT_FOUND) {
        throw new NotFoundException(ErrorCodes.RESOURCE_NOT_FOUND);
      }
      throw error;
    }
  }

}
