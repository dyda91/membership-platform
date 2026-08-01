import { Module } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import {
  ArtistsController,
  ArtistProfileController,
} from './artists.controller';

@Module({
  controllers: [ArtistsController, ArtistProfileController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {}
