import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsEnum, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitOfMeasure } from '@marketplace/shared';

export class CreateInquiryDto {
  @ApiProperty({ description: 'ID of product being inquired about' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ enum: UnitOfMeasure, default: UnitOfMeasure.PIECE })
  @IsOptional()
  @IsEnum(UnitOfMeasure)
  unitOfMeasure?: UnitOfMeasure;

  @ApiProperty({ example: 'Please provide quotation with GST and shipping timeline.' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ example: 'Rohit Sharma' })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiPropertyOptional({ example: 'buyer@example.com' })
  @IsOptional()
  @IsEmail()
  buyerEmail?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  buyerPhone?: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsOptional()
  @IsString()
  buyerCity?: string;
}

