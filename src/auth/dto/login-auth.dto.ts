import { IsEmail, IsNotEmpty} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto{
    @IsEmail()
    @ApiProperty({ example: 'juan@ejemplo.com', description: 'Email del usuario' })
    email: string;
    
    @IsNotEmpty()
    @ApiProperty({ example: 'ChanGeMe', description: 'contraseña' })
    password: string;
}