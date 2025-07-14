import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './errors/all-exceptions.filter';
import { CustomersModule } from './customers/customers.module';
import { DeliveryDriverModule } from './delivery-drivers/delivery-driver.module';
import { CustomerTypesModule } from './customer-types/customer-types.module';
import { StoresModule } from './stores/stores.module';
import { PrismaModule } from './prisma/prisma.module';
import { MlAuthModule } from './ml-auth/ml-auth.module';
import { MLNotificationsModule } from './ml-notifications/ml-notifications.module';
import { PackagesModule } from './_packages/_packages.module';
import { VoysStatusModule } from './voys-status/voys-status.module';
import { StatsModule } from './stats/stats.module';
import { RoutesModule } from './routes/routes.module';
import { FaviconController } from './favicon.controller';
import { SentryModule } from '@sentry/nestjs/setup';

@Module({
  imports: [
    SentryModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que las variables de entorno estén disponibles en toda la aplicación
      envFilePath: '.env', // Este es el archivo que contiene las variables de entorno
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    RolesModule,
    CustomersModule,
    DeliveryDriverModule,
    CustomerTypesModule,
    MlAuthModule,
    StoresModule,
    MLNotificationsModule,
    PackagesModule,
    RoutesModule,
    VoysStatusModule,
    StatsModule
  ],
  controllers: [FaviconController],
  providers: [{
    provide: APP_FILTER,
    useClass: AllExceptionsFilter
  }],
})
export class AppModule {}
