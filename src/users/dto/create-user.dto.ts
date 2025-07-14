import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Juan', description: 'Nombre del usuario', required: false, })
    name: string;

    @IsOptional()
    @ApiProperty({ example: 'Juan', description: 'Apellido del usuario', required: false, })
    last_name?: string;

    @IsInt()
    @IsOptional()
    @ApiProperty({ example: 1, description: 'id del rol', required: false, })
    role_id?: number;
    
    @IsEmail()
    @ApiProperty({ example: 'juan@ejemplo.com', description: 'Email del usuario' })
    email: string;
    
    @IsNotEmpty()
    @ApiProperty({ example: 'ChanGeMe', description: 'contraseña' })
    password: string;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        example: true,
        description: 'Indica si el usuario esta activo o no',
        required: false,
    })
    active?: boolean;
}