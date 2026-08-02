# Proposal: Public Feed and Media Experience

## Why

The platform now has a consistent visual foundation, responsive application
layout, reusable interface primitives and functional public and administrative
workflows.

However, the main public experience still requires dedicated product-level
refinement. The artist profile, Feed cards, image galleries, video playback and
locked-content presentation should feel like one cohesive creator profile
rather than a collection of administrative components.

This change transforms the root Feed into the principal public artist page. The
experience will be inspired by modern subscription-based creator profiles,
using a prominent banner, overlapping avatar, artist identity, contact actions
and a media-focused timeline, without copying any third-party brand identity or
interface exactly.

## What Changes

- Redesign the public artist header as a creator-profile hero.
- Display the banner as the main visual background of the artist profile.
- Position the avatar in relation to the banner and artist identity.
- Improve presentation of the artist name, biography and supporting text.
- Present enabled WhatsApp and Discord actions clearly.
- Keep the Feed immediately below the artist profile.
- Redesign Feed post cards for content-first viewing.
- Improve post text hierarchy, author identity and publication metadata.
- Support responsive image and video media presentation.
- Create an adaptive media gallery for posts containing multiple media items.
- Add an accessible image lightbox.
- Support keyboard and mobile gallery navigation.
- Improve video-player presentation and error behavior.
- Add lazy loading and stable media dimensions.
- Improve the final locked-content presentation.
- Display the required tier clearly without exposing protected media.
- Present external contact actions when the viewer lacks access.
- Preserve public post text when media is locked.
- Improve initial Feed loading and incremental pagination.
- Preserve all existing role, tier, access-validity and media-security rules.
- Preserve the Feed as the root route.
- Preserve the current visual foundation and shared UI primitives.
- Provide a polished mobile-first public experience.

## Goals

- Make the home page feel like the artist's public profile.
- Make media consumption the primary public experience.
- Provide a profile layout inspired by successful creator platforms without
  cloning a specific service.
- Make single-media and multi-media posts visually coherent.
- Improve image and video viewing on mobile and desktop.
- Make locked content attractive and understandable without compromising
  security.
- Keep visitors and subscribers focused on the artist and their content.
- Improve perceived quality and loading behavior.
- Preserve all existing business and authorization behavior.

## Non Goals

This change will not implement:

- Likes
- Comments
- Reposts
- Direct messages
- Follower counts
- Public member profiles
- Integrated payments
- Automatic subscriptions
- A marketplace or artist-discovery page
- Multiple active artists
- Final administrative interface redesign
- Advanced video transcoding
- Digital-rights management
- Download prevention guarantees
- A pixel-for-pixel copy of Fansly or another platform
- Final wording, color tuning or complete brand identity

## Impact

### Frontend

- Public Feed page
- Artist profile hero
- Feed post cards
- Media gallery
- Image lightbox
- Video presentation
- Locked-content components
- Loading and pagination behavior
- Responsive public experience
- Accessibility tests and interaction behavior

### Backend

Backend changes should be limited to data already required by the public Feed,
such as:

- ordered media metadata;
- safe image dimensions or aspect ratios;
- safe video poster or thumbnail metadata;
- pagination metadata;
- protected presigned media URLs;
- locked-media presentation metadata.

No new business rule is expected.

### Database

No migration is expected unless required media-order, aspect-ratio or thumbnail
metadata is missing from the current schema.

Any migration must be minimal, safe and preserve existing posts and media.
