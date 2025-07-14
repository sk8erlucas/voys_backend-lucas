import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilterPackagesDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '25/12/2024',
    description: 'Fecha de filtrado de paquetes en formato AAAA-MM-DD',
    required: false,
  })
  date?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '20/12/2024',
    description:
      'Fecha de inicio de filtrado de paquetes en formato AAAA-MM-DD',
    required: false,
  })
  start_date?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '27/12/2024',
    description: 'Fecha de fin de filtrado de paquetes en formato AAAA-MM-DD',
    required: false,
  })
  end_date?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '2024-01-25',
    description: 'Día específico para filtrar paquetes (YYYY-MM-DD)',
    required: false,
  })
  day?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '09123456789',
    description: 'Número de orden de Mercado Libre',
    required: false,
  })
  ml_order_id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'MLT1234567890',
    description: 'Número de seguimiento de Mercado Libre',
    required: false,
  })
  ml_tracking_id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'ready_to_ship',
    description: 'Estado del paquete en Mercado Libre',
    required: false,
  })
  ml_status?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'en_planta',
    description: 'Estado del paquete en Voys',
    required: false,
  })
  voys_status?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' || value === 'false' ? value === 'true' : value,
  )
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Indica si el paquete está asignado a un conductor',
    required: false,
  })
  assigned?: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' || value === 'false' ? value === 'true' : value,
  )
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Indica si el paquete está incluido en una ruta',
    required: false,
  })
  with_route?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    const parsedValue = parseInt(value, 10);
    return isNaN(parsedValue) ? value : parsedValue;
  })
  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'ID de la tienda asociada al paquete',
    required: false,
  })
  store_id?: number;

  @IsOptional()
  @Transform(({ value }) => {
    const parsedValue = parseInt(value, 10);
    return isNaN(parsedValue) ? value : parsedValue;
  })
  @IsInt()
  @ApiProperty({
    example: 123,
    description: 'ID del cliente asociado al paquete',
    required: false,
  })
  customer_id?: number;

  @IsOptional()
  @Transform(({ value }) => {
    const parsedValue = parseInt(value, 10);
    return isNaN(parsedValue) ? value : parsedValue;
  })
  @IsInt()
  @ApiProperty({
    example: 5,
    description: 'ID de la ruta asignada al paquete',
    required: false,
  })
  route_id?: number;

  @IsOptional()
  @Transform(({ value }) => {
    const parsedValue = parseInt(value, 10);
    return isNaN(parsedValue) ? value : parsedValue;
  })
  @IsInt()
  @ApiProperty({
    example: 42,
    description: 'ID del conductor de entrega asignado al paquete',
    required: false,
  })
  delivery_driver_id?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Av. Corrientes 1234',
    description: 'Dirección para filtrar paquetes',
    required: false,
  })
  address?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'C1043AAZ',
    description: 'Código postal para filtrar paquetes',
    required: false,
  })
  postal_code?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Si es true, excluye paquetes con campos ofuscados',
    required: false,
    default: true,
  })
  filter_obfuscated?: boolean;

  /**
   * Verifica si un string contiene patrones de ofuscación (3 o más 'x' juntas)
   * @param value String a verificar
   * @returns true si el string está ofuscado, false en caso contrario
   */
  isObfuscated(value: string): boolean {
    if (!value) return false;
    return /xxx+/i.test(value);
  }

  /**
   * Verifica si alguno de los campos críticos del paquete está ofuscado
   * @param pkg Datos del paquete a verificar
   * @returns true si algún campo está ofuscado, false en caso contrario
   */
  hasObfuscatedFields(pkg: any): boolean {
    const fieldsToCheck = [
      pkg.ml_street_name,
      pkg.ml_city_name,
      pkg.ml_state_name,
    ];

    const isObfuscated = fieldsToCheck.some((field) =>
      this.isObfuscated(field),
    );

    if (isObfuscated) {
      console.log(
        `Paquete excluido por contener campos de dirección ofuscados: ID=${pkg.id}, Orden ML=${pkg.ml_order_id}`,
      );
    }

    return isObfuscated;
  }
}
