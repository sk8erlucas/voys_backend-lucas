import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDeliveryDriverDto {

    @ApiProperty({ 
        required: false, 
        example: 'Juan', 
        description: 'Nombre del conductor de entrega' 
    })
    @IsString()
    name: string;
  
    @ApiProperty({ 
        required: false, 
        example: 'Pérez', 
        description: 'Apellido del conductor de entrega' 
    })
    @IsString()
    @IsOptional()
    last_name: string;
  
    @ApiProperty({ 
        required: false, 
        example: '123456789', 
        description: 'Número de teléfono del conductor de entrega' 
    })
    @IsString()
    phone?: string;
  
    @ApiProperty({ 
        example: '12345678', 
        description: 'Número de DNI del conductor de entrega' 
    })
    @IsString()
    dni: string;
  
    @ApiProperty({ 
        required: false, 
        example: 'Notas sobre el conductor', 
        description: 'Notas adicionales sobre el conductor de entrega' 
    })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ 
        required: false, 
        example: true, 
        description: 'Estado activo del conductor de entrega' 
    })
    @IsOptional()
    @IsBoolean()
    active?: boolean;
    
    @ApiProperty({ 
        required: false, 
        example: 'Auto', 
        description: 'Tipo de movilidad del conductor de entrega' 
    })
    @IsOptional()
    @IsString()
    mobility: string;

}
