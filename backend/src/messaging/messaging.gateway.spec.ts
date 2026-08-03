/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, Role } from '@prisma/client';
import { MessagingGateway } from './messaging.gateway';
import { MessagingService } from './messaging.service';
import { PrismaService } from '../prisma/prisma.service';

function makeSocket(overrides: Record<string, unknown> = {}) {
  const socket = {
    handshake: { auth: {} },
    data: {},
    disconnect: jest.fn(),
    join: jest.fn().mockResolvedValue(undefined),
    leave: jest.fn().mockResolvedValue(undefined),
    emit: jest.fn(),
    ...overrides,
  };

  return socket as unknown as import('socket.io').Socket;
}

describe('MessagingGateway', () => {
  let gateway: MessagingGateway;
  let jwtService: { verifyAsync: jest.Mock };
  let prisma: { user: { findUnique: jest.Mock } };
  let messagingService: {
    getAuthorizedConversation: jest.Mock;
    sendMessage: jest.Mock;
    markRead: jest.Mock;
    unreadCountForUser: jest.Mock;
  };

  beforeEach(async () => {
    jwtService = { verifyAsync: jest.fn() };
    prisma = { user: { findUnique: jest.fn() } };
    messagingService = {
      getAuthorizedConversation: jest.fn(),
      sendMessage: jest.fn(),
      markRead: jest.fn(),
      unreadCountForUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingGateway,
        { provide: JwtService, useValue: jwtService },
        { provide: PrismaService, useValue: prisma },
        { provide: MessagingService, useValue: messagingService },
      ],
    }).compile();

    gateway = module.get(MessagingGateway);
  });

  describe('connection authentication', () => {
    it('accepts a valid token and joins the user room', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'u1',
        sessionVersion: 0,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        status: AccountStatus.ACTIVE,
        sessionVersion: 0,
        roles: [{ role: Role.SUBSCRIBER }],
      });

      const socket = makeSocket({ handshake: { auth: { token: 'valid' } } });

      await gateway.handleConnection(socket);

      expect(socket.join).toHaveBeenCalledWith('user:u1');
      expect(socket.disconnect).not.toHaveBeenCalled();
    });

    it('rejects a stale sessionVersion token', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'u1',
        sessionVersion: 1,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        status: AccountStatus.ACTIVE,
        sessionVersion: 2,
        roles: [{ role: Role.SUBSCRIBER }],
      });

      const socket = makeSocket({ handshake: { auth: { token: 'stale' } } });

      await gateway.handleConnection(socket);

      expect(socket.disconnect).toHaveBeenCalledWith(true);
    });

    it('rejects an invalid token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('bad'));

      const socket = makeSocket({ handshake: { auth: { token: 'bad' } } });

      await gateway.handleConnection(socket);

      expect(socket.disconnect).toHaveBeenCalledWith(true);
    });

    it('rejects a disabled account', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'u1',
        sessionVersion: 0,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        status: AccountStatus.DISABLED,
        sessionVersion: 0,
        roles: [{ role: Role.SUBSCRIBER }],
      });

      const socket = makeSocket({ handshake: { auth: { token: 'valid' } } });

      await gateway.handleConnection(socket);

      expect(socket.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe('conversation join', () => {
    it('allows an authorized join', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'u1',
        sessionVersion: 0,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        status: AccountStatus.ACTIVE,
        sessionVersion: 0,
        roles: [{ role: Role.SUBSCRIBER }],
      });
      messagingService.getAuthorizedConversation.mockResolvedValue({
        id: 'c1',
      });

      const socket = makeSocket({ handshake: { auth: { token: 'valid' } } });

      await gateway.handleConnection(socket);

      const result = await gateway.joinConversation(socket, {
        conversationId: 'c1',
      });

      expect(result).toEqual({ ok: true, conversationId: 'c1' });
      expect(socket.join).toHaveBeenCalledWith('conversation:c1');
    });

    it('denies an unauthorized join', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'u1',
        sessionVersion: 0,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        status: AccountStatus.ACTIVE,
        sessionVersion: 0,
        roles: [{ role: Role.SUBSCRIBER }],
      });
      messagingService.getAuthorizedConversation.mockRejectedValue(
        new Error('Forbidden'),
      );

      const socket = makeSocket({ handshake: { auth: { token: 'valid' } } });

      await gateway.handleConnection(socket);

      const result = await gateway.joinConversation(socket, {
        conversationId: 'other',
      });

      expect(result).toEqual({ ok: false, error: 'Forbidden' });
      expect(socket.join).not.toHaveBeenCalledWith('conversation:other');
    });
  });

  describe('message:send', () => {
    it('routes through the service and acknowledges with the persisted id', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'u1',
        sessionVersion: 0,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        status: AccountStatus.ACTIVE,
        sessionVersion: 0,
        roles: [{ role: Role.SUBSCRIBER }],
      });
      messagingService.sendMessage.mockResolvedValue({
        message: { id: 'm1', content: 'Oi' },
        conversation: { id: 'c1', memberId: 'u1', artistId: 'a1' },
        recipientId: 'a1',
        senderIsMember: true,
      });
      messagingService.unreadCountForUser.mockResolvedValue(3);

      const socket = makeSocket({ handshake: { auth: { token: 'valid' } } });

      await gateway.handleConnection(socket);

      const result = await gateway.sendMessage(socket, {
        conversationId: 'c1',
        content: 'Oi',
        clientMessageId: 'tmp-1',
      });

      expect(messagingService.sendMessage).toHaveBeenCalled();
      const ack = result as {
        ok: boolean;
        clientMessageId: string;
        message?: { id: string };
      };
      expect(ack.ok).toBe(true);
      expect(ack.clientMessageId).toBe('tmp-1');
      expect(ack.message?.id).toBe('m1');
    });

    it('acknowledges failure for empty content', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'u1',
        sessionVersion: 0,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        status: AccountStatus.ACTIVE,
        sessionVersion: 0,
        roles: [{ role: Role.SUBSCRIBER }],
      });

      const socket = makeSocket({ handshake: { auth: { token: 'valid' } } });

      await gateway.handleConnection(socket);

      const result = await gateway.sendMessage(socket, {
        conversationId: 'c1',
        content: '   ',
        clientMessageId: 'tmp-1',
      });

      const ack = result as { ok: boolean; error?: { code: string } };
      expect(ack.ok).toBe(false);
      expect(ack.error?.code).toBe('invalid_message');
      expect(messagingService.sendMessage).not.toHaveBeenCalled();
    });

    it('rate limits excessive sends', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'u1',
        sessionVersion: 0,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        status: AccountStatus.ACTIVE,
        sessionVersion: 0,
        roles: [{ role: Role.SUBSCRIBER }],
      });

      const socket = makeSocket({ handshake: { auth: { token: 'valid' } } });

      await gateway.handleConnection(socket);

      for (let index = 0; index < 20; index += 1) {
        messagingService.sendMessage.mockResolvedValue({
          message: { id: `m${index}` },
          conversation: { id: 'c1', memberId: 'u1', artistId: 'a1' },
          recipientId: 'a1',
          senderIsMember: true,
        });
        await gateway.sendMessage(socket, {
          conversationId: 'c1',
          content: `m${index}`,
          clientMessageId: `t${index}`,
        });
      }

      const result = await gateway.sendMessage(socket, {
        conversationId: 'c1',
        content: 'over',
        clientMessageId: 't-over',
      });

      const ack = result as { ok: boolean; error?: { code: string } };
      expect(ack.ok).toBe(false);
      expect(ack.error?.code).toBe('rate_limited');
    });
  });
});
