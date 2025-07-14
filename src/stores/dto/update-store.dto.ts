import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateStoreDto } from './create-store.dto';
import { IsBoolean, IsInt, IsOptional, IsString, IsPositive } from 'class-validator';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {

    @IsOptional()
    @IsString()
    @ApiProperty({ example: '14:30', description: 'Horario de corte en formato HH:MM,' })
    cut_schedule?: string;
  
    @IsOptional()
    @IsBoolean()
    @ApiProperty({ example: true, description: 'Indica si la tienda esta activa o no' })
    active?: boolean;
  
    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'tienda', description: 'Notas adicionales sobre la tienda' })
    notes?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'mi_tienda', description: 'Nombre real de la tienda' })
    real_name?: string;
  
    @IsInt()
    @IsPositive()
    @ApiProperty({ example: 23, description: 'ID del método de envío asociado a la tienda' })
    shipping_method_id: number;
}
