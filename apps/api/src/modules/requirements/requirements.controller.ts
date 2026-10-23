import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequirementsService, CreateRequirementDto } from './requirements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, RequirementStatus } from '@marketplace/shared';

@ApiTags('Requirements & RFQ')
@Controller('requirements')
export class RequirementsController {
  constructor(private requirementsService: RequirementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a new B2B Buying Requirement / RFQ' })
  async create(
    @CurrentUser('id') buyerId: string,
    @Body() dto: CreateRequirementDto,
  ) {
    return this.requirementsService.create(buyerId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Public B2B RFQ board - Discover buyer requirements across India' })
  async findAllPublic(
    @Query('categoryId') categoryId?: string,
    @Query('city') city?: string,
    @Query('search') search?: string,
  ) {
    return this.requirementsService.findAllPublic({ categoryId, city, search });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get requirements posted by currently logged in buyer' })
  async getMyRequirements(@CurrentUser('id') buyerId: string) {
    return this.requirementsService.getBuyerRequirements(buyerId);
  }

  @Post(':id/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supplier submits price quotation response to buyer requirement' })
  async respondToRequirement(
    @Param('id') requirementId: string,
    @Body() body: { businessId: string; message: string; offeredPrice?: number },
  ) {
    return this.requirementsService.respondToRequirement(
      requirementId,
      body.businessId,
      body.message,
      body.offeredPrice,
    );
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin audit all platform requirements' })
  async getAllForAdmin(
    @Query('search') search?: string,
    @Query('status') status?: RequirementStatus,
  ) {
    return this.requirementsService.getAllForAdmin({ search, status });
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin update requirement status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: RequirementStatus,
  ) {
    return this.requirementsService.updateStatus(id, status);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin delete requirement' })
  async delete(@Param('id') id: string) {
    return this.requirementsService.delete(id);
  }
}

