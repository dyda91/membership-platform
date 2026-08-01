## 1. Existing Authentication Review

- [x] 1.1 Review the current JWT strategy, guards and request user shape
- [x] 1.2 Review login response payload and token claims
- [x] 1.3 Review the frontend authentication context or store
- [x] 1.4 Review localStorage or other persisted authentication data
- [x] 1.5 Review role-aware navigation and protected routes
- [x] 1.6 Review current ARTIST promotion and downgrade operations
- [x] 1.7 Review tier-access evaluation for SUBSCRIBER, ARTIST and SUPER_ADMIN
- [x] 1.8 Reproduce the promoted-account access problem before modifying code

## 2. Database-Backed JWT Resolution

- [x] 2.1 Update or confirm JWT validation resolves the current account from the database
- [x] 2.2 Attach current roles, tier and status to the authenticated request user
- [x] 2.3 Reject tokens whose account no longer exists
- [x] 2.4 Reject authenticated access for inactive or blocked accounts
- [x] 2.5 Ensure stale role claims do not override database roles
- [x] 2.6 Standardize the authenticated request-user shape
- [x] 2.7 Add backend tests for valid, missing, inactive and changed-role accounts

## 3. Current Session Endpoint

- [x] 3.1 Create or consolidate `GET /auth/me`
- [x] 3.2 Return current roles from the database
- [x] 3.3 Return current tier and tier priority safely
- [x] 3.4 Return current account status
- [x] 3.5 Return only safe frontend session fields
- [x] 3.6 Exclude password, secrets and unnecessary system metadata
- [x] 3.7 Add tests for current subscriber, artist and super-administrator sessions
- [x] 3.8 Add tests proving the response changes after promotion and downgrade

## 4. Backend Role Authorization Consolidation

- [x] 4.1 Ensure role guards use the database-backed request user
- [x] 4.2 Verify ARTIST can access Dashboard-related backend data
- [x] 4.3 Verify ARTIST can manage posts
- [x] 4.4 Verify ARTIST can manage eligible users
- [x] 4.5 Verify ARTIST can manage tiers
- [x] 4.6 Verify SUBSCRIBER is denied from all administrative endpoints
- [x] 4.7 Verify old ARTIST tokens are denied after database downgrade
- [x] 4.8 Preserve hidden SUPER_ADMIN restrictions
- [x] 4.9 Add backend authorization regression tests

## 5. Tier Access Consolidation

- [x] 5.1 Review the current content-access service or helper
- [x] 5.2 Explicitly allow ARTIST to access all platform post media
- [x] 5.3 Explicitly allow SUPER_ADMIN to access all platform post media
- [x] 5.4 Preserve cumulative tier priority for SUBSCRIBER
- [x] 5.5 Preserve locked media for insufficient SUBSCRIBER tier
- [x] 5.6 Preserve public content access for visitors
- [x] 5.7 Add tests for every role and tier branch

## 6. Frontend Session State

- [x] 6.1 Refactor or extend the authentication store to hold currentUser
- [x] 6.2 Add session loading state
- [x] 6.3 Add controlled session error state
- [x] 6.4 Implement a reusable current-session request
- [x] 6.5 Implement `refreshSession()` or equivalent
- [x] 6.6 Stop using decoded JWT roles as the authoritative frontend role source
- [x] 6.7 Stop relying on indefinitely cached login user data
- [x] 6.8 Clear all session-derived role and tier data during logout
- [x] 6.9 Add frontend tests for session-state transitions

## 7. Application Session Initialization

- [x] 7.1 Detect a stored token during application startup
- [x] 7.2 Request the current session before deciding protected access
- [x] 7.3 Store the database-backed current user after successful initialization
- [x] 7.4 Clear invalid or expired tokens
- [x] 7.5 Clear sessions for inactive or blocked accounts
- [x] 7.6 Handle temporary network failures without granting admin access
- [x] 7.7 Prevent premature redirects while session state is loading
- [x] 7.8 Add initialization tests for subscriber, artist, invalid token and network failure

## 8. Login and Logout Synchronization

- [x] 8.1 Store the token after successful login
- [x] 8.2 Load `/auth/me` immediately after login
- [x] 8.3 Use the current session response for role-aware rendering
- [x] 8.4 Preserve Feed as the post-login destination
- [x] 8.5 Clear token and currentUser on logout
- [x] 8.6 Clear authentication caches on logout
- [x] 8.7 Add login and logout synchronization tests

## 9. Role-Aware Navigation Refactor

- [x] 9.1 Centralize frontend role and capability helpers
- [x] 9.2 Render subscriber navigation from currentUser roles
- [x] 9.3 Render artist navigation from currentUser roles
- [x] 9.4 Render super-administrator navigation from currentUser roles
- [x] 9.5 Recalculate navigation after session refresh
- [x] 9.6 Ensure promoted ARTIST sees Dashboard, Posts, Users and Tiers
- [x] 9.7 Ensure downgraded SUBSCRIBER loses administrative navigation
- [x] 9.8 Preserve the tier badge using current session tier
- [x] 9.9 Add role-aware navigation tests

## 10. Protected Route Refactor

- [x] 10.1 Update protected routes to wait for session initialization
- [x] 10.2 Allow ARTIST access to Dashboard
- [x] 10.3 Allow ARTIST access to Posts
- [x] 10.4 Allow ARTIST access to Users
- [x] 10.5 Allow ARTIST access to Tiers
- [x] 10.6 Deny SUBSCRIBER access to administrative routes
- [x] 10.7 Redirect unauthorized authenticated users to Feed
- [x] 10.8 Redirect a downgraded user away from an open admin page after session refresh
- [x] 10.9 Add direct-URL route tests

## 11. API Authentication Error Handling

- [x] 11.1 Review Axios interceptors or equivalent API error handling
- [x] 11.2 Clear invalid sessions on 401 responses
- [x] 11.3 Handle inactive-account session rejection consistently
- [x] 11.4 Preserve authenticated session on ordinary 403 permission denial
- [x] 11.5 Avoid redirect loops between Feed and Login
- [x] 11.6 Add API error-handling tests where practical

## 12. Promotion and Downgrade Integration

- [x] 12.1 Verify ARTIST promotion persists the correct database role
- [x] 12.2 Verify promoted accounts return ARTIST through `/auth/me`
- [x] 12.3 Verify a page reload is sufficient to receive ARTIST access
- [x] 12.4 Verify downgraded accounts return SUBSCRIBER through `/auth/me`
- [x] 12.5 Verify old tokens do not preserve removed administrative permissions
- [x] 12.6 Preserve the one-active-artist constraint
- [x] 12.7 Add integration tests for promotion and downgrade

## 13. End-to-End Validation

- [x] 13.1 Register a new SUBSCRIBER account
- [x] 13.2 Login and confirm subscriber navigation
- [x] 13.3 Confirm administrative routes and endpoints are denied
- [x] 13.4 Promote the account to ARTIST using SUPER_ADMIN
- [x] 13.5 Reload the promoted account session
- [x] 13.6 Confirm Dashboard is visible and accessible
- [x] 13.7 Confirm Posts is visible and accessible
- [x] 13.8 Confirm Users is visible and accessible
- [x] 13.9 Confirm Tiers is visible and accessible
- [x] 13.10 Confirm ARTIST can create or edit a post
- [x] 13.11 Confirm ARTIST can view all tier-protected media
- [x] 13.12 Downgrade the ARTIST account to SUBSCRIBER
- [x] 13.13 Reload the downgraded account session
- [x] 13.14 Confirm administrative navigation disappears
- [x] 13.15 Confirm administrative routes redirect to Feed
- [x] 13.16 Confirm administrative API requests with the old token are denied
- [x] 13.17 Confirm ordinary subscriber cumulative tier access still works

## 14. Quality and Regression Validation

- [x] 14.1 Run backend tests and fix change-related failures
- [x] 14.2 Run frontend tests and fix change-related failures
- [x] 14.3 Run backend lint and fix new issues
- [x] 14.4 Run frontend lint and fix new issues
- [x] 14.5 Run backend production build
- [x] 14.6 Run frontend production build
- [x] 14.7 Run Prisma validate
- [x] 14.8 Confirm no unnecessary migration was created
- [x] 14.9 Review the final diff for unrelated changes
- [x] 14.10 Verify no secrets were added
- [x] 14.11 Fix regressions within the defined scope

## 15. OpenSpec Completion

- [x] 15.1 Update task checkboxes only after implementation and verification
- [x] 15.2 Run `openspec validate role-access-and-session-sync`
- [x] 15.3 Produce a final implementation report
- [x] 15.4 Document session strategy, endpoint behavior, tests and remaining limitations
