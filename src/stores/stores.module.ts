import { Module } from '@nestjs/common';
import { StoresSellerService } from '@src/stores/stores.seller.service';
import { StoresController } from '@src/stores/stores.controller';
import { StoresAdminService } from '@src/stores/stores.admin.service';

@Module({
  controllers: [StoresController],
  providers: [StoresSellerService, StoresAdminService],
})
export class StoresModule {}
