import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRouteDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Identificadores de los paquetes asociados a la ruta.',
    required: false,
  })
  @IsArray()
  @IsOptional()
  packageIds: number[];

  @ApiProperty({
    example: 1,
    description: 'ID del conductor de entrega.',
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => {
    const parsedValue = parseInt(value, 10);
    return isNaN(parsedValue) ? value : parsedValue;
  })
  delivery_driver_id: number;
}
