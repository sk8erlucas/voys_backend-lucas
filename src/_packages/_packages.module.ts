import { Module } from '@nestjs/common';
import { PackagesService } from './_packages.service';
import { PackagesController } from './_packages.controller';

@Module({
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
