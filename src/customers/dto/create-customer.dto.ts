import { CreateUserDto } from '@src/users/dto/create-user.dto';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Define la estructura del DTO para la creación de un Customer y un User
export class CreateCustomerDto {
    @ApiProperty({ 
        required: false, 
        example: '123456789', 
        description: 'Número de teléfono del cliente' 
    })
    @IsOptional()
    @IsString()
    phone?: string;
  
    @ApiProperty({ 
        required: false, 
        example: '20-12345678-9', 
        description: 'CUIT del cliente' 
    })
    @IsOptional()
    @IsString()
    cuit?: string;
  
    @ApiProperty({ 
        required: false, 
        example: '1234567890123456789012', 
        description: 'CBU o CVU del cliente' 
    })
    @IsOptional()
    @IsString()
    cbu_cvu?: string;
  
    @ApiProperty({ 
        example: 'Mi Empresa S.A.', 
        description: 'Nombre de la empresa del cliente' 
    })
    @IsOptional()
    @IsString()
    company_name: string;
  
    @ApiProperty({ 
        required: false, 
        example: 'Juan Pérez', 
        description: 'Nombre del propietario del cliente' 
    })
    @IsOptional()
    @IsString()
    owner?: string;
  
    @ApiProperty({ 
        required: false, 
        example: 'Notas adicionales sobre el cliente', 
        description: 'Notas sobre el cliente' 
    })
    @IsOptional()
    @IsString()
    notes?: string;
  
    @ApiProperty({ 
        required: false, 
        example: true, 
        description: 'Estado activo del cliente' 
    })
    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @ApiProperty({ 
        example: 1, 
        description: 'ID del tipo de cliente' 
    })
    @IsInt()
    @IsOptional()
    customer_type_id: number;

    @ApiProperty({ 
        description: 'Información del usuario asociado al cliente' 
    })
    @ValidateNested()
    @Type(() => CreateUserDto)
    user: CreateUserDto;
}


