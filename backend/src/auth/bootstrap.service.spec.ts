import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { BootstrapService } from './bootstrap.service';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';

describe('BootstrapService', () => {
  let service: BootstrapService;
  let prisma: {
    user: {
      findFirst: jest.Mock;
      create: jest.Mock;
    };
  };
  let passwordService: { hash: jest.Mock };
  let config: { get: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    passwordService = { hash: jest.fn() };
    config = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BootstrapService,
        { provide: PrismaService, useValue: prisma },
        { provide: PasswordService, useValue: passwordService },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<BootstrapService>(BootstrapService);
  });

  it('does nothing when bootstrap is disabled', async () => {
    config.get.mockImplementation((key: string) =>
      key === 'SUPER_ADMIN_BOOTSTRAP_ENABLED' ? 'false' : undefined,
    );

    await service.onApplicationBootstrap();

    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('creates no account when configuration is missing', async () => {
    config.get.mockImplementation(() => undefined);

    await service.onApplicationBootstrap();

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('creates exactly one hidden SUPER_ADMIN when none exists', async () => {
    config.get.mockImplementation((key: string) => {
      const map: Record<string, string> = {
        SUPER_ADMIN_BOOTSTRAP_ENABLED: 'true',
        SUPER_ADMIN_EMAIL: 'root@test.com',
        SUPER_ADMIN_PASSWORD: 'very-secure-password',
        SUPER_ADMIN_NAME: 'Root',
      };

      return map[key];
    });
    prisma.user.findFirst.mockResolvedValue(null);
    passwordService.hash.mockResolvedValue('$2b$10$hashed');

    const expectedData = {
      email: 'root@test.com',
      passwordHash: '$2b$10$hashed',
      name: 'Root',
      roles: { create: [{ role: Role.SUPER_ADMIN }] },
    };

    await service.onApplicationBootstrap();

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expectedData }),
    );
  });

  it('is idempotent and never creates a duplicate', async () => {
    config.get.mockImplementation((key: string) =>
      key === 'SUPER_ADMIN_BOOTSTRAP_ENABLED' ? 'true' : 'value',
    );
    prisma.user.findFirst.mockResolvedValue({ id: 'root-1' });

    await service.onApplicationBootstrap();
    await service.onApplicationBootstrap();

    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.findFirst).toHaveBeenCalledTimes(2);
  });

  it('does not overwrite an existing SUPER_ADMIN password', async () => {
    config.get.mockImplementation((key: string) =>
      key === 'SUPER_ADMIN_BOOTSTRAP_ENABLED' ? 'true' : 'new-password',
    );
    prisma.user.findFirst.mockResolvedValue({ id: 'root-1' });

    await service.onApplicationBootstrap();

    expect(passwordService.hash).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
