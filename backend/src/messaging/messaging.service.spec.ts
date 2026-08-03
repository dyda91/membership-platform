/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { MessagingService } from './messaging.service';
import { TierAccessService } from '../tier-access/tier-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { InboxSort } from './dto/inbox-query.dto';

const MEMBER_ID = 'member-1';
const ARTIST_ID = 'artist-1';

const artist = {
  id: ARTIST_ID,
  name: 'Artista',
  email: 'artist@test.com',
  roles: [{ role: Role.ARTIST }],
};

const memberUser = {
  id: MEMBER_ID,
  name: 'Membro',
  email: 'member@test.com',
  roles: [{ role: Role.SUBSCRIBER }],
};

const conversation = {
  id: 'conv-1',
  memberId: MEMBER_ID,
  artistId: ARTIST_ID,
  memberLastReadAt: null,
  artistLastReadAt: null,
  lastMessageAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const effectiveNone = {
  roleBypass: false,
  status: 'NONE',
  tier: null,
  tierPriority: null,
  startsAt: null,
  expiresAt: null,
  permanent: false,
  expiringSoon: false,
  revoked: false,
};

describe('MessagingService', () => {
  let service: MessagingService;

  const prisma = {
    user: { findFirst: jest.fn(), findUnique: jest.fn() },
    conversation: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const tierAccess = {
    getEffectiveAccess: jest.fn().mockResolvedValue(effectiveNone),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingService,
        { provide: PrismaService, useValue: prisma },
        { provide: TierAccessService, useValue: tierAccess },
      ],
    }).compile();

    service = module.get(MessagingService);
  });

  describe('getOrCreateMemberConversation', () => {
    it('creates a conversation with the resolved active artist', async () => {
      prisma.user.findFirst.mockResolvedValue(artist);
      prisma.conversation.findUnique.mockResolvedValue(null);
      prisma.conversation.create.mockResolvedValue({
        ...conversation,
        artist,
        member: memberUser,
      });

      const result = await service.getOrCreateMemberConversation({
        id: MEMBER_ID,
        roles: [Role.SUBSCRIBER],
      });

      expect(prisma.conversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            memberId: MEMBER_ID,
            artistId: ARTIST_ID,
          }),
        }),
      );
      expect(result.id).toBe('conv-1');
    });

    it('returns the existing conversation without creating a duplicate', async () => {
      prisma.user.findFirst.mockResolvedValue(artist);
      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        artist,
        member: memberUser,
      });

      const result = await service.getOrCreateMemberConversation({
        id: MEMBER_ID,
        roles: [Role.SUBSCRIBER],
      });

      expect(prisma.conversation.create).not.toHaveBeenCalled();
      expect(result.id).toBe('conv-1');
    });

    it('fails safely when no active artist exists', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.getOrCreateMemberConversation({
          id: MEMBER_ID,
          roles: [Role.SUBSCRIBER],
        }),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    it('rejects hidden system accounts as members', async () => {
      await expect(
        service.getOrCreateMemberConversation({
          id: 'hidden',
          roles: [Role.SUPER_ADMIN],
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('authorization', () => {
    it('allows a member only their own conversation', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        member: { ...memberUser, roles: memberUser.roles },
        artist: { ...artist, roles: artist.roles },
      });

      await expect(
        service.getAuthorizedConversation(
          { id: MEMBER_ID, roles: [Role.SUBSCRIBER] },
          'conv-1',
        ),
      ).resolves.toBeDefined();

      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        memberId: 'other-member',
        member: { ...memberUser, id: 'other-member', roles: memberUser.roles },
        artist: { ...artist, roles: artist.roles },
      });

      await expect(
        service.getAuthorizedConversation(
          { id: MEMBER_ID, roles: [Role.SUBSCRIBER] },
          'conv-1',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows the active artist to access eligible conversations', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        member: { ...memberUser, roles: memberUser.roles },
        artist: { ...artist, roles: artist.roles },
      });

      await expect(
        service.getAuthorizedConversation(
          { id: ARTIST_ID, roles: [Role.ARTIST] },
          'conv-1',
        ),
      ).resolves.toBeDefined();
    });

    it('allows SUPER_ADMIN support access', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        member: { ...memberUser, roles: memberUser.roles },
        artist: { ...artist, roles: artist.roles },
      });

      await expect(
        service.getAuthorizedConversation(
          { id: 'root', roles: [Role.SUPER_ADMIN] },
          'conv-1',
        ),
      ).resolves.toBeDefined();
    });
  });

  describe('sendMessage', () => {
    it('persists a member message transactionally before returning', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        member: { ...memberUser, roles: memberUser.roles },
        artist: { ...artist, roles: artist.roles },
      });
      prisma.$transaction.mockImplementation(
        async (fn: (tx: unknown) => Promise<unknown>) =>
          fn({
            message: prisma.message,
            conversation: { update: prisma.conversation.update },
          }),
      );
      prisma.message.create.mockResolvedValue({
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: MEMBER_ID,
        content: 'Oi',
        createdAt: new Date(),
      });
      prisma.conversation.update.mockResolvedValue({});

      const result = await service.sendMessage(
        { id: MEMBER_ID, roles: [Role.SUBSCRIBER] },
        'conv-1',
        'Oi',
      );

      expect(prisma.message.create).toHaveBeenCalled();
      expect(prisma.conversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'conv-1' },
          data: expect.objectContaining({
            lastMessageAt: expect.any(Date) as Date,
          }),
        }),
      );
      expect(result.recipientId).toBe(ARTIST_ID);
      expect(result.senderIsMember).toBe(true);
    });

    it('rejects an artist send from a member', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        member: { ...memberUser, roles: memberUser.roles },
        artist: { ...artist, roles: artist.roles },
      });

      await expect(
        service.sendMessage(
          { id: 'other', roles: [Role.SUBSCRIBER] },
          'conv-1',
          'Oi',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects whitespace-only content', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        member: { ...memberUser, roles: memberUser.roles },
        artist: { ...artist, roles: artist.roles },
      });

      await expect(
        service.sendMessage(
          { id: MEMBER_ID, roles: [Role.SUBSCRIBER] },
          'conv-1',
          '   ',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects oversized content', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        member: { ...memberUser, roles: memberUser.roles },
        artist: { ...artist, roles: artist.roles },
      });

      await expect(
        service.sendMessage(
          { id: MEMBER_ID, roles: [Role.SUBSCRIBER] },
          'conv-1',
          'x'.repeat(4001),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects SUPER_ADMIN sending as a participant', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        member: { ...memberUser, roles: memberUser.roles },
        artist: { ...artist, roles: artist.roles },
      });

      await expect(
        service.sendMessage(
          { id: 'root', roles: [Role.SUPER_ADMIN] },
          'conv-1',
          'Oi',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getHistory', () => {
    it('returns the latest messages in chronological order', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        member: { ...memberUser, roles: memberUser.roles },
        artist: { ...artist, roles: artist.roles },
      });
      prisma.message.findMany.mockResolvedValue([
        { id: 'm2', createdAt: new Date('2026-01-02'), content: 'b' },
        { id: 'm1', createdAt: new Date('2026-01-01'), content: 'a' },
      ]);

      const result = await service.getHistory(
        { id: MEMBER_ID, roles: [Role.SUBSCRIBER] },
        'conv-1',
        {},
      );

      expect(result.messages.map((m) => m.content)).toEqual(['a', 'b']);
      expect(result.hasMore).toBe(false);
    });

    it('applies the cursor and reports hasMore', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        member: { ...memberUser, roles: memberUser.roles },
        artist: { ...artist, roles: artist.roles },
      });
      const older = [
        { id: 'm1', createdAt: new Date('2026-01-01'), content: 'old' },
      ];
      prisma.message.findMany.mockResolvedValue([
        ...older,
        { id: 'm0', createdAt: new Date('2025-12-31'), content: 'older' },
      ]);

      const result = await service.getHistory(
        { id: MEMBER_ID, roles: [Role.SUBSCRIBER] },
        'conv-1',
        { before: '2026-01-02T00:00:00.000Z|m2', limit: 1 },
      );

      expect(result.messages.length).toBe(1);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toContain('m1');
    });
  });

  describe('listConversations', () => {
    it('denies access to a subscriber', async () => {
      await expect(
        service.listConversations(
          { id: MEMBER_ID, roles: [Role.SUBSCRIBER] },
          {},
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('lists conversations with effective tier and unread counts', async () => {
      prisma.user.findUnique.mockResolvedValue(artist);
      prisma.conversation.findMany.mockResolvedValue([
        {
          ...conversation,
          member: memberUser,
          messages: [{ id: 'm1', senderId: MEMBER_ID, content: 'Olá' }],
        },
      ]);
      prisma.message.count.mockResolvedValue(1);
      tierAccess.getEffectiveAccess.mockResolvedValue({
        ...effectiveNone,
        status: 'ACTIVE',
        tier: { id: 't-gold', name: 'Gold', priority: 5 },
        tierPriority: 5,
      });

      const result = await service.listConversations(
        { id: ARTIST_ID, roles: [Role.ARTIST] },
        { page: 1, limit: 20 },
      );

      expect(result.total).toBe(1);
      expect(result.data[0].member.email).toBe('member@test.com');
      expect(result.data[0].effectiveTier?.name).toBe('Gold');
      expect(result.data[0].artistUnreadCount).toBe(1);
      expect(result.data[0].lastMessagePreview).toBe('Olá');
    });

    it('prioritizes unread and higher effective tier', async () => {
      prisma.user.findUnique.mockResolvedValue(artist);
      prisma.conversation.findMany.mockResolvedValue([
        {
          ...conversation,
          id: 'free',
          member: { ...memberUser, id: 'free', roles: memberUser.roles },
          messages: [],
        },
        {
          ...conversation,
          id: 'gold',
          member: { ...memberUser, id: 'gold', roles: memberUser.roles },
          messages: [],
        },
      ]);
      prisma.message.count.mockImplementation(
        ({ where }: { where: { senderId: string } }) =>
          Promise.resolve(where.senderId === 'gold' ? 1 : 0),
      );
      tierAccess.getEffectiveAccess.mockImplementation(
        (_userId: { id: string }) =>
          Promise.resolve({
            ...effectiveNone,
            status: 'ACTIVE',
            tier: { id: 't', name: 'Gold', priority: 5 },
            tierPriority: 5,
          }),
      );

      const result = await service.listConversations(
        { id: ARTIST_ID, roles: [Role.ARTIST] },
        { page: 1, limit: 20, sort: InboxSort.PRIORITY },
      );

      expect(result.data.map((c) => c.id)).toEqual(['gold', 'free']);
    });

    it('excludes hidden system accounts', async () => {
      prisma.user.findUnique.mockResolvedValue(artist);
      prisma.conversation.findMany.mockResolvedValue([
        {
          ...conversation,
          member: { ...memberUser, roles: [{ role: Role.SUPER_ADMIN }] },
          messages: [],
        },
      ]);

      const result = await service.listConversations(
        { id: ARTIST_ID, roles: [Role.ARTIST] },
        { page: 1, limit: 20 },
      );

      expect(result.total).toBe(0);
    });

    it('filters by access status', async () => {
      prisma.user.findUnique.mockResolvedValue(artist);
      prisma.conversation.findMany.mockResolvedValue([
        {
          ...conversation,
          id: 'c1',
          member: memberUser,
          messages: [],
        },
      ]);
      prisma.message.count.mockResolvedValue(1);
      tierAccess.getEffectiveAccess.mockResolvedValue({
        ...effectiveNone,
        status: 'EXPIRED',
        tier: { id: 't-gold', name: 'Gold', priority: 5 },
        tierPriority: null,
      });

      const matched = await service.listConversations(
        { id: ARTIST_ID, roles: [Role.ARTIST] },
        { page: 1, limit: 20, accessStatus: 'EXPIRED' },
      );

      expect(matched.total).toBe(1);

      const filteredOut = await service.listConversations(
        { id: ARTIST_ID, roles: [Role.ARTIST] },
        { page: 1, limit: 20, accessStatus: 'ACTIVE' },
      );

      expect(filteredOut.total).toBe(0);
    });

    it('filters by effective tier id only for granting access', async () => {
      prisma.user.findUnique.mockResolvedValue(artist);
      prisma.conversation.findMany.mockResolvedValue([
        {
          ...conversation,
          id: 'c1',
          member: memberUser,
          messages: [],
        },
      ]);
      prisma.message.count.mockResolvedValue(1);
      tierAccess.getEffectiveAccess.mockResolvedValue({
        ...effectiveNone,
        status: 'ACTIVE',
        tier: { id: 't-gold', name: 'Gold', priority: 5 },
        tierPriority: 5,
      });

      const matched = await service.listConversations(
        { id: ARTIST_ID, roles: [Role.ARTIST] },
        { page: 1, limit: 20, tierId: 't-gold' },
      );

      expect(matched.total).toBe(1);

      const otherTier = await service.listConversations(
        { id: ARTIST_ID, roles: [Role.ARTIST] },
        { page: 1, limit: 20, tierId: 't-silver' },
      );

      expect(otherTier.total).toBe(0);
    });
  });

  describe('read state', () => {
    it('advances artist read state and zeroes artist unread', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        member: { ...memberUser, roles: memberUser.roles },
        artist: { ...artist, roles: artist.roles },
      });
      prisma.message.count.mockResolvedValue(3);

      await service.markRead({ id: ARTIST_ID, roles: [Role.ARTIST] }, 'conv-1');

      expect(prisma.conversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ artistLastReadAt: expect.any(Date) }),
        }),
      );
    });

    it('does not move the read timestamp backwards', async () => {
      const future = new Date(Date.now() + 60_000);
      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        artistLastReadAt: future,
        member: { ...memberUser, roles: memberUser.roles },
        artist: { ...artist, roles: artist.roles },
      });
      prisma.message.count.mockResolvedValue(0);

      await service.markRead({ id: ARTIST_ID, roles: [Role.ARTIST] }, 'conv-1');

      const update = prisma.conversation.update.mock.calls[0][0] as {
        data: { artistLastReadAt: Date };
      };

      expect(update.data.artistLastReadAt).toBe(future);
    });

    it('keeps SUPER_ADMIN support read-only', async () => {
      prisma.conversation.findUnique.mockResolvedValue({
        ...conversation,
        member: { ...memberUser, roles: memberUser.roles },
        artist: { ...artist, roles: artist.roles },
      });
      prisma.message.count.mockResolvedValue(1);

      await service.markRead(
        { id: 'root', roles: [Role.SUPER_ADMIN] },
        'conv-1',
      );

      expect(prisma.conversation.update).not.toHaveBeenCalled();
    });
  });

  describe('unread counts', () => {
    it('counts artist replies for a member', async () => {
      prisma.conversation.findMany.mockResolvedValue([conversation]);
      prisma.message.count.mockResolvedValue(2);

      const result = await service.unreadCount({
        id: MEMBER_ID,
        roles: [Role.SUBSCRIBER],
      });

      expect(result.count).toBe(2);
    });
  });
});
