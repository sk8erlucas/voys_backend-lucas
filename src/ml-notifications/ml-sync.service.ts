import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@src/prisma/prisma.service';
import { MLAuthService } from '@src/ml-auth/ml-auth.service';
import { PackagesService } from '@src/_packages/_packages.service';
import axios from 'axios';

@Injectable()
export class MLSyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MLSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mlAuthService: MLAuthService,
    private readonly packagesService: PackagesService,
  ) {}

  async onModuleInit() {
    await this.prisma.$connect();
    this.logger.log(
      'MLSyncService initialized - Auto sync enabled every 5 minutes',
    );
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
  /*========================================
  CRON JOB - SYNC PACKAGES EVERY 5 MINUTES
  ========================================*/
  @Cron('*/5 * * * *') // Cada 5 minutos
  async syncPackagesWithMercadoLibre(): Promise<void> {
    console.log(
      `🔄 [CRON JOB] ML Sync ejecutándose - ${new Date().toLocaleString()}`,
    );
    this.logger.log('Starting automatic sync with MercadoLibre...');

    try {
      // Buscar paquetes que están en hoja de ruta pero no entregados
      const packagesToSync = await this.getPackagesToSync();

      if (packagesToSync.length === 0) {
        this.logger.log('No packages found to sync');
        return;
      }

      this.logger.log(`Found ${packagesToSync.length} packages to sync`);

      // Agrupar paquetes por tienda para optimizar los tokens
      const packagesByStore = this.groupPackagesByStore(packagesToSync);

      // Procesar cada tienda
      for (const [storeId, packages] of packagesByStore.entries()) {
        await this.syncPackagesForStore(storeId, packages);
      }

      this.logger.log('Automatic sync completed successfully');
    } catch (error) {
      this.logger.error('Error during automatic sync:', error);
    }
  }
  /*========================================
  GET PACKAGES TO SYNC
  ========================================*/
  private async getPackagesToSync() {
    return await this.prisma.package.findMany({
      where: {
        // Paquetes que están en hoja de ruta (tienen route_id)
        route_id: { not: null },
        // Estados que indican que están en camino pero no entregados
        voys_status: {
          in: ['en_camino'],
        },
        // Que tengan tracking ID de ML válido (no string vacío)
        ml_tracking_id: {
          not: '',
        },
        // Que pertenezcan a una tienda activa
        store: {
          ml_user_id: { not: null },
        },
      },
      include: {
        store: true,
        route: {
          include: {
            delivery_driver: true,
          },
        },
      },
      // Ordenar por fecha de actualización para procesar primero los más antiguos
      orderBy: {
        updated_at: 'asc',
      },
    });
  }

  /*========================================
  GROUP PACKAGES BY STORE
  ========================================*/
  private groupPackagesByStore(packages: any[]) {
    const packagesByStore = new Map();

    packages.forEach((pkg) => {
      const storeId = pkg.store.id;
      if (!packagesByStore.has(storeId)) {
        packagesByStore.set(storeId, []);
      }
      packagesByStore.get(storeId).push(pkg);
    });

    return packagesByStore;
  }

  /*========================================
  SYNC PACKAGES FOR STORE
  ========================================*/
  private async syncPackagesForStore(storeId: number, packages: any[]) {
    try {
      // Obtener token válido para la tienda
      const tokenData = await this.mlAuthService.getValidToken(storeId);

      this.logger.log(
        `Syncing ${packages.length} packages for store ${storeId}`,
      );

      // Procesar paquetes en lotes para evitar sobrecarga
      const batchSize = 10;
      for (let i = 0; i < packages.length; i += batchSize) {
        const batch = packages.slice(i, i + batchSize);
        await this.processBatch(batch, tokenData.ml_access_token);

        // Pequeña pausa entre lotes para no sobrecargar la API
        await this.sleep(1000);
      }
    } catch (error) {
      this.logger.error(`Error syncing packages for store ${storeId}:`, error);
    }
  }

  /*========================================
  PROCESS BATCH OF PACKAGES
  ========================================*/
  private async processBatch(packages: any[], accessToken: string) {
    const promises = packages.map((pkg) =>
      this.syncSinglePackage(pkg, accessToken),
    );
    await Promise.allSettled(promises);
  }

  /*========================================
  SYNC SINGLE PACKAGE
  ========================================*/
  private async syncSinglePackage(pkg: any, accessToken: string) {
    try {
      // Obtener datos actuales del shipment desde ML
      const shipmentData = await this.getShipmentData(
        pkg.ml_tracking_id,
        accessToken,
      );

      // Verificar si hubo cambio de estado
      const hasStatusChanged = this.hasStatusChanged(pkg, shipmentData);

      if (hasStatusChanged) {
        this.logger.log(
          `Status changed for package ${pkg.ml_tracking_id}: ${pkg.ml_status} -> ${shipmentData.status}`,
        );

        // Actualizar el paquete con los nuevos datos
        await this.updatePackageFromShipment(pkg, shipmentData);
      }
    } catch (error) {
      this.logger.error(
        `Error syncing package ${pkg.ml_tracking_id}:`,
        error.message,
      );
    }
  }

  /*========================================
  GET SHIPMENT DATA FROM ML
  ========================================*/
  private async getShipmentData(
    trackingId: string,
    accessToken: string,
  ): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.mercadolibre.com/shipments/${trackingId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000, // 10 segundos de timeout
        },
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`Shipment ${trackingId} not found`);
      }
      throw new Error(
        `Failed to fetch shipment data: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /*========================================
  CHECK IF STATUS CHANGED
  ========================================*/
  private hasStatusChanged(pkg: any, shipmentData: any): boolean {
    return (
      pkg.ml_status !== shipmentData.status ||
      pkg.ml_substatus !== shipmentData.substatus
    );
  }

  /*========================================
  UPDATE PACKAGE FROM SHIPMENT DATA
  ========================================*/
  private async updatePackageFromShipment(pkg: any, shipmentData: any) {
    try {
      // Determinar el nuevo voys_status basado en el estado de ML
      const voysStatusData = await this.prisma.voysStatus.findMany();
      let newVoysStatus = pkg.voys_status; // Mantener el actual por defecto

      for (const status of voysStatusData) {
        const ml_status_array = JSON.parse(status.ml_status_array);
        if (ml_status_array.includes(String(shipmentData.status))) {
          newVoysStatus = status.slug;
          break;
        }
      }

      // Actualizar el paquete en la base de datos
      await this.prisma.package.update({
        where: { id: pkg.id },
        data: {
          ml_status: shipmentData.status,
          ml_substatus: shipmentData.substatus,
          voys_status: newVoysStatus,
          ml_latitude:
            shipmentData.receiver_address?.latitude || pkg.ml_latitude,
          ml_longitude:
            shipmentData.receiver_address?.longitude || pkg.ml_longitude,
          updated_at: new Date(),
        },
      });

      // Registrar el cambio en el historial
      await this.packagesService.updatePackageHistory(
        pkg.id,
        pkg.route_id,
        'AutoSync-ML',
        `${shipmentData.status} ${shipmentData.substatus}`,
        `Actualización automática desde MercadoLibre: ${pkg.ml_status} -> ${shipmentData.status}`,
      );

      this.logger.log(`Package ${pkg.ml_tracking_id} updated successfully`);
    } catch (error) {
      this.logger.error(`Error updating package ${pkg.ml_tracking_id}:`, error);
    }
  }

  /*========================================
  UTILITY FUNCTION - SLEEP
  ========================================*/
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /*========================================
  MANUAL SYNC (FOR TESTING/ADMIN)
  ========================================*/
  async manualSync(): Promise<{ message: string; syncedPackages: number }> {
    this.logger.log('Manual sync requested');

    const packagesToSync = await this.getPackagesToSync();
    await this.syncPackagesWithMercadoLibre();

    return {
      message: 'Manual sync completed',
      syncedPackages: packagesToSync.length,
    };
  }
}
