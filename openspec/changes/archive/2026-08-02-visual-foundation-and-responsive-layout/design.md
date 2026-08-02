# Design: Visual Foundation and Responsive Layout

## Context

The application already provides the complete core product workflow:

- public registration;
- login and database-backed session;
- Feed as the root page;
- one active ARTIST;
- hidden SUPER_ADMIN;
- role-aware navigation;
- posts with images and videos;
- MinIO media delivery;
- cumulative tier access;
- manual tier granting, renewal and revocation;
- access validity and history;
- user search, filters and pagination;
- artist public profile and contact actions.

The visual interface was built incrementally while these capabilities were being
implemented. It therefore needs a shared design foundation before individual
areas receive detailed refinement.

## Change Segmentation

The final visual work is divided into three changes.

### Change 1: Visual Foundation and Responsive Layout

Current change:

- design tokens;
- shared UI primitives;
- global layout;
- navigation;
- responsiveness;
- form and state conventions;
- accessibility foundation.

### Change 2: Public Feed and Media Experience

Future change:

- artist header refinement;
- Feed post cards;
- media gallery;
- image viewer;
- video presentation;
- locked content;
- public profile polish;
- incremental Feed loading.

### Change 3: Admin Interface and Form Polish

Future change:

- Dashboard;
- Users;
- tier access;
- Posts editor;
- Tiers;
- history panels;
- administrative tables and filters.

This segmentation reduces regression risk and prevents one visual change from
rewriting the entire frontend at once.

## Goals

- Introduce reusable frontend visual primitives.
- Define clear conventions for application layout.
- Improve responsive behavior.
- Preserve role-based navigation.
- Improve consistency and accessibility.
- Reduce duplicated page-specific styling.
- Avoid changing backend contracts unnecessarily.
- Prepare all pages for later domain-specific polish.

## Non-Goals

- Final Feed card layout
- Advanced gallery behavior
- Advanced video controls
- New business rules
- New backend endpoints
- Full dark-mode implementation
- Fully customizable artist themes
- Final marketing copy

## Visual Direction

The interface should feel:

- modern;
- content-focused;
- clean;
- discreet;
- visually appropriate for an exclusive creator platform;
- comfortable on mobile;
- simple enough for the artist to administer daily.

The visual system should avoid looking like a generic enterprise dashboard in
the public area.

The administration area may use denser information layouts while still sharing
the same typography, colors and primitives.

## Design Tokens

Prefer CSS custom properties exposed through Tailwind or a consistent Tailwind
theme extension.

Suggested semantic groups:

```text
background
surface
surface-muted
foreground
foreground-muted
border
primary
primary-foreground
secondary
success
warning
danger
focus

Do not scatter arbitrary colors across components.

Exact values should be selected after reviewing the existing application and
ensuring readable contrast.

Typography

Define conventions for:

application identity;
page title;
section title;
card title;
body text;
secondary text;
form labels;
captions;
badges.

Prefer the current available font stack unless an open web font is deliberately
introduced through a safe project dependency.

Avoid introducing many font families.

Spacing and Layout

Create a consistent spacing scale using Tailwind conventions.

Recommended page structure:

AppShell
├── Header
├── MobileNavigation
└── Main
    └── PageContainer
        ├── PageHeader
        └── PageContent

Suggested reusable layout components:

AppShell
PageContainer
PageHeader
PageSection
Stack
Inline
ResponsiveGrid

Do not create abstractions that merely wrap one Tailwind class without reuse.

Page Widths

Public Feed content and administration tables have different ideal widths.

Suggested concepts:

narrow reading/content container;
standard page container;
wide administration container.

Pages should select an explicit container variant rather than define arbitrary
maximum widths independently.

Header

The desktop header should contain:

platform or artist identity;
role-aware primary navigation;
authenticated user identity;
tier/access badge where applicable;
Logout;
mobile-navigation trigger on narrow screens.

Avoid allowing the user email and navigation to collide at intermediate widths.

Mobile Navigation

Use a drawer, sheet or controlled overlay appropriate to current dependencies.

It must:

preserve role-aware destinations;
provide a visible close action;
support Escape where applicable;
prevent background interaction while modal;
close after destination selection;
restore focus predictably when practical.

Avoid duplicating navigation definitions between desktop and mobile.

Both should consume one shared navigation model.

Navigation Model

Create a shared navigation definition derived from current capabilities.

Conceptually:

navigationItems(currentUser)

Each item may include:

label;
destination;
capability requirement;
optional icon;
public/authenticated state.

Do not use visual refactoring to weaken existing route guards.

Shared UI Primitives

Review current components before introducing new ones.

Likely reusable primitives:

Button
IconButton
Input
Textarea
Select
Checkbox
Field
FormMessage
Badge
Card
Alert
Dialog
ConfirmDialog
Spinner
Skeleton
EmptyState
ErrorState
PageHeader
SectionHeader
Avatar

Use composition rather than creating many domain-specific variants in the
foundation layer.

Buttons

Suggested variants:

primary;
secondary;
ghost;
outline;
danger;
link.

Suggested sizes:

small;
medium;
large;
icon.

All variants need:

disabled state;
focus state;
loading behavior;
adequate touch target.
Forms

Create a shared field structure:

Field
├── Label
├── Control
├── Help text
└── Validation message

Native inputs should remain usable and semantically correct.

Do not replace native controls with complex custom widgets without need.

Date and time controls used by access validity must remain understandable on
mobile.

Badges

Badge variants should support:

role;
tier;
ACTIVE;
EXPIRING_SOON;
EXPIRED;
PERMANENT;
SCHEDULED;
REVOKED;
account status.

Color cannot be the only differentiator.

Text labels remain required.

Cards and Surfaces

Use a restrained hierarchy.

Suggested levels:

application background;
primary surface;
muted or nested surface;
overlay/dialog.

Avoid combining thick border, large shadow and strong background change on every
element.

Loading States

Use:

button spinner for mutations;
page or section skeleton for initial queries;
compact spinner for small controls.

Avoid replacing the entire application with a spinner during normal navigation.

Session initialization remains a special protected state.

Empty States

An empty state should contain:

concise title;
helpful explanation;
optional relevant action.

Examples:

no posts yet;
no users match filters;
no access history;
no tiers configured.

Domain-specific copy can remain in the domain page while using a shared
EmptyState.

Error States

Separate:

page-load failure;
section failure;
form validation;
mutation failure;
media failure.

Do not show raw backend stack traces.

Provide retry only when the operation is safely repeatable.

Feedback Strategy

Review whether the project already has a toast system.

If not, introduce a lightweight reusable feedback mechanism only if justified.

Feedback categories:

success;
error;
warning;
information.

Dialogs should not be replaced by toasts when explicit confirmation is needed.

Responsive Strategy

Review at minimum:

approximately 320–375 px mobile widths;
common larger mobile widths;
tablet widths;
laptop widths;
large desktop widths.

Responsive rules should be content-driven rather than tied to one device.

Important behaviors:

form actions stack on narrow screens;
table overflow is controlled;
navigation collapses;
page padding reduces;
dialogs fit viewport height;
touch targets remain usable;
long email addresses do not break the header.
Administrative Tables

This change should provide only the shared responsive foundation.

Detailed table redesign remains in the later administrative visual change.

At minimum:

tables must not break the page;
horizontal overflow should be contained;
primary actions should remain reachable;
mobile fallback can be prepared but does not need final domain-specific card
layouts yet.
Accessibility

Foundation requirements:

semantic buttons and links;
visible keyboard focus;
labels associated with controls;
accessible names for icon buttons;
dialog title and description;
keyboard dismissal where appropriate;
readable color contrast;
no state communicated by color alone;
reasonable heading hierarchy;
respect reduced motion for any newly introduced animation.

A complete formal accessibility audit remains future work, but obvious issues
must be corrected.

Animation

Use restrained transitions for:

navigation drawer;
dialog appearance;
button and hover feedback;
state transitions.

Do not add animation that delays operations or hides content.

Respect prefers-reduced-motion.

Existing Pages Integration

Apply the foundation to at least:

Feed shell;
Login;
Register;
Profile;
Dashboard;
Posts list;
New/Edit Post;
Users;
Tiers;
Artist profile management.

Detailed page-specific redesign is not required, but these pages must use the
new layout and primitives where applicable.

Dependency Strategy

Before installing a UI library, review existing dependencies.

Prefer:

existing Tailwind;
existing React components;
small focused accessibility utilities where genuinely needed.

Do not replace the application with a large component framework.

Any new dependency must have a clear purpose and be listed in the final report.

Testing Strategy
Component tests

Test:

button variants and disabled/loading state;
field error presentation;
badge labels;
dialog open/close;
mobile navigation;
role-aware navigation;
empty/error/loading states.
Responsive validation

Validate manually or through browser automation:

mobile Feed shell;
mobile Login and Register;
mobile Users page;
mobile post editor;
desktop navigation;
intermediate-width header;
dialogs on short viewports.
Regression

Verify:

role visibility;
route guards;
tier badge;
access expiration;
post creation;
tier management;
user management;
Logout;
SUPER_ADMIN invisibility.
Backend and Database

No backend or database change is expected.

If frontend assumptions reveal inconsistent existing data, do not redesign the
backend within this change unless required for correctness.

Document unrelated findings for a future change.

Open Questions

No product question should block implementation.

When choosing visual details:

prioritize readability;
prioritize mobile usability;
reuse tokens and primitives;
preserve current functionality;
avoid excessive dependencies;
document meaningful choices.
