import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreatePackageDto } from '@src/_packages/dto/create-package.dto';
import { IsBoolean, IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePackageDto extends PartialType(CreatePackageDto) {

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        example: true,
        description: 'Indica si el paquete está asignado a un conductor',
        required: false })
    assigned?: boolean;

    @IsOptional()
    @IsDate()
    @ApiProperty({
        example: '2023-12-25T13:00:00Z',
        description: 'Fecha y hora de entrada a planta',
        required: false })
    plant_entry_date?: Date;

    @IsOptional()
    @IsInt()
    @ApiProperty({
        example: 5,
        description: 'ID de la ruta asignada al paquete',
        required: false })
    route_id?: number;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        example: false,
        description: 'Indica si el paquete ha sido liquidado',
        required: false })
    liquidated?: boolean;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        example: true,
        description: 'Indica si el paquete fue liberado por la persona de entrega',
        required: false })
    Cleared_Delivery_Person: boolean;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        example: true,
        description: 'Indica si el cliente ha confirmado la recepción del paquete',
        required: false })
    Settled_Customer: boolean;

    // New fields
    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'Ingreso de paquete en planta',
        description: 'Información adicional sobre el ingreso del paquete',
        required: false })
    ingreso?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'Sucursal A',
        description: 'Sucursal de origen del paquete',
        required: false })
    sucursalOrigen?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'Sucursal B',
        description: 'Sucursal de destino del paquete',
        required: false })
    sucursalDestino?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'Comentarios sobre el estado del paquete',
        description: 'Comentarios adicionales sobre el paquete',
        required: false })
    comentarios?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'Buenos Aires',
        description: 'Nombre de la ciudad',
        required: false })
    ml_city_name?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'Av. Prueba',
        description: 'Nombre de la calle',
        required: false })
    ml_street_name?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: '742',
        description: 'Número de la calle',
        required: false })
    ml_street_number?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'Entre calles A y B',
        description: 'Comentarios adicionales sobre la dirección',
        required: false })
    ml_comment?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: '1234',
        description: 'Código postal',
        required: false })
    ml_zip_code?: string;
}
