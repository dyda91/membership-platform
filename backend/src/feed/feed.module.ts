import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { ArtistProfileModule } from '../artist-profile/artist-profile.module';

@Module({
  imports: [ArtistProfileModule],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
