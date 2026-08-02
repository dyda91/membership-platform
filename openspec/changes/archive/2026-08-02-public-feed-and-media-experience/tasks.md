## 1. Public Feed Audit

- [x] 1.1 Review the current Feed page, FeedPostCard and artist-profile header
- [x] 1.2 Review the Feed API response and pagination metadata
- [x] 1.3 Review authorized and locked media response shapes
- [x] 1.4 Review media ordering, dimensions, type and poster metadata
- [x] 1.5 Review current image and video rendering behavior
- [x] 1.6 Review current locked-content security in payload and DOM
- [x] 1.7 Review existing loading, error and empty states
- [x] 1.8 Review current public experience on mobile, tablet and desktop
- [x] 1.9 Record the selected gallery, lightbox and incremental-loading approach
- [x] 1.10 Document any required backend contract adjustment before implementation

## 2. Public Feed Data Types

- [x] 2.1 Consolidate typed artist public-profile data
- [x] 2.2 Consolidate typed Feed post data
- [x] 2.3 Consolidate authorized media presentation data
- [x] 2.4 Consolidate locked-media presentation data
- [x] 2.5 Represent image dimensions and aspect ratio safely
- [x] 2.6 Represent video poster or thumbnail metadata safely
- [x] 2.7 Represent pagination or cursor metadata
- [x] 2.8 Prevent frontend types from requiring protected URLs for locked media
- [x] 2.9 Add type-level or service tests where practical

## 3. Backend Feed Contract Review

- [x] 3.1 Verify published posts are ordered newest first
- [x] 3.2 Verify deterministic media ordering
- [x] 3.3 Verify safe image dimensions or aspect ratio are returned
- [x] 3.4 Verify safe video poster metadata behavior
- [x] 3.5 Verify authorized presigned URLs are viewer-aware
- [x] 3.6 Verify locked responses omit protected URLs
- [x] 3.7 Verify Feed pagination supports incremental loading
- [x] 3.8 Make only minimal required backend contract corrections
- [x] 3.9 Add backend regression tests for any changed response behavior
- [x] 3.10 Confirm no new business authorization rule was introduced

## 4. Public Artist Hero

- [x] 4.1 Refactor the public artist header into a dedicated hero component
- [x] 4.2 Create a responsive banner region
- [x] 4.3 Preserve banner aspect ratio and object positioning
- [x] 4.4 Position the avatar in relation to the banner
- [x] 4.5 Display artist name with clear hierarchy
- [x] 4.6 Display biography and presentation text
- [x] 4.7 Hide empty optional profile fields cleanly
- [x] 4.8 Add intentional avatar and banner fallbacks
- [x] 4.9 Keep artist-management actions discreet and role-restricted
- [x] 4.10 Add hero component tests

## 5. Public Contact Actions

- [x] 5.1 Refactor artist contact actions using shared Button primitives
- [x] 5.2 Render WhatsApp only when enabled and valid
- [x] 5.3 Render Discord only when enabled and valid
- [x] 5.4 Add safe external-link attributes
- [x] 5.5 Ensure contact actions stack or wrap correctly on mobile
- [x] 5.6 Add accessible names and visible focus states
- [x] 5.7 Add contact-action tests

## 6. Feed Layout

- [x] 6.1 Apply a content-focused Feed container
- [x] 6.2 Align artist hero and Feed content coherently
- [x] 6.3 Control excessive empty space on large screens
- [x] 6.4 Remove horizontal overflow on narrow screens
- [x] 6.5 Keep a readable post width
- [x] 6.6 Preserve the root route and existing route behavior
- [x] 6.7 Add Feed layout tests where practical

## 7. Feed Post Card

- [x] 7.1 Redesign FeedPostCard using shared visual primitives
- [x] 7.2 Create or refine PostHeader
- [x] 7.3 Display artist avatar and identity compactly
- [x] 7.4 Display publication metadata without overpowering content
- [x] 7.5 Refine post text typography and spacing
- [x] 7.6 Preserve line breaks and safe text rendering
- [x] 7.7 Add optional long-text expansion if justified
- [x] 7.8 Integrate the media area without excessive nested borders
- [x] 7.9 Keep management actions role-restricted and discreet
- [x] 7.10 Add text-only and media-post tests

## 8. Media Gallery Foundation

- [x] 8.1 Create or refactor PostMediaGallery
- [x] 8.2 Preserve backend media order
- [x] 8.3 Add deterministic fallback ordering
- [x] 8.4 Manage active media state per post
- [x] 8.5 Support single-media presentation
- [x] 8.6 Support multiple-media presentation
- [x] 8.7 Support mixed image and video media
- [x] 8.8 Add visible current-position metadata
- [x] 8.9 Avoid unnecessary Feed-wide rerenders
- [x] 8.10 Add gallery foundation tests

## 9. Gallery Navigation

- [x] 9.1 Add previous and next gallery actions
- [x] 9.2 Disable unavailable navigation actions correctly
- [x] 9.3 Add keyboard navigation where appropriate
- [x] 9.4 Add touch-friendly mobile interaction
- [x] 9.5 Add swipe or scroll-snap behavior only if reliable
- [x] 9.6 Keep visible navigation available when touch navigation exists
- [x] 9.7 Add accessible labels
- [x] 9.8 Respect reduced-motion preferences
- [x] 9.9 Add gallery-navigation tests

## 10. Image Media

- [x] 10.1 Create or refine the authorized image component
- [x] 10.2 Preserve image aspect ratio
- [x] 10.3 Add stable aspect-ratio placeholders
- [x] 10.4 Add lazy loading
- [x] 10.5 Add appropriate responsive sizes behavior
- [x] 10.6 Handle portrait and landscape images
- [x] 10.7 Add controlled image error state
- [x] 10.8 Ensure image failure does not break the post
- [x] 10.9 Add image component tests

## 11. Image Lightbox

- [x] 11.1 Create a media lightbox using the existing Dialog foundation
- [x] 11.2 Open authorized images from the Feed
- [x] 11.3 Prevent locked media from opening
- [x] 11.4 Add close control
- [x] 11.5 Add Escape dismissal
- [x] 11.6 Add previous and next controls for multiple images
- [x] 11.7 Display gallery position
- [x] 11.8 Ensure controls fit mobile and short viewports
- [x] 11.9 Preserve focus and body-scroll behavior
- [x] 11.10 Add lightbox tests

## 12. Video Media

- [x] 12.1 Create or refine the authorized video component
- [x] 12.2 Use native responsive video controls unless an existing player is justified
- [x] 12.3 Avoid automatic unmuted playback
- [x] 12.4 Configure safe preload behavior
- [x] 12.5 Display poster or safe fallback
- [x] 12.6 Preserve video aspect ratio
- [x] 12.7 Add loading presentation
- [x] 12.8 Add playback error state
- [x] 12.9 Ensure mobile controls remain usable
- [x] 12.10 Add video component tests

## 13. Locked Media Redesign

- [x] 13.1 Refactor LockedMedia into a polished content state
- [x] 13.2 Display a clear lock indicator
- [x] 13.3 Display the required tier
- [x] 13.4 Display a concise access explanation
- [x] 13.5 Preserve public post text outside the locked media area
- [x] 13.6 Use only safe visual placeholders
- [x] 13.7 Confirm no protected URL is rendered in attributes or CSS
- [x] 13.8 Handle expired, revoked and insufficient access consistently
- [x] 13.9 Add locked-media tests for all access states

## 14. Locked Contact Actions

- [x] 14.1 Add valid WhatsApp action to LockedMedia when enabled
- [x] 14.2 Add valid Discord action to LockedMedia when enabled
- [x] 14.3 Support both contact channels
- [x] 14.4 Add controlled state when no contact channel exists
- [x] 14.5 Avoid payment or checkout wording
- [x] 14.6 Preserve external-link safety
- [x] 14.7 Add contact-state tests

## 15. Feed Initial States

- [x] 15.1 Create a stable initial Feed skeleton
- [x] 15.2 Create an artist-profile hero skeleton
- [x] 15.3 Preserve the page structure during loading
- [x] 15.4 Improve the no-posts empty state
- [x] 15.5 Improve complete Feed failure behavior
- [x] 15.6 Preserve public Login and Register access during controlled failures
- [x] 15.7 Add initial-state tests

## 16. Incremental Feed Loading

- [x] 16.1 Review current page or cursor pagination behavior
- [x] 16.2 Implement Load More or an equally accessible incremental pattern
- [x] 16.3 Append new posts without clearing existing posts
- [x] 16.4 Prevent duplicate post insertion
- [x] 16.5 Add separate loading-more state
- [x] 16.6 Add next-page failure and retry state
- [x] 16.7 Add end-of-Feed behavior
- [x] 16.8 Preserve authentication and access context between pages
- [x] 16.9 Add incremental-loading tests

## 17. Media URL Recovery

- [x] 17.1 Review current behavior when a presigned media URL expires
- [x] 17.2 Avoid permanently caching an expired URL failure
- [x] 17.3 Add safe retry or post-refresh behavior
- [x] 17.4 Re-evaluate authorization through the backend on retry
- [x] 17.5 Never reconstruct MinIO URLs in the frontend
- [x] 17.6 Add URL-recovery tests where practical

## 18. Performance Review

- [x] 18.1 Verify image lazy loading
- [x] 18.2 Verify stable aspect-ratio reservation
- [x] 18.3 Verify videos do not preload full content unnecessarily
- [x] 18.4 Verify locked posts download no protected media
- [x] 18.5 Verify additional Feed pages are fetched incrementally
- [x] 18.6 Review unnecessary rerenders in galleries
- [x] 18.7 Review media component memoization only where useful
- [x] 18.8 Fix change-related layout shifts and obvious performance issues

## 19. Responsive Public Experience

- [x] 19.1 Validate artist hero at narrow mobile width
- [x] 19.2 Validate Feed cards at narrow mobile width
- [x] 19.3 Validate gallery at common mobile width
- [x] 19.4 Validate lightbox in portrait mobile
- [x] 19.5 Validate lightbox in landscape mobile
- [x] 19.6 Validate video controls on mobile
- [x] 19.7 Validate tablet layout
- [x] 19.8 Validate laptop layout
- [x] 19.9 Validate large desktop layout
- [x] 19.10 Fix overflow, clipping and unusable touch targets

## 20. Accessibility Review

- [x] 20.1 Verify public heading hierarchy
- [x] 20.2 Verify artist images use appropriate alt behavior
- [x] 20.3 Verify gallery buttons have accessible names
- [x] 20.4 Verify gallery keyboard interaction
- [x] 20.5 Verify lightbox focus and dismissal
- [x] 20.6 Verify locked-state text is understandable
- [x] 20.7 Verify required tier is not communicated only by color
- [x] 20.8 Verify visible focus
- [x] 20.9 Verify reduced-motion behavior
- [x] 20.10 Fix change-related accessibility issues

## 21. Authorization and Security Regression

- [x] 21.1 Verify visitor sees public posts
- [x] 21.2 Verify visitor receives no premium media URL
- [x] 21.3 Verify Free subscriber access
- [x] 21.4 Verify sufficient active-tier subscriber access
- [x] 21.5 Verify insufficient-tier locked state
- [x] 21.6 Verify expired subscriber locked state
- [x] 21.7 Verify revoked subscriber locked state
- [x] 21.8 Verify ARTIST sees all media
- [x] 21.9 Verify SUPER_ADMIN sees all media
- [x] 21.10 Inspect locked payload and DOM for protected URLs

## 22. Functional Regression

- [x] 22.1 Verify public Feed route
- [x] 22.2 Verify artist profile data
- [x] 22.3 Verify WhatsApp and Discord
- [x] 22.4 Verify Login and Register navigation
- [x] 22.5 Verify subscriber tier and validity badge
- [x] 22.6 Verify artist management navigation
- [x] 22.7 Verify Edit Post navigation from authorized controls
- [x] 22.8 Verify media upload remains functional
- [x] 22.9 Verify image and video posts created before this change
- [x] 22.10 Verify Logout and session cleanup

## 23. Quality Validation

- [x] 23.1 Run frontend tests and fix change-related failures
- [x] 23.2 Run frontend lint and fix new errors
- [x] 23.3 Run frontend production build
- [x] 23.4 Run backend tests
- [x] 23.5 Run backend lint
- [x] 23.6 Run backend production build
- [x] 23.7 Run Prisma validate
- [x] 23.8 Confirm no unnecessary migration was created
- [x] 23.9 Review dependencies and remove unnecessary additions
- [x] 23.10 Review final diff for unrelated changes
- [x] 23.11 Verify no secrets were added
- [x] 23.12 Fix regressions within scope

## 24. OpenSpec Completion

- [x] 24.1 Update checkboxes only after implementation and verification
- [x] 24.2 Run `openspec validate public-feed-and-media-experience`
- [x] 24.3 Produce a final implementation report
- [x] 24.4 Document visual direction, components, backend adjustments, security checks, responsive checks and remaining limitations
