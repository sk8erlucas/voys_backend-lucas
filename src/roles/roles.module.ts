import { Module } from '@nestjs/common';
import { RolesService } from '@src/roles/roles.service';
import { RolesController } from '@src/roles/roles.controller';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService]
})
export class RolesModule {}
