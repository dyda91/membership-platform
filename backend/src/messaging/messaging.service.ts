import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TierAccessService } from '../tier-access/tier-access.service';
import type { EffectiveAccess } from '../tier-access/tier-access.service';
import { MESSAGE_MAX_LENGTH } from './dto/create-message.dto';
import { InboxQueryDto, InboxSort } from './dto/inbox-query.dto';

export interface MessagingActor {
  id: string;
  roles: Role[];
}

export interface MessageResult {
  message: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
  };
  conversation: {
    id: string;
    memberId: string;
    artistId: string;
  };
  recipientId: string;
  senderIsMember: boolean;
}

const GRANTING_STATUSES = ['ACTIVE', 'EXPIRING_SOON', 'PERMANENT'];

function isHidden(roles: Role[]): boolean {
  return roles.includes(Role.SUPER_ADMIN);
}

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tierAccessService: TierAccessService,
  ) {}

  async resolveActiveArtist() {
    return this.prisma.user.findFirst({
      where: { roles: { some: { role: Role.ARTIST } } },
      include: { roles: true },
    });
  }

  /**
   * Creates or returns the member's conversation with the active artist.
   * Never accepts an artist id from client input. Handles unique conflicts.
   */
  async getOrCreateMemberConversation(actor: MessagingActor) {
    if (isHidden(actor.roles)) {
      throw new ForbiddenException('Not allowed');
    }

    const artist = await this.resolveActiveArtist();

    if (!artist) {
      throw new ServiceUnavailableException(
        'A artista ainda não está disponível para mensagens.',
      );
    }

    const existing = await this.prisma.conversation.findUnique({
      where: {
        memberId_artistId: { memberId: actor.id, artistId: artist.id },
      },
      include: {
        artist: { include: { roles: true } },
        member: { include: { roles: true } },
      },
    });

    if (existing) {
      return this.toMemberConversation(existing);
    }

    try {
      const created = await this.prisma.conversation.create({
        data: {
          memberId: actor.id,
          artistId: artist.id,
          memberLastReadAt: new Date(),
          artistLastReadAt: new Date(),
        },
        include: {
          artist: { include: { roles: true } },
          member: { include: { roles: true } },
        },
      });

      return this.toMemberConversation(created);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const recreated = await this.prisma.conversation.findUnique({
          where: {
            memberId_artistId: { memberId: actor.id, artistId: artist.id },
          },
          include: {
            artist: { include: { roles: true } },
            member: { include: { roles: true } },
          },
        });

        if (recreated) {
          return this.toMemberConversation(recreated);
        }
      }

      throw error;
    }
  }

  /**
   * Loads a conversation and verifies the actor may access it.
   * SUPER_ADMIN support access is read-only and never a normal participant.
   */
  async getAuthorizedConversation(
    actor: MessagingActor,
    conversationId: string,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        member: { include: { roles: true } },
        artist: { include: { roles: true } },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (isHidden(actor.roles)) {
      return conversation;
    }

    if (actor.roles.includes(Role.ARTIST)) {
      if (conversation.artistId !== actor.id) {
        throw new ForbiddenException('Not allowed');
      }

      return conversation;
    }

    if (conversation.memberId === actor.id) {
      return conversation;
    }

    throw new ForbiddenException('Not allowed');
  }

  async getConversationForActor(actor: MessagingActor, conversationId: string) {
    const conversation = await this.getAuthorizedConversation(
      actor,
      conversationId,
    );

    const artist = await this.prisma.user.findUnique({
      where: { id: conversation.artistId },
      include: { roles: true },
    });

    const member = await this.prisma.user.findUnique({
      where: { id: conversation.memberId },
      include: { roles: true },
    });

    return this.toConversationDetail({
      ...conversation,
      member: member ?? conversation.member,
      artist: artist ?? conversation.artist,
    });
  }

  /**
   * Persists a message and updates lastMessageAt transactionally. Returns the
   * persisted message so the caller can emit only after commit.
   */
  async sendMessage(
    actor: MessagingActor,
    conversationId: string,
    content: string,
  ): Promise<MessageResult> {
    if (isHidden(actor.roles)) {
      throw new ForbiddenException('Not allowed');
    }

    const trimmed = content.trim();

    if (trimmed.length === 0) {
      throw new ForbiddenException('Mensagem vazia');
    }

    if (trimmed.length > MESSAGE_MAX_LENGTH) {
      throw new ForbiddenException('Mensagem muito longa');
    }

    const conversation = await this.getAuthorizedConversation(
      actor,
      conversationId,
    );

    const senderIsMember = conversation.memberId === actor.id;
    const senderIsArtist = conversation.artistId === actor.id;

    if (!senderIsMember && !senderIsArtist) {
      throw new ForbiddenException('Not allowed');
    }

    const now = new Date();

    const created = await this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId: actor.id,
          content: trimmed,
          createdAt: now,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: now },
      });

      return message;
    });

    return {
      message: {
        id: created.id,
        conversationId: created.conversationId,
        senderId: created.senderId,
        content: created.content,
        createdAt: created.createdAt.toISOString(),
      },
      conversation: {
        id: conversation.id,
        memberId: conversation.memberId,
        artistId: conversation.artistId,
      },
      recipientId: senderIsMember
        ? conversation.artistId
        : conversation.memberId,
      senderIsMember,
    };
  }

  /**
   * Cursor-based history. Returns the newest `limit` messages (chronological
   * for display) when no cursor is given, or messages strictly older than the
   * cursor. Prevents overlap by using createdAt + id as a deterministic key.
   */
  async getHistory(
    actor: MessagingActor,
    conversationId: string,
    query: { before?: string; limit?: number },
  ) {
    const conversation = await this.getAuthorizedConversation(
      actor,
      conversationId,
    );

    const safeLimit = Math.min(50, Math.max(1, query.limit ?? 30));

    const where: Prisma.MessageWhereInput = { conversationId: conversation.id };

    if (query.before) {
      const [datePart, idPart] = query.before.split('|');

      if (datePart && idPart) {
        where.OR = [
          { createdAt: { lt: new Date(datePart) } },
          { createdAt: new Date(datePart), id: { lt: idPart } },
        ];
      }
    }

    const rows = await this.prisma.message.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: safeLimit + 1,
    });

    const hasMore = rows.length > safeLimit;
    const page = rows.slice(0, safeLimit);
    const chronological = [...page].reverse();
    const oldest = chronological[0];

    const nextCursor =
      hasMore && oldest
        ? `${oldest.createdAt.toISOString()}|${oldest.id}`
        : null;

    return {
      messages: chronological.map((message) => ({
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      })),
      nextCursor,
      hasMore,
    };
  }

  /**
   * Artist inbox with server-side search, filters, sorting and pagination.
   * Effective tier is computed live through the tier-access service.
   */
  async listConversations(actor: MessagingActor, query: InboxQueryDto) {
    if (
      !actor.roles.includes(Role.ARTIST) &&
      !actor.roles.includes(Role.SUPER_ADMIN)
    ) {
      throw new ForbiddenException('Not allowed');
    }

    const artist = actor.roles.includes(Role.ARTIST)
      ? await this.prisma.user.findUnique({ where: { id: actor.id } })
      : await this.resolveActiveArtist();

    if (!artist) {
      return { data: [], page: 1, limit: 20, total: 0, totalPages: 0 };
    }

    const conversations = await this.prisma.conversation.findMany({
      where: { artistId: artist.id },
      include: {
        member: { include: { roles: true } },
        messages: {
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: 1,
        },
      },
    });

    const summaries = await Promise.all(
      conversations
        .filter(
          (conversation) =>
            conversation.member &&
            !isHidden(conversation.member.roles.map((item) => item.role)),
        )
        .map(async (conversation) => {
          const member = conversation.member;
          const effective = await this.tierAccessService.getEffectiveAccess(
            member.id,
          );
          const artistUnread = await this.unreadForSender(
            conversation.id,
            member.id,
            conversation.artistLastReadAt,
          );
          const lastMessage = conversation.messages[0];

          return this.toConversationSummary(conversation, member, effective, {
            artistUnread,
            lastMessage,
          });
        }),
    );

    const filtered = summaries.filter((summary) => {
      if (query.search) {
        const needle = query.search.toLowerCase();
        const name = (summary.member.name ?? '').toLowerCase();
        const email = summary.member.email.toLowerCase();

        if (!name.includes(needle) && !email.includes(needle)) {
          return false;
        }
      }

      if (query.unread && summary.artistUnreadCount <= 0) {
        return false;
      }

      if (query.tierId && summary.effectiveTier?.id !== query.tierId) {
        return false;
      }

      if (query.accessStatus && summary.accessStatus !== query.accessStatus) {
        return false;
      }

      return true;
    });

    const sorted = this.sortSummaries(
      filtered,
      query.sort ?? InboxSort.PRIORITY,
    );

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 20));
    const total = sorted.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const start = (page - 1) * limit;

    return {
      data: sorted.slice(start, start + limit),
      page,
      limit,
      total,
      totalPages,
    };
  }

  private sortSummaries(
    summaries: ReturnType<MessagingService['toConversationSummary']>[],
    sort: InboxSort,
  ) {
    const priorityOf = (summary: (typeof summaries)[number]) =>
      summary.effectiveTier?.priority ?? 0;

    const sorted = [...summaries];

    switch (sort) {
      case InboxSort.RECENT:
        sorted.sort(
          (a, b) =>
            new Date(b.lastMessageAt ?? 0).getTime() -
            new Date(a.lastMessageAt ?? 0).getTime(),
        );
        break;
      case InboxSort.UNREAD:
        sorted.sort(
          (a, b) =>
            b.artistUnreadCount - a.artistUnreadCount ||
            new Date(b.lastMessageAt ?? 0).getTime() -
              new Date(a.lastMessageAt ?? 0).getTime(),
        );
        break;
      case InboxSort.TIER:
        sorted.sort(
          (a, b) =>
            priorityOf(b) - priorityOf(a) ||
            new Date(b.lastMessageAt ?? 0).getTime() -
              new Date(a.lastMessageAt ?? 0).getTime(),
        );
        break;
      case InboxSort.PRIORITY:
      default:
        sorted.sort(
          (a, b) =>
            (b.artistUnreadCount > 0 ? 1 : 0) -
              (a.artistUnreadCount > 0 ? 1 : 0) ||
            priorityOf(b) - priorityOf(a) ||
            new Date(b.lastMessageAt ?? 0).getTime() -
              new Date(a.lastMessageAt ?? 0).getTime(),
        );
        break;
    }

    return sorted;
  }

  private async unreadForSender(
    conversationId: string,
    senderId: string,
    lastReadAt: Date | null,
  ) {
    return this.prisma.message.count({
      where: {
        conversationId,
        senderId,
        createdAt: { gt: lastReadAt ?? new Date(0) },
      },
    });
  }

  /**
   * Advances the actor's read timestamp monotonically and returns updated
   * unread counts. SUPER_ADMIN support access does not alter participant
   * read state.
   */
  async markRead(actor: MessagingActor, conversationId: string) {
    const conversation = await this.getAuthorizedConversation(
      actor,
      conversationId,
    );

    const counts = {
      memberUnread: await this.unreadForSender(
        conversation.id,
        conversation.artistId,
        conversation.memberLastReadAt,
      ),
      artistUnread: await this.unreadForSender(
        conversation.id,
        conversation.memberId,
        conversation.artistLastReadAt,
      ),
    };

    if (isHidden(actor.roles)) {
      return counts;
    }

    const now = new Date();
    const isMember = conversation.memberId === actor.id;
    const isArtist = conversation.artistId === actor.id;

    if (isMember) {
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          memberLastReadAt:
            conversation.memberLastReadAt && conversation.memberLastReadAt > now
              ? conversation.memberLastReadAt
              : now,
        },
      });
    } else if (isArtist) {
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          artistLastReadAt:
            conversation.artistLastReadAt && conversation.artistLastReadAt > now
              ? conversation.artistLastReadAt
              : now,
        },
      });
    }

    return {
      ...counts,
      ...(isMember ? { memberUnread: 0 } : isArtist ? { artistUnread: 0 } : {}),
    };
  }

  /**
   * Total unread messages for the current user. Members see artist replies;
   * the artist sees total unread member messages; SUPER_ADMIN support returns 0.
   */
  async unreadCount(actor: MessagingActor) {
    if (isHidden(actor.roles)) {
      return { count: 0 };
    }

    const isArtist = actor.roles.includes(Role.ARTIST);

    const conversations = await this.prisma.conversation.findMany({
      where: isArtist ? { artistId: actor.id } : { memberId: actor.id },
    });

    let count = 0;

    for (const conversation of conversations) {
      if (isArtist) {
        count += await this.unreadForSender(
          conversation.id,
          conversation.memberId,
          conversation.artistLastReadAt,
        );
      } else {
        count += await this.unreadForSender(
          conversation.id,
          conversation.artistId,
          conversation.memberLastReadAt,
        );
      }
    }

    return { count };
  }

  /**
   * Total unread for an arbitrary user id, used to emit real-time counts.
   */
  async unreadCountForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user || isHidden(user.roles.map((item) => item.role))) {
      return 0;
    }

    const isArtist = user.roles.some((item) => item.role === Role.ARTIST);
    const conversations = await this.prisma.conversation.findMany({
      where: isArtist ? { artistId: userId } : { memberId: userId },
    });

    let count = 0;

    for (const conversation of conversations) {
      if (isArtist) {
        count += await this.unreadForSender(
          conversation.id,
          conversation.memberId,
          conversation.artistLastReadAt,
        );
      } else {
        count += await this.unreadForSender(
          conversation.id,
          conversation.artistId,
          conversation.memberLastReadAt,
        );
      }
    }

    return count;
  }

  private toMemberConversation(conversation: {
    id: string;
    memberId: string;
    artistId: string;
    memberLastReadAt: Date | null;
    artistLastReadAt: Date | null;
    lastMessageAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    member: { id: string; name: string | null; roles: { role: Role }[] };
    artist: { id: string; name: string | null; roles: { role: Role }[] };
  }) {
    return {
      id: conversation.id,
      memberId: conversation.memberId,
      artistId: conversation.artistId,
      memberLastReadAt: conversation.memberLastReadAt?.toISOString() ?? null,
      artistLastReadAt: conversation.artistLastReadAt?.toISOString() ?? null,
      lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      artist: {
        id: conversation.artist.id,
        name: conversation.artist.name,
      },
      member: {
        id: conversation.member.id,
        name: conversation.member.name,
      },
    };
  }

  private async toConversationDetail(conversation: {
    id: string;
    memberId: string;
    artistId: string;
    memberLastReadAt: Date | null;
    artistLastReadAt: Date | null;
    lastMessageAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    member: {
      id: string;
      name: string | null;
      email: string;
      roles: { role: Role }[];
    };
    artist: {
      id: string;
      name: string | null;
      email: string;
      roles: { role: Role }[];
    };
  }) {
    const memberEffective = await this.tierAccessService.getEffectiveAccess(
      conversation.memberId,
    );
    const memberUnread = await this.unreadForSender(
      conversation.id,
      conversation.artistId,
      conversation.memberLastReadAt,
    );
    const artistUnread = await this.unreadForSender(
      conversation.id,
      conversation.memberId,
      conversation.artistLastReadAt,
    );

    return {
      id: conversation.id,
      memberId: conversation.memberId,
      artistId: conversation.artistId,
      memberLastReadAt: conversation.memberLastReadAt?.toISOString() ?? null,
      artistLastReadAt: conversation.artistLastReadAt?.toISOString() ?? null,
      lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      artist: {
        id: conversation.artist.id,
        name: conversation.artist.name,
      },
      member: {
        id: conversation.member.id,
        name: conversation.member.name,
        email: conversation.member.email,
      },
      memberEffectiveTier: this.toSafeTier(memberEffective),
      accessStatus: memberEffective.status,
      accessExpiresAt: memberEffective.expiresAt,
      accessPermanent: memberEffective.permanent,
      memberUnread,
      artistUnread,
    };
  }

  private toConversationSummary(
    conversation: {
      id: string;
      lastMessageAt: Date | null;
    },
    member: { id: string; name: string | null; email: string },
    effective: EffectiveAccess,
    extra: {
      artistUnread: number;
      lastMessage:
        { id: string; senderId: string; content: string } | undefined;
    },
  ) {
    const granting = GRANTING_STATUSES.includes(effective.status);

    return {
      id: conversation.id,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
      },
      lastMessagePreview: extra.lastMessage
        ? extra.lastMessage.content.slice(0, 120)
        : '',
      lastMessageSenderId: extra.lastMessage?.senderId ?? null,
      lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
      artistUnreadCount: extra.artistUnread,
      effectiveTier: granting ? effective.tier : null,
      accessStatus: effective.status,
      accessExpiresAt: effective.expiresAt,
      accessPermanent: effective.permanent,
    };
  }

  private toSafeTier(effective: EffectiveAccess) {
    const granting = GRANTING_STATUSES.includes(effective.status);

    return granting ? effective.tier : null;
  }
}
