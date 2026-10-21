import { IsBooleanString, IsNumberString, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchProductDto {
  @ApiPropertyOptional({ description: 'Search keyword for product name or description' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Category slug or ID' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'City name of the supplier (e.g. Mumbai, Ahmedabad, Delhi)' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Minimum price filter (INR)' })
  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @ApiPropertyOptional({ description: 'Maximum price filter (INR)' })
  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @ApiPropertyOptional({ description: 'Filter only verified suppliers' })
  @IsOptional()
  @IsBooleanString()
  verifiedOnly?: string;

  @ApiPropertyOptional({ description: 'Filter B2B or B2C' })
  @IsOptional()
  @IsString()
  tradeType?: 'b2b' | 'b2c';

  @ApiPropertyOptional({ description: 'Sort order: price_asc, price_desc, newest' })
  @IsOptional()
  @IsString()
  sortBy?: 'price_asc' | 'price_desc' | 'newest';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}

