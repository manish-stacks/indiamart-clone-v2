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
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, VerificationStatus } from '@marketplace/shared';

@ApiTags('Admin Console')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get marketplace aggregate statistics' })
  async getStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('businesses')
  @ApiOperation({ summary: 'List businesses with optional verification status filter' })
  async getBusinesses(@Query('status') status?: VerificationStatus) {
    return this.adminService.getBusinesses(status);
  }

  @Patch('businesses/:id/verify')
  @ApiOperation({ summary: 'Update business verification status and GSTIN verification' })
  async verifyBusiness(
    @Param('id') id: string,
    @Body() body: { status: VerificationStatus; gstinVerified?: boolean },
  ) {
    return this.adminService.verifyBusiness(id, body.status, body.gstinVerified);
  }

  @Get('users')
  @ApiOperation({ summary: 'List platform users with roles' })
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Suspend or activate user account' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACTIVE' | 'SUSPENDED' },
  ) {
    return this.adminService.updateUserStatus(id, body.status);
  }

  @Post('impersonate/:id')
  @ApiOperation({ summary: 'Login as any buyer or seller for account support and moderation' })
  async impersonateUser(@Param('id') id: string) {
    return this.adminService.impersonateUser(id);
  }

  @Get('products')
  @ApiOperation({ summary: 'List all marketplace products for moderation' })
  async getAllProducts(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('businessId') businessId?: string,
  ) {
    return this.adminService.getAllProducts({ search, status, businessId });
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Admin delete violating or spam product listing' })
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  @Get('inquiries')
  @ApiOperation({ summary: 'List all marketplace inquiries for audit' })
  async getAllInquiries(@Query('search') search?: string) {
    return this.adminService.getAllInquiries({ search });
  }
}

