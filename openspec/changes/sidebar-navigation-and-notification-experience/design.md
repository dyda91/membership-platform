# Design: Sidebar Navigation and Notification Experience

## Context

The application currently uses a horizontal authenticated header containing:

- Feed;
- Dashboard;
- Posts;
- Users;
- Tiers;
- artist public page;
- artist configuration;
- Profile;
- Messages;
- tier summary;
- account email;
- Logout.

This structure worked when the platform contained fewer pages, but it has become
visually dense and difficult to scale.

The application already has:

- shared visual tokens;
- reusable buttons, badges, cards, dialogs and fields;
- role-aware navigation;
- responsive application shell;
- member-to-artist messaging;
- shared unread-message state;
- public creator profile;
- administrative pages;
- account security;
- mobile navigation foundations.

## Goals

- Replace desktop top navigation with a scalable sidebar.
- Improve route hierarchy and visual emphasis.
- Make Messages and unread state visible everywhere.
- Make tier or role context more prominent.
- Improve navigation for ARTIST and SUPER_ADMIN.
- Keep SUBSCRIBER navigation simple.
- Preserve mobile usability.
- Preserve all existing route guards and business rules.
- Reuse the current visual system.
- Avoid a pixel-perfect third-party clone.

## Non-Goals

- New routes
- New authorization rules
- New notification backend
- Push notifications
- Final branding
- Complete dark mode
- User-configurable menu ordering
- Full page redesign
- Changes to messaging persistence

## Inspiration Boundary

The desktop experience may be structurally inspired by social platforms such as
X/Twitter:

- left navigation rail;
- icon and label items;
- prominent active route;
- account block near the bottom;
- central content column;
- notification badge.

The implementation must not copy:

- third-party branding;
- logo;
- exact icons;
- exact colors;
- exact dimensions;
- exact wording;
- source code;
- proprietary assets;
- pixel-level composition.

Use the platform's existing tokens and component conventions.

## Application Shell Architecture

Recommended structure:

```text
ApplicationRoot
├── PublicShell
│   ├── PublicHeader
│   └── PublicContent
└── AuthenticatedShell
    ├── DesktopSidebar
    ├── CompactSidebar
    ├── MobileNavigation
    └── MainContent

The authenticated shell should be mounted around protected and authenticated
routes.

Avoid mounting and unmounting the sidebar for every nested page.

Desktop Layout

Suggested desktop grid:

sidebar width: expanded approximately 240–280 px
content: minmax(0, 1fr)
optional right utility region: not required

Exact dimensions should follow content and existing design tokens rather than
copying another product.

The sidebar should be:

fixed or sticky;
full viewport height;
independently structured;
visually separated from the content;
scroll-safe when navigation exceeds available height.

The page content must use:

min-width: 0

or equivalent safeguards to prevent overflow.

Sidebar Sections

Suggested expanded hierarchy:

Brand / Artist identity

Primary
- Feed
- Messages

Management
- Dashboard
- Posts
- Users
- Tiers

Artist
- Public artist page
- Configure artist

Account
- Profile
- Security

Bottom account card
- Avatar
- Name or email
- Tier or role
- Access validity when relevant
- Account menu

Only render groups containing permitted destinations.

For SUBSCRIBER:

Brand
- Feed
- Messages

Account
- Profile
- Security

Bottom account card

Do not show empty Management or Artist headings.

Navigation Model

Continue using a centralized navigation definition.

Suggested model:

NavigationItem {
  id
  label
  path
  icon
  match
  capability
  group
  badge
  mobilePriority
}

Do not place role checks independently throughout multiple components.

Create a single function or hook:

getNavigationForUser(currentUser)

or reuse the existing equivalent.

Desktop, compact and mobile navigation must consume the same underlying model.

Icons

Prefer an existing icon dependency if already installed.

If no icon library exists, choose one small, maintained and tree-shakeable
library.

Do not:

copy X/Twitter icons;
use emoji as the final navigation icons;
combine several icon libraries;
use icons without accessible labels.

Potential semantic icons:

Home or Feed;
Messages;
Dashboard;
Posts;
Users;
Tiers;
Public profile;
Settings;
User profile;
Security;
Logout;
Collapse/Expand.

Exact icons may follow the available library.

Expanded Sidebar Item

Suggested composition:

NavItem
├── Icon
├── Label
└── Optional Badge

States:

default;
hover;
focus;
active;
disabled, only when genuinely unavailable.

The active item should have:

background or surface distinction;
stronger foreground;
icon emphasis;
semantic aria-current="page".

Avoid using only a thin color difference.

Compact Sidebar

Use at intermediate viewport widths if appropriate.

Composition:

Icon
Optional unread dot/count
Tooltip on hover/focus
Accessible label

The account section may reduce to avatar and a menu.

The compact sidebar must not remove routes.

Manual collapse may be supported, but responsive automatic behavior is the
priority.

If manual state is persisted, use a non-sensitive local preference such as:

sidebarCollapsed

Do not store private account information in that preference.

Account Card

For SUBSCRIBER:

Avatar
Display name or email
Tier badge
Validity summary

Examples:

Gold
Válido até 15/09/2026
Silver
Acesso permanente
Gratuito
Gold expirado

For ARTIST:

Avatar
Display name
Artista
Gerenciamento da plataforma

For SUPER_ADMIN:

Avatar
Display name or email
Super Admin
Administração do sistema

Do not present a fabricated tier for ARTIST or SUPER_ADMIN.

Account Menu

Activating the account card may open:

Profile;
Account Security;
public artist configuration where appropriate;
Logout.

Use the existing menu/dialog/dropdown primitives when possible.

Logout must:

call the existing logout flow;
disconnect messaging socket;
clear unread state;
clear user caches;
clear authentication token.
Unread State Integration

The sidebar must consume the existing global unread source.

Recommended:

MessagingUnreadProvider

or existing equivalent.

It should expose:

unreadCount
refreshUnreadCount()
setUnreadCount()
incrementUnread()
clearUnread()

The sidebar must not independently fetch and maintain a conflicting second
counter.

Unread updates come from:

initial authenticated load;
messaging socket events;
mark-read success;
reconnect refresh;
account switch;
logout.
Badge Presentation

Use the shared Badge or a specialized navigation badge.

Expanded:

Messages                         5

Compact:

message icon + count/dot

Accessibility:

Mensagens, 5 não lidas

Large count:

99+

Zero count:

hide badge;
retain normal Messages label.
Notification Emphasis

Messages should receive more prominence than ordinary secondary routes because
they require timely attention.

However:

do not flash aggressively;
do not animate continuously;
do not play sound;
respect reduced motion;
do not make unread Messages appear like an application error.

A subtle count badge and stronger unread state are sufficient.

Tier Emphasis

Tier should be emphasized in the account card, not treated as another primary
navigation route.

Use:

badge;
tier name;
validity text;
access status.

Do not show tier-management navigation to SUBSCRIBER.

For ARTIST and SUPER_ADMIN, emphasize role instead.

Mobile Strategy

A large desktop sidebar should not be forced onto mobile.

Recommended approach:

Primary bottom navigation

For SUBSCRIBER:

Feed;
Messages;
Profile.

For ARTIST:

Feed;
Messages;
Dashboard;
More.

For SUPER_ADMIN:

Feed;
Messages;
Dashboard;
More.

More opens a drawer containing the remaining permitted destinations.

Alternative: one mobile top bar plus drawer, if the current shell integrates
more safely.

Choose the approach that best reuses current components.

The Messages badge must appear in the mobile primary navigation.

Mobile Safe Areas

When using bottom navigation:

account for mobile safe-area inset;
add content bottom padding;
keep the message composer above the navigation and virtual keyboard;
avoid covering buttons at the end of pages.

Use CSS such as environment safe-area values when supported.

Public Layout

Unauthenticated users should continue using a lighter public header.

Do not show the full authenticated sidebar before login.

Public header may contain:

platform identity;
Login;
Register.

The public artist profile and Feed remain centered.

Feed Alignment

With the sidebar visible, center the Feed in the remaining content region, not
the full browser viewport.

Use the existing narrow/content container.

Avoid placing the Feed directly against the sidebar.

Administration Alignment

Dashboard, Users, Posts and Tiers use the existing wide container within the
remaining layout.

Tables and cards must continue to handle responsive width.

Do not reduce the administrative page to an unnecessarily narrow center column.

Route Matching

Support parent-active state.

Examples:

/posts
/posts/new
/posts/:id/edit

should activate Posts.

/profile
/profile/security

may activate Profile or Security according to the selected navigation model.

Use route-aware matching instead of exact string comparison only.

Accessibility

Required:

semantic <nav>;
navigation label;
logical list structure;
visible focus;
aria-current;
accessible icon buttons;
tooltip available by keyboard;
unread count announced;
collapse control named;
account menu keyboard support;
mobile menu focus behavior;
reduced motion.

Do not rely only on tooltip for the accessible name.

Responsive Breakpoints

Use content-driven breakpoints consistent with existing Tailwind configuration.

Conceptually:

mobile: mobile navigation;
tablet/small laptop: compact sidebar or drawer;
desktop: expanded sidebar.

Avoid building around one exact screen size.

Validate around:

320 px;
375 px;
768 px;
1024 px;
1280 px;
1440 px and larger.
Sidebar Scrolling

The sidebar may have three vertical regions:

Top identity
Middle navigation, scrollable
Bottom account card

Ensure the account card remains available when practical.

On short viewports, the entire sidebar may scroll safely.

Do not hide Logout below an unreachable region.

Visual Tokens

Reuse existing:

background;
surface;
surface-muted;
foreground;
foreground-muted;
primary;
border;
focus;
badge/status variants.

Do not make final branding decisions in this change.

Exact color tuning remains for:

final-branding-and-microcopy
Testing Strategy
Navigation model

Test destinations for:

visitor;
SUBSCRIBER;
ARTIST;
SUPER_ADMIN.
Desktop

Test:

expanded sidebar;
compact sidebar;
active routes;
nested routes;
unread badge;
account card;
account menu;
logout.
Mobile

Test:

primary destinations;
More drawer;
unread badge;
navigation changes;
safe bottom spacing;
message composer compatibility.
Regression

Test:

Feed;
Messages;
Dashboard;
Posts;
Users;
Tiers;
artist profile;
Profile;
Account Security;
logout;
role boundaries;
hidden SUPER_ADMIN;
unread clearing.
Backend and Database

No backend or database change is expected.

If unread synchronization reveals a remaining messaging bug, apply the smallest
safe correction and document it.

Do not create a migration for layout or navigation.

Open Questions

No product question should block implementation.

When selecting details:

prioritize clear navigation;
prioritize Messages visibility;
preserve permissions;
preserve mobile usability;
reuse shared state and visual primitives;
avoid third-party copying;
avoid unnecessary dependencies;
document material decisions.
