# Design: Admin Interface and Form Polish

## Context

The platform already provides:

- a responsive visual foundation;
- reusable UI primitives;
- role-aware desktop and mobile navigation;
- public creator-profile hero;
- public Feed cards;
- image gallery and lightbox;
- video presentation;
- locked-content presentation;
- public contact actions;
- user management;
- server-side search, filters and pagination;
- role and tier separation;
- manual access validity;
- renewals and revocations;
- access history;
- post management;
- tier management;
- artist-profile management.

The remaining visual work is concentrated in the operational administration
area used by ARTIST and SUPER_ADMIN.

## Goals

- Improve the artist's daily operational workflows.
- Make administrative information easier to scan.
- Make role, tier and access concepts difficult to confuse.
- Improve mobile administration.
- Improve forms without changing backend rules.
- Reuse the current design system.
- Add operational summaries without introducing advanced analytics.
- Preserve public Feed behavior.

## Non-Goals

- Financial analytics
- Revenue reports
- Automated notifications
- New business rules
- Final branding
- A new public Feed redesign
- Full rich-text editor
- Full media-processing pipeline
- Complex drag-and-drop framework without need

## Administrative Information Architecture

Suggested navigation remains:

```text
Dashboard
Posts
Users
Tiers
Public Profile

System-only functions remain restricted to SUPER_ADMIN.

The navigation model created in the visual foundation should be reused.

Dashboard Design

The Dashboard should be operational rather than decorative.

Suggested sections:

DashboardPage
├── SummaryCards
│   ├── Visible members
│   ├── Published posts
│   ├── Active access
│   └── Expiring or expired access
├── QuickActions
│   ├── Create Post
│   ├── Manage Members
│   ├── Edit Public Profile
│   └── Manage Tiers
├── AccessOverview
└── RecentOperationalActivity, only if current data supports it safely

Do not invent revenue, follower or engagement values.

Dashboard Backend Strategy

First inspect existing APIs.

Prefer deriving summary data from:

existing users endpoints;
existing posts endpoints;
existing tiers endpoints;
existing access-status queries.

If requesting all records merely to calculate totals is inefficient, add one
small aggregation endpoint.

Suggested route if required:

GET /dashboard/summary

Safe response may include:

visibleUsers
publishedPosts
draftPosts
archivedPosts
tiers
activeAccess
expiringSoonAccess
expiredAccess
permanentAccess
scheduledAccess

The endpoint must:

exclude hidden/system users;
use current effective-access rules;
remain restricted to ARTIST and SUPER_ADMIN;
avoid exposing private account data.
Summary Cards

Use shared Card and Badge primitives.

Cards should include:

concise label;
value;
optional explanatory text;
optional direct action.

Do not use large charts solely for decoration.

Simple compact distributions may be used only when they improve understanding.

Users Page Architecture

Suggested structure:

UsersAdminPage
├── PageHeader
├── UserQueryControls
│   ├── Search
│   ├── Tier
│   ├── AccountStatus
│   ├── AccessStatus
│   └── Role, where permitted
├── ActiveFilterSummary
├── UsersDesktopTable
├── UsersMobileCards
├── Pagination
└── ManageUserDialog

Desktop and mobile may use different presentations while sharing data and
actions.

User Row or Card

Display:

avatar or fallback;
name;
email;
role;
tier;
account status;
access status;
expiration or permanent state;
primary Manage Access action;
secondary permitted actions.

Avoid showing every possible action at once.

Use menus or grouped actions where appropriate.

Concept Separation

The management UI should use four labeled sections:

Identity
Account
Role
Access
Account
account status;
basic administrative account controls.
Role
SUBSCRIBER or ARTIST;
assignment controls only where permitted.
Access
tier;
start;
expiration;
permanent;
effective status;
renew;
revoke;
history.

This prevents role and tier confusion.

Manage Access Interface

Use either:

a large Dialog with internal scrolling; or
a dedicated page.

Choose based on current code complexity.

A dedicated page may be preferable if the existing dialog has become too dense.

The interface should contain:

Member summary
Current access summary
Tier selector
Start date
Expiration date
Permanent toggle
Internal note
Save or Grant
Renew
Revoke
History

Use the existing backend operations.

Do not merge role updates into access requests.

Dates

Continue using existing UTC and local-display rules.

Clearly indicate whether an entered date includes the whole selected day.

Do not change established expiration semantics.

Renewal

The renewal workflow should display:

current tier;
current status;
current expiration;
proposed expiration;
optional note;
result summary.

Quick duration actions such as 7, 30 or 90 days may be included as conveniences
if they do not change the underlying date rules.

Revocation

Use ConfirmDialog.

The description should explain:

premium access is removed;
account remains active;
public/Free access remains;
history is preserved.

Internal reason remains optional.

Access History

Suggested presentation:

AccessHistoryTimeline
└── Event
    ├── action
    ├── timestamp
    ├── actor
    ├── previous state
    ├── new state
    └── internal note

Use readable labels instead of raw enum values.

Preserve exact timestamps in tooltip or secondary text when useful.

Posts Administration

Suggested structure:

PostsAdminPage
├── PageHeader with Create Post
├── Status Filters
├── PostsList
│   └── PostAdminCard
│       ├── media preview
│       ├── text preview
│       ├── status
│       ├── required tier
│       ├── dates
│       └── actions
└── Pagination, if currently supported or required

A card-based list may work better than a wide table because posts contain media.

Post Status

Use shared Badge variants for:

DRAFT;
PUBLISHED;
ARCHIVED.

Do not represent status only by color.

Post Actions

Possible actions:

Edit;
Publish;
Archive;
Restore, if supported;
Delete, if supported;
Open in public Feed, when published.

Only show actions currently supported by backend behavior.

Post Authoring

Suggested page:

PostEditorPage
├── PostTextSection
├── MediaUploadSection
├── MediaOrderSection
├── AccessSection
│   ├── Public or Tier
│   └── Selected tier summary
├── PublicationSection
├── Preview
└── Sticky or responsive ActionBar

Posts remain titleless.

Upload Experience

Reuse current upload service.

Improve presentation with:

file queue;
filename;
type;
local or server preview;
upload state;
success;
failure;
remove;
retry where supported.

Avoid claiming percentage progress if the API client does not expose real
progress.

A generic processing state is better than fake progress.

Media Ordering

First confirm the existing Media model and endpoint support persisted ordering.

If supported:

allow drag-and-drop or explicit move controls;
persist order;
show the first item as primary preview.

If not supported:

do not add an interface that suggests persistence;
use simpler existing order;
document a future media-order change.

Prefer small pointer/keyboard-safe controls over adding a large drag framework.

Post Preview

Reuse the public FeedPostCard in a non-interactive preview mode where possible.

Preview must:

use draft form state;
show text;
show media previews;
show selected tier;
not publish;
not generate unauthorized backend access.
Unsaved Changes

Implement a reusable dirty-form strategy.

Possible scope:

New Post;
Edit Post;
Artist Profile.

Use:

route blocker if supported by the router;
browser beforeunload as fallback for page close;
no warning after successful save.

Avoid blocking navigation when no meaningful change exists.

Tiers Page

Suggested structure:

TiersPage
├── PageHeader
├── TierExplanation
├── TierList
│   └── TierCard
│       ├── name
│       ├── description
│       ├── priority
│       ├── usage
│       └── actions
└── TierFormDialog

Explain cumulative priority:

A member can access content assigned to their own tier and every lower-priority
tier.

Do not imply that numeric priority is a price.

Tier Usage

If current APIs can safely provide usage, display:

current users or assignments;
posts;
history references where useful.

If adding full counts would require expensive queries, provide conflict details
only when deletion is attempted.

Tier Deletion

When backend returns a conflict, translate it into a clear message such as:

This tier cannot be deleted because it is used by members, posts or access
history.

Do not expose raw database constraint names.

Artist Profile Management

Suggested sections:

PublicIdentitySection
ProfileMediaSection
BiographySection
ContactSection
PreviewSection

Display current avatar and banner.

Allow safe replacement through existing endpoints.

Show enabled state separately from contact value.

Use public hero preview where possible.

Responsive Administration

At narrow widths:

replace wide user tables with cards or controlled row expansion;
stack filters;
make action bars sticky only when they do not cover content;
allow dialogs to scroll internally;
preserve 44 px or similar touch targets;
avoid hidden horizontal primary actions.

Desktop should remain information-dense but readable.

Shared Administrative Components

Potential components:

DashboardSummaryCard
QuickActionCard
AdminFilterBar
ActiveFilterChips
ResponsiveDataTable
MobileAdminCard
AccessStatusSummary
ManageAccessForm
AccessHistoryTimeline
PostAdminCard
PostMediaQueue
PostPreviewDialog
UnsavedChangesDialog
TierAdminCard
ArtistProfilePreview

Create only components with actual reuse or clear domain purpose.

Accessibility

Administrative accessibility requirements:

labels;
field descriptions;
status text;
keyboard filter operation;
dialog focus;
confirmation clarity;
accessible menus;
no icon-only action without accessible name;
table headings;
mobile-card semantic grouping;
error association;
visible focus.
Backend Impact

Avoid backend redesign.

Only add small endpoints or fields where current UI cannot obtain operational
data efficiently.

Potential changes:

Dashboard summary;
tier usage summary;
safe post preview metadata;
clearer conflict responses.

All changes require tests.

Testing Strategy
Dashboard
summaries;
loading;
partial errors;
role access;
hidden SUPER_ADMIN exclusion;
shortcuts.
Users
desktop;
mobile;
search;
filters;
pagination;
concept separation;
grants;
updates;
renewals;
revocations;
history.
Posts
list;
status;
media preview;
text-only;
upload;
upload failure;
preview;
unsaved changes;
mobile.
Tiers
create;
edit;
priority explanation;
usage;
deletion conflict;
mobile.
Artist Profile
sections;
current images;
upload;
contacts;
preview;
unsaved changes.
Branding Boundary

Use existing design tokens and current wording conventions.

Final decisions about:

exact colors;
logo;
platform name;
typography;
tone of voice;
final button labels;
final access messaging;

remain for final-branding-and-microcopy.

Open Questions

No product question should block implementation.

When choosing an implementation:

preserve business rules;
reuse shared components;
optimize artist workflow;
prioritize mobile usability;
avoid fake metrics or fake progress;
avoid unnecessary dependencies;
document material decisions.
