import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty({ 
        example: 'Admin', 
        description: 'Nombre del rol que se está creando' 
    })
    name: string;

    @ApiProperty({ 
        required: false, 
        example: 'Rol con acceso completo al sistema', 
        description: 'Descripción del rol que se está creando' 
    })
    description?: string;
}
