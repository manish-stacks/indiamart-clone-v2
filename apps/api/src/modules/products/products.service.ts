import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { ProductStatus, VerificationStatus } from '@marketplace/shared';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(dto: CreateProductDto) {
    let slug = this.slugify(dto.name);
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          businessId: dto.businessId,
          categoryId: dto.categoryId,
          name: dto.name,
          slug,
          description: dto.description,
          minOrderQuantity: dto.minOrderQuantity,
          unitOfMeasure: dto.unitOfMeasure,
          unitPrice: dto.unitPrice,
          isB2B: dto.isB2B ?? true,
          isB2C: dto.isB2C ?? false,
          sku: dto.sku,
          specifications: dto.specifications || {},
          status: ProductStatus.PUBLISHED,
          images: {
            create: (dto.images || []).map((img, idx) => ({
              url: img.url,
              altText: img.altText || dto.name,
              displayOrder: idx,
              isPrimary: img.isPrimary ?? (idx === 0),
            })),
          },
          priceTiers: {
            create: (dto.priceTiers || []).map((pt) => ({
              minQuantity: pt.minQuantity,
              maxQuantity: pt.maxQuantity,
              price: pt.price,
            })),
          },
        },
        include: {
          images: true,
          priceTiers: true,
          category: true,
          business: true,
        },
      });

      return product;
    });
  }

  async search(dto: SearchProductDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: ProductStatus.PUBLISHED,
    };

    // Keyword search
    if (dto.q) {
      where.OR = [
        { name: { contains: dto.q } },
        { description: { contains: dto.q } },
      ];
    }

    // Category filter
    if (dto.category) {
      where.OR = [
        ...(where.OR || []),
        { category: { slug: dto.category } },
        { categoryId: dto.category },
      ];
    }

    // Trade type
    if (dto.tradeType === 'b2b') {
      where.isB2B = true;
    } else if (dto.tradeType === 'b2c') {
      where.isB2C = true;
    }

    // Price range
    if (dto.minPrice || dto.maxPrice) {
      where.unitPrice = {};
      if (dto.minPrice) where.unitPrice.gte = Number(dto.minPrice);
      if (dto.maxPrice) where.unitPrice.lte = Number(dto.maxPrice);
    }

    // Business & location filters
    const businessWhere: any = {};
    if (dto.verifiedOnly === 'true') {
      businessWhere.verificationStatus = VerificationStatus.VERIFIED;
    }
    if (dto.city) {
      businessWhere.addresses = {
        some: {
          city: { contains: dto.city },
        },
      };
    }

    if (Object.keys(businessWhere).length > 0) {
      where.business = businessWhere;
    }

    // Sort order
    let orderBy: any = { createdAt: 'desc' };
    if (dto.sortBy === 'price_asc') {
      orderBy = { unitPrice: 'asc' };
    } else if (dto.sortBy === 'price_desc') {
      orderBy = { unitPrice: 'desc' };
    }

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              verificationStatus: true,
              gstinVerified: true,
              trustScore: true,
              addresses: {
                where: { isPrimary: true },
                select: { city: true, state: true },
              },
            },
          },
          images: {
            orderBy: { displayOrder: 'asc' },
            take: 2,
          },
          priceTiers: {
            orderBy: { minQuantity: 'asc' },
          },
        },
      }),
    ]);

    return {
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        unitPrice: Number(p.unitPrice),
        minOrderQuantity: p.minOrderQuantity,
        unitOfMeasure: p.unitOfMeasure,
        isB2B: p.isB2B,
        isB2C: p.isB2C,
        category: p.category,
        business: {
          id: p.business.id,
          name: p.business.name,
          slug: p.business.slug,
          verificationStatus: p.business.verificationStatus,
          gstinVerified: p.business.gstinVerified,
          trustScore: Number(p.business.trustScore),
          city: p.business.addresses[0]?.city || null,
          state: p.business.addresses[0]?.state || null,
        },
        primaryImage: p.images[0]?.url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
        priceTiers: p.priceTiers.map((pt) => ({
          minQuantity: pt.minQuantity,
          maxQuantity: pt.maxQuantity,
          price: Number(pt.price),
        })),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        business: {
          include: {
            addresses: { where: { isPrimary: true } },
          },
        },
        images: { orderBy: { displayOrder: 'asc' } },
        priceTiers: { orderBy: { minQuantity: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product '${slug}' not found`);
    }

    // Find similar products in same category
    const similarProducts = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: ProductStatus.PUBLISHED,
      },
      take: 4,
      include: {
        images: { take: 1 },
      },
    });

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      minOrderQuantity: product.minOrderQuantity,
      unitOfMeasure: product.unitOfMeasure,
      unitPrice: Number(product.unitPrice),
      isB2B: product.isB2B,
      isB2C: product.isB2C,
      sku: product.sku,
      specifications: product.specifications,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      business: {
        id: product.business.id,
        name: product.business.name,
        slug: product.business.slug,
        legalName: product.business.legalName,
        businessType: product.business.businessType,
        verificationStatus: product.business.verificationStatus,
        gstinVerified: product.business.gstinVerified,
        trustScore: Number(product.business.trustScore),
        responseTimeHours: product.business.responseTimeHours,
        city: product.business.addresses[0]?.city || null,
        state: product.business.addresses[0]?.state || null,
        yearEstablished: product.business.yearEstablished,
      },
      images: product.images.map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
      })),
      priceTiers: product.priceTiers.map((pt) => ({
        minQuantity: pt.minQuantity,
        maxQuantity: pt.maxQuantity,
        price: Number(pt.price),
      })),
      similarProducts: similarProducts.map((sp) => ({
        id: sp.id,
        name: sp.name,
        slug: sp.slug,
        unitPrice: Number(sp.unitPrice),
        primaryImage: sp.images[0]?.url || null,
      })),
    };
  }
}

