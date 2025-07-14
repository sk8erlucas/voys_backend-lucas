import { PartialType } from '@nestjs/swagger';
import { CreateVoysStatusDto } from '@src/voys-status/dto/create-voys-status.dto';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVoysStatusDto extends PartialType(CreateVoysStatusDto) {

    @ApiProperty({
        example: "Estado actualizado",
        description: "El nombre del estado que se está actualizando"
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: "Descripción actualizada del estado",
        description: "Descripción opcional del estado"
    })
    description?: string;

    @ApiProperty({
        example: ["activo", "inactivo"],
        description: "Array de estados de machine learning"
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    ml_status_array: Array<string>;

}
