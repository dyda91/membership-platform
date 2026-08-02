import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { FeedService } from './feed.service';
import type { ContentViewer } from '../common/content-access.util';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  getFeed(
    @CurrentUser() user: AuthenticatedUser | null,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const viewer: ContentViewer | null = user
      ? {
          roles: user.roles,
          tierPriority: user.tier?.priority ?? null,
        }
      : null;

    return this.feedService.getFeed(
      viewer,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      user?.id,
    );
  }
}
