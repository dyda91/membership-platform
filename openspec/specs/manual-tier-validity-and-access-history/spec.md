# manual-tier-validity-and-access-history Specification

## Purpose
TBD - created by archiving change manual-tier-validity-and-access-history. Update Purpose after archive.
## Requirements
### Requirement: Manual tier access assignment

The system SHALL allow ARTIST and SUPER_ADMIN users to manually grant tier
access to eligible members.

#### Scenario: Artist grants Silver access

- GIVEN the authenticated user has the ARTIST role
- AND the target account is an eligible SUBSCRIBER
- AND Silver exists
- WHEN the artist grants Silver access
- THEN the system SHALL create a current access assignment for Silver
- AND the assignment SHALL record the acting user

#### Scenario: Super administrator grants Gold access

- GIVEN the authenticated user has the SUPER_ADMIN role
- AND the target account is eligible
- WHEN the administrator grants Gold access
- THEN the system SHALL create a current access assignment for Gold

#### Scenario: Subscriber attempts to grant access

- GIVEN the authenticated user has the SUBSCRIBER role
- WHEN the user attempts to grant tier access
- THEN the system SHALL deny the operation

#### Scenario: Hidden system account is targeted

- GIVEN the target account is hidden or system-managed
- WHEN an ordinary access-assignment operation is attempted
- THEN the system SHALL reject the operation

### Requirement: Time-limited access

The system SHALL support tier access with a defined start and expiration date.

#### Scenario: Artist grants thirty-day access

- GIVEN the artist selects a valid tier
- AND provides a valid start date
- AND provides an expiration date after the start date
- WHEN the assignment is saved
- THEN the system SHALL treat the assignment as active during that interval

#### Scenario: Expiration precedes start date

- GIVEN an expiration date is earlier than or equal to the start date
- WHEN the assignment is submitted
- THEN the system SHALL reject the operation
- AND no invalid assignment SHALL be persisted

#### Scenario: Future access is created

- GIVEN the access start date is in the future
- WHEN the assignment is saved
- THEN the system SHALL represent the access as scheduled
- AND premium access SHALL remain unavailable until the start date

### Requirement: Permanent access

The system SHALL support permanent manual access without an expiration date.

#### Scenario: Artist grants permanent access

- GIVEN the artist selects a valid tier
- AND selects permanent access
- WHEN the assignment is saved
- THEN the system SHALL create an active assignment without an expiration date

#### Scenario: Permanent access is displayed

- GIVEN a member has an active assignment without expiration
- WHEN access information is rendered
- THEN the system SHALL display the access as permanent

### Requirement: Effective access status

The system SHALL derive an effective access status from assignment dates and
revocation state.

#### Scenario: Assignment is currently active

- GIVEN the current time is after or equal to the start date
- AND before the expiration date when one exists
- AND the assignment has not been revoked
- WHEN access is evaluated
- THEN the assignment SHALL be ACTIVE

#### Scenario: Assignment has not started

- GIVEN the current time is before the start date
- WHEN access is evaluated
- THEN the assignment SHALL be SCHEDULED

#### Scenario: Assignment has expired

- GIVEN an expiration date exists
- AND the current time is after or equal to the expiration date
- WHEN access is evaluated
- THEN the assignment SHALL be EXPIRED

#### Scenario: Assignment was revoked

- GIVEN the assignment has been revoked
- WHEN access is evaluated
- THEN the assignment SHALL be REVOKED

### Requirement: Expired access behavior

The system SHALL remove paid-tier content access after a manual assignment
expires.

#### Scenario: Silver access expires

- GIVEN a member had active Silver access
- AND the assignment reaches its expiration date
- WHEN the member's effective access is evaluated
- THEN Silver and higher protected content SHALL be unavailable
- AND public or configured Free access SHALL remain available

#### Scenario: Expired member remains active

- GIVEN a member's tier access expires
- WHEN the expiration is processed or evaluated
- THEN the member account SHALL remain active
- AND the member SHALL still be able to log in and edit their basic profile

#### Scenario: Expired session is refreshed

- GIVEN a member has an existing authenticated session
- AND the current access assignment expires
- WHEN `/auth/me` or the Feed is requested
- THEN the system SHALL use the expired effective state
- AND SHALL NOT preserve obsolete premium access from cached session data

### Requirement: Manual access renewal

The system SHALL allow ARTIST and SUPER_ADMIN to renew manual tier access.

#### Scenario: Artist renews active access

- GIVEN a member has active tier access
- WHEN the artist extends the expiration date
- THEN the system SHALL preserve the current tier
- AND update the current access interval
- AND record a renewal event in access history

#### Scenario: Artist renews expired access

- GIVEN a member has expired access
- WHEN the artist grants a new valid access period
- THEN the system SHALL restore access according to the selected tier and dates
- AND record the renewal in history

#### Scenario: Subscriber attempts renewal

- GIVEN the authenticated user has the SUBSCRIBER role
- WHEN the user attempts to renew access
- THEN the system SHALL deny the operation

### Requirement: Manual tier change

The system SHALL allow authorized administrators to change the member's tier.

#### Scenario: Member changes from Silver to Gold

- GIVEN a member has current Silver access
- WHEN ARTIST changes the assignment to Gold
- THEN the system SHALL apply Gold according to the new assignment
- AND preserve the previous Silver information in history

#### Scenario: Member changes from Gold to Free

- GIVEN a member has current Gold access
- WHEN ARTIST changes the member to Free access
- THEN Gold-only content SHALL become unavailable
- AND the change SHALL be recorded

#### Scenario: Invalid tier is submitted

- GIVEN the selected tier does not exist
- WHEN a tier change is attempted
- THEN the system SHALL reject the operation
- AND preserve the previous valid assignment

### Requirement: Manual access revocation

The system SHALL allow ARTIST and SUPER_ADMIN to revoke an active assignment.

#### Scenario: Artist revokes access

- GIVEN a member has active premium access
- WHEN ARTIST revokes the assignment
- THEN the assignment SHALL become REVOKED
- AND premium content access SHALL be removed
- AND a revocation history event SHALL be stored

#### Scenario: Revocation includes a note

- GIVEN the artist provides an internal reason
- WHEN access is revoked
- THEN the reason SHALL be stored as administrative history
- AND SHALL NOT be exposed publicly to the member unless explicitly allowed

#### Scenario: Subscriber attempts revocation

- GIVEN the authenticated user has the SUBSCRIBER role
- WHEN the user attempts to revoke access
- THEN the system SHALL deny the operation

### Requirement: Access history

The system SHALL preserve a history of manual tier-access operations.

#### Scenario: Access is granted

- GIVEN a valid access grant succeeds
- WHEN history is requested
- THEN the history SHALL identify the tier, dates, action, actor and timestamp

#### Scenario: Access is renewed

- GIVEN an access renewal succeeds
- WHEN history is requested
- THEN the renewal event SHALL be present

#### Scenario: Tier is changed

- GIVEN the tier changes from one valid tier to another
- WHEN history is requested
- THEN the history SHALL preserve the previous and new tier information

#### Scenario: Access is revoked

- GIVEN access is revoked
- WHEN history is requested
- THEN the revocation event SHALL be present

#### Scenario: Member requests administrative history

- GIVEN the authenticated user is a SUBSCRIBER
- WHEN the user attempts to retrieve internal access history
- THEN the system SHALL deny access to administrative notes and actor details

### Requirement: Access action audit information

The system SHALL record who performed each administrative access action.

#### Scenario: Artist grants access

- GIVEN ARTIST grants access
- WHEN the event is stored
- THEN the history SHALL identify the acting artist account

#### Scenario: Super administrator changes access

- GIVEN SUPER_ADMIN changes access
- WHEN the event is stored
- THEN the event SHALL identify the acting administrator internally

#### Scenario: Acting account is later changed

- GIVEN the actor's profile information changes later
- WHEN old history is reviewed
- THEN the historical action SHALL remain attributable through a stable actor
  identifier

### Requirement: Administrative access notes

The system SHALL support optional internal notes on access actions.

#### Scenario: Artist records external payment confirmation

- GIVEN the artist confirmed payment through WhatsApp or Discord
- WHEN granting or renewing access
- THEN the artist MAY store an internal note

#### Scenario: Member views their access

- GIVEN an internal note exists
- WHEN the member views their current access information
- THEN the system SHALL NOT expose the internal note

#### Scenario: Authorized administrator views history

- GIVEN ARTIST or SUPER_ADMIN views the member access history
- WHEN history is returned
- THEN internal notes MAY be displayed

### Requirement: User-management access status

The system SHALL display effective access information in user management.

#### Scenario: Active access is displayed

- GIVEN a member has active Silver access
- WHEN the user list or detail is rendered
- THEN the system SHALL display Silver and ACTIVE

#### Scenario: Expiring access is displayed

- GIVEN an active assignment expires within the configured warning interval
- WHEN user management is rendered
- THEN the system SHALL identify the access as expiring soon

#### Scenario: Expired access is displayed

- GIVEN a member's assignment has expired
- WHEN user management is rendered
- THEN the system SHALL display EXPIRED
- AND premium access SHALL not be represented as active

#### Scenario: Permanent access is displayed

- GIVEN an assignment has no expiration date
- WHEN user management is rendered
- THEN the system SHALL display PERMANENT

### Requirement: Access status filters

The system SHALL allow ARTIST and SUPER_ADMIN to filter users by effective
access status.

#### Scenario: Filter active access

- GIVEN members have different access states
- WHEN the administrator filters by ACTIVE
- THEN only members with effective active access SHALL be returned

#### Scenario: Filter expiring access

- GIVEN members have access expiring within the configured warning interval
- WHEN the administrator filters by EXPIRING_SOON
- THEN those members SHALL be returned

#### Scenario: Filter expired access

- GIVEN expired assignments exist
- WHEN the administrator filters by EXPIRED
- THEN expired members SHALL be returned

#### Scenario: Filter permanent access

- GIVEN permanent assignments exist
- WHEN the administrator filters by PERMANENT
- THEN permanent-access members SHALL be returned

### Requirement: Member access summary

The system SHALL provide members with a safe read-only summary of their current
access.

#### Scenario: Member has active access

- GIVEN the authenticated subscriber has active Gold access
- WHEN the member identity or profile is rendered
- THEN the system SHALL display Gold
- AND the access expiration date when one exists

#### Scenario: Member has permanent access

- GIVEN the subscriber has permanent access
- WHEN the access summary is rendered
- THEN the system SHALL display the tier and permanent state

#### Scenario: Member access is expired

- GIVEN the subscriber's access has expired
- WHEN the access summary is rendered
- THEN the system SHALL display a controlled expired-access state
- AND SHALL NOT display internal history or notes

### Requirement: Current session access synchronization

The system SHALL return effective current access through the authenticated
session endpoint.

#### Scenario: Active access is returned

- GIVEN a subscriber has active Silver access
- WHEN `/auth/me` is requested
- THEN the response SHALL include Silver as the effective tier
- AND include safe validity metadata

#### Scenario: Access expires without a new login

- GIVEN the subscriber's assignment expires
- WHEN `/auth/me` is requested using the existing valid token
- THEN the response SHALL no longer grant Silver access

#### Scenario: Access is renewed

- GIVEN an expired subscriber is renewed
- WHEN `/auth/me` is refreshed
- THEN the new effective tier and validity SHALL be returned

### Requirement: Feed integration

The system SHALL use effective current access when authorizing premium content.

#### Scenario: Active Gold member opens Feed

- GIVEN a subscriber has active Gold access
- WHEN the Feed is requested
- THEN the subscriber SHALL access Gold and lower-priority content

#### Scenario: Expired Gold member opens Feed

- GIVEN the subscriber's Gold access expired
- WHEN the Feed is requested
- THEN Gold and Silver protected media SHALL remain locked
- AND public or Free content SHALL remain available

#### Scenario: Artist opens Feed

- GIVEN the current user is ARTIST
- WHEN the Feed is requested
- THEN all content SHALL remain available regardless of manual tier validity

#### Scenario: Super administrator opens Feed

- GIVEN the current user is SUPER_ADMIN
- WHEN the Feed is requested
- THEN all content SHALL remain available regardless of manual tier validity

### Requirement: Existing assignment migration

The system SHALL preserve existing user tier assignments when introducing
validity records.

#### Scenario: Existing user has Silver tier

- GIVEN a user is assigned Silver before the migration
- WHEN the new access model is introduced
- THEN the system SHALL create or infer a valid current access record
- AND the user SHALL not unexpectedly lose access

#### Scenario: Existing user has no tier

- GIVEN a user has no assigned tier before migration
- WHEN the migration is applied
- THEN the user SHALL retain public or Free access

#### Scenario: Existing artist or administrator has no tier

- GIVEN ARTIST or SUPER_ADMIN does not have a tier
- WHEN the migration is applied
- THEN role-based content bypass SHALL remain functional

