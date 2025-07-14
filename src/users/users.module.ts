import { Module } from '@nestjs/common';
import { UsersService } from '@src/users/users.service';
import { UsersController } from '@src/users/users.controller';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
