import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { VerificationStatus } from '@marketplace/shared';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async getPlatformStats() {
    const [
      totalUsers,
      totalBusinesses,
      totalProducts,
      totalInquiries,
      totalLeads,
      pendingVerifications,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.business.count(),
      this.prisma.product.count(),
      this.prisma.inquiry.count(),
      this.prisma.lead.count(),
      this.prisma.business.count({
        where: { verificationStatus: { in: [VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW] } },
      }),
    ]);

    return {
      totalUsers,
      totalBusinesses,
      totalProducts,
      totalInquiries,
      totalLeads,
      pendingVerifications,
    };
  }

  async getBusinesses(status?: VerificationStatus) {
    const where: any = {};
    if (status) {
      where.verificationStatus = status;
    }

    return this.prisma.business.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        addresses: { where: { isPrimary: true } },
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, phone: true },
            },
          },
        },
        _count: {
          select: { products: true, inquiriesReceived: true, leads: true },
        },
      },
    });
  }

  async verifyBusiness(businessId: string, status: VerificationStatus, gstinVerified: boolean = true) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.prisma.business.update({
      where: { id: businessId },
      data: {
        verificationStatus: status,
        gstinVerified: status === VerificationStatus.VERIFIED ? gstinVerified : false,
      },
    });
  }

  async getUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        roles: { include: { role: true } },
        businessMembers: {
          include: {
            business: { select: { id: true, name: true, slug: true, verificationStatus: true } },
          },
        },
        _count: {
          select: { buyerInquiries: true, buyerRequirements: true },
        },
      },
    });
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  async getAllProducts(query?: { search?: string; status?: string; businessId?: string }) {
    const where: any = {};
    if (query?.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query?.businessId) {
      where.businessId = query.businessId;
    }
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search } },
        { sku: { contains: query.search } },
        { business: { name: { contains: query.search } } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        business: {
          select: { id: true, name: true, slug: true, verificationStatus: true, gstin: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: { take: 1 },
        priceTiers: true,
        _count: {
          select: { inquiries: true },
        },
      },
    });
  }

  async deleteProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.prisma.product.delete({
      where: { id: productId },
    });
  }

  async impersonateUser(targetUserId: string) {
    return this.authService.generateImpersonationToken(targetUserId);
  }

  async getAllInquiries(query?: { search?: string }) {
    const where: any = {};
    if (query?.search) {
      where.OR = [
        { product: { name: { contains: query.search } } },
        { business: { name: { contains: query.search } } },
        { buyer: { fullName: { contains: query.search } } },
        { message: { contains: query.search } },
      ];
    }

    return this.prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        product: { select: { id: true, name: true, slug: true, unitPrice: true, unitOfMeasure: true } },
        business: { select: { id: true, name: true, slug: true, verificationStatus: true } },
        buyer: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });
  }
}

