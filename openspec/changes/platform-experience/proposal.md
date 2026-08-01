# Proposal: Platform Experience

## Why

The platform currently behaves primarily as an administrative dashboard, even
for users whose only purpose is to consume content.

The application needs a role-aware experience where the feed is the main page,
administrative features are restricted to content managers, premium content is
displayed according to subscription tier, and the hidden SUPER_ADMIN account is
never exposed through normal user-management interfaces.

This change also corrects the current post experience by removing unnecessary
title and cover-media requirements and ensuring uploaded images and videos are
displayed correctly.

## What Changes

- Make the content feed the default application page.
- Create public and authenticated feed experiences.
- Restrict Dashboard, Posts, Users and Tiers pages to ARTIST and SUPER_ADMIN.
- Restrict platform system administration capabilities to SUPER_ADMIN.
- Completely hide SUPER_ADMIN accounts from user listings, searches, counters,
  selectors and editable user interfaces.
- Allow SUPER_ADMIN to assign the ARTIST role.
- Allow ARTIST and SUPER_ADMIN to assign subscription tiers to members.
- Prevent SUBSCRIBER users from assigning roles or tiers.
- Allow members to edit only basic information from their own profiles.
- Display the authenticated member's tier as a badge near their identity.
- Do not create a separate subscription-plan page.
- Apply cumulative tier access so a member can access content for their own
  tier and every lower-priority tier.
- Remove the post title requirement.
- Remove manual cover-media selection.
- Use the first available post media as the feed preview.
- Generate or use a video thumbnail when the first post media is a video.
- Correct media retrieval and rendering so uploaded images and videos appear in
  posts.
- Show locked premium media when the viewer does not have sufficient tier
  access while keeping the permitted public post text visible.

## Goals

- Make the feed the central experience for every visitor and authenticated user.
- Provide navigation and route access appropriate to each role.
- Keep administrative capabilities unavailable to normal members.
- Preserve the hidden and privileged nature of SUPER_ADMIN.
- Provide cumulative subscription-tier access.
- Simplify post creation to text, media, tier and publication status.
- Ensure uploaded media is reliably displayed.
- Prepare the platform for future subscription and payment integration.

## Non Goals

This change will not implement:

- Payment processing
- Automatic subscription billing
- Subscription checkout
- Comments
- Likes
- Direct messages
- Notifications
- Multiple artist accounts operating independently
- Advanced analytics
- A separate member plan-management page

## Impact

### Backend

- Feed query and response rules
- Centralized content-access evaluation
- Role and tier authorization adjustments
- User visibility filtering
- Post DTO and schema adjustments if required
- Protected media-delivery adjustments
- Media preview and retrieval behavior

### Frontend

- Feed becomes the default route
- Role-aware navigation
- Role-aware protected routes
- New feed and locked-media components
- Simplified post form
- Tier badge near the authenticated user
- Removal of administrative navigation for members
- Reliable image and video rendering

### Database

The existing models should be reused whenever possible.

A migration should only be created if removing obsolete Post fields or adding
required media-order or preview metadata cannot be handled without a schema
change.
