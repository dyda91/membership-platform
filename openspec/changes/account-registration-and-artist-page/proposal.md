# Proposal: Account Registration and Artist Page

## Why

The platform already supports authentication, role-based administration,
subscription tiers, content management and a viewer-aware content feed.

However, visitors still need a public account-registration flow, the initial
SUPER_ADMIN account needs a safe and repeatable bootstrap process, and the
single artist operating the platform needs a public identity integrated with
the home feed.

Because this platform is designed for exactly one active artist, the system must
explicitly enforce that constraint while allowing the hidden SUPER_ADMIN to
promote or replace the artist account when necessary.

The artist also needs to manage the public information displayed above the feed,
including name, avatar, banner, biography and external contact options such as
WhatsApp and Discord.

## What Changes

- Add public account registration.
- Ensure every public registration creates a SUBSCRIBER account.
- Prevent public requests from assigning roles, tiers, account status or system
  privileges.
- Provide an idempotent bootstrap process for the initial SUPER_ADMIN account.
- Keep the bootstrapped SUPER_ADMIN hidden from normal platform interfaces.
- Allow SUPER_ADMIN to promote an eligible account to ARTIST.
- Enforce a maximum of one active ARTIST account.
- Allow SUPER_ADMIN to replace the active artist through an explicit controlled
  workflow.
- Associate the public artist page with the single active ARTIST account.
- Allow ARTIST and SUPER_ADMIN to edit the artist's public page information.
- Display the artist's public information at the top of the home feed.
- Support artist avatar and banner media.
- Support artist name, biography and optional presentation text.
- Support configurable WhatsApp and Discord contact buttons.
- Allow contact channels to be enabled or disabled independently.
- Display contact actions on the public feed and locked-content experience.
- Provide a controlled empty state when no artist has been configured.
- Preserve the feed as the main public page.
- Keep the implementation visually consistent with the current interface
  without introducing the final visual identity.

## Goals

- Allow visitors to create their own accounts safely.
- Ensure public registration never creates privileged users.
- Make initial platform administration predictable and repeatable.
- Enforce the single-artist business rule.
- Allow the artist to control the public identity shown on the platform.
- Make WhatsApp and Discord the external contact channels for acquiring access.
- Integrate the artist identity directly with the main feed.
- Prepare the platform for later manual access-validity and visual-design
  changes.

## Non Goals

This change will not implement:

- Integrated payments
- Subscription checkout
- Payment webhooks
- Automatic billing
- Automatic tier assignment after payment
- E-mail verification, unless already supported by the current authentication
  architecture
- Password recovery
- Multiple active artists
- Artist discovery
- Multiple artist pages
- Comments
- Likes
- Direct messages
- Final branding and visual design
- Final mobile visual refinement
- Advanced image editing
- Automatic tier expiration
- Administrative payment records

## Impact

### Backend

- Public registration behavior
- Registration DTO security
- Initial SUPER_ADMIN bootstrap
- Artist promotion and replacement rules
- Single-active-artist enforcement
- Artist public-profile endpoints
- Avatar and banner media handling
- Contact-channel validation
- Feed integration with artist-profile data

### Frontend

- Public registration page
- Registration form and validation
- Artist setup and editing interface
- Artist header above the feed
- Avatar and banner display
- WhatsApp and Discord actions
- Controlled state when no artist exists
- Role-aware artist-management access

### Database

Existing User, Role, Media and Artist/Profile models should be reused whenever
possible.

A migration should only be introduced when the current schema cannot represent:

- the single artist's public profile;
- avatar and banner references;
- external contact settings;
- active artist association;
- or other required artist-page metadata.

Existing data must be preserved.
