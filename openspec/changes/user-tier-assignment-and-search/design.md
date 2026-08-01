# Design: User Tier Assignment and Search

## Context

The application currently provides:

- JWT authentication
- database-backed current session
- role-aware frontend navigation
- hidden SUPER_ADMIN behavior
- one active ARTIST
- user management
- tier management
- manual tier-based content access
- cumulative tier priorities
- Feed and locked premium content

The current user-management interface incorrectly presents role selection where
tier selection is needed.

The platform already contains tier records such as:

- Free, priority 0
- Silver, priority 2
- Gold, priority 5

ARTIST must be able to assign these tiers to members without receiving
permission to assign privileged roles.

The page also requires server-side search, filtering and pagination.

## Goals

- Separate role and tier management in data, API and UI.
- Use the existing tier API as the source of tier options.
- Allow ARTIST and SUPER_ADMIN to assign tiers.
- Keep role assignment restricted.
- Add scalable user search, filters and pagination.
- Refresh user and session state after tier changes.
- Preserve cumulative content access.
- Preserve hidden SUPER_ADMIN behavior.

## Non-Goals

- Integrated payments
- Automatic expiration
- Bulk assignment
- Final visual redesign
- New role types
- Multiple artists
- User import/export

## Domain Separation

Role and tier have different meanings.

### Role

Determines platform-management capability:

- SUPER_ADMIN
- ARTIST
- SUBSCRIBER

### Tier

Determines premium-content access:

- Free
- Silver
- Gold
- future tiers created through tier management

A typical member has:

```text
role = SUBSCRIBER
tier = Gold

An ARTIST normally has:

role = ARTIST
tier = null or irrelevant for content-management access

Role and tier must never share the same selector or frontend data source.

Authorization Matrix
Action	Subscriber	Artist	Super Admin
View own tier	Yes	Yes	Yes
Assign member tier	No	Yes	Yes
Manage tier definitions	No	Yes	Yes
Assign ARTIST role	No	No	Yes
Assign SUPER_ADMIN role	No	No	No through normal UI
Search visible users	No	Yes	Yes
Filter visible users	No	Yes	Yes
View hidden SUPER_ADMIN	No	No	Internal only
Backend User Query

The existing user-list endpoint should be extended rather than duplicated.

Suggested route:

GET /users

Suggested query parameters:

search
tierId
status
role
page
limit

Example:

GET /users?search=maria&tierId=<id>&status=ACTIVE&page=1&limit=20

The exact parameter naming should follow existing project conventions.

Search Behavior

Search should be:

server-side;
case-insensitive;
applied to visible user name and email;
trimmed;
safe for empty strings;
combined with other filters using AND semantics.

The Prisma implementation may use case-insensitive contains filters supported
by PostgreSQL.

Search must not return hidden/system accounts.

Filter Behavior
Tier filter

Filter users by tierId.

The interface loads tier options from the existing tier endpoint.

No tier names or ids should be hardcoded.

Status filter

Reuse existing account statuses.

Only statuses supported by the current schema should be offered.

Role filter

SUPER_ADMIN may receive permitted non-system role filters.

ARTIST should primarily manage members and must never receive SUPER_ADMIN as an
option.

Pagination

Backend pagination is required.

Suggested response:

data
page
limit
total
totalPages

If the existing project already uses another pagination structure, reuse it.

The backend must calculate totals using the same hidden-user, search and filter
conditions as the data query.

Changing search or filters should reset the frontend to page 1.

Page size should have a safe maximum.

User Response Shape

The visible user-management response should provide safe fields such as:

id
name
email
roles
status
tier {
  id
  name
  priority
}
createdAt

It must not include:

password hash;
hidden SUPER_ADMIN;
secret system metadata;
private bootstrap information.
Tier Options API

Reuse the existing tier-list endpoint.

The frontend should load active assignable tiers when the access-management
form or page loads.

Tier options should include:

id
name
description
priority

If a tier API request fails:

do not show roles in its place;
disable tier assignment;
display a clear controlled error;
allow retry.
Tier Assignment Backend

Prefer an explicit endpoint if the current general user update DTO mixes
unrelated administrative fields.

Suggested route:

PATCH /users/:id/tier

Suggested body:

{
  "tierId": "existing-tier-id"
}

Alternatively, extend the existing secure administrative update endpoint if it
already cleanly separates authorized fields.

The service must validate:

acting user is ARTIST or SUPER_ADMIN;
target is visible and eligible;
tier exists;
target is not hidden/system;
requested operation complies with role rules.

The update should return the updated safe user representation.

Removing or Clearing Tier

The implementation should inspect current Free-tier behavior.

Preferred options:

assign the explicit Free tier; or
allow tierId = null to represent public/free access.

Use the convention already established by the platform.

Do not introduce two conflicting free-access representations without necessity.

Role Assignment UI

Role controls must be visibly separate from tier controls.

ARTIST view

For a normal member:

role displayed as informational or read-only;
tier editable;
status editable only if already allowed;
no ARTIST or SUPER_ADMIN promotion controls.
SUPER_ADMIN view
permitted role assignment may be available;
ARTIST assignment remains subject to the single-active-artist rule;
SUPER_ADMIN remains absent from ordinary selectors;
tier remains a separate field.
Frontend User Page

Suggested layout:

UsersPage
├── UserSearchBar
├── UserFilters
│   ├── TierFilter
│   ├── StatusFilter
│   └── RoleFilter when permitted
├── UsersTable
├── Pagination
└── UserAccessDialog or UserEditPanel
    ├── IdentitySummary
    ├── RoleSection
    ├── TierSection
    └── StatusSection

Reuse existing components where possible.

Table Columns

Suggested columns:

User
Email
Role
Tier
Status
Created At
Actions

For ARTIST, role may be displayed without privileged editing.

The primary action may be:

Manage access

This better reflects the tier-assignment purpose.

Frontend State

The frontend should maintain separate state for:

user query;
search input;
selected tier filter;
selected status filter;
selected role filter;
page;
limit;
selected user;
tier options;
update state.

Search requests should be debounced if the project already uses that pattern.

Otherwise, search may be submitted explicitly.

Avoid excessive backend requests.

Refresh Strategy

After successful tier assignment:

update or refetch selected user details;
update or refetch the current user list;
preserve current search and filters;
update the row's tier display;
show a controlled success state.

When the changed account is the currently logged-in user, the current session
will reflect the new tier on its next refresh.

The existing /auth/me flow remains the source of session tier data.

Feed Access

No new feed authorization model is required.

The existing access helper should continue using tier priority:

member priority >= required post priority

After session refresh:

Silver receives Silver and lower content;
Gold receives Gold and lower content;
downgrade to Free removes higher-tier access.

ARTIST and SUPER_ADMIN keep their existing bypass.

Tier Deletion Safety

This change should review the current tier deletion behavior.

If a tier is assigned to users or posts, deletion must not silently break
relations.

Preferred behavior:

prevent deletion while referenced; or
require a controlled reassignment workflow.

A full tier-deletion redesign is outside the core change, but unsafe behavior
discovered during implementation should receive the smallest safe correction
and be documented.

Error Handling

Backend errors should distinguish where current conventions allow:

user not found;
tier not found;
unauthorized;
forbidden;
hidden/system target unavailable;
invalid query parameter;
invalid pagination;
assignment conflict.

Frontend states should include:

loading users;
loading tiers;
no users found;
user query error;
tier query error;
update in progress;
update error;
update success.
Testing Strategy
Backend

Test:

user list without filters;
search by name;
search by email;
case-insensitive search;
filter by tier;
filter by status;
combined filters;
pagination;
hidden SUPER_ADMIN exclusion;
ARTIST tier assignment;
SUPER_ADMIN tier assignment;
SUBSCRIBER denial;
invalid tier rejection;
ARTIST role-assignment denial;
safe user response.
Frontend

Test:

tier selector displays Free, Silver and Gold;
role and tier controls are separate;
ARTIST can assign a tier;
ARTIST cannot assign ARTIST;
SUPER_ADMIN role controls remain separate;
user search;
tier filter;
status filter;
pagination;
successful row refresh;
failed assignment state;
empty search results.
Integration

Validate:

create or identify a subscriber;
search for that subscriber;
open access management;
verify Free, Silver and Gold options;
assign Silver;
confirm list and detail update;
login as the member and refresh session;
confirm Silver badge and access;
assign Gold;
confirm Gold and lower content;
downgrade to Free;
confirm higher content becomes locked.
Schema Changes

No schema change is expected because User already relates to Tier.

Do not create a migration unless the current relation is incomplete.

Open Questions

No product question should block implementation.

When implementation details are not specified:

reuse existing project patterns;
preserve current authorization;
prefer explicit separation between role and tier;
preserve data;
document decisions in the final report.
