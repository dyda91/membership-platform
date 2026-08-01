# Platform Experience Specification

## ADDED Requirements

### Requirement: Feed as the primary application experience

The system SHALL use the content feed as the primary page for visitors and
authenticated users.

#### Scenario: Visitor opens the application

- GIVEN a visitor is not authenticated
- WHEN the visitor opens the root application route
- THEN the system SHALL display the public feed
- AND the system SHALL provide an option to authenticate

#### Scenario: Subscriber opens the application

- GIVEN an authenticated user has the SUBSCRIBER role
- WHEN the user opens the root application route
- THEN the system SHALL display the content feed
- AND the system SHALL NOT redirect the user to an administrative dashboard

#### Scenario: Content manager opens the application

- GIVEN an authenticated user has the ARTIST or SUPER_ADMIN role
- WHEN the user opens the root application route
- THEN the system SHALL display the content feed
- AND the user SHALL be able to navigate to the administrative dashboard

### Requirement: Role-aware navigation

The system SHALL display navigation options according to the authenticated
user's role.

#### Scenario: Visitor navigation

- GIVEN the visitor is not authenticated
- WHEN navigation is rendered
- THEN the system SHALL display the feed and authentication options
- AND the system SHALL NOT display administrative options

#### Scenario: Subscriber navigation

- GIVEN the authenticated user has the SUBSCRIBER role
- WHEN navigation is rendered
- THEN the system SHALL display Feed, Profile and Logout options
- AND the system SHALL NOT display Dashboard, Posts, Users or Tiers options

#### Scenario: Artist navigation

- GIVEN the authenticated user has the ARTIST role
- WHEN navigation is rendered
- THEN the system SHALL display Feed, Dashboard, Posts, Users, Tiers, Profile
  and Logout options

#### Scenario: Super administrator navigation

- GIVEN the authenticated user has the SUPER_ADMIN role
- WHEN navigation is rendered
- THEN the system SHALL display the content-management options available to an
  ARTIST
- AND the system MAY display system-management options unavailable to other
  roles

### Requirement: Administrative route protection

The system SHALL enforce administrative permissions on both frontend routes and
backend endpoints.

#### Scenario: Subscriber attempts to access the dashboard

- GIVEN the authenticated user has the SUBSCRIBER role
- WHEN the user navigates directly to the dashboard route
- THEN the system SHALL deny access
- AND the user SHALL be redirected to the feed

#### Scenario: Subscriber attempts to manage posts

- GIVEN the authenticated user has the SUBSCRIBER role
- WHEN the user requests a post-management route or endpoint
- THEN the system SHALL deny access

#### Scenario: Subscriber attempts to manage users or tiers

- GIVEN the authenticated user has the SUBSCRIBER role
- WHEN the user requests a user-management or tier-management route or endpoint
- THEN the system SHALL deny access

#### Scenario: Artist accesses administrative features

- GIVEN the authenticated user has the ARTIST role
- WHEN the user accesses Dashboard, Posts, Users or Tiers
- THEN the system SHALL permit access

### Requirement: Hidden super administrator

The system SHALL prevent SUPER_ADMIN accounts from being exposed through normal
platform user-management interfaces.

#### Scenario: Artist lists users

- GIVEN the authenticated user has the ARTIST role
- WHEN the user list is requested
- THEN no SUPER_ADMIN account SHALL be returned

#### Scenario: Artist searches users

- GIVEN the authenticated user has the ARTIST role
- WHEN users are searched or filtered
- THEN no SUPER_ADMIN account SHALL appear in the results

#### Scenario: User-management metadata is calculated

- GIVEN the platform calculates user totals, pagination or selectable users
- WHEN the calculation is returned to ARTIST or SUBSCRIBER interfaces
- THEN SUPER_ADMIN accounts SHALL be excluded

#### Scenario: Artist attempts to access a super administrator directly

- GIVEN the authenticated user has the ARTIST role
- WHEN the user requests a SUPER_ADMIN account by identifier
- THEN the system SHALL respond as though the account is unavailable

### Requirement: Role assignment rules

The system SHALL restrict role assignment according to the acting user's role.

#### Scenario: Super administrator assigns artist role

- GIVEN the authenticated user has the SUPER_ADMIN role
- WHEN the user assigns the ARTIST role to an eligible account
- THEN the system SHALL persist the ARTIST role

#### Scenario: Artist attempts to assign privileged role

- GIVEN the authenticated user has the ARTIST role
- WHEN the user attempts to assign ARTIST or SUPER_ADMIN to another account
- THEN the system SHALL deny the operation

#### Scenario: Subscriber attempts to assign a role

- GIVEN the authenticated user has the SUBSCRIBER role
- WHEN the user attempts to change any account role
- THEN the system SHALL deny the operation

### Requirement: Tier assignment permissions

The system SHALL allow ARTIST and SUPER_ADMIN to manage subscription tiers and
member tier assignments.

#### Scenario: Artist assigns a tier to a member

- GIVEN the authenticated user has the ARTIST role
- AND the target account is an eligible member
- WHEN the artist assigns a tier
- THEN the system SHALL persist the tier assignment

#### Scenario: Super administrator assigns a tier

- GIVEN the authenticated user has the SUPER_ADMIN role
- WHEN the administrator assigns a tier to an eligible account
- THEN the system SHALL persist the tier assignment

#### Scenario: Subscriber attempts to assign a tier

- GIVEN the authenticated user has the SUBSCRIBER role
- WHEN the user attempts to assign or modify a tier
- THEN the system SHALL deny the operation

#### Scenario: Subscriber views tier administration

- GIVEN the authenticated user has the SUBSCRIBER role
- WHEN the application navigation and routes are rendered
- THEN the tier-management page SHALL NOT be available

### Requirement: Member tier badge

The system SHALL display the authenticated member's current tier near the
member's identity without requiring a separate plan page.

#### Scenario: Member has an assigned tier

- GIVEN the authenticated user has an assigned tier
- WHEN the application header or account identity is rendered
- THEN the system SHALL display the tier name as a badge

#### Scenario: Member has no assigned paid tier

- GIVEN the authenticated user does not have an assigned paid tier
- WHEN the application header or account identity is rendered
- THEN the system SHALL display the configured free or public access label
- AND the system SHALL NOT display a link to a separate plan-management page

### Requirement: Cumulative tier access

The system SHALL allow members to access content requiring their own tier or any
lower-priority tier.

#### Scenario: Member accesses same-tier content

- GIVEN the member has tier priority 3
- AND a post requires tier priority 3
- WHEN the member views the post
- THEN the system SHALL allow access to the protected media

#### Scenario: Member accesses lower-tier content

- GIVEN the member has tier priority 3
- AND a post requires tier priority 1 or 2
- WHEN the member views the post
- THEN the system SHALL allow access to the protected media

#### Scenario: Member accesses higher-tier content

- GIVEN the member has tier priority 2
- AND a post requires tier priority 3
- WHEN the member views the post
- THEN the system SHALL keep the protected media unavailable

#### Scenario: Visitor accesses premium content

- GIVEN the visitor is not authenticated
- AND a post requires a subscription tier
- WHEN the visitor views the post
- THEN the system SHALL keep the protected media unavailable

### Requirement: Locked premium content presentation

The system SHALL preserve public post text while protecting media that requires
a higher subscription tier.

#### Scenario: Unauthorized viewer sees premium post

- GIVEN a post contains public text and premium media
- AND the viewer does not have sufficient tier access
- WHEN the post is displayed in the feed
- THEN the system SHALL display the post text
- AND the system SHALL display a locked or blurred media presentation
- AND the system SHALL NOT provide the protected media URL

#### Scenario: Authorized viewer sees premium post

- GIVEN the viewer has sufficient tier access
- WHEN the post is displayed in the feed
- THEN the system SHALL display the post text and media normally

### Requirement: Simplified post authoring

The system SHALL allow ARTIST and SUPER_ADMIN users to create posts without a
title or manually selected cover media.

#### Scenario: Artist creates a text post

- GIVEN the authenticated user has the ARTIST role
- WHEN the artist submits valid post text without a title
- THEN the system SHALL create the post

#### Scenario: Artist creates a media post

- GIVEN the authenticated user has the ARTIST role
- WHEN the artist submits text with one or more images or videos
- THEN the system SHALL create the post without requiring a title
- AND the system SHALL NOT require manual cover-media selection

#### Scenario: Feed preview uses first image

- GIVEN a post has one or more image media items
- WHEN the post preview is rendered
- THEN the system SHALL use the first ordered media item as the primary preview

#### Scenario: Feed preview uses first video

- GIVEN the first ordered media item is a video
- WHEN the post preview is rendered
- THEN the system SHALL use a generated or available video thumbnail
- AND the system SHALL NOT require the artist to upload a separate cover

### Requirement: Reliable media display

The system SHALL correctly retrieve and display uploaded image and video media
for authorized viewers.

#### Scenario: Authorized viewer opens an image post

- GIVEN an image was successfully uploaded and associated with a post
- AND the viewer has access to that post
- WHEN the post is displayed
- THEN the image SHALL be retrievable and visible

#### Scenario: Authorized viewer opens a video post

- GIVEN a video was successfully uploaded and associated with a post
- AND the viewer has access to that post
- WHEN the post is displayed
- THEN the video SHALL be retrievable and playable

#### Scenario: Media retrieval fails

- GIVEN stored media cannot be retrieved
- WHEN the post is displayed
- THEN the system SHALL show a controlled media error state
- AND the rest of the feed SHALL remain functional

### Requirement: Profile editing boundaries

The system SHALL allow members to edit only permitted fields of their own
profiles.

#### Scenario: Subscriber edits own basic profile

- GIVEN the authenticated user has the SUBSCRIBER role
- WHEN the user edits permitted basic profile fields
- THEN the system SHALL save the changes

#### Scenario: Subscriber attempts to modify role or tier

- GIVEN the authenticated user has the SUBSCRIBER role
- WHEN the user attempts to modify their own role or tier
- THEN the system SHALL deny the operation

#### Scenario: Member attempts to edit another member

- GIVEN the authenticated user has the SUBSCRIBER role
- WHEN the user attempts to edit another user's profile
- THEN the system SHALL deny the operation
