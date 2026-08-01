# Design: Platform Experience

## Context

The existing application already provides:

- NestJS backend
- React and TypeScript frontend
- PostgreSQL through Prisma
- JWT authentication
- Role authorization
- User management
- Tier management
- Post and media management
- MinIO storage
- Artist profile management

The current user interface is primarily structured as an administrative
dashboard. Administrative navigation is visible too broadly, the root page is a
dashboard rather than a feed, post authoring includes unnecessary title and
cover-media concepts, and uploaded media is not consistently displayed.

This change restructures the application around a public and member-facing
content feed while preserving a separate administration area.

## Goals

- Make the feed the default application page.
- Keep administration available only to ARTIST and SUPER_ADMIN.
- Completely hide SUPER_ADMIN accounts from ordinary user-management flows.
- Enforce permission rules in both frontend and backend.
- Apply cumulative tier access.
- Simplify post creation.
- Correct media delivery and rendering.
- Preserve existing authentication, tier, user and content-management
  functionality.

## Non-Goals

- Payment processing
- Checkout
- Automatic subscription renewal
- Comments or likes
- Multiple independent artists
- Advanced video transcoding
- Full content-delivery-network integration

## Application Areas

The frontend will be separated conceptually into three areas.

### Public Area

Accessible without authentication:

- Feed
- Login
- Registration, if registration remains enabled
- Public artist information

### Member Area

Accessible to authenticated users:

- Feed
- Own profile
- Logout

The current tier is displayed as a badge near the authenticated user's name.

### Administration Area

Accessible only to ARTIST and SUPER_ADMIN:

- Dashboard
- Posts
- Users
- Tiers
- Artist profile management

System-level functionality, when present, is restricted to SUPER_ADMIN.

## Role Model

The existing roles remain:

- SUPER_ADMIN
- ARTIST
- SUBSCRIBER

Tiers remain independent from roles.

A role defines what a user can manage.

A tier defines what premium content a member can access.

## Permission Matrix

| Capability | Visitor | Subscriber | Artist | Super Admin |
|---|---:|---:|---:|---:|
| View public feed | Yes | Yes | Yes | Yes |
| View permitted premium media | No | By tier | Yes | Yes |
| Edit own basic profile | No | Yes | Yes | Yes |
| Access dashboard | No | No | Yes | Yes |
| Manage posts | No | No | Yes | Yes |
| Manage media | No | No | Yes | Yes |
| Manage normal users | No | No | Yes | Yes |
| Assign member tiers | No | No | Yes | Yes |
| Manage tier definitions | No | No | Yes | Yes |
| Assign ARTIST role | No | No | No | Yes |
| View or edit SUPER_ADMIN accounts | No | No | No | Internal only |
| Access system functions | No | No | No | Yes |

## Hidden SUPER_ADMIN Strategy

SUPER_ADMIN visibility must not depend only on the frontend.

Backend user queries will exclude SUPER_ADMIN accounts from:

- lists
- search results
- pagination totals
- counters
- selection controls
- exports intended for ARTIST
- direct retrieval by ARTIST

The existing system-account or hidden-account mechanism should be reused if
available.

If both role and system flags exist, visibility checks should use the strongest
available rule so privileged system accounts cannot accidentally appear.

The frontend must also avoid presenting actions for assigning or editing
SUPER_ADMIN.

## User and Role Management

SUPER_ADMIN may assign or revoke the ARTIST role.

ARTIST may:

- view and manage eligible member accounts
- activate or deactivate eligible members
- assign subscription tiers
- edit permitted member information

ARTIST may not:

- assign SUPER_ADMIN
- assign ARTIST
- view SUPER_ADMIN
- modify system-account flags

SUBSCRIBER may edit only permitted fields in their own profile.

Role and tier fields must not be accepted from subscriber self-profile update
requests.

## Tier Access Model

Tier access is cumulative and based on tier priority.

Example:

- Tier priority 1: entry tier
- Tier priority 2: intermediate tier
- Tier priority 3: highest tier

A user with priority 3 can access content requiring priority 1, 2 or 3.

A user with priority 2 cannot access content requiring priority 3.

Public posts have no required tier.

Access evaluation should be centralized in a reusable service or helper rather
than duplicated in controllers and React components.

Suggested decision function:

- no required tier: allow
- SUPER_ADMIN or ARTIST: allow
- unauthenticated visitor: deny premium media
- member has no tier: deny premium media
- member tier priority is greater than or equal to required priority: allow
- otherwise: deny

## Feed Backend Design

A feed module or feed-oriented post query will provide published posts ordered
by publication or creation date descending.

The feed response must be viewer-aware.

Suggested endpoint:

- `GET /feed`

Authentication is optional for the public feed.

When a valid token is available, the backend evaluates the viewer's role and
tier.

The response should include safe presentation metadata such as:

- post id
- text content
- author public information
- publication date
- required tier summary
- whether the viewer has media access
- ordered media presentation data
- locked-media state

The backend must not expose protected MinIO object URLs when access is denied.

Pagination should use the existing project conventions. Cursor pagination is
preferred for the timeline, but offset pagination may be retained if it is
already standardized in the project.

## Protected Media Delivery

Public or authorized media may be served through short-lived MinIO presigned
URLs or the existing protected media endpoint.

Unauthorized responses must contain only safe metadata required for a locked
placeholder, for example:

- media type
- aspect ratio if available
- required tier name
- locked state

They must not contain a usable protected storage URL.

The current image-rendering defect must be traced through:

1. upload response
2. media-to-post association
3. database metadata
4. MinIO object existence
5. generated media URL
6. browser accessibility and CORS
7. frontend rendering

The implementation should correct the root cause rather than adding a static
placeholder around a broken URL.

## Post Model Simplification

Posts behave like social-media posts rather than articles.

The post-authoring interface contains:

- text
- zero or more images/videos
- required tier or public option
- draft/published status

The interface does not contain:

- title
- subtitle
- slug
- manually selected cover media

If the Prisma Post model currently requires `title`, the field should be made
optional or removed through a safe migration.

If `coverMediaId` exists only for manual cover selection, it should be removed
or ignored after verifying no other feature depends on it.

Media order determines presentation order.

The first ordered media item becomes the primary preview.

## Video Preview

For video media, the preferred architecture is:

1. use a thumbnail already produced by the upload process, when available;
2. otherwise use a browser-generated poster or controlled video preview;
3. do not require a separate artist-uploaded cover.

Advanced server-side video transcoding is outside this change.

## Frontend Routing

Suggested route behavior:

- `/` → Feed
- `/login` → Login
- `/profile` → Authenticated user's profile
- `/dashboard` → ARTIST or SUPER_ADMIN
- `/posts` → ARTIST or SUPER_ADMIN
- `/posts/new` → ARTIST or SUPER_ADMIN
- `/posts/:id/edit` → ARTIST or SUPER_ADMIN
- `/users` → ARTIST or SUPER_ADMIN
- `/tiers` → ARTIST or SUPER_ADMIN

Direct navigation to unauthorized routes must be blocked even when the menu item
is hidden.

The frontend guard is for user experience.

The backend remains the security authority.

## Frontend Navigation

### Visitor

- Feed
- Login

### Subscriber

- Feed
- Profile
- Tier badge
- Logout

### Artist

- Feed
- Dashboard
- Posts
- Users
- Tiers
- Profile
- Logout

### Super Admin

- Feed
- Dashboard
- Posts
- Users
- Tiers
- Profile or system controls as appropriate
- Logout

SUPER_ADMIN must not be shown in ordinary user lists even to the artist.

## Feed Components

Suggested components:

- `FeedPage`
- `FeedList`
- `FeedPostCard`
- `PostMediaGallery`
- `LockedMedia`
- `ImageMedia`
- `VideoMedia`
- `TierBadge`
- `FeedPagination` or `InfiniteFeedLoader`
- `MediaErrorState`

Components should use the existing design system and Tailwind conventions.

## Locked Content Presentation

When access is denied:

- post text remains visible
- media area is blurred, obscured or replaced by a controlled lock presentation
- required tier may be displayed
- no protected URL is rendered into the page
- no separate plan page is required in this change

A future payment change may add an upgrade action.

## Tier Badge

The authenticated account display should include a compact tier badge.

The badge is informational only.

It must not link subscribers to tier administration.

ARTIST and SUPER_ADMIN navigation may continue to include the Tiers management
page.

## Profile Editing

Subscriber self-profile DTOs must use an allowlist of editable fields.

Permitted fields may include:

- display name
- avatar
- other existing basic profile fields

They must exclude:

- role
- tierId
- account status controlled by administration
- hidden/system flags

Artist-specific public profile editing remains available through the existing
artist profile feature.

## Migration Strategy

A database migration should be created only where required.

Likely schema changes include:

- making `Post.title` optional or removing it
- removing or deprecating `coverMediaId`
- adding media ordering if not already represented
- adding thumbnail metadata only if needed by the selected implementation

Migration requirements:

- preserve existing posts
- avoid destructive reset
- provide safe values for existing rows
- regenerate Prisma client
- validate migration status

## Error Handling

The feed must remain usable when one media item fails.

Media rendering errors should show a controlled local error state.

Authentication errors should not prevent public feed access.

Invalid or deleted tiers should not crash feed serialization.

Missing MinIO objects should be logged and represented safely.

## Testing Strategy

Backend tests should cover:

- public feed
- authenticated feed
- cumulative tier rules
- ARTIST and SUPER_ADMIN bypass rules
- protected media URL omission
- hidden SUPER_ADMIN filtering
- role assignment restrictions
- tier assignment restrictions
- post creation without title
- subscriber self-profile field restrictions

Frontend tests should cover:

- menu visibility by role
- route guards
- feed as root page
- tier badge
- locked and unlocked media
- post form without title or cover selector
- image and video rendering
- graceful media errors

Integration validation should include a real MinIO upload and retrieval flow.

## Open Questions

No unresolved product questions should block implementation.

When an implementation detail is not specified, the existing project
architecture and conventions take precedence.
