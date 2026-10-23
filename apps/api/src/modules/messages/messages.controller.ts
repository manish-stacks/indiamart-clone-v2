import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Messages & Chat')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get active buyer-seller conversations for current user' })
  async getConversations(@CurrentUser('id') userId: string) {
    return this.messagesService.getConversations(userId);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create or get existing conversation for product inquiry' })
  async createOrGetConversation(
    @CurrentUser('id') buyerId: string,
    @Body() body: { businessId: string; productId?: string; inquiryId?: string },
  ) {
    return this.messagesService.getOrCreateConversation(
      buyerId,
      body.businessId,
      body.productId,
      body.inquiryId,
    );
  }

  @Get(':conversationId')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  async getMessages(
    @Param('conversationId') conversationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagesService.getMessages(conversationId, userId);
  }

  @Post(':conversationId')
  @ApiOperation({ summary: 'Send message to conversation' })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @CurrentUser('id') senderId: string,
    @Body('content') content: string,
  ) {
    return this.messagesService.sendMessage(conversationId, senderId, content);
  }
}

