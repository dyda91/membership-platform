import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MAILER } from './mail.types';
import type { Mailer, MailMessage } from './mail.types';

describe('MailService', () => {
  let service: MailService;
  let fakeMailer: { send: jest.Mock<Promise<void>, [MailMessage]> };

  const config = { get: jest.fn() };

  beforeEach(async () => {
    fakeMailer = { send: jest.fn<Promise<void>, [MailMessage]>() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: config },
        { provide: MAILER, useValue: fakeMailer as Mailer },
      ],
    }).compile();

    service = module.get(MailService);
  });

  it('builds reset links from the configured FRONTEND_URL', () => {
    config.get.mockImplementation((key: string) =>
      key === 'FRONTEND_URL' ? 'https://app.example.com' : undefined,
    );

    expect(service.buildResetUrl('abc.123')).toBe(
      'https://app.example.com/reset-password?token=abc.123',
    );
  });

  it('sends a password-reset e-mail with the link and expiration', async () => {
    config.get.mockImplementation((key: string) =>
      key === 'FRONTEND_URL' ? 'http://localhost:5173' : undefined,
    );

    const expiresAt = new Date('2026-02-01T12:00:00.000Z');

    await service.sendPasswordReset({
      to: 'user@test.com',
      token: 'raw-token',
      expiresAt,
    });

    const message = fakeMailer.send.mock.calls[0][0];

    expect(message.to).toBe('user@test.com');
    expect(message.text).toContain(
      'http://localhost:5173/reset-password?token=raw-token',
    );
    expect(message.text).toContain('válido até');
    expect(message.text).not.toContain('password="');
    expect(message.html).toContain(
      'http://localhost:5173/reset-password?token=raw-token',
    );
  });

  it('rethrows delivery failures without logging the token', async () => {
    fakeMailer.send.mockRejectedValue(new Error('smtp down'));

    await expect(
      service.sendPasswordReset({
        to: 'user@test.com',
        token: 'raw-token',
        expiresAt: new Date(),
      }),
    ).rejects.toThrow('smtp down');
  });
});
