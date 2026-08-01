import { Module } from '@nestjs/common';
import { ArtistProfileService } from './artist-profile.service';
import { ArtistProfileController } from './artist-profile.controller';

@Module({
  controllers: [ArtistProfileController],
  providers: [ArtistProfileService],
  exports: [ArtistProfileService],
})
export class ArtistProfileModule {}
