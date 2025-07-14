import { Module } from '@nestjs/common';
import { CustomersService } from '@src/customers/customers.service';
import { CustomersController } from '@src/customers/customers.controller';
import { UsersService } from '@src/users/users.service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, UsersService]
})
export class CustomersModule {}