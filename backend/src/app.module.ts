import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TiersModule } from './tiers/tiers.module';
import { PostsModule } from './posts/posts.module';
import { MediaModule } from './media/media.module';
import { ArtistsModule } from './artists/artists.module';
import { FeedModule } from './feed/feed.module';
import { ArtistProfileModule } from './artist-profile/artist-profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    StorageModule,
    HealthModule,
    AuthModule,
    UsersModule,
    TiersModule,
    PostsModule,
    MediaModule,
    ArtistsModule,
    FeedModule,
    ArtistProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
