import { Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateVoysStatusDto } from '@src/voys-status/dto/create-voys-status.dto';
import { UpdateVoysStatusDto } from '@src/voys-status/dto/update-voys-status.dto';

@Injectable()
export class VoysStatusService {

  constructor(

    private readonly prisma: PrismaService

  ) { }

  async createVoysStatus(createVoysStatusDto: CreateVoysStatusDto) {

    const { ml_status_array, ...data} = createVoysStatusDto;

    const voysStatus = await this.prisma.voysStatus.create({
      data: { 
        ...data, 
        slug: data.name.toLowerCase().replace(/ /g, '_'),
        ml_status_array: JSON.stringify(ml_status_array)
      }
    });

    return {
      ...voysStatus,
      ml_status_array: JSON.parse(voysStatus.ml_status_array)
    }

  }

  async findAllVoysStatus() {

    const voysStatus = await this.prisma.voysStatus.findMany();

    if(!voysStatus) return [];

    return voysStatus.map(voysStatus => {
      return {
        ...voysStatus,
        ml_status_array: JSON.parse(voysStatus.ml_status_array)
      }
    });

  }

  async updateVoysStatus(id: number, updateVoysStatusDto: UpdateVoysStatusDto) {

    const { ml_status_array, ...data} = updateVoysStatusDto;

    const voysStatus = await this.prisma.voysStatus.update({
      where: { id },
      data: { 
        ...data, 
        slug: data.name.toLowerCase().replace(/ /g, '_'),
        ml_status_array: JSON.stringify(ml_status_array)
      }
    });

    return {
      ...voysStatus,
      ml_status_array: JSON.parse(voysStatus.ml_status_array)
    }

  }

  async deleteVoysStatus(id: number) {

    const voysStatus = await this.prisma.voysStatus.findUnique({ where: { id } });

    if(!voysStatus) throw new NotFoundException(ErrorCodes.RESOURCE_NOT_FOUND);

    return await this.prisma.voysStatus.delete({ where: { id } });

  }

}
