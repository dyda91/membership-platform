# User Tier Assignment and Search Specification

## ADDED Requirements

### Requirement: Separate role and tier management

The system SHALL treat account roles and subscription tiers as independent
properties in user management.

#### Scenario: Administrator opens an eligible member profile

- GIVEN the authenticated user is ARTIST or SUPER_ADMIN
- WHEN an eligible member profile is opened
- THEN the system SHALL display the member's current role separately from the
  member's current tier

#### Scenario: Artist views member access controls

- GIVEN the authenticated user has the ARTIST role
- WHEN the artist opens a subscriber profile
- THEN the system SHALL allow tier selection
- AND the system SHALL NOT allow assignment of ARTIST or SUPER_ADMIN roles

#### Scenario: Super administrator views member access controls

- GIVEN the authenticated user has the SUPER_ADMIN role
- WHEN the administrator opens an eligible member profile
- THEN the system SHALL allow permitted role management
- AND the system SHALL allow tier management

#### Scenario: Subscriber views own profile

- GIVEN the authenticated user has the SUBSCRIBER role
- WHEN the user opens their own profile
- THEN the system SHALL display the current tier as read-only information
- AND the system SHALL NOT display role or tier assignment controls

### Requirement: Tier options from existing tiers

The system SHALL load assignable tier options from the existing tier-management
data.

#### Scenario: Tier selector is opened

- GIVEN Free, Silver and Gold tiers exist
- WHEN ARTIST or SUPER_ADMIN opens the tier selector
- THEN the system SHALL display Free, Silver and Gold using current backend data

#### Scenario: A new tier is created

- GIVEN a new active tier is created through tier management
- WHEN the user-management tier selector is loaded again
- THEN the new tier SHALL appear without requiring a frontend code change

#### Scenario: Tier loading fails

- GIVEN the tier API cannot be loaded
- WHEN the access-management form is rendered
- THEN the system SHALL display a controlled error
- AND the system SHALL NOT replace tier options with role options

### Requirement: Member tier assignment

The system SHALL allow ARTIST and SUPER_ADMIN to assign an existing tier to an
eligible member.

#### Scenario: Artist assigns Silver tier

- GIVEN the authenticated user is ARTIST
- AND the target user is an eligible SUBSCRIBER
- AND Silver exists
- WHEN the artist assigns Silver
- THEN the system SHALL persist the Silver tier on the target user

#### Scenario: Artist assigns Gold tier

- GIVEN the authenticated user is ARTIST
- AND the target user is an eligible SUBSCRIBER
- AND Gold exists
- WHEN the artist assigns Gold
- THEN the system SHALL persist the Gold tier on the target user

#### Scenario: Super administrator assigns a tier

- GIVEN the authenticated user is SUPER_ADMIN
- WHEN the administrator assigns an existing tier to an eligible member
- THEN the system SHALL persist the assignment

#### Scenario: Subscriber attempts to assign a tier

- GIVEN the authenticated user is SUBSCRIBER
- WHEN the user attempts to assign or change a tier
- THEN the system SHALL deny the operation

#### Scenario: Invalid tier is submitted

- GIVEN the submitted tier identifier does not exist
- WHEN the assignment is processed
- THEN the system SHALL reject the operation
- AND the target user's current tier SHALL remain unchanged

### Requirement: Role assignment boundaries

The system SHALL preserve existing role-assignment restrictions while tier
management is introduced.

#### Scenario: Super administrator assigns ARTIST

- GIVEN the authenticated user is SUPER_ADMIN
- AND no conflicting active artist exists
- WHEN the administrator assigns ARTIST to an eligible account
- THEN the system SHALL persist the role according to the single-artist rules

#### Scenario: Artist attempts to assign ARTIST

- GIVEN the authenticated user is ARTIST
- WHEN the artist attempts to assign ARTIST to another account
- THEN the system SHALL deny the operation

#### Scenario: Super administrator role is offered in a selector

- GIVEN a user-management role selector is rendered
- WHEN available roles are displayed
- THEN SUPER_ADMIN SHALL NOT appear as an assignable option

#### Scenario: Hidden super administrator is searched

- GIVEN a hidden SUPER_ADMIN account exists
- WHEN users are searched, filtered or paginated
- THEN the account SHALL NOT be returned

### Requirement: User search

The system SHALL support server-side user search by name or email.

#### Scenario: Search by name

- GIVEN multiple visible users exist
- WHEN ARTIST or SUPER_ADMIN searches using part of a user's name
- THEN the system SHALL return matching visible users

#### Scenario: Search by email

- GIVEN multiple visible users exist
- WHEN ARTIST or SUPER_ADMIN searches using part of a user's email
- THEN the system SHALL return matching visible users

#### Scenario: Search is case-insensitive

- GIVEN a user's name or email contains mixed case
- WHEN the search uses a different letter case
- THEN the matching visible user SHALL be returned

#### Scenario: Search has no result

- GIVEN no visible user matches the search
- WHEN the search is submitted
- THEN the system SHALL return an empty result state
- AND the page SHALL remain usable

### Requirement: User filters

The system SHALL support filtering visible users by tier and account status.

#### Scenario: Filter by tier

- GIVEN users are assigned to different tiers
- WHEN ARTIST or SUPER_ADMIN filters by Silver
- THEN only visible users assigned to Silver SHALL be returned

#### Scenario: Filter by status

- GIVEN users have different account statuses
- WHEN ARTIST or SUPER_ADMIN filters by ACTIVE
- THEN only visible active users SHALL be returned

#### Scenario: Combine search and filters

- GIVEN user data matches a search term, tier and status
- WHEN those criteria are submitted together
- THEN the system SHALL return users matching all applied criteria

#### Scenario: Clear filters

- GIVEN search or filters are active
- WHEN the user clears them
- THEN the default visible user list SHALL be restored

### Requirement: Role filter visibility

The system SHALL expose role filtering only where permitted.

#### Scenario: Super administrator filters by role

- GIVEN the authenticated user is SUPER_ADMIN
- WHEN role filters are rendered
- THEN permitted non-system roles MAY be available

#### Scenario: Artist filters members

- GIVEN the authenticated user is ARTIST
- WHEN user filters are rendered
- THEN the interface SHALL prioritize member and tier management
- AND SHALL NOT expose SUPER_ADMIN as a filter value

### Requirement: User pagination

The system SHALL paginate user-management results on the backend.

#### Scenario: User count exceeds page size

- GIVEN the number of visible users exceeds the selected page size
- WHEN the user list is requested
- THEN the system SHALL return one page of results
- AND pagination metadata

#### Scenario: Administrator moves to next page

- GIVEN another page of visible users exists
- WHEN ARTIST or SUPER_ADMIN selects the next page
- THEN the system SHALL return the next result set using the current search and
  filters

#### Scenario: Search changes while on a later page

- GIVEN the interface is displaying a page after the first
- WHEN the search or filters change
- THEN pagination SHALL return to the first page

#### Scenario: Hidden user affects totals

- GIVEN a hidden SUPER_ADMIN exists
- WHEN pagination totals are calculated
- THEN the hidden account SHALL NOT be included

### Requirement: User-management response

The system SHALL return sufficient safe information for member access
management.

#### Scenario: Visible member is returned

- GIVEN an eligible visible member exists
- WHEN the user list or detail is requested
- THEN the response SHALL include safe fields for identity, role, tier, status
  and management actions

#### Scenario: User has no assigned tier

- GIVEN a visible user has no tier relation
- WHEN the user is returned
- THEN the response SHALL represent the state safely
- AND the frontend SHALL display the configured free or no-tier label according
  to existing platform rules

#### Scenario: Tier is assigned

- GIVEN a visible user has an assigned tier
- WHEN the user is returned
- THEN the response SHALL include the tier id, name and priority required by the
  frontend

### Requirement: Tier assignment interface refresh

The system SHALL update user-management state after a tier assignment.

#### Scenario: Tier assignment succeeds

- GIVEN an ARTIST assigns Gold to a member
- WHEN the backend confirms the update
- THEN the user details SHALL display Gold
- AND the user list SHALL reflect Gold without requiring manual data repair

#### Scenario: Tier assignment fails

- GIVEN a tier assignment request fails
- WHEN the frontend receives the error
- THEN the previous tier SHALL remain displayed
- AND a controlled error SHALL be shown

#### Scenario: Current user tier is changed

- GIVEN the authenticated member's own tier is changed by ARTIST or SUPER_ADMIN
- WHEN that member refreshes the session or application
- THEN the tier badge SHALL show the updated tier

### Requirement: Tier access after assignment

The system SHALL apply newly assigned tiers to feed access using cumulative
priority rules.

#### Scenario: Member receives Silver

- GIVEN Silver priority is 2
- AND the member is assigned Silver
- WHEN the member refreshes the session and opens the Feed
- THEN the member SHALL access public content
- AND content requiring priority 2 or lower

#### Scenario: Member receives Gold

- GIVEN Gold priority is 5
- AND the member is assigned Gold
- WHEN the member refreshes the session and opens the Feed
- THEN the member SHALL access public content
- AND content requiring priority 5 or lower

#### Scenario: Member is downgraded

- GIVEN a member previously had Gold
- AND the member is reassigned to Free
- WHEN the session and Feed are refreshed
- THEN content above Free priority SHALL be locked

### Requirement: Functional user-management states

The system SHALL provide controlled loading, empty and error states for user
management.

#### Scenario: Users are loading

- GIVEN a user query is in progress
- WHEN the page is rendered
- THEN a controlled loading state SHALL be displayed

#### Scenario: No users match

- GIVEN search and filters produce no visible users
- WHEN results are rendered
- THEN a clear empty state SHALL be displayed

#### Scenario: User query fails

- GIVEN the user query fails
- WHEN the error is rendered
- THEN the interface SHALL display a controlled error
- AND SHALL allow retrying or changing filters
