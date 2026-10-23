import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@marketplace/shared';

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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin create a new category or subcategory' })
  async create(
    @Body()
    body: {
      name: string;
      slug?: string;
      description?: string;
      imageUrl?: string;
      icon?: string;
      parentId?: string;
    },
  ) {
    return this.categoriesService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin update existing category' })
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      imageUrl?: string;
      icon?: string;
      parentId?: string;
    },
  ) {
    return this.categoriesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin delete category' })
  async delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}

