import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BusinessMemberGuard } from '../../common/guards/business-member.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BusinessRoles } from '../../common/decorators/business-roles.decorator';
import { BusinessMemberRole } from '@marketplace/shared';

@ApiTags('Inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private inquiriesService: InquiriesService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Submit buyer inquiry for a product (Authenticated buyer or guest)' })
  async create(
    @Body() dto: CreateInquiryDto,
    @CurrentUser() user: any,
  ) {
    return this.inquiriesService.create(dto, user);
  }

  @Post('direct-connect')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Log instant WhatsApp click or Call Supplier lead' })
  async logDirectConnect(
    @Body() body: { productId: string; channel?: 'WHATSAPP' | 'CALL'; notes?: string; buyerName?: string; buyerPhone?: string },
    @CurrentUser() user: any,
  ) {
    return this.inquiriesService.logDirectConnect(body, user);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all inquiries submitted by currently authenticated buyer' })
  async getMyInquiries(@CurrentUser('id') userId: string) {
    return this.inquiriesService.getMyInquiries(userId);
  }

  @Get('seller/leads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all CRM buyer leads received across user seller businesses' })
  async getSellerLeads(@CurrentUser('id') userId: string) {
    return this.inquiriesService.getSellerLeads(userId);
  }

  @Patch('leads/:leadId/stage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update CRM lead pipeline stage (New, Contacted, Won, Lost)' })
  async updateLeadStage(
    @Param('leadId') leadId: string,
    @Body('stage') stage: any,
    @CurrentUser('id') userId: string,
  ) {
    return this.inquiriesService.updateLeadStage(leadId, stage, userId);
  }

  @Post('leads/:leadId/notes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add private internal seller note to lead' })
  async addLeadNote(
    @Param('leadId') leadId: string,
    @Body('note') note: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.inquiriesService.addLeadNote(leadId, note, userId);
  }

  @Get('business/:businessId')
  @UseGuards(JwtAuthGuard, BusinessMemberGuard)
  @BusinessRoles(BusinessMemberRole.OWNER, BusinessMemberRole.MANAGER, BusinessMemberRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all inquiries and leads received by business (Owner/Staff)' })
  async getBusinessInquiries(@Param('businessId') businessId: string) {
    return this.inquiriesService.getBusinessInquiries(businessId);
  }
}

