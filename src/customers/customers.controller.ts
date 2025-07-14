import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards, Patch } from '@nestjs/common';
import { CustomersService } from '@src/customers/customers.service';
import { CreateCustomerDto } from '@src/customers/dto/create-customer.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { Roles } from '@src/roles/decorators/roles.decorator';
import { RoleNames } from '@src/roles/roles.enum';
import { RolesGuard } from '@src/roles/roles.guard';
import { UpdateCustomerDto } from './dto/update-customer.dto';


@Controller('customers')
@ApiTags('Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleNames.ADMIN)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {

    return await this.customersService.createCustomer(createCustomerDto);

  }

  @Get()
  async findAllCustomers() {
    
    return await this.customersService.findAllCustomers();

  }

  @Get(':id')
  async findCustomerById(@Param('id', ParseIntPipe) id: number) {

    return await this.customersService.findCustomerById(id);

  }

  @Patch(':id')
  async updateCustomer(@Param('id', ParseIntPipe) id: number, @Body() updateCustomerDto: UpdateCustomerDto) {

    return await this.customersService.updateCustomer(id, updateCustomerDto);

  }

  @Delete(':id')
  async deleteCustomer(@Param('id', ParseIntPipe) id: number) {

    return await this.customersService.deleteCustomer(id);

  }

}