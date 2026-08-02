import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { ArtistProfileModule } from '../artist-profile/artist-profile.module';
import { TierAccessModule } from '../tier-access/tier-access.module';

@Module({
  imports: [ArtistProfileModule, TierAccessModule],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
