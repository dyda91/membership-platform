## 1. Existing Tier Access Review

- [x] 1.1 Review the current User-to-Tier Prisma relationship
- [x] 1.2 Review tier assignment endpoints, DTOs and authorization
- [x] 1.3 Review `/auth/me` effective tier response
- [x] 1.4 Review Feed cumulative tier-access evaluation
- [x] 1.5 Review current user search, filters and pagination
- [x] 1.6 Review tier deletion behavior and references from users and posts
- [x] 1.7 Identify existing tier assignments that require data migration
- [x] 1.8 Document the selected compatibility strategy for `User.tierId`

## 2. Access Domain Model

- [x] 2.1 Add a TierAccessAssignment model or equivalent current-assignment model
- [x] 2.2 Add user and tier relationships
- [x] 2.3 Add startsAt and optional expiresAt
- [x] 2.4 Add revocation metadata
- [x] 2.5 Add createdBy and updatedBy actor relationships
- [x] 2.6 Add optional internal administrative note
- [x] 2.7 Add indexes required for user, status and expiration queries
- [x] 2.8 Ensure hidden/system accounts are not altered through normal assignments

## 3. Access History Model

- [x] 3.1 Add a TierAccessEvent or equivalent history model
- [x] 3.2 Add grant, renewal, tier-change, date-change, revoke and migration actions
- [x] 3.3 Store previous and new tier references where applicable
- [x] 3.4 Store previous and new validity values where applicable
- [x] 3.5 Store stable actor identifiers
- [x] 3.6 Store optional internal notes
- [x] 3.7 Preserve history when current assignment changes
- [x] 3.8 Add indexes for member and chronological history queries

## 4. Safe Migration and Existing Data Conversion

- [x] 4.1 Create a Prisma migration without resetting the database
- [x] 4.2 Preserve existing users, roles, tiers, posts and media
- [x] 4.3 Convert existing paid or explicit tier assignments into active permanent assignments
- [x] 4.4 Preserve Free or no-tier behavior according to the current convention
- [x] 4.5 Avoid requiring access assignments for ARTIST and SUPER_ADMIN
- [x] 4.6 Create migration history events where appropriate
- [x] 4.7 Synchronize or deprecate `User.tierId` according to the selected strategy
- [x] 4.8 Regenerate Prisma Client
- [x] 4.9 Run Prisma validation and migration status
- [x] 4.10 Verify migrated users retain their previous effective access

## 5. Effective Access Service

- [x] 5.1 Create or extend a centralized TierAccessService
- [x] 5.2 Derive NONE, SCHEDULED, ACTIVE, EXPIRED and REVOKED states
- [x] 5.3 Represent permanent active access safely
- [x] 5.4 Derive EXPIRING_SOON using configurable warning days
- [x] 5.5 Apply UTC-safe start and expiration comparisons
- [x] 5.6 Return effective tier and priority only for active assignments
- [x] 5.7 Preserve ARTIST and SUPER_ADMIN role bypass
- [x] 5.8 Preserve public or Free fallback behavior
- [x] 5.9 Add unit tests for every status and boundary instant

## 6. Manual Access Grant Backend

- [x] 6.1 Create an allowlisted grant-access DTO
- [x] 6.2 Validate tier existence
- [x] 6.3 Validate eligible target member
- [x] 6.4 Validate startsAt and expiresAt
- [x] 6.5 Support permanent access with no expiration
- [x] 6.6 Derive actor from the authenticated request
- [x] 6.7 Create assignment and grant-history event transactionally
- [x] 6.8 Allow ARTIST and SUPER_ADMIN
- [x] 6.9 Deny SUBSCRIBER
- [x] 6.10 Prevent hidden/system target assignment
- [x] 6.11 Return the updated safe access summary
- [x] 6.12 Add backend grant tests

## 7. Renewal Backend

- [x] 7.1 Create a secure renewal operation
- [x] 7.2 Support renewal of active access
- [x] 7.3 Support renewal of expired access
- [x] 7.4 Validate the new expiration date
- [x] 7.5 Preserve or intentionally update the tier
- [x] 7.6 Record a renewal history event
- [x] 7.7 Perform assignment and history changes transactionally
- [x] 7.8 Add tests for active, expired and invalid renewals

## 8. Tier and Date Change Backend

- [x] 8.1 Create an allowlisted access-update DTO
- [x] 8.2 Support changing the tier
- [x] 8.3 Support changing the start date
- [x] 8.4 Support changing the expiration date
- [x] 8.5 Support converting between fixed-term and permanent access
- [x] 8.6 Preserve previous values in history
- [x] 8.7 Reject invalid tiers and date ranges
- [x] 8.8 Perform changes transactionally
- [x] 8.9 Add update and tier-change tests

## 9. Revocation Backend

- [x] 9.1 Create a secure revocation operation
- [x] 9.2 Record revokedAt and revokedBy
- [x] 9.3 Record an optional internal reason
- [x] 9.4 Create a revocation history event
- [x] 9.5 Remove effective premium access immediately
- [x] 9.6 Preserve the member account and login access
- [x] 9.7 Handle repeated revocation safely
- [x] 9.8 Add revocation authorization and behavior tests

## 10. Access History Backend

- [x] 10.1 Create an ARTIST and SUPER_ADMIN access-history endpoint
- [x] 10.2 Return events in reverse chronological order
- [x] 10.3 Include safe previous and new tier summaries
- [x] 10.4 Include validity changes
- [x] 10.5 Include safe actor information
- [x] 10.6 Include internal notes only for authorized administrators
- [x] 10.7 Deny subscriber access to internal history
- [x] 10.8 Add history response and authorization tests

## 11. User Query and Access Status Filters

- [x] 11.1 Extend user list query DTO with accessStatus
- [x] 11.2 Implement ACTIVE filtering
- [x] 11.3 Implement EXPIRING_SOON filtering
- [x] 11.4 Implement EXPIRED filtering
- [x] 11.5 Implement PERMANENT filtering
- [x] 11.6 Implement SCHEDULED filtering where useful
- [x] 11.7 Combine access status with search, tier, account status and role filters
- [x] 11.8 Preserve pagination and hidden SUPER_ADMIN filtering
- [x] 11.9 Add filter and pagination tests

## 12. User Management Response

- [x] 12.1 Add safe current access summary to user list responses
- [x] 12.2 Add complete administrative current access summary to user details
- [x] 12.3 Include status, tier, startsAt, expiresAt and permanent state
- [x] 12.4 Include expiring-soon presentation metadata
- [x] 12.5 Exclude internal notes from ordinary list responses
- [x] 12.6 Preserve role and tier separation
- [x] 12.7 Add safe response-shape tests

## 13. Current Session Integration

- [x] 13.1 Update `/auth/me` to use effective current access
- [x] 13.2 Return effective tier only when access is active
- [x] 13.3 Return safe start, expiration and permanent metadata
- [x] 13.4 Return expired state without exposing internal history
- [x] 13.5 Ensure an old token does not preserve expired access
- [x] 13.6 Ensure renewal appears after session refresh
- [x] 13.7 Add session tests for active, expired, permanent and renewed access

## 14. Feed Authorization Integration

- [x] 14.1 Replace stale direct User tier access with the centralized effective-access service
- [x] 14.2 Preserve cumulative tier priority
- [x] 14.3 Lock premium media after expiration
- [x] 14.4 Restore access after renewal
- [x] 14.5 Remove access immediately after revocation
- [x] 14.6 Preserve ARTIST and SUPER_ADMIN bypass
- [x] 14.7 Preserve visitor public access
- [x] 14.8 Add Feed integration tests for all access states

## 15. User Access Form Frontend

- [x] 15.1 Extend the current Manage Access interface
- [x] 15.2 Display the current effective tier
- [x] 15.3 Display the current access status
- [x] 15.4 Add start date control
- [x] 15.5 Add expiration date control
- [x] 15.6 Add permanent-access control
- [x] 15.7 Add optional internal-note field
- [x] 15.8 Keep role controls separate
- [x] 15.9 Validate dates before submission
- [x] 15.10 Disable submission while saving
- [x] 15.11 Add controlled success and error states
- [x] 15.12 Add form tests

## 16. Grant and Update Actions Frontend

- [x] 16.1 Connect grant access to the backend
- [x] 16.2 Connect tier and date changes to the backend
- [x] 16.3 Preload current assignment values
- [x] 16.4 Support fixed-term access
- [x] 16.5 Support permanent access
- [x] 16.6 Preserve the previous state after failed updates
- [x] 16.7 Refresh selected user and table row after success
- [x] 16.8 Preserve current search, filters and page
- [x] 16.9 Add integration tests for grant and update

## 17. Renewal Frontend

- [x] 17.1 Add a Renew action for eligible assignments
- [x] 17.2 Allow selection of a new expiration date
- [x] 17.3 Support renewing expired access
- [x] 17.4 Show the current expiration before confirmation
- [x] 17.5 Display success and failure feedback
- [x] 17.6 Refresh the current user data after renewal
- [x] 17.7 Add renewal component tests

## 18. Revocation Frontend

- [x] 18.1 Add a Revoke Access action
- [x] 18.2 Require explicit confirmation
- [x] 18.3 Support an optional internal reason
- [x] 18.4 Prevent duplicate requests while revoking
- [x] 18.5 Refresh effective access after success
- [x] 18.6 Display the revoked state
- [x] 18.7 Add revocation component tests

## 19. Access History Frontend

- [x] 19.1 Add a View Access History action
- [x] 19.2 Create an access-history panel or dialog
- [x] 19.3 Display action, tier changes, date changes and timestamp
- [x] 19.4 Display safe actor identity
- [x] 19.5 Display internal notes only to authorized administrators
- [x] 19.6 Add loading, empty and error states
- [x] 19.7 Add history rendering tests

## 20. User Table and Filters Frontend

- [x] 20.1 Add effective access status to the user table
- [x] 20.2 Display expiration or permanent state
- [x] 20.3 Add Active access filter
- [x] 20.4 Add Expiring soon filter
- [x] 20.5 Add Expired filter
- [x] 20.6 Add Permanent filter
- [x] 20.7 Combine with existing search, tier and status filters
- [x] 20.8 Reset pagination when access filters change
- [x] 20.9 Preserve hidden SUPER_ADMIN behavior
- [x] 20.10 Add table and filter tests

## 21. Member Access Summary Frontend

- [x] 21.1 Extend the tier badge or profile summary with validity information
- [x] 21.2 Display active tier and expiration
- [x] 21.3 Display permanent state
- [x] 21.4 Display expired access safely
- [x] 21.5 Keep internal notes and history hidden
- [x] 21.6 Refresh the summary from `/auth/me`
- [x] 21.7 Add member-summary tests

## 22. Tier Deletion Safety

- [x] 22.1 Prevent hard deletion of tiers referenced by current assignments
- [x] 22.2 Prevent hard deletion of tiers referenced by access history
- [x] 22.3 Preserve existing post-reference protections
- [x] 22.4 Return a controlled conflict response
- [x] 22.5 Display a clear frontend deletion error
- [x] 22.6 Add referenced-tier deletion tests

## 23. End-to-End Validation

- [x] 23.1 Confirm migrated existing users retain their tier access
- [x] 23.2 Grant Silver access with fixed expiration
- [x] 23.3 Confirm status is ACTIVE
- [x] 23.4 Confirm Silver and lower content is available
- [x] 23.5 Grant permanent Gold access to another member
- [x] 23.6 Confirm permanent status
- [x] 23.7 Create scheduled future access
- [x] 23.8 Confirm it does not activate early
- [x] 23.9 Simulate or create an expired assignment
- [x] 23.10 Confirm premium content becomes locked
- [x] 23.11 Confirm the account remains active
- [x] 23.12 Renew the expired assignment
- [x] 23.13 Confirm access returns
- [x] 23.14 Change Silver to Gold
- [x] 23.15 Confirm cumulative Gold access
- [x] 23.16 Revoke active access
- [x] 23.17 Confirm immediate access removal
- [x] 23.18 Inspect grant, renewal, change and revoke history
- [x] 23.19 Confirm actor attribution
- [x] 23.20 Confirm internal notes are hidden from the member
- [x] 23.21 Filter active members
- [x] 23.22 Filter expiring members
- [x] 23.23 Filter expired members
- [x] 23.24 Filter permanent members
- [x] 23.25 Confirm hidden SUPER_ADMIN remains absent
- [x] 23.26 Confirm ARTIST and SUPER_ADMIN still bypass tier restrictions

## 24. Quality and Regression Validation

- [x] 24.1 Run backend tests and fix change-related failures
- [x] 24.2 Run frontend tests and fix change-related failures
- [x] 24.3 Run backend lint and fix new issues
- [x] 24.4 Run frontend lint and fix new issues
- [x] 24.5 Run backend production build
- [x] 24.6 Run frontend production build
- [x] 24.7 Run Prisma validate
- [x] 24.8 Run Prisma migration status
- [x] 24.9 Review migration SQL for destructive behavior
- [x] 24.10 Verify no existing user unexpectedly lost access
- [x] 24.11 Review the final diff for unrelated changes
- [x] 24.12 Verify no secrets were added
- [x] 24.13 Fix regressions within the defined scope

## 25. OpenSpec Completion

- [x] 25.1 Update task checkboxes only after implementation and verification
- [x] 25.2 Run `openspec validate manual-tier-validity-and-access-history`
- [x] 25.3 Produce a final implementation report
- [x] 25.4 Document migrations, compatibility strategy, endpoints, date rules, tests and remaining limitations
