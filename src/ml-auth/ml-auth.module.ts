import { Module } from '@nestjs/common';
import { MLAuthService } from '@src/ml-auth/ml-auth.service';
import { MLAuthController } from '@src/ml-auth/ml-auth.controller';
import { PrismaService } from '@src/prisma/prisma.service';
import { StoresSellerService } from '@src/stores/stores.seller.service';
import { StoresAdminService } from '@src/stores/stores.admin.service';

@Module({
  providers: [MLAuthService, PrismaService, StoresSellerService, StoresAdminService],
  controllers: [MLAuthController]
})
export class MlAuthModule {}