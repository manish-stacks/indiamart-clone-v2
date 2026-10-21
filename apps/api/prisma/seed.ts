import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING DEMO MARKETPLACE DATA ---');

  // 1. Roles
  const roles = [
    { name: 'BUYER', description: 'Standard buyer account' },
    { name: 'SELLER', description: 'Verified or registered business supplier' },
    { name: 'SUPPORT', description: 'Customer support staff' },
    { name: 'MODERATOR', description: 'Content and listing moderator' },
    { name: 'FINANCE', description: 'Finance and payout operator' },
    { name: 'ADMIN', description: 'Marketplace administrator' },
    { name: 'SUPER_ADMIN', description: 'Full system super administrator' },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
    roleMap[r.name] = createdRole.id;
  }
  console.log('Roles seeded successfully.');

  // 2. Demo Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminDemo123!', salt);
  const sellerPasswordHash = await bcrypt.hash('SellerDemo123!', salt);
  const buyerPasswordHash = await bcrypt.hash('BuyerDemo123!', salt);

  // Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demomarketplace.in' },
    update: {},
    create: {
      email: 'admin@demomarketplace.in',
      fullName: 'Super Administrator (Demo)',
      passwordHash: adminPasswordHash,
      emailVerified: true,
      roles: {
        create: [
          { roleId: roleMap['ADMIN'] },
          { roleId: roleMap['SUPER_ADMIN'] },
        ],
      },
    },
  });

  // Seller 1 User (Apex Machinery)
  const seller1 = await prisma.user.upsert({
    where: { email: 'apex.machinery@demomarketplace.in' },
    update: {},
    create: {
      email: 'apex.machinery@demomarketplace.in',
      phone: '+919825000001',
      fullName: 'Praveen Patel (Demo Supplier)',
      passwordHash: sellerPasswordHash,
      emailVerified: true,
      phoneVerified: true,
      roles: {
        create: [{ roleId: roleMap['SELLER'] }, { roleId: roleMap['BUYER'] }],
      },
    },
  });

  // Seller 2 User (Surat Textiles)
  const seller2 = await prisma.user.upsert({
    where: { email: 'surat.textiles@demomarketplace.in' },
    update: {},
    create: {
      email: 'surat.textiles@demomarketplace.in',
      phone: '+919825000002',
      fullName: 'Vikram Shah (Demo Supplier)',
      passwordHash: sellerPasswordHash,
      emailVerified: true,
      phoneVerified: true,
      roles: {
        create: [{ roleId: roleMap['SELLER'] }],
      },
    },
  });

  // Buyer User
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer.delhi@demomarketplace.in' },
    update: {},
    create: {
      email: 'buyer.delhi@demomarketplace.in',
      phone: '+919811000003',
      fullName: 'Rohit Sharma (Demo Procurement Buyer)',
      passwordHash: buyerPasswordHash,
      emailVerified: true,
      phoneVerified: true,
      roles: {
        create: [{ roleId: roleMap['BUYER'] }],
      },
    },
  });

  console.log('Demo Users seeded successfully.');

  // 3. Demo Businesses
  const bizApex = await prisma.business.upsert({
    where: { slug: 'apex-machinery-automation' },
    update: {},
    create: {
      name: 'Apex Machinery & Automation Ltd (Demo)',
      slug: 'apex-machinery-automation',
      legalName: 'Apex Machinery & Automation Private Limited',
      gstin: '24AAACA1234A1Z5',
      businessType: 'MANUFACTURER',
      verificationStatus: 'VERIFIED',
      gstinVerified: true,
      trustScore: 4.8,
      responseTimeHours: 2,
      yearEstablished: 2010,
      description: 'ISO 9001:2015 certified manufacturer of high precision CNC lathes, industrial milling machines, and automated packaging equipment.',
      members: {
        create: {
          userId: seller1.id,
          role: 'OWNER',
        },
      },
      addresses: {
        create: {
          street: 'Plot No. 42, GIDC Industrial Estate, Vatva',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '382445',
          country: 'India',
          isPrimary: true,
        },
      },
    },
  });

  const bizTex = await prisma.business.upsert({
    where: { slug: 'surat-tex-fabric-mills' },
    update: {},
    create: {
      name: 'Surat Tex Fabric Mills (Demo)',
      slug: 'surat-tex-fabric-mills',
      legalName: 'Surat Tex Fabric Mills LLP',
      gstin: '24AAACS5678B1Z2',
      businessType: 'MANUFACTURER',
      verificationStatus: 'VERIFIED',
      gstinVerified: true,
      trustScore: 4.7,
      responseTimeHours: 3,
      yearEstablished: 2014,
      description: 'Direct manufacturer and wholesale bulk supplier of pure organic combed cotton fabrics, polyester yarn, and export-grade textiles.',
      members: {
        create: {
          userId: seller2.id,
          role: 'OWNER',
        },
      },
      addresses: {
        create: {
          street: 'Ring Road Textile Market, Salabatpura',
          city: 'Surat',
          state: 'Gujarat',
          postalCode: '395002',
          country: 'India',
          isPrimary: true,
        },
      },
    },
  });

  console.log('Demo Businesses seeded successfully.');

  // 4. Nested Categories
  const catMachinery = await prisma.category.upsert({
    where: { slug: 'industrial-machinery' },
    update: {},
    create: {
      name: 'Industrial Machinery & Plants',
      slug: 'industrial-machinery',
      description: 'CNC machines, lathes, pumps, packaging and food processing plants.',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      icon: 'Cpu',
      displayOrder: 1,
    },
  });

  const catCnc = await prisma.category.upsert({
    where: { slug: 'cnc-lathe-machines' },
    update: {},
    create: {
      name: 'CNC & Lathe Machines',
      slug: 'cnc-lathe-machines',
      description: 'Computer Numerical Control lathes, turning centers, and milling equipment.',
      parentId: catMachinery.id,
      displayOrder: 1,
    },
  });

  const catPackaging = await prisma.category.upsert({
    where: { slug: 'packaging-machinery' },
    update: {},
    create: {
      name: 'Packaging & Strapping Machines',
      slug: 'packaging-machinery',
      description: 'Automatic and semi-automatic cartooning and strapping equipment.',
      parentId: catMachinery.id,
      displayOrder: 2,
    },
  });

  const catTextiles = await prisma.category.upsert({
    where: { slug: 'textiles-fabrics' },
    update: {},
    create: {
      name: 'Textiles, Fabrics & Yarns',
      slug: 'textiles-fabrics',
      description: 'Cotton fabrics, industrial yarns, garment raw materials, and apparel.',
      imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
      icon: 'Shirt',
      displayOrder: 2,
    },
  });

  const catCotton = await prisma.category.upsert({
    where: { slug: 'cotton-fabrics' },
    update: {},
    create: {
      name: 'Cotton Fabrics & Twill',
      slug: 'cotton-fabrics',
      description: 'Pure organic cotton, twill, canvas, and woven fabrics.',
      parentId: catTextiles.id,
      displayOrder: 1,
    },
  });

  const catYarn = await prisma.category.upsert({
    where: { slug: 'industrial-yarns' },
    update: {},
    create: {
      name: 'Industrial Yarns & Threads',
      slug: 'industrial-yarns',
      description: 'Polyester filament yarns, cotton threads, and high-tenacity yarn.',
      parentId: catTextiles.id,
      displayOrder: 2,
    },
  });

  const catElectrical = await prisma.category.upsert({
    where: { slug: 'electrical-electronics' },
    update: {},
    create: {
      name: 'Electrical, Power & Electronics',
      slug: 'electrical-electronics',
      description: 'Transformers, switchgears, industrial lighting, and automation control panels.',
      imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&auto=format&fit=crop&q=80',
      icon: 'Zap',
      displayOrder: 3,
    },
  });

  console.log('Demo Categories seeded successfully.');

  // 5. Demo Products
  // Product 1: CNC Lathe
  await prisma.product.upsert({
    where: { slug: 'heavy-duty-cnc-lathe-machine-3000-rpm' },
    update: {},
    create: {
      businessId: bizApex.id,
      categoryId: catCnc.id,
      name: 'Heavy Duty CNC Lathe Machine 3000 RPM (Demo)',
      slug: 'heavy-duty-cnc-lathe-machine-3000-rpm',
      description: 'Industrial heavy duty CNC horizontal lathe machine designed for high speed precision metal turning. Equipped with Siemens 808D controller and 8-station hydraulic turret.',
      minOrderQuantity: 1,
      unitOfMeasure: 'PIECE',
      unitPrice: 350000.0,
      isB2B: true,
      isB2C: false,
      sku: 'APEX-CNC-3000',
      status: 'PUBLISHED',
      specifications: {
        'Spindle Speed': '3000 RPM',
        'Max Turning Diameter': '400 mm',
        'Bed Type': 'Slant Bed 45 Degree',
        'Control System': 'Siemens 808D Advance',
        'Warranty': '2 Years Comprehensive',
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
            altText: 'Heavy Duty CNC Lathe Machine',
            isPrimary: true,
            displayOrder: 0,
          },
        ],
      },
      priceTiers: {
        create: [
          { minQuantity: 1, maxQuantity: 2, price: 350000.0 },
          { minQuantity: 3, maxQuantity: 5, price: 330000.0 },
          { minQuantity: 6, maxQuantity: null, price: 310000.0 },
        ],
      },
    },
  });

  // Product 2: Packaging Machine
  await prisma.product.upsert({
    where: { slug: 'semi-automatic-carton-strapping-machine' },
    update: {},
    create: {
      businessId: bizApex.id,
      categoryId: catPackaging.id,
      name: 'Semi-Automatic Carton Box Strapping Machine (Demo)',
      slug: 'semi-automatic-carton-strapping-machine',
      description: 'High speed table top strapping machine for corrugated packaging boxes. Cycle time 1.5 seconds per strap. Compatible with standard PP strapping rolls.',
      minOrderQuantity: 1,
      unitOfMeasure: 'PIECE',
      unitPrice: 38000.0,
      isB2B: true,
      isB2C: true,
      sku: 'APEX-STRAP-740',
      status: 'PUBLISHED',
      specifications: {
        'Tension Range': '15 to 45 kg',
        'Strap Width': '6 mm - 15 mm',
        'Power Supply': 'Single Phase 220V 50Hz',
        'Table Height': '750 mm',
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
            altText: 'Semi-Automatic Box Strapping Machine',
            isPrimary: true,
            displayOrder: 0,
          },
        ],
      },
      priceTiers: {
        create: [
          { minQuantity: 1, maxQuantity: 4, price: 38000.0 },
          { minQuantity: 5, maxQuantity: null, price: 34500.0 },
        ],
      },
    },
  });

  // Product 3: Cotton Fabric
  await prisma.product.upsert({
    where: { slug: 'pure-organic-combed-cotton-fabric-60s' },
    update: {},
    create: {
      businessId: bizTex.id,
      categoryId: catCotton.id,
      name: 'Pure Organic Combed Cotton Fabric 60s Count (Demo)',
      slug: 'pure-organic-combed-cotton-fabric-60s',
      description: 'GOTS certified organic cotton woven fabric. High GSM, breathable, pre-shrunk, ideal for shirts, uniforms, and garment manufacturing.',
      minOrderQuantity: 100,
      unitOfMeasure: 'METER',
      unitPrice: 165.0,
      isB2B: true,
      isB2C: true,
      sku: 'TEX-COT-60S',
      status: 'PUBLISHED',
      specifications: {
        'Yarn Count': '60s x 60s',
        'Weave': 'Plain Weave',
        'GSM': '115 GSM',
        'Width': '58 Inches',
        'Color Fastness': 'Grade 4+',
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
            altText: 'Pure Organic Cotton Fabric',
            isPrimary: true,
            displayOrder: 0,
          },
        ],
      },
      priceTiers: {
        create: [
          { minQuantity: 100, maxQuantity: 499, price: 165.0 },
          { minQuantity: 500, maxQuantity: 1999, price: 152.0 },
          { minQuantity: 2000, maxQuantity: null, price: 140.0 },
        ],
      },
    },
  });

  // Product 4: Polyester Spun Yarn
  await prisma.product.upsert({
    where: { slug: 'polyester-spun-filament-yarn-150d' },
    update: {},
    create: {
      businessId: bizTex.id,
      categoryId: catYarn.id,
      name: 'Polyester Spun Filament Yarn 150D/48F Semi-Dull (Demo)',
      slug: 'polyester-spun-filament-yarn-150d',
      description: 'High tenacity continuous filament polyester yarn. Uniform intermingle points, suitable for circular knitting and waterjet looms.',
      minOrderQuantity: 200,
      unitOfMeasure: 'KG',
      unitPrice: 135.0,
      isB2B: true,
      isB2C: false,
      sku: 'TEX-YARN-150D',
      status: 'PUBLISHED',
      specifications: {
        'Denier': '150 Denier / 48 Filaments',
        'Lustre': 'Semi-Dull (SD)',
        'Tenacity': '4.2 gpd',
        'Elongation': '26%',
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1598555230054-d8bc42f53448?w=800&auto=format&fit=crop&q=80',
            altText: 'Polyester Spun Yarn',
            isPrimary: true,
            displayOrder: 0,
          },
        ],
      },
      priceTiers: {
        create: [
          { minQuantity: 200, maxQuantity: 999, price: 135.0 },
          { minQuantity: 1000, maxQuantity: null, price: 124.0 },
        ],
      },
    },
  });

  console.log('Demo Products seeded successfully.');
  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

