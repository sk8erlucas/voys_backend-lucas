import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FilterDeliveryDriverDto {
  @ApiProperty({ 
      required: false, 
      example: true, 
      description: 'Indica si se deben incluir los conductores que tienen paquetes' 
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  with_packages?: boolean;
}