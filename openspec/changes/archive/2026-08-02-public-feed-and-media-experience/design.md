# Design: Public Feed and Media Experience

## Context

The frontend now has:

- semantic visual tokens;
- shared React and Tailwind UI primitives;
- responsive AppShell;
- centralized role-aware navigation;
- desktop and mobile navigation;
- shared buttons, fields, badges, cards and dialogs;
- standardized loading, empty and error states;
- responsive page containers;
- accessibility foundations.

The product also already supports:

- one active artist;
- public artist profile;
- banner and avatar;
- public Feed;
- posts with images and videos;
- ordered media;
- protected MinIO media URLs;
- cumulative tier access;
- manual access validity;
- expired and revoked access handling;
- WhatsApp and Discord contact actions.

This change applies the visual foundation to the primary public product
experience.

## Visual Inspiration Boundary

The public page may be inspired by modern creator-profile platforms such as
Fansly in broad interaction patterns:

- profile banner;
- overlapping avatar;
- creator identity;
- bio and contact actions;
- content-focused timeline;
- premium locked posts;
- media-centered post cards.

The implementation must not:

- copy third-party branding;
- use third-party trademarks as platform identity;
- copy proprietary icons or assets;
- reproduce exact colors, dimensions or interface text;
- create a pixel-perfect clone.

The resulting interface should retain its own visual identity and use the
platform's established tokens.

## Public Page Architecture

Suggested structure:

```text
FeedPage
├── PublicArtistProfile
│   ├── ArtistBanner
│   ├── ArtistAvatar
│   ├── ArtistIdentity
│   ├── ArtistBiography
│   └── ArtistContactActions
├── FeedToolbar, only if a real current need exists
└── FeedList
    ├── FeedPostCard
    │   ├── PostHeader
    │   ├── PostText
    │   ├── PostMedia
    │   └── PostMetadata
    └── FeedLoadingBoundary

Do not add artificial social metrics that do not exist.

Artist Hero

The artist hero should establish immediate identity.

Suggested behavior:

banner spans the hero width;
banner uses an aspect ratio appropriate for desktop and mobile;
object positioning preserves important parts of the image;
avatar overlaps or visually connects the banner and profile body;
identity section contains name, bio and contacts;
controls for ARTIST/SUPER_ADMIN remain discreet and separate from public
identity;
missing media uses intentional fallbacks rather than broken images.

The hero should not consume the entire mobile viewport.

Profile Content Width

Use the foundation's narrow or content container.

Suggested desktop behavior:

hero and Feed align to one main content column;
the hero may be slightly wider than Feed cards if visually appropriate;
excessive empty horizontal space should be avoided;
the public profile should remain centered.

A secondary sidebar is not necessary at this stage.

Feed Post Card

The card should emphasize content.

Recommended hierarchy:

small artist identity and publication metadata;
post text;
media;
required tier or access state where applicable.

Do not show a title because posts do not use titles.

Avoid excessive borders around every nested element.

The media area may visually extend closer to card edges than the text area,
while maintaining safe mobile behavior.

Post Text

Support:

line breaks;
readable wrapping;
URLs according to current safe rendering behavior;
optional collapsed long-text presentation;
a clear “show more” control where used.

Do not interpret arbitrary HTML supplied by the post as trusted content.

Media Model

The frontend should consume ordered media presentation data.

Each safe media item should ideally contain:

id
type
url, only when authorized
thumbnailUrl or posterUrl when safe and available
width
height
aspectRatio
mimeType
locked

Unauthorized media must not contain a protected URL.

If width and height are missing, use a stable fallback ratio and avoid blocking
the entire post.

Gallery Strategy

Use one gallery component for:

one image;
multiple images;
one video;
mixed images and videos.

Suggested components:

PostMediaGallery
├── ImageMedia
├── VideoMedia
├── LockedMedia
├── GalleryControls
└── GalleryPosition

Keep the active-media index local to each post.

Do not cause the entire Feed to rerender unnecessarily when navigating one
gallery.

Gallery Mobile Interaction

Support touch-friendly previous/next interaction.

Swipe may be implemented using:

a small existing utility;
pointer-event logic;
CSS scroll snapping when it provides reliable accessibility.

Do not install a large carousel framework without need.

Navigation buttons should still be available when swipe exists.

Image Presentation

Use semantic image elements with:

correct alt behavior;
loading strategy;
responsive dimensions;
object-fit appropriate to the context;
aspect-ratio reservation;
controlled fallback.

Post media often should use neutral contain or constrained cover behavior based
on the desired card design.

Avoid cropping essential image content unexpectedly.

Lightbox

The lightbox may reuse the shared Dialog foundation, adapted for media.

Requirements:

full or near-full viewport presentation;
close control;
Escape dismissal;
next/previous controls for multiple images;
visible position;
focus containment;
body-scroll control;
mobile-safe controls;
no opening for locked media.

Zoom is optional. If implemented, keep it controlled and mobile-safe.

Do not delay the entire change for advanced pinch-to-zoom.

Video Strategy

Use the native HTML video element unless the current implementation requires a
specialized player.

Recommended:

controls;
preload="metadata" or safer lazy behavior;
poster where available;
no automatic unmuted playback;
no forced autoplay;
responsive aspect ratio;
controlled loading and playback error states.

Only one Feed video should not automatically pause all others unless this can be
implemented safely without excessive scope.

Video Thumbnail

Preferred order:

existing thumbnail/poster metadata;
existing uploaded poster;
browser-safe controlled video frame presentation;
neutral video placeholder.

Server-side FFmpeg transcoding and thumbnail generation are outside this change
unless already supported.

Locked Media

Locked media should feel intentional rather than broken.

Suggested structure:

LockedMedia
├── visual obscured or neutral preview area
├── lock indicator
├── required tier
├── concise access explanation
└── WhatsApp and Discord actions

Security rules:

never render a hidden protected URL into CSS;
never use a real premium image as a browser blur when unauthorized;
do not rely on filter: blur() over a delivered protected asset;
consume only safe locked metadata.

A generated generic visual, neutral gradient or safe public placeholder may be
used.

Contact Actions

Use the public contact actions already returned by the backend.

Do not hardcode artist contact information.

External links should use safe behavior such as appropriate rel attributes.

Locked-media wording should not claim that payment occurs inside the platform.

Feed Pagination

Review the current pagination response.

Preferred public interaction:

“Load more” button; or
incremental automatic loading with an explicit fallback.

A Load More control is simpler, predictable and accessible.

Infinite scrolling may be used only if:

browser-history behavior remains acceptable;
focus is not lost;
retry is possible;
end state is clear.

Do not fetch all posts at once.

Feed State Management

The Feed should maintain:

initialLoading
initialError
posts
nextCursor or nextPage
loadingMore
loadMoreError
hasMore

Loading another page must not remove existing posts.

Avoid duplicate posts when retrying.

Media URL Expiration

Presigned URLs may expire.

The frontend should not indefinitely cache failed URLs as permanent errors.

When a media URL expires:

controlled retry or post refresh may be offered;
the Feed should remain stable;
authorization should be re-evaluated by the backend.

Do not manually construct MinIO URLs in the frontend.

Performance

Apply:

image lazy loading;
video metadata loading;
stable aspect-ratio boxes;
component memoization only where measured or clearly useful;
incremental Feed loading;
minimal gallery-local state;
no eager downloading of locked media.

Avoid premature complex virtualization unless the Feed is already large enough
to require it.

Accessibility

Required:

semantic headings;
meaningful image alt text where available;
decorative images use empty alt;
accessible gallery buttons;
keyboard lightbox;
visible focus;
locked state announced in text;
no access state communicated only by blur or color;
reduced-motion behavior;
adequate target sizes.
Editing Controls

When ARTIST or SUPER_ADMIN views the public Feed, optional management actions may
appear discreetly:

edit profile;
edit post;
create post.

These controls must not dominate the public presentation.

Do not expose them to subscribers or visitors.

Error Boundaries

A failure in one media item must not break:

the post;
other post media;
the Feed;
the artist hero.

Use local media error states.

The existing page-level ErrorState remains for complete Feed failure.

Backend Impact

First inspect existing Feed and media responses.

Only modify backend contracts where necessary to provide:

ordered media;
safe aspect ratio;
safe poster metadata;
viewer-aware URLs;
pagination.

Do not add protected URL data to locked responses.

Do not redesign access authorization.

Database Impact

No migration is expected.

Only consider a migration if the media records lack data strictly necessary for
stable presentation, such as deterministic ordering.

Prefer deriving aspectRatio from existing width and height.

Do not add fields solely for CSS convenience.

Testing Strategy
Component

Test:

artist hero complete and fallback states;
contact actions;
text-only post;
single image;
multiple images;
mixed gallery;
video;
locked media;
loading;
media failure;
Load More behavior;
lightbox open and close.
Role and access

Test:

visitor;
Free subscriber;
sufficient-tier subscriber;
expired subscriber;
ARTIST;
SUPER_ADMIN.
Responsive

Validate:

narrow mobile;
common mobile;
tablet;
laptop;
large desktop;
landscape mobile;
short viewport with lightbox.
Security

Inspect locked payload and DOM:

no protected URL;
no hidden background image;
no video source;
no downloadable premium URL.
Final Branding Boundary

This change should make the public experience polished.

However, a final small branding change may later refine:

exact color values;
final typography;
final labels and microcopy;
logo;
favicon;
final artist-specific identity.

Do not block the public experience waiting for final branding decisions.

Open Questions

No product question should block implementation.

When selecting a visual or technical option:

use the current design tokens;
prioritize content;
prioritize mobile;
preserve media security;
avoid unnecessary dependencies;
preserve current backend behavior;
document material decisions.
