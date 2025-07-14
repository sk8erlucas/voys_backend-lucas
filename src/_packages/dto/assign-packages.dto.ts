import { ArrayNotEmpty, IsArray, IsInt, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AssignPackagesDto {

    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    @Min(1, { each: true })
    @ApiProperty({
        example: [1, 2, 3],
        description: 'Lista de IDs de paquetes a asignar. Cada ID debe ser un número entero positivo.',
        type: [Number], // Especifica que es un array de números
    })
    readonly packageIds: number[];

}
