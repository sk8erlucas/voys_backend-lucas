import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { VoysStatusService } from '@src/voys-status/voys-status.service';
import { CreateVoysStatusDto } from '@src/voys-status/dto/create-voys-status.dto';
import { UpdateVoysStatusDto } from '@src/voys-status/dto/update-voys-status.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@src/roles/decorators/roles.decorator';
import { RoleNames } from '@src/roles/roles.enum';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { RolesGuard } from '@src/roles/roles.guard';

@Controller('voys-status')
@ApiTags('Voys status')
@ApiBearerAuth()
@Roles(RoleNames.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class VoysStatusController {

  constructor(private readonly voysStatusService: VoysStatusService) {}

  @Post()
  async createVoysStatus(@Body() createVoysStatusDto: CreateVoysStatusDto) {

    return await this.voysStatusService.createVoysStatus(createVoysStatusDto);

  }

  @Get()
  async findAllVoysStatus() {

    return await this.voysStatusService.findAllVoysStatus();

  }

  @Patch(':id')
  async updateVoysStatus(@Param('id', ParseIntPipe) id: number, @Body() updateVoysStatusDto: UpdateVoysStatusDto) {

    return await this.voysStatusService.updateVoysStatus(id, updateVoysStatusDto);

  }

  @Delete(':id')
  async deleteVoysStatus(@Param('id', ParseIntPipe) id: number) {

    return await this.voysStatusService.deleteVoysStatus(id);

  }


}
