# Design: Account Registration and Artist Page

## Context

The application currently provides:

- NestJS backend
- React and TypeScript frontend
- PostgreSQL through Prisma
- JWT authentication
- User management
- Role-based authorization
- Tier management
- Post and media management
- MinIO storage
- Public and authenticated feed
- Cumulative tier-based content access
- Hidden SUPER_ADMIN behavior
- ARTIST and SUPER_ADMIN administration interfaces

The platform is designed for exactly one active artist.

Payment and tier acquisition occur outside the platform through direct contact
with the artist. The platform therefore needs public registration, a safe
initial administrator bootstrap, controlled artist assignment and an editable
public artist identity integrated with the main Feed.

## Goals

- Add safe public subscriber registration.
- Prevent public privilege assignment.
- Bootstrap the initial hidden SUPER_ADMIN without hardcoded credentials.
- Enforce exactly zero or one active ARTIST account.
- Allow SUPER_ADMIN to assign or replace the artist.
- Provide one public artist profile.
- Allow ARTIST to control public profile content.
- Integrate profile information with the home Feed.
- Provide WhatsApp and Discord contact actions.
- Reuse the existing MinIO and media infrastructure.
- Preserve existing role, tier and feed behavior.
- Keep visual work functional rather than final.

## Non-Goals

- Integrated payments
- Automatic subscription state
- Automatic tier expiration
- Payment records
- Multiple artists
- Final visual identity
- Advanced image processing
- E-mail verification unless already supported
- Password recovery
- Content interactions

## Domain Model

The application has three account roles:

- SUPER_ADMIN
- ARTIST
- SUBSCRIBER

Roles remain independent from subscription tiers.

### SUPER_ADMIN

- Bootstrapped securely
- Hidden from ordinary user management
- Used for system recovery and privileged management
- Can assign or replace the active artist
- Can edit the artist's public profile
- Is not expected to be used for daily content management

### ARTIST

- Exactly one active ARTIST may exist
- Manages posts, users and tiers
- Assigns tiers manually after external contact
- Edits the public artist profile
- Cannot assign ARTIST or SUPER_ADMIN
- Cannot see or modify SUPER_ADMIN

### SUBSCRIBER

- Created through public registration
- Views the Feed
- Accesses content according to tier
- Edits only their own basic profile
- Cannot assign role or tier

## Registration Architecture

The current authentication module should be extended rather than duplicated.

Suggested public endpoint:

- `POST /auth/register`

The server-controlled registration DTO should accept only fields such as:

- name
- email
- password

The exact fields should follow existing User requirements.

The public DTO must not accept:

- roles
- role
- tierId
- status
- isHidden
- isSystem
- artist-profile properties
- administrative properties

The service must assign:

- role: SUBSCRIBER
- default server-defined status
- no privileged tier

The email must be normalized according to the existing authentication
convention.

Passwords must use the existing hashing implementation.

Registration should reuse existing duplicate-email and password validation
behavior.

The frontend registration form should provide:

- name
- email
- password
- password confirmation

Password confirmation is a frontend validation field and should not be persisted.

After successful registration, the implementation may:

- authenticate automatically using the existing login response format; or
- redirect to Login.

The existing architecture should determine the least disruptive approach.

In either case, the authenticated destination is the Feed.

## Registration Security

Backend allowlist DTOs are the primary protection.

The implementation must not depend on hiding frontend inputs.

Unknown or privileged properties should be stripped or rejected according to
the project's validation-pipe configuration.

Registration should return controlled errors and avoid exposing sensitive
account information.

Existing rate-limiting infrastructure should be reused if available.

Introducing a major new anti-abuse service is outside the change.

## SUPER_ADMIN Bootstrap

The platform must never ship with a hardcoded default password.

The preferred implementation is an idempotent bootstrap service or explicit
bootstrap command driven by environment configuration.

Suggested environment variables:

- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- optionally `SUPER_ADMIN_NAME`
- optionally `SUPER_ADMIN_BOOTSTRAP_ENABLED`

The implementation must:

1. validate the configured credentials;
2. search for an existing SUPER_ADMIN or designated system account;
3. create one only when none exists;
4. hash the password through the existing authentication service;
5. mark the account hidden/system using the current schema;
6. never log the password;
7. never overwrite an existing password during ordinary startup;
8. never create duplicate SUPER_ADMIN accounts.

If automatic startup bootstrap fits the existing NestJS architecture, it may
run during application initialization only when explicitly enabled.

Otherwise, an idempotent application command such as a package script may be
used.

The selected approach must be documented in the implementation report.

The `.env.example` may document variable names but must not contain real
credentials.

## Single Artist Enforcement

The system must allow a maximum of one active artist.

Enforcement must occur in the backend service and inside a database transaction.

The implementation should inspect the current role representation before
choosing a database-level constraint.

If the current schema safely supports a PostgreSQL constraint or unique active
artist reference, it may be added.

Otherwise, the service must:

1. start a transaction;
2. verify no other active ARTIST exists;
3. update the selected account;
4. verify the resulting state;
5. commit atomically.

Frontend validation is not sufficient.

## Artist Assignment

Only SUPER_ADMIN can assign ARTIST.

Suggested administrative operations:

- promote eligible account to ARTIST;
- replace active artist;
- optionally remove artist designation when preparing replacement.

The user interface should make the replacement action explicit.

It should not silently assign a second artist.

Eligible artist targets must not be:

- SUPER_ADMIN
- hidden/system accounts
- deleted accounts
- ineligible inactive accounts, according to current account-status rules

## Artist Replacement

Artist replacement should be an atomic backend operation.

Suggested behavior:

1. SUPER_ADMIN selects an eligible replacement account;
2. frontend shows an explicit confirmation;
3. backend validates the actor and target;
4. previous artist is downgraded to SUBSCRIBER or deactivated according to the
   selected implementation;
5. replacement receives ARTIST;
6. existing public artist-profile association is transferred or preserved
   according to the chosen data model;
7. transaction commits with exactly one active ARTIST.

Preferred product behavior:

- preserve the public page configuration when replacing the account;
- associate platform branding with a singleton public artist page;
- associate management ownership with the currently active ARTIST.

This avoids deleting the public page when the artist login account changes.

## Artist Public Profile Model

Because the platform has one artist page, a singleton profile model is
preferred over creating one independent public profile per arbitrary user.

Suggested conceptual model:

```text
ArtistProfile

id
artistUserId
displayName
bio
presentationText
avatarMediaId
bannerMediaId
whatsappValue
whatsappEnabled
discordUrl
discordEnabled
contactButtonText
createdAt
updatedAt

The exact schema should reuse existing Artist or Profile models where possible.

The model must have at most one active record used by the platform.

The active artist account controls the record through artistUserId or another
explicit association.

Avatar and Banner Storage

Artist avatar and banner should reuse MinIO and the existing media-storage
service.

Do not create a separate unrelated storage implementation.

The implementation should support:

image MIME validation;
configurable size limits;
safe generated storage keys;
metadata persistence;
replacement of profile media;
controlled fallback when an object is missing.

Old media cleanup should follow current storage conventions.

If automatic cleanup is unsafe, the old object may remain temporarily and the
limitation should be documented rather than deleting data incorrectly.

Public Artist Data API

The Feed needs public artist information without requiring authentication.

Suggested endpoint:

GET /artist-profile/public

Or artist data may be included in the existing Feed response if that better
matches the current architecture.

Public response fields may include:

display name
biography
presentation text
avatar presentation URL
banner presentation URL
enabled contact actions
safe external contact URLs

It must not include:

private account email
user-management metadata
role-assignment metadata
hidden flags
storage keys not intended for the browser
SUPER_ADMIN information
Artist Profile Management API

Suggested endpoints:

GET /artist-profile/manage
PATCH /artist-profile
POST /artist-profile/avatar
POST /artist-profile/banner
optionally DELETE /artist-profile/avatar
optionally DELETE /artist-profile/banner

Permissions:

ARTIST
SUPER_ADMIN

The ARTIST must be the active artist when modifying the artist profile.

SUPER_ADMIN may modify it for recovery or administration.

DTOs must use explicit field allowlists.

Contact Configuration

WhatsApp configuration may be stored as a normalized telephone value or a
validated wa.me-compatible URL.

The backend should generate or validate a safe external URL.

Discord should accept a validated HTTPS Discord invite or profile/contact URL
according to the selected product behavior.

Each contact channel has an independent enabled flag.

A configured value does not need to be displayed when the channel is disabled.

Suggested public contact representation:

contactActions: [
  {
    type: "WHATSAPP",
    label: "Falar pelo WhatsApp",
    url: "..."
  },
  {
    type: "DISCORD",
    label: "Entrar em contato pelo Discord",
    url: "..."
  }
]

Only enabled and valid actions should be returned.

Locked Content Contact Integration

The current LockedMedia or restricted-content component should receive safe
public contact actions.

When content is locked:

maintain the tier requirement message;
display available artist contact actions;
do not create a payment screen;
do not create a plan-management page;
do not automatically assign access;
never expose protected media URLs.

The user contacts the artist externally.

The artist later assigns the appropriate tier through existing user management.

Feed Integration

The root route remains the Feed.

The page structure becomes conceptually:

FeedPage
├── ArtistHeader
│   ├── ArtistBanner
│   ├── ArtistAvatar
│   ├── ArtistIdentity
│   ├── ArtistBiography
│   └── ArtistContactActions
└── FeedList
    └── FeedPostCard[]

The artist header should be rendered for:

visitors
subscribers
artist
super administrator

Role-specific administration controls may be shown separately to ARTIST and
SUPER_ADMIN.

No-Artist State

The platform may temporarily exist without an active artist during setup.

Public behavior:

show a controlled “profile being configured” state;
do not crash;
optionally hide empty contact actions;
keep Login and registration available according to current routing decisions.

SUPER_ADMIN behavior:

allow access to the artist-assignment workflow;
make the missing artist state clearly visible;
allow selection of an eligible account.
Frontend Routes

Suggested routes:

/ — public and authenticated Feed
/register — public registration
/login — Login
/profile — own member profile
/dashboard — ARTIST and SUPER_ADMIN
/artist-profile/edit — ARTIST and SUPER_ADMIN
/system/artist or an existing user-management route — SUPER_ADMIN artist
assignment/replacement

The actual route names should follow existing project conventions.

Frontend Components

Suggested components:

RegisterPage
RegisterForm
ArtistHeader
ArtistBanner
ArtistAvatar
ArtistContactActions
ArtistProfileEditPage
ArtistProfileForm
ArtistAvatarUploader
ArtistBannerUploader
ArtistAssignmentPanel
ArtistReplacementDialog
NoArtistConfiguredState

Reuse existing form, upload, error and loading components whenever possible.

Authorization Matrix
Capability	Visitor	Subscriber	Artist	Super Admin
Register account	Yes	No need	No need	No need
View public artist page	Yes	Yes	Yes	Yes
View Feed	Yes	Yes	Yes	Yes
Edit own basic profile	No	Yes	Yes	Yes
Edit artist public profile	No	No	Active artist	Yes
Upload artist avatar/banner	No	No	Active artist	Yes
Assign member tiers	No	No	Yes	Yes
Assign ARTIST role	No	No	No	Yes
Replace active artist	No	No	No	Yes
View SUPER_ADMIN account	No	No	No	Internal only
Migration Strategy

Before creating a migration, inspect existing:

User model
roles representation
Artist model
Profile model
Media model
post and storage relations

Prefer extending existing models.

A migration may be required to:

create or extend ArtistProfile;
add singleton or active-profile constraints;
add avatar/banner references;
add contact fields;
add active artist association.

Migration rules:

preserve users;
preserve posts;
preserve tiers;
preserve media;
do not reset the database;
use nullable fields for safe introduction;
populate safe defaults when needed;
regenerate Prisma Client;
validate migration status.
Validation and Error Handling

The backend must validate:

unique email;
password policy;
registration allowlist;
privileged role restrictions;
single active artist;
eligible replacement account;
avatar/banner MIME type;
avatar/banner size;
WhatsApp configuration;
Discord configuration;
active artist ownership for edits.

The frontend must show controlled states for:

duplicate email;
invalid registration;
upload failure;
artist-profile load failure;
missing active artist;
missing profile media;
invalid contact values;
artist replacement conflict.
Testing Strategy

Backend tests should cover:

successful registration;
duplicate email;
invalid password;
ignored or rejected role injection;
ignored or rejected tier injection;
SUPER_ADMIN bootstrap creation;
bootstrap idempotency;
no hardcoded bootstrap credentials;
first artist assignment;
rejection of a second active artist;
controlled artist replacement;
subscriber artist-assignment denial;
artist profile public response;
artist profile authorization;
contact validation;
avatar and banner upload;
no-artist state.

Frontend tests should cover:

registration form;
registration errors;
post-registration destination;
artist header;
avatar and banner fallbacks;
contact buttons;
disabled contact channels;
artist-profile editing;
SUPER_ADMIN artist assignment;
replacement confirmation;
no-artist setup state;
locked-content contact actions.

Integration testing should include:

creating a real subscriber account;
promoting it to ARTIST through SUPER_ADMIN;
uploading avatar and banner through MinIO;
editing the artist profile;
rendering the profile above the Feed;
rendering WhatsApp and Discord actions;
confirming a second artist cannot be created.
Visual Design Boundary

New interfaces should use:

existing Tailwind conventions;
existing spacing and form patterns;
existing buttons;
existing cards;
existing responsive layout conventions.

This change should not introduce a final brand identity.

A later visual-design-and-responsive-experience change will address:

final color palette;
final typography;
advanced mobile layout;
feed card refinement;
animations;
polished media galleries;
final locked-content presentation;
complete accessibility and visual review.
Open Questions

No unresolved product question should block implementation.

For technical details not explicitly specified:

preserve existing behavior;
reuse existing architecture;
prefer safe and reversible changes;
preserve existing data;
document the selected decision in the final report.