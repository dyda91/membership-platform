import { Module } from '@nestjs/common';
import { TierAccessService } from './tier-access.service';
import { TierAccessAdminService } from './tier-access-admin.service';
import { TierAccessController } from './tier-access.controller';

@Module({
  controllers: [TierAccessController],
  providers: [TierAccessService, TierAccessAdminService],
  exports: [TierAccessService],
})
export class TierAccessModule {}
