import { Module } from '@nestjs/common';
import { MLNotificationsService } from '@src/ml-notifications/ml-notifications.service';
import { MLNotificationsController } from '@src/ml-notifications/ml-notifications.controller';
import { MLSyncService } from '@src/ml-notifications/ml-sync.service';
import { MLSyncController } from '@src/ml-notifications/ml-sync.controller';
import { MLAuthService } from '@src/ml-auth/ml-auth.service';
import { PackagesModule } from '@src/_packages/_packages.module';
@Module({
  imports: [PackagesModule],
  controllers: [MLNotificationsController, MLSyncController],
  providers: [MLNotificationsService, MLSyncService, MLAuthService],
})
export class MLNotificationsModule {}
