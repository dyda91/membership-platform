# Design: Role Access and Session Sync

## Context

The application currently uses JWT authentication, role-based backend guards,
role-aware frontend navigation and cumulative tier access.

A SUPER_ADMIN can promote a subscriber account to ARTIST.

However, a promoted account may continue using stale role information stored in
the existing JWT or frontend authentication state.

This creates an inconsistent state where:

- the database contains ARTIST;
- the frontend still identifies the user as SUBSCRIBER;
- administrative menus remain hidden;
- frontend route guards deny access;
- tier access may still work because backend content authorization uses current
  database information or role-specific bypass rules.

This change centralizes current-session state and ensures all authorization
layers use current account data consistently.

## Goals

- Establish a single current-user session contract.
- Use database-backed account data for role, tier and status.
- Keep JWT focused on identity and token validity.
- Ensure promotion and downgrade changes are reflected.
- Keep frontend navigation and route guards synchronized.
- Preserve backend authorization as the security boundary.
- Make ARTIST and SUPER_ADMIN tier bypass explicit.
- Prevent inactive accounts from continuing authenticated use.

## Non-Goals

- OAuth
- Refresh-token redesign unless required by the current architecture
- Full server-side session storage
- Distributed token revocation
- New roles
- New tier types
- Final UI redesign
- Payments or subscriptions

## Current Problem Model

The likely current flow is:

```text
Login
→ JWT created with roles
→ frontend stores token and role data
→ administrator changes role in database
→ stored JWT and frontend state remain unchanged
→ navigation and routes continue using stale role

The target flow is:

Login
→ token identifies account
→ frontend requests current session
→ backend loads current account from database
→ session returns current roles, tier and status
→ frontend derives navigation and route access from current session
Source of Truth

The database is the source of truth for:

roles
tier
account status
hidden/system state
current artist state

The JWT may include role claims for compatibility, but authorization-sensitive
operations must not rely exclusively on role claims that can become stale.

At minimum, authenticated authorization must load or verify the current user
record before granting privileged access.

Current Session Endpoint

A current-user endpoint should exist or be consolidated.

Suggested route:

GET /auth/me

Alternative existing route names may be reused if already established.

The response should contain only safe session data:

id
name
email
roles
status
tier
avatar
isArtist
permissions or capability flags when already part of project conventions

The response must not expose:

password hash
bootstrap data
hidden system metadata unnecessary to the client
secret configuration
SUPER_ADMIN internals beyond the current account's own permitted session state
JWT Strategy

Preferred strategy:

JWT sub identifies the account.
Authentication guard verifies signature and expiration.
The backend loads the current account from the database.
Current roles, tier and status are attached to the request.
Role guards evaluate the database-backed current user.

This means an old token cannot preserve removed ARTIST permissions.

If the existing Passport JWT strategy already loads the User record, refine it
rather than duplicating the lookup.

If it currently trusts only serialized claims, update it to resolve the current
account.

Request User Shape

Use one consistent authenticated request-user structure.

Conceptually:

AuthenticatedUser

id
email
roles
status
tierId
tierPriority
isSystem
isHidden

Controllers, role guards, tier access helpers and /auth/me should derive from
the same resolved current-account data.

Avoid separate incompatible user shapes between:

JWT strategy
role guard
tier guard
controllers
feed access service
Account Status Enforcement

During authenticated resolution:

account not found: unauthorized;
inactive account: forbidden or unauthorized according to current conventions;
blocked/suspended account: deny;
active account: continue.

The same behavior should apply to all authenticated endpoints.

Role Authorization

Role guards must evaluate current database roles.

Administrative access:

ARTIST: Dashboard, Posts, Users, Tiers and artist profile;
SUPER_ADMIN: all permitted administration and system operations;
SUBSCRIBER: no administrative pages or endpoints.

The existing hidden SUPER_ADMIN rules remain unchanged.

Tier Authorization

Tier access remains cumulative for SUBSCRIBER.

The access service should apply:

public post: allow;
ARTIST: allow;
SUPER_ADMIN: allow;
unauthenticated viewer: deny protected media;
SUBSCRIBER with sufficient priority: allow;
otherwise deny.

ARTIST and SUPER_ADMIN do not need assigned subscription tiers to review
content.

Frontend Authentication State

The frontend authentication store or context should contain:

token
currentUser
isLoading
isAuthenticated
sessionError

currentUser comes from the backend session endpoint.

Do not derive the authoritative role only from:

decoded JWT;
login response cached indefinitely;
localStorage user object;
manually assigned menu state.

The token may remain in localStorage if that is the existing architecture, but
current authorization data must be refreshed from the backend.

Application Initialization

On application startup:

read stored token;
if no token, render public state;
if token exists, request /auth/me;
if successful, store current user;
if token is invalid or account inactive, clear authentication;
if temporary network error occurs, show controlled state and do not grant
administrative access.

The route tree should wait for session initialization before making protected
access decisions.

This avoids redirecting a valid ARTIST before their session has loaded.

Login Flow

On successful login:

store token;
call the current-session endpoint;
store database-backed current user;
render the Feed;
show role-aware navigation.

The login response may still include user information, but /auth/me remains
the authoritative state.

Logout Flow

On logout:

clear token;
clear current user;
clear role and tier caches;
invalidate pending session requests if needed;
redirect to Feed or Login according to current navigation.
Session Refresh Behavior

A full automatic real-time role update is not required.

The role change must be reflected when:

the user logs in;
the application reloads;
/auth/me is refreshed;
the user returns to the tab if an existing session-refresh mechanism exists;
an administrative mutation explicitly triggers session invalidation for the
current user where applicable.

At minimum, reload and reauthentication must work reliably.

An optional refreshSession() frontend method may be exposed.

Promotion Flow

When SUPER_ADMIN promotes a subscriber:

backend commits the current role change;
the promoted account receives ARTIST on next session refresh;
no frontend hardcoded account mapping is used;
administrative navigation derives from the returned role;
backend endpoints authorize based on current database role.

If the promoted account is logged in during promotion, reloading the page must
be sufficient.

Downgrade Flow

When ARTIST is downgraded:

backend updates current role;
old token may remain signed but no longer grants ARTIST privileges;
next protected backend request resolves current database role and denies;
next session refresh removes ARTIST navigation;
if the user is currently on an admin route, frontend redirects to Feed.
Frontend Permissions

Navigation and route guards should use shared helpers.

Suggested helpers:

hasRole(currentUser, role)
canAccessDashboard(currentUser)
canManagePosts(currentUser)
canManageUsers(currentUser)
canManageTiers(currentUser)

Avoid duplicating role arrays in multiple components.

Prefer a central permission map or capability functions.

Route Guards

Protected route components should distinguish:

session loading;
unauthenticated;
authenticated but unauthorized;
authorized.

Conceptual behavior:

loading → render loading state
unauthenticated → redirect to Login or Feed
unauthorized → redirect to Feed
authorized → render route

Do not redirect while session initialization is still loading.

Navigation Synchronization

The application menu should use currentUser.roles.

After refreshSession():

role additions appear;
removed roles disappear;
tier badge updates;
admin links recalculate;
no full browser reset should be required beyond ordinary reload.
API Error Handling

The API client may centrally handle:

401: clear invalid session and token;
inactive/blocked-account response: clear session and show controlled message;
403: preserve login but deny the specific action.

Avoid treating every 403 as logout.

Caching

Do not cache /auth/me indefinitely.

If a query library is used, set behavior so:

startup fetch occurs;
invalidation is available;
stale role data is not retained across account changes;
logout clears cache.
Schema Changes

No schema change is expected.

A tokenVersion or sessionVersion field should only be added if the existing
architecture requires immediate token revocation beyond database-backed
authorization.

Because loading current user on authenticated requests already invalidates stale
role authorization, adding token versioning is probably unnecessary for this
change.

Testing Strategy
Backend

Test:

/auth/me with valid account;
/auth/me after role promotion;
/auth/me after role downgrade;
old ARTIST token after downgrade;
inactive account with previously valid token;
ARTIST administrative access;
SUBSCRIBER administrative denial;
ARTIST tier bypass;
SUBSCRIBER cumulative tier behavior.
Frontend

Test:

startup with valid ARTIST token;
startup with valid SUBSCRIBER token;
promoted account after reload;
downgraded account after reload;
loading state before route decision;
menu recalculation;
admin route redirect;
tier badge refresh;
invalid token cleanup;
temporary session request error.
Integration

Validate with real accounts:

register subscriber;
login as subscriber;
confirm no admin navigation;
promote using SUPER_ADMIN;
reload promoted account;
confirm ARTIST navigation and routes;
create or edit a post;
confirm ARTIST sees all tier content;
downgrade account;
reload;
confirm admin access is removed;
call admin API with old token and confirm denial.
Open Questions

No product question should block implementation.

When choosing between compatible technical approaches:

reuse existing authentication state;
preserve existing API conventions;
prefer database-backed authorization;
avoid unnecessary schema changes;
document the selected approach.