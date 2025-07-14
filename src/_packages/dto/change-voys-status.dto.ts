import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeVoysStatusDto {

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: '09123456789',
        description: 'numero de orden de mercado libre',
        required: false })
    ml_order_id?: string;
  
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.toString())
    @ApiProperty({ 
        example: '44123456789',
        description: 'numero de tracking de mercado libre',
        required: false })
    ml_tracking_id?: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'en_planta', description: 'estado de voys' })
    voys_status: string;

}