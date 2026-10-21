import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get nested hierarchical category tree' })
  async findAllTree() {
    return this.categoriesService.findAllTree();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category details by slug with subcategories' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}

