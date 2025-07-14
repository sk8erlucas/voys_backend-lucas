import { Module } from '@nestjs/common';
import { VoysStatusService } from '@src/voys-status/voys-status.service';
import { VoysStatusController } from '@src/voys-status/voys-status.controller';
import { PrismaService } from '@src/prisma/prisma.service';

@Module({
  controllers: [VoysStatusController],
  providers: [VoysStatusService, PrismaService],
})
export class VoysStatusModule {}
