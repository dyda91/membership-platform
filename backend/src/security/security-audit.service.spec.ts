import { Test, TestingModule } from '@nestjs/testing';
import { SecurityAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityAuditService } from './security-audit.service';

describe('SecurityAuditService', () => {
  it('records an event with serialized non-sensitive metadata', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'e1' });
    const prisma = {
      securityAuditEvent: { create },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityAuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    const service = module.get(SecurityAuditService);

    await service.record('u1', SecurityAction.PASSWORD_CHANGED, {
      reason: 'manual',
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        action: SecurityAction.PASSWORD_CHANGED,
        metadataJson: JSON.stringify({ reason: 'manual' }),
      },
    });
  });

  it('stores null metadata when none is provided', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'e1' });
    const prisma = {
      securityAuditEvent: { create },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityAuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    const service = module.get(SecurityAuditService);

    await service.record('u1', SecurityAction.LOGOUT_ALL_SESSIONS);

    expect(create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        action: SecurityAction.LOGOUT_ALL_SESSIONS,
        metadataJson: null,
      },
    });
  });
});
