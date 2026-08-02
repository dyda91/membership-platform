# Proposal: Admin Interface and Form Polish

## Why

The platform's public artist profile, Feed and media experience are now
functional, responsive and visually consistent.

However, the administration area still reflects the incremental development of
the product. Dashboard information, user management, tier-access operations,
post editing, tier management and artist-profile configuration need a dedicated
operational design pass.

The artist will use these interfaces daily to publish content, manage members,
assign and renew access, review history and maintain the public profile.
Therefore, these workflows must be clear, efficient, responsive and difficult to
use incorrectly.

This change refines the administration experience without changing the existing
business rules.

## What Changes

- Redesign the administrative Dashboard around useful operational information.
- Add clear summary cards for users, posts, tiers and access states.
- Add practical shortcuts for common artist actions.
- Refine user search, filters, pagination and table presentation.
- Add a mobile-friendly user-management presentation.
- Improve the Manage Access workflow.
- Improve tier grant, renewal, update and revocation forms.
- Improve access-history presentation.
- Make role, tier, account status and access status visibly distinct.
- Improve the administrative Posts list.
- Improve draft, published and archived status presentation.
- Add media previews to administrative post listings.
- Improve the New Post and Edit Post forms.
- Improve upload progress, media ordering and upload-error feedback.
- Add unsaved-change protection where appropriate.
- Add a post preview before publication where practical.
- Refine tier-management forms and list presentation.
- Explain tier priority and cumulative access clearly.
- Display tier usage by users, posts and access history where available.
- Improve referenced-tier deletion errors.
- Refine artist-profile management.
- Improve avatar and banner previews.
- Organize public identity and contact settings.
- Standardize administrative tables, filters, forms and action bars.
- Preserve all current permissions and business rules.
- Preserve the public Feed and public media experience.

## Goals

- Make the artist's daily administration efficient and understandable.
- Reduce mistakes when changing role, tier, validity or account status.
- Make user and access management usable with many members.
- Improve the content-authoring workflow.
- Make tier management safer.
- Improve mobile usability for administrative pages.
- Reuse the existing visual foundation and shared UI primitives.
- Preserve all backend authorization and data behavior.

## Non Goals

This change will not implement:

- New role types
- New tier business rules
- Integrated payments
- Automatic billing
- Likes
- Comments
- Direct messages
- Advanced analytics
- Revenue reporting
- Final branding and microcopy
- Full notification system
- E-mail delivery
- Advanced video transcoding
- A new public Feed redesign
- A complete backend architecture rewrite

## Impact

### Frontend

- Dashboard
- Users administration
- User search, filters and pagination
- Manage Access dialog or page
- Access history
- Posts administration
- Post editor
- Upload and media ordering
- Tier administration
- Artist-profile administration
- Shared administrative table and form patterns
- Responsive administrative layouts
- Frontend tests

### Backend

Only minor safe changes are expected where additional existing operational
metadata is required, such as:

- Dashboard counts
- Tier usage counts
- Post status totals
- User access-status totals
- Safe media previews
- Referenced-tier conflict details

Existing authorization and domain rules must remain unchanged.

### Database

No migration is expected.

A migration should only be created if an existing required value cannot be
derived safely from the current schema.
