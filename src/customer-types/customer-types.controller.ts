import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomerTypesService } from './customer-types.service';
import { CreateCustomerTypeDto } from './dto/create-customer-type.dto';
import { UpdateCustomerTypeDto } from './dto/update-customer-type.dto';

@Controller('customer-types')
export class CustomerTypesController {
  constructor(private readonly customerTypesService: CustomerTypesService) {}
}
