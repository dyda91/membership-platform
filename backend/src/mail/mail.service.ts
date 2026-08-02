import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAILER } from './mail.types';
import type { Mailer } from './mail.types';

export interface ResetEmail {
  to: string;
  token: string;
  expiresAt: Date;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(MAILER) private readonly mailer: Mailer,
  ) {}

  /**
   * Builds the reset link from the configured FRONTEND_URL. The request Host
   * header is never used, preventing host-header injection.
   */
  buildResetUrl(token: string): string {
    const base = (
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173'
    ).replace(/\/$/, '');
    const encoded = encodeURIComponent(token);

    return `${base}/reset-password?token=${encoded}`;
  }

  /**
   * Sends the password-reset e-mail. The raw token appears only in the link
   * passed to the mailer; it is never logged. Delivery failures are rethrown
   * so the caller can handle them without exposing the token.
   */
  async sendPasswordReset({ to, token, expiresAt }: ResetEmail): Promise<void> {
    const url = this.buildResetUrl(token);
    const expiresLabel = expiresAt.toLocaleString('pt-BR');
    const safeUrl = escapeHtml(url);

    const text = [
      'Solicitação de redefinição de senha.',
      '',
      `Abra o link abaixo para criar uma nova senha. O link é válido até ${expiresLabel}.`,
      '',
      url,
      '',
      'Se você não solicitou a redefinição, ignore este e-mail.',
      'Nenhuma alteração será feita na sua conta.',
    ].join('\n');

    const html = [
      '<p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>',
      `<p>Use o link abaixo para criar uma nova senha. O link é válido até <strong>${expiresLabel}</strong>:</p>`,
      `<p><a href="${safeUrl}">Redefinir minha senha</a></p>`,
      '<p>Se você não solicitou, ignore este e-mail. Nenhuma alteração será feita.</p>',
    ].join('');

    try {
      await this.mailer.send({
        to,
        subject: 'Redefinição de senha',
        text,
        html,
      });
    } catch (error) {
      this.logger.error('Failed to deliver password-reset e-mail');
      throw error;
    }
  }
}
