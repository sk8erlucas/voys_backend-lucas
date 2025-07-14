import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MLSyncService } from './ml-sync.service';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { RolesGuard } from '@src/roles/roles.guard';
import { Roles } from '@src/roles/decorators/roles.decorator';
import { RoleNames } from '@src/roles/roles.enum';

@Controller('ml-sync')
@ApiTags('MercadoLibre Sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleNames.ADMIN)
export class MLSyncController {
  constructor(private readonly mlSyncService: MLSyncService) {}

  @Post('manual')
  @ApiOperation({ 
    summary: 'Ejecutar sincronización manual con MercadoLibre',
    description: 'Fuerza una sincronización inmediata de todos los paquetes en hoja de ruta con MercadoLibre'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sincronización manual completada exitosamente',
    schema: {
      example: {
        message: 'Manual sync completed',
        syncedPackages: 25
      }
    }
  })
  async manualSync() {
    return await this.mlSyncService.manualSync();
  }

  @Get('status')
  @ApiOperation({ 
    summary: 'Obtener estado del servicio de sincronización',
    description: 'Devuelve información sobre el estado del servicio de sincronización automática'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado del servicio obtenido exitosamente',
    schema: {
      example: {
        autoSyncEnabled: true,
        syncInterval: '5 minutes',
        lastSyncTime: '2024-01-15T10:30:00Z',
        nextSyncTime: '2024-01-15T10:35:00Z'
      }
    }
  })
  async getStatus() {
    return {
      autoSyncEnabled: true,
      syncInterval: '5 minutes',
      description: 'Automatic sync runs every 5 minutes for packages in route but not delivered',
      cronExpression: '*/5 * * * *'
    };
  }
}
