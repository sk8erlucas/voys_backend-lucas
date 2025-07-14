import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { PackagesModule } from '@src/_packages/_packages.module';

@Module({
  imports: [PackagesModule],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
