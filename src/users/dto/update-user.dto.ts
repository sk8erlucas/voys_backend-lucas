import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto{

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Juan', description: 'Nombre del usuario', required: false, })
    name: string;

    @IsOptional()
    @ApiProperty({ example: 'Juan', description: 'Apellido del usuario', required: false, })
    last_name?: string;

    @IsInt()
    @IsOptional()
    @ApiProperty({ example: 1, description: 'id del rol' })
    role_id?: number;
    
    @IsOptional()
    @ApiProperty({ example: 'ChanGeMe', description: 'contraseña' })
    password: string;

    @IsOptional()
    @ApiProperty({ example: 'ChanGeMe', description: 'contraseña (repetir)' })
    new_password?: string;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        example: true,
        description: 'Indica si el usuario esta activo o no',
        required: false,
    })
    active?: boolean;
}
