# Design: Manual Tier Validity and Access History

## Context

The platform currently supports:

- public subscriber registration;
- one active ARTIST;
- hidden SUPER_ADMIN;
- manual tier assignment;
- user search, filters and pagination;
- database-backed authenticated sessions;
- cumulative tier priority;
- viewer-aware Feed;
- external access negotiation through WhatsApp and Discord.

The existing User-to-Tier relation identifies a member's tier but does not
represent an access lifecycle.

Manual external payment requires the artist to track:

- when access begins;
- when access ends;
- whether access is permanent;
- who granted access;
- when it was renewed;
- why access changed;
- whether it was revoked.

This change introduces explicit access assignments and history while preserving
the existing tier-management model.

## Goals

- Represent manual access as a first-class domain concept.
- Support time-limited, scheduled and permanent access.
- Preserve previous access changes as history.
- Derive effective access reliably at request time.
- Keep role and tier independent.
- Keep account status and access status independent.
- Avoid requiring a payment provider.
- Preserve all current users and tier assignments.
- Keep ARTIST and SUPER_ADMIN content bypass.
- Integrate access status with session, Feed and user management.

## Non-Goals

- Payment processing
- Automatic billing
- Financial reconciliation
- Automatic external messaging
- Complex subscription plans
- Multi-artist access
- Final visual redesign
- Advanced reporting
- Background e-mail reminders

## Domain Model

The recommended architecture uses a current access assignment plus immutable
history events.

Conceptual models:

```text
TierAccessAssignment

id
userId
tierId
startsAt
expiresAt
revokedAt
revokedById
createdById
updatedById
internalNote
createdAt
updatedAt
TierAccessEvent

id
assignmentId
userId
action
previousTierId
newTierId
previousStartsAt
newStartsAt
previousExpiresAt
newExpiresAt
actorId
internalNote
createdAt

Exact names may follow existing project conventions.

Why Not Store Only Dates on User

Storing only:

User.tierId
User.tierExpiresAt

would be simpler but would not preserve:

previous assignments;
renewals;
tier changes;
revocations;
actor attribution;
historical notes.

Because the artist needs operational control and history, a dedicated assignment
model is preferable.

The existing User.tierId may temporarily remain for compatibility but should
not become a second conflicting source of truth.

Source of Truth

The effective access-assignment model should become the source of truth for
subscriber tier access.

During migration, existing User.tierId values should be converted into active
access assignments.

After migration, choose one of these safe strategies:

remove or deprecate User.tierId; or
keep it as a synchronized compatibility field during transition.

Avoid long-term unsynchronized dual ownership.

The selected strategy must be documented.

Access Actions

Suggested event actions:

GRANTED
RENEWED
TIER_CHANGED
DATES_CHANGED
REVOKED
RESTORED
MIGRATED

The exact enum may be simplified if current requirements remain supported.

Effective Status

Effective status is derived rather than manually edited.

Suggested statuses:

SCHEDULED
ACTIVE
EXPIRING_SOON
EXPIRED
REVOKED
PERMANENT
NONE

PERMANENT may be represented as an active assignment with expiresAt = null.

EXPIRING_SOON is a presentation and filtering state derived from the active
assignment and a configurable warning interval.

Suggested warning configuration:

TIER_ACCESS_EXPIRING_SOON_DAYS=7

Use a safe server default when absent.

Access Evaluation

Conceptual evaluation:

if role is ARTIST or SUPER_ADMIN:
    allow managed content

if no assignment:
    use Free or public access

if revokedAt exists:
    assignment is revoked

if current time < startsAt:
    assignment is scheduled

if expiresAt exists and current time >= expiresAt:
    assignment is expired

otherwise:
    assignment is active

Content access then uses:

effective member tier priority >= required post tier priority

Only ACTIVE or permanent assignments grant their tier priority.

Date and Time Rules

Store timestamps in UTC.

Frontend should display dates in the user's local timezone.

Use inclusive start and exclusive expiration semantics:

active when now >= startsAt and now < expiresAt

This avoids ambiguous access at the exact expiration instant.

Date-only frontend inputs should be converted consistently.

For example, if the product treats access as valid through a selected day, the
backend and frontend must agree whether expiration occurs at:

start of the selected date; or
end of the selected date.

Preferred behavior for manual administration:

display date and optionally time;
when only a date is selected, treat validity as ending at the end of that
local day or use an explicitly documented convention.

The implementation must avoid timezone-dependent accidental early expiration.

Grant Operation

Suggested endpoint:

POST /users/:userId/tier-access

Suggested request:

{
  "tierId": "tier-id",
  "startsAt": "2026-08-01T00:00:00.000Z",
  "expiresAt": "2026-09-01T00:00:00.000Z",
  "permanent": false,
  "internalNote": "Pagamento confirmado pelo WhatsApp"
}

When permanent = true, expiresAt should be null.

The DTO must not accept:

actorId;
arbitrary status;
event type;
hidden account flags;
role changes.

The actor comes from the authenticated request.

Renewal Operation

Possible endpoint:

POST /users/:userId/tier-access/renew

Suggested request:

{
  "expiresAt": "2026-10-01T00:00:00.000Z",
  "internalNote": "Renovação confirmada"
}

Alternatively, a single update endpoint may be used if it preserves history
correctly.

Renewal must create a history event.

Tier Change Operation

Possible endpoint:

PATCH /users/:userId/tier-access

It may update:

tier;
start date;
expiration;
permanent flag.

Every meaningful change must create history.

Revocation Operation

Suggested endpoint:

POST /users/:userId/tier-access/revoke

Body:

{
  "internalNote": "Acesso removido manualmente"
}

Revocation sets:

revokedAt;
revokedById;
updatedById.

It must not delete history.

History Endpoint

Suggested endpoint:

GET /users/:userId/tier-access/history

Permissions:

ARTIST;
SUPER_ADMIN.

Response should include:

action;
previous tier summary;
new tier summary;
old and new validity dates;
actor safe identity;
internal note;
timestamp.

SUBSCRIBER should receive only their safe current summary through /auth/me or
own profile.

Current Access Endpoint

User detail may include:

tierAccess {
  status
  tier
  startsAt
  expiresAt
  permanent
  expiringSoon
}

The user list should include a compact version.

User Search and Filters

Extend existing user query support with:

accessStatus
expiresBefore
expiresAfter

Core UI filters:

Active
Expiring soon
Expired
Permanent
Scheduled
Revoked or no access when useful

Search, tier, status and access-status filters must continue to combine safely.

Pagination totals must use the same conditions.

Expiration Processing Strategy

Premium access must become unavailable even if no background job runs.

Therefore request-time effective access evaluation is mandatory.

A periodic background job may later:

produce notifications;
materialize status;
generate reports.

But authorization must not depend on a scheduler.

This avoids a failure where expired users retain access because a cron job was
offline.

Session Integration

GET /auth/me should return effective access, not a stale stored tier.

Suggested safe response:

tier
tierAccessStatus
tierStartsAt
tierExpiresAt
tierPermanent
tierExpiringSoon

Internal notes and access history are excluded.

The current valid JWT remains an identity token.

Role, status and effective access come from the current database state.

Feed Integration

Feed content authorization should consume the centralized effective access
service.

Do not duplicate expiration logic inside Feed serializers or controllers.

Suggested service:

TierAccessService.getEffectiveAccess(userId, now)

It returns:

roleBypass
effectiveTier
effectivePriority
status
startsAt
expiresAt

The Feed then applies existing cumulative priority.

Existing Assignment Migration

A safe data migration is required.

For each current visible subscriber:

Existing paid or explicit tier

Create an assignment:

startsAt = migration time or existing meaningful assignment date
expiresAt = null
status = active/permanent
action = MIGRATED

This preserves access.

Existing Free or no-tier user

Follow the current platform convention:

explicit Free assignment; or
no access assignment with public/Free fallback.

Do not create conflicting representations.

ARTIST and SUPER_ADMIN

Do not require tier-access assignments because role bypass applies.

Database Transactions

Grant, renew, change and revoke should use transactions.

A transaction should:

load eligible user and current assignment;
validate tier and dates;
update or create assignment;
create history event;
synchronize compatibility fields when still used;
commit atomically.

History must not record successful actions when the assignment update failed.

Authorization
ARTIST

May:

grant subscriber access;
renew access;
change subscriber tier;
revoke access;
view access history;
filter members by access status.

May not:

modify hidden/system accounts;
modify SUPER_ADMIN;
use access operations to change roles.
SUPER_ADMIN

May perform the same access operations for eligible normal accounts.

SUBSCRIBER

May:

view safe own access summary.

May not:

grant;
renew;
revoke;
change tier;
view internal history or notes.
Frontend User Management

Suggested access-management area:

ManageAccessDialog

Member identity
Current tier
Current access status
Start date
Expiration date
Permanent access checkbox
Internal note
Grant / Save changes
Renew
Revoke
View history

Role remains separate.

Date Input UX

The form should support:

start now;
custom start date;
fixed expiration date;
permanent access.

Safe defaults:

start now;
expiration in 30 days only if explicitly selected by product convention;
do not silently assume payment duration when the artist did not choose it.

The application may provide quick options:

7 days;
30 days;
90 days;
permanent.

Quick options are conveniences, not separate business rules.

Access Status Presentation

Suggested badges:

ACTIVE
EXPIRING SOON
EXPIRED
PERMANENT
SCHEDULED
REVOKED
FREE

Final colors and polish remain for the visual-design change.

Member Presentation

The member should see compact information near their identity or profile:

Gold
Válido até 01/09/2026

or:

Gold
Acesso permanente

or:

Free
Acesso Gold expirado

Do not expose:

internal notes;
actor identity;
complete history.
Tier Deletion Interaction

A tier referenced by current or historical access records must not be silently
deleted.

Preferred behavior:

prevent deletion while referenced;
preserve historical tier identity;
return a controlled conflict response.

Hard-deleting a tier referenced by history would damage audit records.

Soft deletion may be considered later but is outside this change unless already
supported.

Error Handling

Backend errors should cover:

user unavailable;
hidden/system target;
tier unavailable;
invalid dates;
conflicting current assignment;
unauthorized actor;
already revoked assignment;
renewal without suitable assignment;
invalid pagination or filters.

Frontend should provide:

loading current access;
saving;
renewing;
revoking;
history loading;
controlled validation errors;
retry behavior;
confirmation before revoke.
Testing Strategy
Backend

Test:

grant fixed-term access;
grant permanent access;
scheduled access;
invalid dates;
renewal;
tier change;
revocation;
history creation;
actor attribution;
internal note privacy;
expiration at request time;
/auth/me after expiration;
Feed after expiration;
ARTIST bypass;
SUPER_ADMIN bypass;
subscriber denial;
migration preservation.
Frontend

Test:

access form;
permanent checkbox;
dates;
quick duration options if implemented;
active status;
expiring status;
expired status;
renewal;
revoke confirmation;
history;
filters;
safe member summary.
Integration

Validate:

assign Silver for a short test interval;
verify access;
expire or simulate time;
verify media becomes locked;
renew;
verify access returns;
change to Gold;
verify cumulative access;
revoke;
verify immediate removal;
inspect history;
verify member cannot see internal note.
Visual Boundary

Use existing Tailwind and component conventions.

Do not perform final branding or complete layout redesign.

The next major change after this will be:

visual-design-and-responsive-experience
Open Questions

No product question should block implementation.

For technical choices:

preserve existing data;
use database-backed effective access;
avoid scheduler-dependent authorization;
keep role and tier separate;
preserve immutable history;
document the migration and compatibility strategy.
