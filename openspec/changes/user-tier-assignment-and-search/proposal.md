# Proposal: User Tier Assignment and Search

## Why

The platform already supports users, roles, tiers, role-aware navigation and
manual tier-based content access.

However, the current user-management interface displays role selection where
tier selection is expected, preventing ARTIST and SUPER_ADMIN users from
assigning existing tiers such as Free, Silver and Gold to members.

The user-management page also lacks server-side search, filtering and pagination,
which will make it difficult to manage members as the platform grows.

This change separates role management from tier management, adds a reliable
member-access workflow and introduces scalable user discovery.

## What Changes

- Separate user role selection from subscription tier selection.
- Load tier options from the existing tier API.
- Allow ARTIST and SUPER_ADMIN to assign tiers to eligible members.
- Keep ARTIST role assignment restricted to SUPER_ADMIN.
- Never expose SUPER_ADMIN as a selectable role or visible user.
- Prevent SUBSCRIBER users from assigning roles or tiers.
- Add search by user name or email.
- Add filters by tier, account status and role where permitted.
- Add server-side pagination.
- Persist tier assignments through the existing user-management backend.
- Refresh user details and lists after a successful tier assignment.
- Refresh the current user's session when their own tier changes.
- Ensure the feed unlocks the assigned tier and all lower-priority tiers.
- Add controlled loading, empty, validation and error states.
- Preserve existing hidden SUPER_ADMIN behavior and the single-active-artist
  constraint.

## Goals

- Allow the artist to assign Free, Silver, Gold or future tiers to members.
- Make role and tier concepts visibly and technically distinct.
- Prevent accidental role changes during tier management.
- Make user management scalable for a larger number of accounts.
- Ensure tier changes are immediately reflected in user administration and
  content access.
- Reuse the existing User, Tier, authentication and feed architecture.

## Non Goals

This change will not implement:

- Automatic payments
- Automatic tier expiration
- Tier billing
- Tier purchase checkout
- E-mail notifications
- User deletion redesign
- Final visual design
- Advanced analytics
- Bulk tier assignment
- CSV import or export

## Impact

### Backend

- User list query parameters
- User search, filters and pagination
- Tier-assignment endpoint or user-update behavior
- Role-assignment authorization
- Tier-assignment authorization
- User response DTOs
- Automated tests

### Frontend

- User search and filter controls
- Paginated user table or list
- Separate role and tier fields
- Tier selector loaded from the API
- Updated user-management form
- Updated user details and access-management workflow
- Session refresh after own-account tier changes

### Database

No schema change is expected.

A migration should only be introduced if the current user-to-tier relationship
cannot support the required assignment behavior.
