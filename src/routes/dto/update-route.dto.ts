import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRouteDto {
  @ApiProperty({
    description: 'IDs de los paquetes asociados a la ruta',
    example: [1, 2, 3],
    required: false,
  })
  @IsArray()
  @IsOptional()
  packageIds: number[];

  @ApiProperty({
    description: 'ID del conductor de entrega',
    example: 123,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  delivery_driver_id: number;
}