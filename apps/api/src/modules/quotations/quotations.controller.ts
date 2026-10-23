import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuotationsService, CreateQuotationDto } from './quotations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { QuotationStatus } from '@marketplace/shared';

@ApiTags('Quotations & Estimates')
@Controller('quotations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuotationsController {
  constructor(private quotationsService: QuotationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create formal B2B quotation for buyer inquiry (Seller)' })
  async create(
    @Body() dto: CreateQuotationDto,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.quotationsService.create(dto, sellerId);
  }

  @Get('seller')
  @ApiOperation({ summary: 'Get all quotations issued by seller businesses' })
  async getSellerQuotations(@CurrentUser('id') sellerId: string) {
    return this.quotationsService.getSellerQuotations(sellerId);
  }

  @Get('buyer')
  @ApiOperation({ summary: 'Get all quotations received by currently logged in buyer' })
  async getBuyerQuotations(@CurrentUser('id') buyerId: string) {
    return this.quotationsService.getBuyerQuotations(buyerId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Accept, decline, or revise quotation status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: QuotationStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.quotationsService.updateStatus(id, status, userId);
  }
}

