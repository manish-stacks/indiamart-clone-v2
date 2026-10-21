import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BusinessMemberGuard } from '../../common/guards/business-member.guard';
import { BusinessRoles } from '../../common/decorators/business-roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BusinessMemberRole } from '@marketplace/shared';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private businessesService: BusinessesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new business profile / storefront (Self-onboarding)' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBusinessDto,
  ) {
    return this.businessesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter businesses/suppliers' })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'businessType', required: false })
  @ApiQuery({ name: 'verifiedOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('city') city?: string,
    @Query('businessType') businessType?: string,
    @Query('verifiedOnly') verifiedOnly?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.businessesService.findAll({
      city,
      businessType,
      verifiedOnly: verifiedOnly === 'true',
      page,
      limit,
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get public business profile and catalogue by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.businessesService.findBySlug(slug);
  }

  @Put(':businessId')
  @UseGuards(JwtAuthGuard, BusinessMemberGuard)
  @BusinessRoles(BusinessMemberRole.OWNER, BusinessMemberRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update business profile details (Owner or Manager only)' })
  async update(
    @Param('businessId') businessId: string,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessesService.update(businessId, dto);
  }
}

