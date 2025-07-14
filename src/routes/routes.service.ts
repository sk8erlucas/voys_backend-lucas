import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Route } from '@prisma/client';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateRouteDto } from '@src/routes/dto/create-route.dto';
import { UpdateRouteDto } from '@src/routes/dto/update-route.dto';
import { FilterRoutesDto } from '@src/routes/dto/filter-routes.dto';
import { PackagesService } from '@src/_packages/_packages.service';
import { parseDate } from '@src/utils/date.util';
@Injectable()
export class RoutesService implements OnModuleInit, OnModuleDestroy {
  constructor(private prisma: PrismaService, private packagesService: PackagesService) {}

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async createRoute(createRouteDto: CreateRouteDto) {
    
    const { packageIds, delivery_driver_id } = createRouteDto;
    
    const newRoute = await this.prisma.route.create({
      data: {
        delivery_driver_id,
        updated_at: new Date(),
      },
    });

    await Promise.all(packageIds.map(async (id, index) => {
      if (id > 0) {
        await this.prisma.package.update({
          where: { id },
          data: {
            route_id: newRoute.id,
            order: index + 1,
          },
        });
        
        await this.packagesService.updatePackageHistory(
          id,
          newRoute.id,
          '',
          null,
          'Asignado el paquete a una nueva hoja de ruta con ID ' + newRoute.id
        );
      }
    }));

    return newRoute;
  }

  async getRouteById(routeId: number) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: {
        package: {
          orderBy: {
            order: 'asc'
          }
        },
        delivery_driver: true,
      },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    return route;
  }

  async filterRoutes(filterRoutesDto: FilterRoutesDto): Promise<Array<Route & { packageCount: number }>> {
    const {
      start_date,
      end_date,
      delivery_driver_id,
    } = filterRoutesDto;

    const where: any = {};
    // Manejar filtrado por fechas
    let startDateParsed;
    let endDateParsed;

    if (start_date || end_date) {
      if (!start_date) {
        startDateParsed = parseDate(end_date);
        endDateParsed = parseDate(end_date);
      } else if (!end_date) {
        startDateParsed = parseDate(start_date);
        endDateParsed = parseDate(start_date);
      } else {
        startDateParsed = parseDate(start_date);
        endDateParsed = parseDate(end_date);
      }

      where.created_at = {
          gte: new Date(startDateParsed.setHours(0, 0, 0, 0)),
          lte: new Date(endDateParsed.setHours(23, 59, 59, 999)),
      };
    }

    // Corregir el filtrado por delivery_driver_id
    if (delivery_driver_id) {
      where.delivery_driver_id = delivery_driver_id;
    }

    const routes = await this.prisma.route.findMany({
      where,
      include: {
        delivery_driver: { select: { name: true, last_name: true } },
      }
    });

    const routesWithPackageCount = await Promise.all(
      (routes || []).map(async (route) => {
        const packages = await this.prisma.package.findMany({
          where: {
              route_id: route.id,
          },
        });
        return {
          ...route,
          packageCount: packages.length,
          packages,
        };
      })
    );

    return routesWithPackageCount;
  }  

  async deleteRoute(routeId: number) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    const packages = await this.prisma.package.findMany({
      where: { route_id: routeId },
    });

    if (packages && packages.length > 0) {
      await Promise.all(packages.map((pkg) => 
        this.packagesService.updatePackageHistory(
          pkg.id,
          null,
          '',
          null,
          `El paquete ha sido desvinculado de la ruta con ID ${routeId}`
        )
      ));
    }

    await this.prisma.package.updateMany({
      where: { route_id: routeId },
      data: { 
        route_id: null,
        order: null,
        voys_status: 'en_planta'
      }
    });

    await this.prisma.route.delete({
      where: { id: routeId },
    });

    return { message: `Route with ID ${routeId} deleted successfully` };
  }

  async updateRoute(routeId: number, updateRouteDto: UpdateRouteDto) {
    const { packageIds, delivery_driver_id } = updateRouteDto;

    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    const updatedRoute = await this.prisma.route.update({
      where: { id: routeId },
      data: {
        delivery_driver_id,
        updated_at: new Date(), // Añadir el campo updated_at
      },
    });

    if (packageIds) {
      
      await this.prisma.package.updateMany({
        where: { route_id: routeId },
        data: { 
          route_id: null,
          order: null,
        },
      });

      await Promise.all(packageIds.map((id, index) => 
        this.prisma.package.update({
          where: { id },
          data: {
            route_id: updatedRoute.id,
            order: index + 1
          },
        }).then(() => {
          return this.packagesService.updatePackageHistory(
            id,
            updatedRoute.id,
            '',
            null,
            'Asignado el paquete a la hoja de ruta actualizada con ID ' + updatedRoute.id
          );
        })
      ));
    }

    return updatedRoute;
  }
}