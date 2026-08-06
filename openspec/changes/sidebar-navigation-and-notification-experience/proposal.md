# Proposal: Sidebar Navigation and Notification Experience

## Why

The platform has grown from a small application into a complete creator
platform containing a public Feed, messaging, Dashboard, Posts, Users, Tiers,
artist-profile configuration and member account pages.

The current horizontal header presents too many navigation items in one row.
Administrative and public destinations compete for attention, the user identity
has limited space, and important information such as unread messages, current
tier and role is not sufficiently prominent.

The application needs a scalable navigation structure that remains clear as the
product grows. A desktop sidebar inspired by modern social platforms provides
more space for icons, labels, unread indicators, account context and
role-specific destinations while preserving a focused central content area.

## What Changes

- Replace the primary desktop horizontal navigation with a left sidebar.
- Keep the visual inspiration structural and avoid copying any third-party
  branding or interface exactly.
- Add icons to primary navigation destinations.
- Add clear active-route highlighting.
- Add a real-time unread-message badge to the Messages item.
- Keep the unread indicator visible from every authenticated page.
- Display the current account identity in a dedicated sidebar account area.
- Display the member's current effective tier and validity summary.
- Display ARTIST and SUPER_ADMIN role context where tier is not the primary
  account identity.
- Group public, account and administrative destinations clearly.
- Preserve role-aware navigation.
- Preserve existing route guards and backend authorization.
- Add a collapsible or compact sidebar state for intermediate desktop widths.
- Add an appropriate mobile navigation strategy.
- Improve mobile access to Feed, Messages, Profile and permitted management
  pages.
- Preserve the public unauthenticated layout.
- Preserve all current messaging, Feed, administration and account behavior.
- Add accessible navigation labels, landmarks, focus states and badges.
- Improve content-container alignment with the new sidebar.
- Prevent the sidebar from reducing Feed readability or causing horizontal
  overflow.
- Preserve support for long names and email addresses.
- Add responsive and regression tests.

## Goals

- Make the growing navigation easier to understand.
- Give Messages and unread notifications appropriate prominence.
- Make the current route immediately recognizable.
- Make tier, access validity and role context more visible.
- Improve daily navigation for ARTIST and SUPER_ADMIN.
- Keep the member experience simple.
- Improve scalability for future routes.
- Preserve the current design system and business behavior.
- Provide a layout that works well on desktop, tablet and mobile.

## Non Goals

This change will not implement:

- A new messaging backend
- New unread-count business rules
- Push notifications
- Browser notifications
- E-mail notifications
- New roles
- New tiers
- A new Feed redesign
- A redesign of individual administrative forms
- Final colors, logo or typography
- A pixel-perfect copy of X, Twitter or another platform
- User-customizable sidebar layouts
- Drag-and-drop menu ordering
- Multiple themes
- A complete dark-mode implementation

## Impact

### Frontend

- Application shell
- Header
- Desktop sidebar
- Compact sidebar
- Mobile navigation
- Navigation model
- Unread-message provider integration
- User identity and tier presentation
- Route-aware active states
- Content containers
- Responsive layout
- Accessibility
- Frontend tests

### Backend

No backend change is expected.

Backend changes are only permitted if a small correction is strictly required
for an existing unread-count or current-account response.

### Database

No database migration is expected.

