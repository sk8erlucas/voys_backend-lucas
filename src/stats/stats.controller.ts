import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { RolesGuard } from '@src/roles/roles.guard';
import { RoleNames } from '@src/roles/roles.enum';
import { Roles } from '@src/roles/decorators/roles.decorator';

@Controller('stats')
@ApiTags('Stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleNames.ADMIN)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('packages')
  @ApiQuery({ name: 'date', required: false, description: 'Format: DD/MM/YYYY' })
  async getPackagesStatsByDate(@Query('date') date: string) {

    return await this.statsService.getPackagesStatsByDate(date);

  }
    // New route for date range
    @Get('packages/date-range')
    @ApiQuery({ name: 'startDate', required: true, description: 'Start date in format DD/MM/YYYY' })
    @ApiQuery({ name: 'endDate', required: true, description: 'End date in format DD/MM/YYYY' })
    async getPackagesStatsByDateRange(
      @Query('startDate') startDate: string,
      @Query('endDate') endDate: string
    ) {
      return await this.statsService.getPackagesStatsByDateRange(startDate, endDate);
    }
  

}