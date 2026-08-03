import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus } from '@prisma/client';
import type { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingService } from './messaging.service';
import type { MessagingActor, MessageResult } from './messaging.service';
import { MESSAGE_MAX_LENGTH } from './dto/create-message.dto';

interface SocketUser extends MessagingActor {
  isArtist: boolean;
  isSuperAdmin: boolean;
}

interface SocketData {
  user?: SocketUser;
  authPromise?: Promise<SocketUser | null>;
}

const SEND_LIMIT = 20;
const SEND_WINDOW_MS = 60_000;

@WebSocketGateway({ namespace: '/messaging' })
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server | undefined;

  private readonly sendWindows = new Map<string, number[]>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
  ) {}

  async handleConnection(socket: Socket) {
    const authPromise = this.authenticate(socket);
    const data = socket.data as SocketData;
    data.authPromise = authPromise;

    const user = await authPromise;

    if (!user) {
      socket.disconnect(true);

      return;
    }

    data.user = user;

    await socket.join(`user:${user.id}`);

    if (user.isArtist) {
      await socket.join(`artist-inbox:${user.id}`);
    }

    if (user.isSuperAdmin) {
      const artist = await this.messagingService.resolveActiveArtist();

      if (artist) {
        await socket.join(`artist-inbox:${artist.id}`);
      }
    }

    socket.emit('ready');
  }

  handleDisconnect(socket: Socket) {
    const userId = (socket.data as SocketData).user?.id;

    if (userId) {
      this.sendWindows.delete(userId);
    }
  }

  private async getUser(socket: Socket): Promise<SocketUser | undefined> {
    const data = socket.data as SocketData;

    if (data.user) {
      return data.user;
    }

    if (!data.authPromise) {
      return undefined;
    }

    const user = await data.authPromise;

    return user ?? undefined;
  }

  @SubscribeMessage('conversation:join')
  async joinConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { conversationId: string },
  ) {
    const user = await this.getUser(socket);

    if (!user) {
      return { ok: false, error: 'Unauthorized' };
    }

    try {
      await this.messagingService.getAuthorizedConversation(
        user,
        body.conversationId,
      );
      await socket.join(`conversation:${body.conversationId}`);

      return { ok: true, conversationId: body.conversationId };
    } catch {
      return { ok: false, error: 'Forbidden' };
    }
  }

  @SubscribeMessage('conversation:leave')
  async leaveConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { conversationId: string },
  ) {
    await socket.leave(`conversation:${body.conversationId}`);

    return { ok: true };
  }

  @SubscribeMessage('message:send')
  async sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    body: {
      conversationId: string;
      content: string;
      clientMessageId: string;
    },
  ) {
    const user = await this.getUser(socket);

    if (!user) {
      return this.ackFailure(body, 'unauthorized', 'Não autorizado.');
    }

    if (!this.allowSend(user.id)) {
      return this.ackFailure(
        body,
        'rate_limited',
        'Muitas mensagens. Aguarde um instante.',
      );
    }

    const content =
      typeof body?.content === 'string' ? body.content.trim() : '';

    if (content.length === 0) {
      return this.ackFailure(body, 'invalid_message', 'Mensagem vazia.');
    }

    if (content.length > MESSAGE_MAX_LENGTH) {
      return this.ackFailure(
        body,
        'invalid_message',
        'Mensagem muito longa.',
      );
    }

    try {
      const result = await this.messagingService.sendMessage(
        user,
        body.conversationId,
        content,
      );

      const recipientUnread = await this.messagingService.unreadCountForUser(
        result.recipientId,
      );

      this.emitMessage(result, recipientUnread);

      return {
        ok: true,
        clientMessageId: body.clientMessageId,
        message: result.message,
      };
    } catch {
      return this.ackFailure(
        body,
        'send_failed',
        'Não foi possível enviar a mensagem.',
      );
    }
  }
  @SubscribeMessage('conversation:read')
  async markRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { conversationId: string },
  ) {
    const user = await this.getUser(socket);

    if (!user) {
      return { ok: false, error: 'Unauthorized' };
    }

    try {
      await this.messagingService.markRead(user, body.conversationId);

      this.server
        ?.to(`conversation:${body.conversationId}`)
        .emit('conversation:read-updated', {
          conversationId: body.conversationId,
          userId: user.id,
        });

      const count = await this.messagingService.unreadCountForUser(user.id);
      this.server?.to(`user:${user.id}`).emit('unread:updated', { count });

      return { ok: true };
    } catch {
      return { ok: false, error: 'Forbidden' };
    }
  }

  /**
   * Emits a persisted message to the conversation room and updated unread
   * count to the recipient, plus a summary-update signal to the artist inbox.
   * Called by both the REST controller and the socket gateway after commit.
   */
  emitMessage(result: MessageResult, recipientUnread: number) {
    this.server
      ?.to(`conversation:${result.conversation.id}`)
      .emit('message:new', {
        conversationId: result.conversation.id,
        message: result.message,
      });

    this.server
      ?.to(`user:${result.recipientId}`)
      .emit('unread:updated', { count: recipientUnread });

    this.server
      ?.to(`artist-inbox:${result.conversation.artistId}`)
      .emit('conversation:updated', {
        conversationId: result.conversation.id,
      });
  }

  emitReadUpdated(conversationId: string, actor: MessagingActor) {
    this.server
      ?.to(`conversation:${conversationId}`)
      .emit('conversation:read-updated', {
        conversationId,
        userId: actor.id,
      });

    void this.messagingService
      .unreadCountForUser(actor.id)
      .then((count) => {
        this.server?.to(`user:${actor.id}`).emit('unread:updated', { count });
      })
      .catch(() => undefined);
  }

  private async authenticate(socket: Socket): Promise<SocketUser | null> {
    const auth = socket.handshake.auth as { token?: unknown } | undefined;
    const token = auth?.token;

    if (typeof token !== 'string' || token.length === 0) {
      return null;
    }

    let payload: { sub?: string; sessionVersion?: number } | undefined;

    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        sessionVersion?: number;
      }>(token);
    } catch {
      return null;
    }

    if (!payload?.sub) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: true },
    });

    if (
      !user ||
      user.status === AccountStatus.DISABLED ||
      payload.sessionVersion !== user.sessionVersion
    ) {
      return null;
    }

    return {
      id: user.id,
      roles: user.roles.map((item) => item.role),
      isArtist: user.roles.some((item) => item.role === 'ARTIST'),
      isSuperAdmin: user.roles.some((item) => item.role === 'SUPER_ADMIN'),
    };
  }

  private allowSend(userId: string): boolean {
    const now = Date.now();
    const windowStart = now - SEND_WINDOW_MS;
    const timestamps = (this.sendWindows.get(userId) ?? []).filter(
      (timestamp) => timestamp > windowStart,
    );

    if (timestamps.length >= SEND_LIMIT) {
      this.sendWindows.set(userId, timestamps);

      return false;
    }

    timestamps.push(now);
    this.sendWindows.set(userId, timestamps);

    return true;
  }

  private ackFailure(
    body: { clientMessageId: string },
    code: string,
    message: string,
  ) {
    return {
      ok: false,
      clientMessageId: body?.clientMessageId,
      error: { code, message },
    };
  }
}
