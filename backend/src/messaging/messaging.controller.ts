import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { MessagingService } from './messaging.service';
import type { MessagingActor } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { CreateMessageDto } from './dto/create-message.dto';
import { InboxQueryDto } from './dto/inbox-query.dto';
import { HistoryQueryDto } from './dto/history-query.dto';

function toActor(user: AuthenticatedUser): MessagingActor {
  return { id: user.id, roles: user.roles };
}

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly gateway: MessagingGateway,
  ) {}

  @Get('conversation')
  memberConversation(@CurrentUser() user: AuthenticatedUser) {
    return this.messagingService.getOrCreateMemberConversation(toActor(user));
  }

  @Get('conversations')
  listConversations(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: InboxQueryDto,
  ) {
    return this.messagingService.listConversations(toActor(user), query);
  }

  @Get('conversations/:conversationId')
  conversationDetail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagingService.getConversationForActor(
      toActor(user),
      conversationId,
    );
  }

  @Get('conversations/:conversationId/messages')
  history(
    @CurrentUser() user: AuthenticatedUser,
    @Param('conversationId') conversationId: string,
    @Query() query: HistoryQueryDto,
  ) {
    return this.messagingService.getHistory(toActor(user), conversationId, {
      before: query.before,
      limit: query.limit,
    });
  }

  @Post('conversations/:conversationId/messages')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async send(
    @CurrentUser() user: AuthenticatedUser,
    @Param('conversationId') conversationId: string,
    @Body() dto: CreateMessageDto,
  ) {
    const actor = toActor(user);
    const result = await this.messagingService.sendMessage(
      actor,
      conversationId,
      dto.content,
    );

    const recipientUnread = await this.messagingService.unreadCountForUser(
      result.recipientId,
    );

    this.gateway.emitMessage(result, recipientUnread);

    return result.message;
  }

  @Post('conversations/:conversationId/read')
  async markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('conversationId') conversationId: string,
  ) {
    const actor = toActor(user);
    const counts = await this.messagingService.markRead(actor, conversationId);

    this.gateway.emitReadUpdated(conversationId, actor);

    return counts;
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.messagingService.unreadCount(toActor(user));
  }
}
