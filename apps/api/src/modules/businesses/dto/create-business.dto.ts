import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessType } from '@marketplace/shared';

export class CreateBusinessDto {
  @ApiProperty({ example: 'Apex Industrial Tools Pvt Ltd' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Apex Industrial Tools Private Limited' })
  @IsOptional()
  @IsString()
  legalName?: string;

  @ApiPropertyOptional({ example: '27AABCU9603R1ZM' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Please provide a valid Indian 15-digit GSTIN number',
  })
  gstin?: string;

  @ApiProperty({ enum: BusinessType, default: BusinessType.MANUFACTURER })
  @IsEnum(BusinessType)
  businessType: BusinessType;

  @ApiPropertyOptional({ example: 'Leading manufacturer of precision cutting and CNC tooling.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 2012 })
  @IsOptional()
  @IsNumber()
  yearEstablished?: number;

  @ApiPropertyOptional({ example: 'Plot 45, GIDC Estate' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: 'Ahmedabad' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Gujarat' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '382445' })
  @IsOptional()
  @IsString()
  postalCode?: string;
}

