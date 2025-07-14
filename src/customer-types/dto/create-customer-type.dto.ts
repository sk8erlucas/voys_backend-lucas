import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCustomerTypeDto {

    @IsString()
    @ApiProperty({ example: 'Regular', description: 'Nombre del tipo de cliente' })
    name: string;

    @IsString()
    @ApiProperty({ example: 'Cliente que realiza compras frecuentes', description: 'Descripción del tipo de cliente' })
    description: string;
}
