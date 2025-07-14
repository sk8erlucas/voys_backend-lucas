import { Module } from '@nestjs/common';
import { DeliveryDriverService } from './delivery-driver.service';
import { DeliveryDriverController } from './delivery-driver.controller';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  controllers: [DeliveryDriverController],
  providers: [DeliveryDriverService],
  exports: [DeliveryDriverService]
})
export class DeliveryDriverModule {}

