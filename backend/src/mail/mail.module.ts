import { Module } from '@nestjs/common';
import { MAILER } from './mail.types';
import { SmtpMailer } from './smtp.mailer';
import { MailService } from './mail.service';

@Module({
  providers: [{ provide: MAILER, useClass: SmtpMailer }, MailService],
  exports: [MailService],
})
export class MailModule {}
