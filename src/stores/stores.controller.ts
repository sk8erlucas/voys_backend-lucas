import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Request, Put } from '@nestjs/common';
import { StoresSellerService } from '@src/stores/stores.seller.service';
import { StoresAdminService } from '@src/stores/stores.admin.service';
import { CreateStoreDto } from '@src/stores/dto/create-store.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { RoleNames } from '@src/roles/roles.enum';
import { Roles } from '@src/roles/decorators/roles.decorator';
import { UpdateStoreDto } from '@src/stores/dto/update-store.dto';
import { RolesGuard } from '@src/roles/roles.guard';


@Controller('stores')
@ApiTags('Tiendas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)

export class StoresController {
  constructor(
    private readonly storesSellerService: StoresSellerService,
    private readonly storesAdminService: StoresAdminService
    
  ) { }

  @Roles(RoleNames.ADMIN, RoleNames.SELLER)
  @Post()
  async createStore(@Body() createStoreDto: CreateStoreDto, @Request() req: any) {

    const { userId, role } = req.user;

    if (role === RoleNames.SELLER) return await this.storesSellerService.createStore(createStoreDto, userId);

    if (role === RoleNames.ADMIN) return await this.storesAdminService.createStore(createStoreDto);

  }

  @Roles(RoleNames.ADMIN, RoleNames.SELLER)
  @Get()
  async findAllStores(@Request() req: any) {

    const { userId, role } = req.user;

    if (role === RoleNames.SELLER) return await this.storesSellerService.findAllStores(userId);

    if (role === RoleNames.ADMIN) return await this.storesAdminService.findAllStores();

  }

  @Roles(RoleNames.ADMIN, RoleNames.SELLER)
  @Get(':id')
  async findStoreById(@Param('id', ParseIntPipe) id: number, @Request() req: any) {

    const { userId, role } = req.user;

    if (role === RoleNames.SELLER) return await this.storesSellerService.findStoreById(id, userId);

    if (role === RoleNames.ADMIN) return await this.storesAdminService.findStoreById(id);

  }

  @Roles(RoleNames.ADMIN, RoleNames.SELLER)
  @Patch(':id')
  async updateStore(@Param('id', ParseIntPipe) id: number, @Body() updateStoreDto: UpdateStoreDto, @Request() req: any) {

    const { userId, role } = req.user;

    if (role === RoleNames.SELLER) return await this.storesSellerService.updateStore(id, updateStoreDto, userId);

    if (role === RoleNames.ADMIN) return await this.storesAdminService.updateStore(id, updateStoreDto);

  }

  @Roles(RoleNames.ADMIN, RoleNames.SELLER)
  @Delete(':id')
  async deleteStore(@Param('id', ParseIntPipe) id: number, @Request() req: any) {

    const { userId, role } = req.user;

    if (role === RoleNames.SELLER) return await this.storesSellerService.deleteStore(id, userId);

    if (role === RoleNames.ADMIN) return await this.storesAdminService.deleteStore(id);

  }

}
