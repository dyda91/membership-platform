# Proposal: Role Access and Session Sync

## Why

The platform allows SUPER_ADMIN to promote a subscriber account to ARTIST, but
the promoted account does not immediately receive the correct administrative
navigation and route access.

The current authentication state may continue using stale roles stored in the
JWT or frontend session, even after the database role has changed.

The application needs a consistent session-refresh strategy so current roles,
tier, status and permissions are always synchronized between the database,
backend authorization and frontend interface.

## What Changes

- Add or consolidate an authenticated current-user endpoint.
- Use the database as the authoritative source for current role, tier and status.
- Refresh frontend session data after login and application reload.
- Ensure promoted ARTIST accounts receive correct administrative access.
- Ensure downgraded accounts lose administrative access.
- Synchronize menu visibility with current backend session data.
- Synchronize frontend route guards with current roles.
- Preserve backend guards as the final authorization boundary.
- Define ARTIST and SUPER_ADMIN bypass rules for tier-restricted content.
- Preserve cumulative tier access for SUBSCRIBER accounts.
- Handle inactive or blocked accounts consistently.
- Add tests for role promotion, role downgrade and stale-session behavior.

## Goals

- Ensure a promoted ARTIST receives Dashboard, Posts, Users and Tiers access.
- Ensure role changes are reflected after session refresh or reauthentication.
- Prevent stale frontend state from granting or denying incorrect access.
- Centralize current-user session information.
- Keep frontend and backend authorization behavior consistent.
- Make role and tier behavior explicit and testable.

## Non Goals

This change will not implement:

- Payments
- Automatic billing
- Tier expiration
- Final visual redesign
- New role types
- Multiple active artists
- Password recovery
- E-mail verification
- OAuth login

## Impact

### Backend

- Authentication session endpoint
- JWT validation behavior
- User lookup during authenticated requests
- Role and tier authorization helpers
- Account-status validation
- Automated authorization tests

### Frontend

- Authentication state initialization
- Session refresh after login and reload
- Role-aware navigation
- Role-aware route guards
- Handling of changed or revoked permissions
- Redirect behavior

### Database

No schema change is expected.

A migration should only be created if the current session strategy requires a
new token-version or session-revision field.
