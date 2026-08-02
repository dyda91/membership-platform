import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Mailer, MailMessage } from './mail.types';

/**
 * SMTP-backed mailer. When SMTP_HOST is not configured the mailer becomes a
 * safe no-op (e-mail delivery disabled) instead of failing or logging content.
 * Never logs message bodies or recipients beyond ordinary errors.
 */
@Injectable()
export class SmtpMailer implements Mailer {
  private readonly logger = new Logger(SmtpMailer.name);
  private readonly from: string;
  private readonly transporter: nodemailer.Transporter | null;

  constructor(config: ConfigService) {
    this.from = config.get<string>('SMTP_FROM') ?? 'no-reply@localhost';

    const host = config.get<string>('SMTP_HOST');

    if (!host) {
      this.logger.warn(
        'SMTP_HOST is not configured; e-mail delivery is disabled.',
      );
      this.transporter = null;

      return;
    }

    const user = config.get<string>('SMTP_USER');

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(config.get<number>('SMTP_PORT') ?? 587),
      secure: config.get<string>('SMTP_SECURE') === 'true',
      auth: user
        ? {
            user,
            pass: config.get<string>('SMTP_PASSWORD') ?? '',
          }
        : undefined,
    });
  }

  async send(message: MailMessage): Promise<void> {
    if (!this.transporter) {
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  }
}
