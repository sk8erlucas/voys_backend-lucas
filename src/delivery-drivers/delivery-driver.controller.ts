import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put, UseGuards, Query } from '@nestjs/common';
import { DeliveryDriverService } from './delivery-driver.service';
import { CreateDeliveryDriverDto } from './dto/create-delivery-driver.dto';
import { UpdateDeliveryDriverDto } from './dto/update-delivery-driver.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { RoleNames } from '@src/roles/roles.enum';
import { Roles } from '@src/roles/decorators/roles.decorator';
import { RolesGuard } from '@src/roles/roles.guard';
import { FilterDeliveryDriverDto } from './dto/filter-delivery-driver.dto';

@Controller('delivery-drivers')
@ApiTags('Repartidores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleNames.ADMIN)
export class DeliveryDriverController {
  constructor(private readonly deliveryDriverService: DeliveryDriverService) { }
  
  @Post()
  async create(@Body() createDeliveryDriverDto: CreateDeliveryDriverDto) {

    return this.deliveryDriverService.createDeliveryDriver(createDeliveryDriverDto);

  }

  @Get()
  async findAllDeliveryDriver(@Query() query: FilterDeliveryDriverDto){
    return this.deliveryDriverService.findAllDeliveryDriver(query);
  }

  @Get(':id')
  async findDeliveryDriverById(@Param('id', ParseIntPipe) id: number) {

    return this.deliveryDriverService.findDeliveryDriverById(id);

  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDeliveryDriverDto: UpdateDeliveryDriverDto) {

    return this.deliveryDriverService.updateDeliveryDriver(id, updateDeliveryDriverDto);

  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {

    return this.deliveryDriverService.deleteDeliveryDriver(id);

  }

}
