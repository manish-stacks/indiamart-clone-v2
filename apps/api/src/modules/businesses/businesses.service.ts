import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { BusinessMemberRole, UserRole, VerificationStatus } from '@marketplace/shared';

@Injectable()
export class BusinessesService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(userId: string, dto: CreateBusinessDto) {
    let slug = this.slugify(dto.name);
    const existingSlug = await this.prisma.business.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (dto.gstin) {
      const existingGstin = await this.prisma.business.findUnique({
        where: { gstin: dto.gstin },
      });
      if (existingGstin) {
        throw new ConflictException('A business with this GSTIN is already registered');
      }
    }

    // Create business and add creator as OWNER
    const business = await this.prisma.$transaction(async (tx) => {
      const biz = await tx.business.create({
        data: {
          name: dto.name,
          slug,
          legalName: dto.legalName,
          gstin: dto.gstin,
          businessType: dto.businessType,
          description: dto.description,
          yearEstablished: dto.yearEstablished,
          verificationStatus: VerificationStatus.PENDING,
          members: {
            create: {
              userId,
              role: BusinessMemberRole.OWNER,
            },
          },
          ...(dto.city
            ? {
                addresses: {
                  create: {
                    street: dto.street || 'Address Not Provided',
                    city: dto.city,
                    state: dto.state || 'State',
                    postalCode: dto.postalCode || '000000',
                    isPrimary: true,
                  },
                },
              }
            : {}),
        },
        include: {
          members: true,
          addresses: true,
        },
      });

      // Ensure user has SELLER role
      let sellerRole = await tx.role.findUnique({ where: { name: UserRole.SELLER } });
      if (!sellerRole) {
        sellerRole = await tx.role.create({ data: { name: UserRole.SELLER, description: 'Seller Role' } });
      }

      await tx.userRole.upsert({
        where: {
          userId_roleId: {
            userId,
            roleId: sellerRole.id,
          },
        },
        create: {
          userId,
          roleId: sellerRole.id,
        },
        update: {},
      });

      return biz;
    });

    return business;
  }

  async findBySlug(slug: string) {
    const business = await this.prisma.business.findUnique({
      where: { slug },
      include: {
        addresses: {
          where: { isPrimary: true },
        },
        products: {
          where: { status: 'PUBLISHED' },
          include: {
            images: {
              orderBy: { displayOrder: 'asc' },
              take: 1,
            },
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
          take: 20,
        },
        _count: {
          select: {
            products: true,
            members: true,
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException(`Business with slug '${slug}' was not found`);
    }

    const primaryAddress = business.addresses[0];

    return {
      id: business.id,
      name: business.name,
      slug: business.slug,
      legalName: business.legalName,
      businessType: business.businessType,
      verificationStatus: business.verificationStatus,
      description: business.description,
      logoUrl: business.logoUrl,
      bannerUrl: business.bannerUrl,
      yearEstablished: business.yearEstablished,
      trustScore: business.trustScore,
      responseTimeHours: business.responseTimeHours,
      gstinVerified: business.gstinVerified,
      city: primaryAddress?.city,
      state: primaryAddress?.state,
      postalCode: primaryAddress?.postalCode,
      street: primaryAddress?.street,
      productCount: business._count.products,
      memberCount: business._count.members,
      products: business.products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        unitPrice: Number(p.unitPrice),
        minOrderQuantity: p.minOrderQuantity,
        unitOfMeasure: p.unitOfMeasure,
        isB2B: p.isB2B,
        isB2C: p.isB2C,
        category: p.category,
        primaryImage: p.images[0]?.url || null,
      })),
    };
  }

  async findAll(query?: { city?: string; businessType?: string; verifiedOnly?: boolean; page?: number; limit?: number }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.businessType) {
      where.businessType = query.businessType;
    }
    if (query?.verifiedOnly) {
      where.verificationStatus = VerificationStatus.VERIFIED;
    }
    if (query?.city) {
      where.addresses = {
        some: {
          city: { contains: query.city },
        },
      };
    }

    const [total, businesses] = await Promise.all([
      this.prisma.business.count({ where }),
      this.prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: { trustScore: 'desc' },
        include: {
          addresses: { where: { isPrimary: true } },
          _count: { select: { products: true } },
        },
      }),
    ]);

    return {
      data: businesses.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        businessType: b.businessType,
        verificationStatus: b.verificationStatus,
        gstinVerified: b.gstinVerified,
        trustScore: b.trustScore,
        city: b.addresses[0]?.city,
        state: b.addresses[0]?.state,
        productCount: b._count.products,
        logoUrl: b.logoUrl,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(businessId: string, dto: UpdateBusinessDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.prisma.business.update({
      where: { id: businessId },
      data: {
        name: dto.name,
        legalName: dto.legalName,
        description: dto.description,
        businessType: dto.businessType,
        yearEstablished: dto.yearEstablished,
      },
    });
  }
}

