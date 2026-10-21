import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitOfMeasure, ProductStatus } from '@marketplace/shared';

class PriceTierDto {
  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  minQuantity: number;

  @ApiPropertyOptional({ example: 49 })
  @IsOptional()
  @IsNumber()
  maxQuantity?: number;

  @ApiProperty({ example: 450.0 })
  @IsNumber()
  @Min(0)
  price: number;
}

class ProductImageDto {
  @ApiProperty({ example: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: 'Industrial CNC Lathe' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'prod-biz-123' })
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({ example: 'cat-machinery-123' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 'Heavy Duty CNC Lathe Machine 3000 RPM' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'High precision industrial CNC lathe machine suitable for automotive component manufacturing.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  minOrderQuantity: number;

  @ApiProperty({ enum: UnitOfMeasure, default: UnitOfMeasure.PIECE })
  @IsEnum(UnitOfMeasure)
  unitOfMeasure: UnitOfMeasure;

  @ApiProperty({ example: 250000.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isB2B?: boolean = true;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isB2C?: boolean = false;

  @ApiPropertyOptional({ example: 'LATHE-CNC-3000' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: { "Motor Power": "7.5 kW", "Spindle Speed": "3000 RPM", "Max Turning Length": "1000 mm" } })
  @IsOptional()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({ type: [ProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiPropertyOptional({ type: [PriceTierDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceTierDto)
  priceTiers?: PriceTierDto[];
}

