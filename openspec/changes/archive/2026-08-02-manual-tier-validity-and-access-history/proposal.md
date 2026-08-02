# Proposal: Manual Tier Validity and Access History

## Why

The platform already allows ARTIST and SUPER_ADMIN users to manually assign
subscription tiers to members.

Because payment and access negotiation happen outside the platform through
WhatsApp or Discord, the artist also needs to control how long each manually
granted tier remains valid.

The current user-to-tier relationship represents only the current tier and does
not provide a reliable record of when access started, when it expires, who
granted it, why it changed or how it was renewed.

This change introduces a manual access lifecycle and immutable access history
without adding integrated payments or automatic billing.

## What Changes

- Add a manual tier-access assignment model.
- Store the assigned tier independently from the user's role.
- Support access start date.
- Support optional expiration date.
- Support permanent access when no expiration date is provided.
- Record who granted, renewed, changed or revoked access.
- Support optional internal administrative notes.
- Preserve a history of tier-access changes.
- Determine effective content access from the current valid assignment.
- Automatically treat expired access as unavailable.
- Return the user to Free or public access when a paid assignment expires.
- Allow ARTIST and SUPER_ADMIN to grant, renew, change and revoke access.
- Prevent SUBSCRIBER users from modifying access validity.
- Display access status in user management.
- Display expiration information to the member in a compact read-only format.
- Add filters for active, expiring, expired and permanent access.
- Add administrative actions for renewal and revocation.
- Preserve existing cumulative tier priority rules.
- Preserve external WhatsApp and Discord contact flow.
- Keep the implementation functional and consistent with the current visual
  conventions.

## Goals

- Allow the artist to grant time-limited or permanent access.
- Remove the need to remember expiration dates manually.
- Preserve an auditable record of access changes.
- Keep account status separate from tier-access status.
- Ensure expired users lose premium access without deleting or disabling their
  accounts.
- Allow manual renewal after external payment confirmation.
- Prepare the platform for later reports and operational notifications.

## Non Goals

This change will not implement:

- Integrated payments
- Automatic billing
- Payment checkout
- Payment webhooks
- Automatic payment confirmation
- Automatic renewal
- E-mail notifications
- WhatsApp or Discord message sending
- Financial transaction records
- Invoices
- Refunds
- Coupon codes
- Final visual design
- Advanced analytics

## Impact

### Backend

- New access-assignment or tier-membership domain model
- Manual grant, renewal, change and revocation operations
- Effective access calculation
- Expiration handling
- User-management filters
- Access-history endpoints
- Current-session tier behavior
- Feed content-access integration
- Automated tests

### Frontend

- Access validity controls in user management
- Expiration date and permanent-access options
- Access status indicators
- Renewal and revoke actions
- Access-history display
- Additional user filters
- Read-only member access information
- Controlled loading and error states

### Database

A database migration is expected.

The implementation should preserve the existing User-to-Tier relation during
migration and convert existing assignments into valid access records whenever
possible.

Existing users, tiers, posts, media and role assignments must be preserved.
