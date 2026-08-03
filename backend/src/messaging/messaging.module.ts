import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { AuthModule } from '../auth/auth.module';
import { TierAccessModule } from '../tier-access/tier-access.module';

@Module({
  imports: [AuthModule, TierAccessModule],
  controllers: [MessagingController],
  providers: [MessagingService, MessagingGateway],
})
export class MessagingModule {}
