import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BusinessMemberGuard } from '../../common/guards/business-member.guard';
import { BusinessRoles } from '../../common/decorators/business-roles.decorator';
import { BusinessMemberRole } from '@marketplace/shared';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, BusinessMemberGuard)
  @BusinessRoles(BusinessMemberRole.OWNER, BusinessMemberRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product listing (Owner or Manager only)' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search and filter marketplace products' })
  async search(@Query() dto: SearchProductDto) {
    return this.productsService.search(dto);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product details by slug with supplier & price tiers' })
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}

