import { ForbiddenException, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CreateDeliveryDriverDto } from '@src/delivery-drivers/dto/create-delivery-driver.dto';
import { UpdateDeliveryDriverDto } from '@src/delivery-drivers/dto/update-delivery-driver.dto';
import { PrismaService } from '@src/prisma/prisma.service';
import { DeliveryDriver } from '@prisma/client';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { PrismaErrorCodes } from '@src/errors/prisma-error-codes.enum';
import { FilterDeliveryDriverDto } from './dto/filter-delivery-driver.dto';

@Injectable()
export class DeliveryDriverService implements OnModuleInit, OnModuleDestroy {

  constructor(private prisma: PrismaService) { }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async createDeliveryDriver(createDeliveryDriverDto: CreateDeliveryDriverDto) {

    try {

      return await this.prisma.deliveryDriver.create({

        data: { ...createDeliveryDriverDto }
      }

      )

    } catch (error) {

      if (error?.code === PrismaErrorCodes.UNIQUE_CONSTRAINT_FAILED) {

        throw new ForbiddenException(ErrorCodes.DNI_ALREADY_REGISTERED)

      } else {

        throw error;

      }

    }

  }

  async findAllDeliveryDriver(filters: FilterDeliveryDriverDto) {

    const { with_packages } = filters;

    const where: any = {};

    if (with_packages) {
      where.route = {
        some: {
          package: {
            some: {
              assigned: true,
              route_id: { not: null },
            }
          }
        }
      };
    }

    return await this.prisma.deliveryDriver.findMany({
      where,
      include: { route: true }
    });

  }

  async findDeliveryDriverById(id: number): Promise<DeliveryDriver> {

    return await this.prisma.deliveryDriver.findUnique({

      where: { id }

    })

  }

  async updateDeliveryDriver(id: number, updateDeliveryDriverDto: UpdateDeliveryDriverDto) {

    return await this.prisma.deliveryDriver.update({

      where: { id },

      data: { ...updateDeliveryDriverDto }

    })

  }

  async deleteDeliveryDriver(id: number): Promise<DeliveryDriver> {

    return await this.prisma.deliveryDriver.delete({

      where: { id }

    })

  }

}
