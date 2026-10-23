import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        businessMembers: { select: { businessId: true } },
      },
    });

    if (!user) {
      return { unreadCount: 0, notifications: [] };
    }

    const roles = user.roles.map((r) => r.role?.name || '');
    const isAdmin = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
    const userBusinessIds = user.businessMembers.map((bm) => bm.businessId);

    const notifications: any[] = [];

    // 1. Seller Leads
    if (userBusinessIds.length > 0) {
      const leads = await this.prisma.lead.findMany({
        where: { businessId: { in: userBusinessIds } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          inquiry: {
            include: {
              product: { select: { name: true } },
              buyer: { select: { fullName: true, email: true } },
            },
          },
        },
      });

      for (const l of leads) {
        notifications.push({
          id: `lead-${l.id}`,
          type: 'LEAD',
          title: `New Buyer Lead (${l.priority})`,
          description: `${l.inquiry?.buyer?.fullName || 'Buyer'} inquired for ${l.inquiry?.quantity || 1} units of "${l.inquiry?.product?.name || 'Product'}".`,
          link: '/dashboard/leads',
          createdAt: l.createdAt,
          unread: l.stage === 'NEW',
        });
      }
    }

    // 2. Buyer Quotations Received
    const quotes = await this.prisma.quotation.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        business: { select: { name: true } },
      },
    });

    for (const q of quotes) {
      notifications.push({
        id: `quote-${q.id}`,
        type: 'QUOTATION',
        title: `Proforma Quotation Received`,
        description: `${q.business?.name} sent commercial quote ${q.quoteNumber} (₹${Number(q.totalAmount).toLocaleString('en-IN')}).`,
        link: '/dashboard/quotations',
        createdAt: q.createdAt,
        unread: q.status === 'SENT',
      });
    }

    // 3. Admin Notifications
    if (isAdmin) {
      const pendingBiz = await this.prisma.business.findMany({
        where: { verificationStatus: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { addresses: { where: { isPrimary: true } } },
      });

      for (const pb of pendingBiz) {
        notifications.push({
          id: `biz-${pb.id}`,
          type: 'ADMIN_GST',
          title: 'Supplier GSTIN Verification Pending',
          description: `${pb.name} (${pb.addresses?.[0]?.city || 'India'}) uploaded GSTIN: ${pb.gstin || 'Pending'} for review.`,
          link: '/admin?tab=sellers',
          createdAt: pb.createdAt,
          unread: true,
        });
      }
    }

    // Sort by createdAt desc
    notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const unreadCount = notifications.filter((n) => n.unread).length;

    return {
      unreadCount,
      notifications: notifications.slice(0, 10),
    };
  }
}
