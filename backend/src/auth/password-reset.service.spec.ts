import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordResetService } from './password-reset.service';

describe('PasswordResetService', () => {
  let service: PasswordResetService;

  const ANY_DATE = expect.any(Date) as Date;

  const prisma = {
    passwordResetToken: {
      create: jest.fn<
        Promise<unknown>,
        [{ data: { userId: string; tokenHash: string; expiresAt: Date } }]
      >(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const config = { get: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(PasswordResetService);
  });

  it('generates URL-safe raw tokens and persists only the hash', async () => {
    prisma.$transaction.mockImplementation(async (arg: unknown) =>
      Promise.all(arg as Promise<unknown>[]),
    );

    const { rawToken } = await service.createToken('user-1');

    expect(rawToken.length).toBeGreaterThanOrEqual(32);
    expect(rawToken).toMatch(/^[A-Za-z0-9_-]+$/);

    const created = prisma.passwordResetToken.create.mock.calls[0][0];

    expect(created.data.tokenHash).not.toBe(rawToken);
    expect(created.data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('invalidates outstanding tokens when a new one is created', async () => {
    prisma.$transaction.mockImplementation(async (arg: unknown) =>
      Promise.all(arg as Promise<unknown>[]),
    );

    await service.createToken('user-1');

    expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', usedAt: null },
      data: { usedAt: ANY_DATE },
    });
  });

  it('finds a token only by its hash', async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValue({ id: 'r1' });

    const result = await service.findValidByRawToken('raw-token');

    expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith({
      where: {
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/) as string,
      },
      include: { user: true },
    });
    expect(result).toEqual({ id: 'r1' });
  });

  it('returns null when the raw token is empty', async () => {
    expect(await service.findValidByRawToken('')).toBeNull();
  });

  it('uses a safe default expiration when unconfigured', () => {
    expect(service.ttlMs()).toBe(30 * 60 * 1000);
  });

  it('reads the configured token lifetime', () => {
    config.get.mockImplementation((key: string) =>
      key === 'RESET_TOKEN_TTL_SECONDS' ? 900 : undefined,
    );

    expect(service.ttlMs()).toBe(900 * 1000);
  });
});
