import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UserRole, UnitOfMeasure } from '@marketplace/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InquiriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInquiryDto, currentUser?: any) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: {
        business: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let buyerId: string;
    let buyerName: string;
    let buyerEmail: string;
    let buyerPhone: string | null = null;

    if (currentUser) {
      buyerId = currentUser.id;
      buyerName = dto.buyerName || currentUser.fullName || currentUser.email.split('@')[0];
      buyerEmail = currentUser.email;
      buyerPhone = dto.buyerPhone || currentUser.phone || null;

      // Update phone on user if provided and not previously set
      if (dto.buyerPhone && !currentUser.phone) {
        await this.prisma.user.update({
          where: { id: buyerId },
          data: { phone: dto.buyerPhone },
        }).catch(() => {});
      }
    } else {
      // Guest inquiry: requires at least name and email or phone
      if (!dto.buyerName || (!dto.buyerEmail && !dto.buyerPhone)) {
        throw new BadRequestException(
          'Please provide your Full Name and at least Email or Phone Number so the supplier can reply with quotations.',
        );
      }

      buyerName = dto.buyerName.trim();
      buyerEmail = dto.buyerEmail ? dto.buyerEmail.toLowerCase().trim() : '';
      buyerPhone = dto.buyerPhone ? dto.buyerPhone.trim() : null;

      // Check if user already exists
      let user = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(buyerEmail ? [{ email: buyerEmail }] : []),
            ...(buyerPhone ? [{ phone: buyerPhone }] : []),
          ],
        },
      });

      if (!user) {
        // Auto-provision buyer account
        const randomPassword = Math.random().toString(36).slice(-10) + '!A1';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(randomPassword, salt);

        let buyerRole = await this.prisma.role.findUnique({
          where: { name: UserRole.BUYER },
        });

        if (!buyerRole) {
          buyerRole = await this.prisma.role.create({
            data: { name: UserRole.BUYER, description: 'Default buyer role' },
          });
        }

        user = await this.prisma.user.create({
          data: {
            email: buyerEmail || `buyer_${Date.now()}@marketplace.local`,
            phone: buyerPhone,
            fullName: buyerName,
            passwordHash,
            roles: {
              create: { roleId: buyerRole.id },
            },
          },
        });
      }

      buyerId = user.id;
    }

    // Prevent seller from inquiring to their own business
    if (currentUser && currentUser.businessMemberships?.some((bm: any) => bm.businessId === product.businessId)) {
      throw new BadRequestException('You cannot send an inquiry to your own business products.');
    }

    const estimatedValue = Number(product.unitPrice) * dto.quantity;

    // Create Inquiry & Lead atomically
    const result = await this.prisma.$transaction(async (tx) => {
      const inquiry = await tx.inquiry.create({
        data: {
          buyerId,
          businessId: product.businessId,
          productId: product.id,
          message: dto.message,
          quantity: dto.quantity,
          unitOfMeasure: dto.unitOfMeasure || (product.unitOfMeasure as UnitOfMeasure),
          status: 'NEW',
        },
      });

      const lead = await tx.lead.create({
        data: {
          businessId: product.businessId,
          inquiryId: inquiry.id,
          buyerName,
          buyerPhone,
          buyerEmail,
          stage: 'NEW',
          priority: 'MEDIUM',
          estimatedValue,
        },
      });

      return { inquiry, lead };
    });

    return {
      inquiryId: result.inquiry.id,
      leadId: result.lead.id,
      productName: product.name,
      supplierName: product.business.name,
      buyerName,
      buyerEmail,
      buyerPhone,
      quantity: dto.quantity,
      unitOfMeasure: dto.unitOfMeasure || product.unitOfMeasure,
      status: 'DELIVERED_TO_SUPPLIER',
      message: `Your inquiry has been successfully sent to ${product.business.name}. The supplier will contact you shortly.`,
    };
  }

  async getMyInquiries(buyerId: string) {
    return this.prisma.inquiry.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            unitPrice: true,
            unitOfMeasure: true,
            images: { take: 1 },
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            verificationStatus: true,
            gstinVerified: true,
            addresses: { where: { isPrimary: true }, select: { city: true, state: true } },
          },
        },
      },
    });
  }

  async getBusinessInquiries(businessId: string) {
    return this.prisma.inquiry.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            unitPrice: true,
          },
        },
        leads: true,
      },
    });
  }

  async getSellerLeads(userId: string) {
    // Find businesses the user belongs to
    const memberships = await this.prisma.businessMember.findMany({
      where: { userId },
      select: { businessId: true },
    });

    const businessIds = memberships.map((m) => m.businessId);
    if (businessIds.length === 0) {
      return [];
    }

    return this.prisma.lead.findMany({
      where: { businessId: { in: businessIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        inquiry: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                unitPrice: true,
                unitOfMeasure: true,
                images: { take: 1 },
              },
            },
            buyer: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async updateLeadStage(leadId: string, stage: any, userId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { business: { include: { members: true } } },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const isMember = lead.business.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new BadRequestException('You are not authorized to update this lead');
    }

    return this.prisma.lead.update({
      where: { id: leadId },
      data: { stage },
    });
  }

  async addLeadNote(leadId: string, noteText: string, authorId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { business: { include: { members: true } } },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const isMember = lead.business.members.some((m) => m.userId === authorId);
    if (!isMember) {
      throw new BadRequestException('You are not authorized to add notes to this lead');
    }

    return this.prisma.leadNote.create({
      data: {
        leadId,
        authorId,
        note: noteText,
      },
    });
  }

  async logDirectConnect(
    body: { productId: string; channel?: 'WHATSAPP' | 'CALL'; notes?: string; buyerName?: string; buyerPhone?: string },
    currentUser?: any,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: body.productId },
      include: { business: true },
    });
    if (!product) return { logged: false };

    const channel = body.channel || 'WHATSAPP';
    const message = body.notes || (channel === 'WHATSAPP' ? `Direct WhatsApp inquiry initiated for "${product.name}"` : `Direct phone call initiated for "${product.name}"`);

    let buyerId = currentUser?.id;
    if (!buyerId) {
      const defaultBuyer = await this.prisma.user.findFirst({
        where: { roles: { some: { role: { name: 'BUYER' } } } },
      });
      buyerId = defaultBuyer?.id;
    }

    if (buyerId) {
      const inquiry = await this.prisma.inquiry.create({
        data: {
          productId: product.id,
          businessId: product.businessId,
          buyerId,
          quantity: product.minOrderQuantity || 1,
          unitOfMeasure: (product.unitOfMeasure || 'PIECE') as any,
          message,
        },
      });

      const buyerUser = currentUser || await this.prisma.user.findUnique({ where: { id: buyerId } });

      await this.prisma.lead.create({
        data: {
          inquiryId: inquiry.id,
          businessId: product.businessId,
          buyerName: body.buyerName || buyerUser?.fullName || 'Verified Buyer',
          buyerEmail: buyerUser?.email || 'buyer@demomarketplace.in',
          buyerPhone: body.buyerPhone || buyerUser?.phone || null,
          stage: 'NEW',
          priority: 'HIGH',
        },
      });

      return { logged: true, inquiryId: inquiry.id };
    }

    return { logged: true };
  }
}

