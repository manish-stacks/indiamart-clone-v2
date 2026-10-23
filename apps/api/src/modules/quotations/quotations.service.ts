import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuotationStatus, UnitOfMeasure } from '@marketplace/shared';

export interface CreateQuotationDto {
  inquiryId?: string;
  businessId: string;
  buyerId: string;
  validityDays?: number;
  paymentTerms?: string;
  taxPercent?: number; // e.g. 18 for 18% GST
  shippingAmount?: number;
  items: {
    productId?: string;
    description: string;
    quantity: number;
    unitOfMeasure?: UnitOfMeasure;
    unitPrice: number;
  }[];
}

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuotationDto, sellerUserId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
      include: { members: true },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const isMember = business.members.some((m) => m.userId === sellerUserId);
    if (!isMember) {
      throw new BadRequestException('You are not authorized to issue quotations for this business');
    }

    const quoteNumber = `QT-${Date.now().toString().slice(-6)}`;

    let subtotal = 0;
    const itemsData = dto.items.map((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;
      return {
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure || UnitOfMeasure.PIECE,
        unitPrice: item.unitPrice,
        totalAmount: lineTotal,
      };
    });

    const taxPercent = dto.taxPercent ?? 18; // Standard Indian GST 18%
    const taxAmount = (subtotal * taxPercent) / 100;
    const shippingAmount = dto.shippingAmount || 0;
    const totalAmount = subtotal + taxAmount + shippingAmount;

    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + (dto.validityDays || 15));

    const quotation = await this.prisma.quotation.create({
      data: {
        quoteNumber,
        businessId: dto.businessId,
        buyerId: dto.buyerId,
        inquiryId: dto.inquiryId,
        subtotal,
        taxAmount,
        shippingAmount,
        totalAmount,
        paymentTerms: dto.paymentTerms || 'Standard B2B terms: 50% advance, balance on dispatch',
        validityDate,
        status: QuotationStatus.SENT,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
        business: { select: { id: true, name: true, slug: true, gstin: true } },
        buyer: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });

    // Update lead stage if associated with inquiry
    if (dto.inquiryId) {
      await this.prisma.lead.updateMany({
        where: { inquiryId: dto.inquiryId },
        data: { stage: 'QUOTATION_SENT' },
      }).catch(() => {});
    }

    return quotation;
  }

  async getSellerQuotations(userId: string) {
    const memberships = await this.prisma.businessMember.findMany({
      where: { userId },
      select: { businessId: true },
    });
    const businessIds = memberships.map((m) => m.businessId);

    return this.prisma.quotation.findMany({
      where: { businessId: { in: businessIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        buyer: { select: { id: true, fullName: true, email: true, phone: true } },
        business: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async getBuyerQuotations(buyerId: string) {
    return this.prisma.quotation.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            gstin: true,
            verificationStatus: true,
            addresses: { where: { isPrimary: true } },
          },
        },
      },
    });
  }

  async updateStatus(quotationId: string, status: QuotationStatus, userId: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { business: { include: { members: true } } },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    const isBuyer = quotation.buyerId === userId;
    const isSeller = quotation.business.members.some((m) => m.userId === userId);

    if (!isBuyer && !isSeller) {
      throw new BadRequestException('Not authorized to update this quotation');
    }

    return this.prisma.quotation.update({
      where: { id: quotationId },
      data: { status },
    });
  }
}

