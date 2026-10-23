import { Test, TestingModule } from '@nestjs/testing';
import { InquiriesService } from './inquiries.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UnitOfMeasure } from '@marketplace/shared';

describe('InquiriesService', () => {
  let service: InquiriesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      inquiry: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      lead: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => {
        return cb(prisma);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InquiriesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InquiriesService>(InquiriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException if product does not exist', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        productId: 'nonexistent',
        quantity: 10,
        message: 'Need quotes',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for guest inquiry without name and contact', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'prod-1',
      businessId: 'biz-1',
      unitPrice: 100,
      business: { name: 'Supplier' },
    });

    await expect(
      service.create({
        productId: 'prod-1',
        quantity: 5,
        message: 'Quote please',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should create inquiry and CRM lead for authenticated buyer', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'prod-1',
      name: 'Lathe Machine',
      businessId: 'biz-1',
      unitPrice: 50000,
      unitOfMeasure: UnitOfMeasure.PIECE,
      business: { name: 'Apex Machinery' },
    });

    prisma.inquiry.create.mockResolvedValue({
      id: 'inq-123',
      buyerId: 'user-buyer-1',
      businessId: 'biz-1',
    });

    prisma.lead.create.mockResolvedValue({
      id: 'lead-123',
      businessId: 'biz-1',
      inquiryId: 'inq-123',
    });

    const currentUser = {
      id: 'user-buyer-1',
      fullName: 'Rohit Sharma',
      email: 'rohit@buyer.com',
      phone: '+919876543210',
      roles: ['BUYER'],
    };

    const res = await service.create(
      {
        productId: 'prod-1',
        quantity: 2,
        message: 'Please send quote with GST to Delhi',
      },
      currentUser,
    );

    expect(res.inquiryId).toBe('inq-123');
    expect(res.leadId).toBe('lead-123');
    expect(res.supplierName).toBe('Apex Machinery');
    expect(res.buyerName).toBe('Rohit Sharma');
  });
});

