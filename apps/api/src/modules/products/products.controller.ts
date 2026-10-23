import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BusinessMemberGuard } from '../../common/guards/business-member.guard';
import { BusinessRoles } from '../../common/decorators/business-roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BusinessMemberRole, ProductStatus } from '@marketplace/shared';

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

  @Post('bulk-import')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk import products from CSV' })
  async bulkImport(
    @Body() body: { products: any[]; businessId?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.productsService.bulkImport(body.products, userId, body.businessId);
  }

  @Get('seller/my-products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all catalogue products for current logged-in seller' })
  async getSellerProducts(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.getSellerProducts(userId, { status, search });
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

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update existing product listing (Owner/Manager)' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product listing (Owner/Manager)' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.productsService.delete(id, userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle product live or draft status' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('status') status: ProductStatus,
  ) {
    return this.productsService.updateStatus(id, userId, status);
  }
}

