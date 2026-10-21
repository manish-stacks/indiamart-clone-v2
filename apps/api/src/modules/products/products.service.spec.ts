import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { UnitOfMeasure } from '@marketplace/shared';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findBySlug', () => {
    it('should throw NotFoundException if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent-product')).rejects.toThrow(NotFoundException);
    });

    it('should return product with business and price tiers when found', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        name: 'Industrial Lathe',
        slug: 'industrial-lathe',
        unitPrice: 50000,
        minOrderQuantity: 1,
        unitOfMeasure: UnitOfMeasure.PIECE,
        isB2B: true,
        isB2C: false,
        category: { id: 'cat-1', name: 'Machinery', slug: 'machinery' },
        business: {
          id: 'biz-1',
          name: 'Apex Tools',
          slug: 'apex-tools',
          verificationStatus: 'VERIFIED',
          trustScore: 4.8,
          addresses: [{ city: 'Ahmedabad', state: 'Gujarat' }],
        },
        images: [{ id: 'img-1', url: 'http://img.jpg', isPrimary: true }],
        priceTiers: [],
      });
      prisma.product.findMany.mockResolvedValue([]);

      const result = await service.findBySlug('industrial-lathe');
      expect(result.name).toBe('Industrial Lathe');
      expect(result.business.name).toBe('Apex Tools');
      expect(result.business.city).toBe('Ahmedabad');
    });
  });
});

