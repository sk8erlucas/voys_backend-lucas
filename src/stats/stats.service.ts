import { BadRequestException, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { VoysStatus } from '@prisma/client';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { PrismaService } from '@src/prisma/prisma.service';
import { parseDate } from '@src/utils/date.util';

@Injectable()
export class StatsService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly prisma: PrismaService
  ) { }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async getPackagesStatsByDate(dateString: string) {

    if (!dateString) throw new BadRequestException(ErrorCodes.INVALID_DATE);

    const date = parseDate(dateString);

    const startDate = new Date(date.setHours(0, 0, 0, 0));
    const endDate = new Date(date.setHours(23, 59, 59, 999));

    const _packages = await this.prisma.package.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        voys_status: {
          not: {
            in: ['']
          },
        }
      },
      include: { store: true, route: true }
    });

    const _packagesWithDeliveryDriver = await this.prisma.package.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        voys_status: {
          not: ''
        }
      },
      include: {
        route: {
          include: {
            delivery_driver: true
          }
        }
      }
    });

    const voysStatusMLAssociated = await this.prisma.voysStatus.findMany({
      where: {
        ml_status_array: {
          not: '[]',  // Busca todos los registros cuyo ml_status_array no sea un array vacío
        },
      },
    });

    const globalStats = {
      global: this.getStatusSummary(_packages, voysStatusMLAssociated),
      stores: this.getStoreSummary(_packages, voysStatusMLAssociated),
      drivers: this.getDriverSummaryByRoute(_packagesWithDeliveryDriver, voysStatusMLAssociated)
    }

    return globalStats;

  }

  async getPackagesStatsByDateRange(startDateString: string, endDateString: string) {
    if (!startDateString || !endDateString) throw new BadRequestException(ErrorCodes.INVALID_DATE);
   
    const startDate = new Date(parseDate(startDateString).setHours(0, 0, 0, 0));
    const endDate = new Date(parseDate(endDateString).setHours(23, 59, 59, 999));
   
  // Convert both dates to UTC
const startDateUTC = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0, 0));
const endDateUTC = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59, 999));
console.log(startDateUTC,endDateUTC)
    const _packages = await this.prisma.package.findMany({
      where: {
        plant_entry_date: {
          gte: startDateUTC,  // Start date (inclusive)
          lte: endDateUTC,    // End date (inclusive)
        },
        voys_status: {
          not: {
            in: ['']
          },
        }
      },
      include: { store: true, route: true }
    });
  
    const _packagesWithDeliveryDriver = await this.prisma.package.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        voys_status: {
          not: ''
        }
      },
      include: {
        route: {
          include: {
            delivery_driver: true
          }
        }
      }
    });
  
    const voysStatusMLAssociated = await this.prisma.voysStatus.findMany({
      where: {
        ml_status_array: {
          not: '[]',
        },
      },
    });
  
    const globalStats = {
      global: this.getStatusSummary(_packages, voysStatusMLAssociated),
      stores: this.getStoreSummary(_packages, voysStatusMLAssociated),
      drivers: this.getDriverSummaryByRoute(_packagesWithDeliveryDriver, voysStatusMLAssociated)
    };
  
    return globalStats;
  }
  

  getStatusSummary(_packages, voysStatus) {
    const statusSummary = { total: 0 };

    // Initialize each status in statusSummary with a count of 0
    voysStatus.forEach(status => {
      statusSummary[status.slug] = 0;
    });
   
    _packages.forEach(pkg => {
      // Skip packages with the status "en_planta"
      if (pkg.voys_status === 'en_planta') {
        return;
      }

      // Increment the total count for packages that are not "en_planta"
      statusSummary.total += 1;

      // Find the matching status from voysStatus
      const statusMatch = voysStatus.find(status => status.slug === pkg.voys_status);
     
      if (statusMatch) {
        // Increment the count for the specific status
        statusSummary[statusMatch.slug] += 1;
      }
    });

    return statusSummary;
}


  getStoreSummary(_packages, voysStatus) {
    const stores = {};

    _packages.forEach(pkg => {
      const storeName = pkg.store.ml_fantazy_name;

      if (!stores[storeName]) {
        stores[storeName] = {
          store: storeName,
          total: 0,
          ...voysStatus.reduce((acc, status) => {
            acc[status.slug] = 0;
            return acc;
          }, {})
        };
      }

      stores[storeName].total += 1;

      if (stores[storeName][pkg.voys_status] !== undefined) {
        stores[storeName][pkg.voys_status] += 1;
      }
    });

    return Object.values(stores);
  }

  getDriverSummaryByRoute(_packages, voysStatus) {
    const drivers = {};

    _packages.forEach(pkg => {

        // Check for route and delivery_driver
        if (pkg.route && pkg.route.delivery_driver) {
            const deliveryDriver = pkg.route.delivery_driver;
            const driverName = deliveryDriver.name;

            if (!drivers[driverName]) {
                drivers[driverName] = {
                    driver: driverName,
                    total: 0,
                    ...voysStatus.reduce((acc, status) => {
                                 
                      acc[status.slug] = 0;
                  
                      return acc;
                  }, {})
                  
                };
             
            }

            // Check and count the voys_status for the package
      
            if (pkg.voys_status && drivers[driverName][pkg.voys_status] !== undefined) {
           
                drivers[driverName][pkg.voys_status] += 1;
             
            } 

          
            drivers[driverName].total += 1;
        } /* else {
            console.log("Package does not have a route or delivery driver:", pkg);
        } */
    });

 
    return Object.values(drivers);
}


}