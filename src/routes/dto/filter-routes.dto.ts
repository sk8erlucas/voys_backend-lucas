import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilterRoutesDto {

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: '20/12/2024',
        description: 'Fecha de inicio de filtrado de paquetes en formato AAAA-MM-DD',
        required: false })
    start_date?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: '27/12/2024',
        description: 'Fecha de fin de filtrado de paquetes en formato AAAA-MM-DD',
        required: false })
    end_date?: string;

    @IsOptional()
    @Transform(({ value }) => {
        const parsedValue = parseInt(value, 10);
        return isNaN(parsedValue) ? value : parsedValue;
    })
    @IsInt()
    @ApiProperty({
        example: 42,
        description: 'ID del conductor de entrega asignado al paquete',
        required: false })
    delivery_driver_id?: number;
}
