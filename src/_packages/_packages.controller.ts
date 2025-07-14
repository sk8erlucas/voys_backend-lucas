import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PackagesService } from '@src/_packages/_packages.service';
import { UpdatePackageDto } from '@src/_packages/dto/update-package.dto';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { Roles } from '@src/roles/decorators/roles.decorator';
import { RoleNames } from '@src/roles/roles.enum';
import { RolesGuard } from '@src/roles/roles.guard';
import { AssignPackagesDto } from '@src/_packages/dto/assign-packages.dto';
import { FilterPackagesDto } from '@src/_packages/dto/filter-packages.dto';
import { ChangeVoysStatusDto } from './dto/change-voys-status.dto';


@Controller('packages')
@ApiTags('Paquetes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleNames.ADMIN)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  async filterPackages(@Query() filterPackagesDto: FilterPackagesDto) {
    return this.packagesService.filterPackages(filterPackagesDto);
  }

  @Get('/last_planta_date')
  async findOnePackageLastPlantaDate() {
    return this.packagesService.findOnePackageLastPlantaDate();
  }

  @Get(':id')
  async findOnePackageById(@Param('id', ParseIntPipe) id: number) {
    return await this.packagesService.findOnePackageById(id);
  }

  @Patch(':id')
  async updatePackage(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePackage: UpdatePackageDto,
  ) {
    return await this.packagesService.updatePackage(id, updatePackage);
  }

  @Patch('/change-voys-status')
  async changeVoysStatus(@Body() changeVoysStatusDto: ChangeVoysStatusDto) {
    return await this.packagesService.changeVoysStatus(changeVoysStatusDto);
  }

  @Post('/assign')
  async assignPackage(@Body() assignPackagesDto: AssignPackagesDto) {
    return await this.packagesService.assignPackages(assignPackagesDto);
  }
  
  @Post('/liquidate_distributor')
  async liquidate_distributor(@Body() assignPackagesDto: AssignPackagesDto) {
    return await this.packagesService.liquidate_distributor(assignPackagesDto);
  }

  @Post('/void_liquidation_distributor')
  async void_liquidation_distributor(@Body() assignPackagesDto: AssignPackagesDto) {
    return await this.packagesService.void_liquidation_distributor(assignPackagesDto);
  }

  @Post('/liquidate_customer')
  async liquidate_customer(@Body() assignPackagesDto: AssignPackagesDto) {
    return await this.packagesService.liquidate_customer(assignPackagesDto);
  }

  @Post('/void_liquidation_customer')
  async void_liquidation_customer(@Body() assignPackagesDto: AssignPackagesDto) {
    return await this.packagesService.void_liquidation_customer(assignPackagesDto);
  }

  @Get('/history/:id')
  async findPackageHistoryById(@Param('id', ParseIntPipe) id: number) {
    return await this.packagesService.findPackageHistoryById(id);
  }
}
