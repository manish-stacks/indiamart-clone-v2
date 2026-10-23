import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    // Find businesses the user belongs to
    const memberships = await this.prisma.businessMember.findMany({
      where: { userId },
      select: { businessId: true },
    });
    const businessIds = memberships.map((m) => m.businessId);

    return this.prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { businessId: { in: businessIds } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        business: {
          select: { id: true, name: true, slug: true, logoUrl: true, verificationStatus: true },
        },
        buyer: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        product: {
          select: { id: true, name: true, slug: true, unitPrice: true, unitOfMeasure: true, images: { take: 1 } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: { isRead: false, senderId: { not: userId } },
            },
          },
        },
      },
    });
  }

  async getOrCreateConversation(
    buyerId: string,
    businessId: string,
    productId?: string,
    inquiryId?: string,
  ) {
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        buyerId,
        businessId,
        ...(productId ? { productId } : {}),
      },
      include: {
        business: true,
        buyer: true,
        product: { include: { images: { take: 1 } } },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          buyerId,
          businessId,
          productId,
          inquiryId,
        },
        include: {
          business: true,
          buyer: true,
          product: { include: { images: { take: 1 } } },
        },
      });
    }

    return conversation;
  }

  async getMessages(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        business: { include: { members: true } },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isBuyer = conversation.buyerId === userId;
    const isSeller = conversation.business.members.some((m) => m.userId === userId);

    if (!isBuyer && !isSeller) {
      throw new ForbiddenException('You are not authorized to view this conversation');
    }

    // Mark messages as read
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        business: { include: { members: true } },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isBuyer = conversation.buyerId === senderId;
    const isSeller = conversation.business.members.some((m) => m.userId === senderId);

    if (!isBuyer && !isSeller) {
      throw new ForbiddenException('You are not authorized to send messages in this conversation');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    // Update conversation timestamp
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }
}

