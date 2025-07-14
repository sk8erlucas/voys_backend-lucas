import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateVoysStatusDto {

    @ApiProperty({
        example: "Estado de prueba",
        description: "El nombre del estado"
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: "Descripción del estado",
        description: "Descripción opcional del estado",
        required: false,
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
