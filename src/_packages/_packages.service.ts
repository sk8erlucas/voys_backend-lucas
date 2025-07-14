import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { UpdatePackageDto } from '@src/_packages/dto/update-package.dto';
import { PrismaService } from '@src/prisma/prisma.service';
import { parseDate } from '@src/utils/date.util';
import { Package, PackageHistory } from '@prisma/client';
import { AssignPackagesDto } from '@src/_packages/dto/assign-packages.dto';
import { FilterPackagesDto } from '@src/_packages/dto/filter-packages.dto';
import { ChangeVoysStatusDto } from '@src/_packages/dto/change-voys-status.dto';
import * as Sentry from '@sentry/nestjs';
import { extractNumber } from '@src/utils/parseText.util';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class PackagesService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async findOnePackageById(id: number): Promise<Package> {
    const _package = await this.prisma.package.findUnique({
      where: { id },
    });

    if (!_package) {
      throw new NotFoundException(ErrorCodes.RESOURCE_NOT_FOUND);
    }

    return _package;
  }

  async findOnePackageLastPlantaDate(): Promise<Date> {
    const latestPackage = await this.prisma.package.findFirst({
      orderBy: {
        plant_entry_date: 'desc',
      },
      select: {
        plant_entry_date: true,
      },
    });

    if (!latestPackage || !latestPackage.plant_entry_date) {
      throw new NotFoundException(ErrorCodes.RESOURCE_NOT_FOUND);
    }

    return latestPackage.plant_entry_date;
  }

  async findPackagesByDate(dateString: string) {
    if (!dateString) throw new BadRequestException(ErrorCodes.INVALID_DATE);

    const date = parseDate(dateString);

    const startDate = new Date(date.setHours(0, 0, 0, 0));
    const endDate = new Date(date.setHours(23, 59, 59, 999));

    const _packages = await this.prisma.package.findMany({
      where: {
        ml_order_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { store: true },
    });

    if (!_packages) return [];

    return _packages.map((_package) => {
      return _package;
    });
  }

  async filterPackages(
    filterPackagesDto: FilterPackagesDto,
  ): Promise<Package[]> {
    const {
      date,
      start_date,
      end_date,
      with_route,
      voys_status,
      route_id,
      delivery_driver_id,
      ml_order_id,
      ml_tracking_id,
      ml_status,
      assigned,
      store_id,
      customer_id,
      day,
    } = filterPackagesDto;

    const where: any = {};

    // Filtro para ml_state_name con comparación insensible a mayúsculas
    where.OR = [
      {
        ml_state_name: {
          contains: 'buenos aires',
        },
      },
      {
        ml_state_name: {
          contains: 'capital federal',
        },
      },
    ];

    // Si hay un día específico y store_id, manejamos el corte por horario
    if (day && store_id) {
      const store = await this.prisma.store.findUnique({
        where: { id: store_id },
        select: { cut_schedule: true },
      });

      if (store && store.cut_schedule) {
        const [cutHour, cutMinute] = store.cut_schedule.split(':').map(Number);
        const offsetHours = 3;
        const cutHourUTC = cutHour + offsetHours;
        const dayDate = new Date(
          Date.UTC(
            new Date(day).getUTCFullYear(),
            new Date(day).getUTCMonth(),
            new Date(day).getUTCDate(),
          ),
        );
        const startDateTime = new Date(dayDate);
        startDateTime.setUTCDate(dayDate.getUTCDate() - 1);
        startDateTime.setUTCHours(cutHourUTC, cutMinute, 0, 0);

        const endDateTime = new Date(dayDate);
        endDateTime.setUTCHours(cutHourUTC, cutMinute, 0, 0);

        console.log('store.cut_schedule', store.cut_schedule);
        console.log('startDateTime', startDateTime);
        console.log('endDateTime', endDateTime);

        where.ml_order_date = {
          gte: startDateTime,
          lt: endDateTime,
        };
      }
    } else if (start_date && end_date) {
      const startDateParsed = parseDate(start_date);
      const endDateParsed = parseDate(end_date);

      where.ml_order_date = {
        gte: new Date(startDateParsed.toISOString().split('T')[0]),
        lt: new Date(
          new Date(endDateParsed.toISOString().split('T')[0]).getTime() +
            24 * 60 * 60 * 1000,
        ),
      };
    } else if (date) {
      const dateParsed = parseDate(date);
      const dateOnly = dateParsed.toISOString().split('T')[0];

      where.ml_order_date = {
        gte: new Date(dateOnly),
        lt: new Date(new Date(dateOnly).getTime() + 24 * 60 * 60 * 1000),
      };
    }

    // Handle delivery_driver_id filtering
    if (delivery_driver_id) {
      where.route = {
        delivery_driver_id: delivery_driver_id,
      };
    }

    // Handle with_route filtering
    if (with_route !== undefined) {
      where.route_id = with_route ? { not: null } : null;
    }

    // Handle route_id filtering
    if (route_id) where.route_id = route_id;

    // Handle voys_status filtering
    if (voys_status) {
      let filteredVoysStatus: string[] = [];

      // Check if voys_status is a string and split it into an array
      if (typeof voys_status === 'string') {
        filteredVoysStatus = voys_status
          .split(',')
          .map((status) => status.trim());
      }

      // Remove empty strings
      filteredVoysStatus = filteredVoysStatus.filter((status) => status !== '');

      // Add to the where clause only if there are valid statuses
      if (filteredVoysStatus.length > 0) {
        where.voys_status = {
          in: filteredVoysStatus,
        };
      }
    }

    // Handle other filters
    if (ml_order_id) where.ml_order_id = ml_order_id;
    if (ml_tracking_id) where.ml_tracking_id = ml_tracking_id;
    if (ml_status) where.ml_status = ml_status;
    if (assigned !== undefined) where.assigned = assigned;
    if (store_id) where.store_id = store_id;

    // Handle customer_id filtering
    if (customer_id) {
      where.store = {
        ...where.store,
        customer: {
          ...where.store?.customer,
          id: customer_id,
        },
      };
    }

    // Fetching packages from the database
    let _packages = await this.prisma.package.findMany({
      where,
      include: {
        store: true,
        route: {
          include: {
            delivery_driver: true,
          },
        },
      },
    });

    // Return packages
    if (!_packages) return [];

    // Aplicar filtro para eliminar paquetes con campos ofuscados (por defecto está activo)
    if (filterPackagesDto.filter_obfuscated !== false) {
      const originalCount = _packages.length;
      _packages = _packages.filter(
        (pkg) => !filterPackagesDto.hasObfuscatedFields(pkg),
      );

      const filteredCount = originalCount - _packages.length;
      if (filteredCount > 0) {
        console.log(
          `Total de paquetes excluidos por campos ofuscados: ${filteredCount}`,
        );
      }
    }

    return _packages.map((_package) => {
      return _package;
    });
  }

  async updatePackage(id: number, updatePackage: UpdatePackageDto) {
    console.log('updatePackage', id, updatePackage);
    if (!updatePackage.ingreso) {
      updatePackage.ingreso = new Date().toISOString();
    }

    const _package = await this.prisma.package.update({
      where: { id },
      data: { ...updatePackage },
    });

    await this.updatePackageHistory(
      id,
      updatePackage.route_id,
      '',
      null,
      'Actualización del paquete',
    );

    return _package;
  }

  async changeVoysStatus(
    changeVoysStatusDto: ChangeVoysStatusDto,
  ): Promise<Package> {
    let _package;

    if (
      !changeVoysStatusDto.ml_order_id &&
      !changeVoysStatusDto.ml_tracking_id
    ) {
      throw new BadRequestException(ErrorCodes.INVALID_DATA);
    }

    if (changeVoysStatusDto.ml_order_id) {
      const filetered_ml_order_id = extractNumber(
        changeVoysStatusDto.ml_order_id,
      );
      const packages = await this.prisma.package.findMany({
        where: {
          ml_order_id: {
            endsWith: filetered_ml_order_id,
          },
        },
      });

      if (packages.length === 0) {
        throw new NotFoundException(ErrorCodes.PACKAGE_NOT_FOUND);
      }

      _package = packages[0]; // Asumiendo que tomas el primer paquete encontrado
    } else if (changeVoysStatusDto.ml_tracking_id) {
      const filetered_ml_tracking_id = extractNumber(
        changeVoysStatusDto.ml_tracking_id,
      );
      _package = await this.prisma.package.findUnique({
        where: { ml_tracking_id: filetered_ml_tracking_id },
      });
    }

    if (!_package) {
      throw new NotFoundException(ErrorCodes.PACKAGE_NOT_FOUND);
    }

    const data: any = {
      voys_status: changeVoysStatusDto.voys_status,
    };

    if (changeVoysStatusDto.voys_status === 'en_planta') {
      // fecha del ultimo ingreso a planta
      data.plant_entry_date = new Date(
        new Date().getTime() - 3 * 60 * 60 * 1000,
      );
      if (!_package.ingreso) {
        // fecha del primer ingreso a planta
        data.ingreso = new Date(new Date().getTime() - 3 * 60 * 60 * 1000);
      }
    }

    // Agrega qr_data solo si ml_tracking_id no es vacío ni null
    if (
      changeVoysStatusDto.ml_tracking_id &&
      changeVoysStatusDto.ml_tracking_id.includes('hash_code') &&
      changeVoysStatusDto.ml_tracking_id.includes('security_digit')
    ) {
      data.qr_data = changeVoysStatusDto.ml_tracking_id;
    }

    _package = await this.prisma.package.update({
      where: { id: _package.id },
      data,
    });

    return _package;
  }

  async assignPackages(assignPackagesDto: AssignPackagesDto) {
    if (
      !assignPackagesDto.packageIds ||
      assignPackagesDto.packageIds.length === 0
    ) {
      throw new BadRequestException('No package IDs provided');
    }
    console.log('assignPackagesDto.packageIds:', assignPackagesDto.packageIds);

    const currentDate = new Date();

    const assigned = await this.prisma.package.updateMany({
      where: {
        id: {
          in: assignPackagesDto.packageIds,
        },
      },
      data: {
        assigned: true,
        assignment_date: currentDate,
      },
    });

    // Obtener los paquetes actualizados
    const updatedPackages = await this.prisma.package.findMany({
      where: {
        id: {
          in: assignPackagesDto.packageIds,
        },
      },
    });

    // Ejecutar updatePackageHistory para cada paquete actualizado
    for (const _package of updatedPackages) {
      await this.updatePackageHistory(
        _package.id,
        _package.route_id,
        '',
        _package.voys_status,
        'Se ha asignado el paquete',
      );
    }

    return assigned;
  }

  async liquidate_distributor(assignPackagesDto: AssignPackagesDto) {
    const liquidated = await this.prisma.package.updateMany({
      where: {
        id: {
          in: assignPackagesDto.packageIds,
        },
      },
      data: {
        liquidated: true, // Updating as a boolean
      },
    });

    // Obtener los paquetes actualizados
    const updatedPackages = await this.prisma.package.findMany({
      where: {
        id: {
          in: assignPackagesDto.packageIds,
        },
      },
    });

    // Ejecutar updatePackageHistory para cada paquete actualizado
    for (const _package of updatedPackages) {
      await this.updatePackageHistory(
        _package.id,
        _package.route_id,
        '',
        _package.voys_status,
        'Se ha liquidado al repartidor',
      );
    }

    return liquidated;
  }

  async void_liquidation_distributor(assignPackagesDto: AssignPackagesDto) {
    const liquidated = await this.prisma.package.updateMany({
      where: {
        id: {
          in: assignPackagesDto.packageIds,
        },
      },
      data: {
        liquidated: false, // Updating as a boolean
      },
    });

    // Obtener los paquetes actualizados
    const updatedPackages = await this.prisma.package.findMany({
      where: {
        id: {
          in: assignPackagesDto.packageIds,
        },
      },
    });

    // Ejecutar updatePackageHistory para cada paquete actualizado
    for (const _package of updatedPackages) {
      await this.updatePackageHistory(
        _package.id,
        _package.route_id,
        '',
        _package.voys_status,
        'Se ha eliminado la liquidación del repartidor',
      );
    }

    return liquidated;
  }
  // TODO: cambiar el campo settled_customer a liq_customer
  async liquidate_customer(assignPackagesDto: AssignPackagesDto) {
    const liquidated = await this.prisma.package.updateMany({
      where: {
        id: {
          in: assignPackagesDto.packageIds,
        },
      },
      data: {
        Settled_Customer: true, // Updating as a boolean
        updated_at: new Date(new Date().getTime() - 3 * 60 * 60 * 1000), // Restar 3 horas
      },
    });

    // Obtener los paquetes actualizados
    const updatedPackages = await this.prisma.package.findMany({
      where: {
        id: {
          in: assignPackagesDto.packageIds,
        },
      },
    });

    // Ejecutar updatePackageHistory para cada paquete actualizado
    for (const _package of updatedPackages) {
      const liquidated = await this.updatePackageHistory(
        _package.id,
        _package.route_id,
        '',
        _package.voys_status,
        'Se ha liquidado al cliente',
      );
    }

    return liquidated;
  }

  async void_liquidation_customer(assignPackagesDto: AssignPackagesDto) {
    const liquidated = await this.prisma.package.updateMany({
      where: {
        id: {
          in: assignPackagesDto.packageIds,
        },
      },
      data: {
        Settled_Customer: false, // Updating as a boolean
        updated_at: new Date(new Date().getTime() - 3 * 60 * 60 * 1000), // Restar 3 horas
      },
    });
    // Obtener los paquetes actualizados
    const updatedPackages = await this.prisma.package.findMany({
      where: {
        id: {
          in: assignPackagesDto.packageIds,
        },
      },
    });

    // Ejecutar updatePackageHistory para cada paquete actualizado
    for (const _package of updatedPackages) {
      await this.updatePackageHistory(
        _package.id,
        _package.route_id,
        '',
        _package.voys_status,
        'Se ha eliminado la liquidación del cliente',
      );
    }

    return liquidated;
  }

  async updatePackageHistory(
    packageId: number,
    routeId: number | null,
    usuario: string,
    estado: string,
    comentarios?: string,
  ) {
    // Obtener el paquete usando findOnePackageById
    const _package = await this.findOnePackageById(packageId);

    // console.log("history", packageId, routeId, usuario, estado, comentarios);
    const historyRecord = await this.prisma.packageHistory.create({
      data: {
        package: { connect: { id: _package.id } }, // Usar el ID del paquete obtenido
        route_id: routeId || null, // Asegúrate de que sea null si no hay ruta
        usuario,
        estado: estado || _package.voys_status, // Asegúrate de que el estado no sea undefined
        comentarios,
        fecha: new Date(new Date().getTime() - 3 * 60 * 60 * 1000),
      },
    });

    return historyRecord;
  }

  async findPackageHistoryById(id: number): Promise<PackageHistory[]> {
    const history = await this.prisma.packageHistory.groupBy({
      by: ['estado'],
      where: {
        package_id: id,
      },
      _max: {
        fecha: true,
        id: true,
        route_id: true,
        usuario: true,
        comentarios: true,
      },
      orderBy: {
        _max: {
          fecha: 'desc',
        },
      },
    });

    if (!history) return [];

    console.log('history', history);

    // Transform the grouped results into PackageHistory objects
    return history.map(
      (group) =>
        ({
          id: group._max.id,
          package_id: id,
          route_id: group._max.route_id,
          usuario: group._max.usuario,
          estado: group.estado ? group.estado.replace(' null', '') : '',
          comentarios: group._max.comentarios
            ? group._max.comentarios.replace(' null', '')
            : '',
          fecha: group._max.fecha,
        }) as PackageHistory,
    );
  }
}
