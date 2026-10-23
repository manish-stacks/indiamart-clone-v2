import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RequirementStatus, UnitOfMeasure } from '@marketplace/shared';

export interface CreateRequirementDto {
  title: string;
  categoryId: string;
  description: string;
  quantity: number;
  unitOfMeasure?: UnitOfMeasure;
  targetPrice?: number;
  deliveryCity: string;
  deliveryState: string;
}

@Injectable()
export class RequirementsService {
  constructor(private prisma: PrismaService) {}

  async create(buyerId: string, dto: CreateRequirementDto) {
    if (!dto.title || !dto.categoryId || !dto.quantity) {
      throw new BadRequestException('Title, Category, and Quantity are required.');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days active

    return this.prisma.requirement.create({
      data: {
        buyerId,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description || '',
        quantity: Number(dto.quantity),
        unitOfMeasure: dto.unitOfMeasure || UnitOfMeasure.PIECE,
        targetPrice: dto.targetPrice ? Number(dto.targetPrice) : null,
        deliveryCity: dto.deliveryCity || 'All India',
        deliveryState: dto.deliveryState || '',
        status: RequirementStatus.OPEN,
        expiresAt,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        buyer: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });
  }

  async findAllPublic(query?: { categoryId?: string; city?: string; search?: string }) {
    const where: any = {
      status: RequirementStatus.OPEN,
    };

    if (query?.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query?.city && query.city !== 'All India') {
      where.deliveryCity = { contains: query.city };
    }
    if (query?.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    return this.prisma.requirement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        buyer: { select: { id: true, fullName: true } },
        _count: { select: { responses: true } },
      },
    });
  }

  async getBuyerRequirements(buyerId: string) {
    return this.prisma.requirement.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        responses: {
          include: {
            business: { select: { id: true, name: true, slug: true, verificationStatus: true, gstinVerified: true } },
          },
        },
      },
    });
  }

  async respondToRequirement(requirementId: string, businessId: string, message: string, offeredPrice?: number) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id: requirementId },
    });
    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    return this.prisma.requirementResponse.upsert({
      where: {
        requirementId_businessId: {
          requirementId,
          businessId,
        },
      },
      update: {
        message,
        offeredPrice: offeredPrice ? Number(offeredPrice) : null,
      },
      create: {
        requirementId,
        businessId,
        message,
        offeredPrice: offeredPrice ? Number(offeredPrice) : null,
      },
    });
  }

  async getAllForAdmin(query?: { search?: string; status?: RequirementStatus }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.search) {
      where.OR = [
        { title: { contains: query.search } },
        { buyer: { fullName: { contains: query.search } } },
        { deliveryCity: { contains: query.search } },
      ];
    }

    return this.prisma.requirement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        category: { select: { id: true, name: true } },
        buyer: { select: { id: true, fullName: true, email: true, phone: true } },
        _count: { select: { responses: true } },
      },
    });
  }

  async updateStatus(id: string, status: RequirementStatus) {
    return this.prisma.requirement.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return this.prisma.requirement.delete({
      where: { id },
    });
  }
}

