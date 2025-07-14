import { IsString, IsOptional, IsBoolean, IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreDto {

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '14:30',
    description: 'Horario de corte en formato HH:MM',
    required: false, })
  cut_schedule?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Indica si la tienda esta activa o no',
    required: false,
  })
  active?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'tienda',
    description: 'Notas adicionales sobre la tienda',
    required: false,
  })
  notes?: string;

  @IsInt()
  @IsPositive()
  @ApiProperty({
    example: 23,
    description: 'ID del método de envío asociado a la tienda',
  })
  shipping_method_id: number;
}
