import { ForbiddenException, Injectable, NotFoundException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CreateStoreDto } from '@src/stores/dto/create-store.dto';
import { UpdateStoreDto } from '@src/stores/dto/update-store.dto';
import { PrismaService } from '@src/prisma/prisma.service';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { PrismaErrorCodes } from '@src/errors/prisma-error-codes.enum';

@Injectable()

export class StoresAdminService implements OnModuleInit, OnModuleDestroy {

  constructor(private prisma: PrismaService) { }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async createStore(createStoreDto: CreateStoreDto) {

    try {
      const customer =  await this.prisma.customer.findFirst({
          orderBy: { created_at: 'desc' }
        });
      
      console.log(customer);
      // Verificar si se encontró un cliente
      if (!customer) {
        throw new NotFoundException(ErrorCodes.CUSTOMER_NOT_FOUND);
      }

      const { shipping_method_id, ...data } = createStoreDto;

      return await this.prisma.store.create({
        data: {
          ...data,
          customer: { connect: { id: customer.id } },
          shipping_method: { connect: { id: shipping_method_id } }
        }
      })

    } catch (error) {

      if (error?.code === PrismaErrorCodes.UNIQUE_CONSTRAINT_FAILED) {

        throw new ForbiddenException(ErrorCodes.EMAIL_ALREADY_REGISTERED)

      }

      throw error;

    }

  }

  async findAllStores() {

    const stores = await this.prisma.store.findMany({
      include: {
        customer: {
          select: {
            user: {
              omit: { email: true, password: true }
            }
          }
        },
        shipping_method: {
          select: {
            name: true
          }
        }
      }
    });

    if(!stores) return [];

    return stores;

  }

  async findStoreById(id: number) {

    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            user: {
              omit: { email: true, password: true }
            }
          }
        },
        shipping_method: {
          select: {
            name: true
          }
        }
      }
    })

    if (!store) {

      throw new NotFoundException(ErrorCodes.RESOURCE_NOT_FOUND);

    }

    return store;

  }
  
  async updateStore(id: number, updateStoreDto: UpdateStoreDto) {

    return await this.prisma.store.update({
      where: { id },
      data: { ...updateStoreDto }
    })

  }

  async deleteStore(id: number) {

    try {

      return await this.prisma.store.delete({
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
