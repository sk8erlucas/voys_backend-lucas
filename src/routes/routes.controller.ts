import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { FilterRoutesDto } from './dto/filter-routes.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { RolesGuard } from '@src/roles/roles.guard';
import { Roles } from '@src/roles/decorators/roles.decorator';
import { RoleNames } from '@src/roles/roles.enum';

@Controller('routes')
@ApiTags('Rutas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleNames.ADMIN)
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  async createRoute(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.createRoute(createRouteDto);
  }

  @Get(':id')
  async getRouteById(@Param('id') id: string) {
    return this.routesService.getRouteById(Number(id));
  }

  @Get()
  async filterRoutes(@Query() filterRoutesDto: FilterRoutesDto) {
    return this.routesService.filterRoutes(filterRoutesDto);
  }  
  
  @Put(':id')
  async updateRoute(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routesService.updateRoute(Number(id), updateRouteDto);
  }  

  @Delete(':id')
  async deleteRoute(@Param('id') id: string) {
    return this.routesService.deleteRoute(Number(id));
  }

}