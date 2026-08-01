import { Role } from '@prisma/client';
import { canAccessContent, ContentViewer } from './content-access.util';

const managerViewer: ContentViewer = {
  roles: [Role.SUPER_ADMIN],
  tierPriority: null,
};

const artistViewer: ContentViewer = {
  roles: [Role.ARTIST],
  tierPriority: null,
};

const subscriberWithTier = (priority: number): ContentViewer => ({
  roles: [Role.SUBSCRIBER],
  tierPriority: priority,
});

const subscriberWithoutTier: ContentViewer = {
  roles: [Role.SUBSCRIBER],
  tierPriority: null,
};

describe('canAccessContent', () => {
  it('allows public content without tier evaluation', () => {
    expect(canAccessContent(null, null)).toEqual({ allowed: true });
    expect(canAccessContent(subscriberWithoutTier, null)).toEqual({
      allowed: true,
    });
  });

  it('allows SUPER_ADMIN to access premium media', () => {
    expect(canAccessContent(managerViewer, { priority: 10 })).toEqual({
      allowed: true,
    });
  });

  it('allows ARTIST to access premium media', () => {
    expect(canAccessContent(artistViewer, { priority: 10 })).toEqual({
      allowed: true,
    });
  });

  it('denies premium access to unauthenticated visitors', () => {
    expect(canAccessContent(null, { priority: 1 })).toEqual({
      allowed: false,
      reason: 'unauthorized',
    });
  });

  it('denies premium access when the member has no tier', () => {
    expect(canAccessContent(subscriberWithoutTier, { priority: 1 })).toEqual({
      allowed: false,
      reason: 'insufficient_tier',
    });
  });

  it('allows access when the member tier matches the required priority', () => {
    expect(canAccessContent(subscriberWithTier(3), { priority: 3 })).toEqual({
      allowed: true,
    });
  });

  it('allows access when the member tier is higher than required (cumulative)', () => {
    expect(canAccessContent(subscriberWithTier(3), { priority: 1 })).toEqual({
      allowed: true,
    });
    expect(canAccessContent(subscriberWithTier(3), { priority: 2 })).toEqual({
      allowed: true,
    });
  });

  it('denies access when the member tier is lower than required', () => {
    expect(canAccessContent(subscriberWithTier(2), { priority: 3 })).toEqual({
      allowed: false,
      reason: 'insufficient_tier',
    });
  });
});
