## 1. Existing User Management Review

- [x] 1.1 Review the current Users page, user detail form and access-management controls
- [x] 1.2 Review the current user list and user detail backend endpoints
- [x] 1.3 Review the existing tier list endpoint and response shape
- [x] 1.4 Review current user-to-tier persistence in Prisma and services
- [x] 1.5 Review current role-assignment authorization
- [x] 1.6 Review hidden SUPER_ADMIN filtering
- [x] 1.7 Reproduce the issue where role options appear instead of tier options
- [x] 1.8 Identify any frontend state or DTO that incorrectly mixes role and tier

## 2. User Query DTO and Validation

- [x] 2.1 Create or extend a user-list query DTO
- [x] 2.2 Add trimmed search input validation
- [x] 2.3 Add optional tierId validation
- [x] 2.4 Add optional account-status validation
- [x] 2.5 Add permitted optional role-filter validation
- [x] 2.6 Add page and limit validation with safe defaults
- [x] 2.7 Add a maximum page-size limit
- [x] 2.8 Add tests for valid and invalid query parameters

## 3. Server-Side User Search

- [x] 3.1 Implement case-insensitive name search
- [x] 3.2 Implement case-insensitive email search
- [x] 3.3 Combine name and email search with OR semantics
- [x] 3.4 Keep hidden and system users excluded
- [x] 3.5 Combine search with other filters using AND semantics
- [x] 3.6 Add tests for name, email, case-insensitive and empty-result searches

## 4. User Filters

- [x] 4.1 Implement tierId filtering
- [x] 4.2 Implement account-status filtering
- [x] 4.3 Implement permitted role filtering
- [x] 4.4 Prevent SUPER_ADMIN from becoming a normal filter value
- [x] 4.5 Ensure ARTIST filters do not reveal hidden privileged accounts
- [x] 4.6 Add tests for individual and combined filters

## 5. User Pagination

- [x] 5.1 Implement backend page and limit handling
- [x] 5.2 Calculate total using the same visibility, search and filter conditions
- [x] 5.3 Return pagination metadata
- [x] 5.4 Ensure hidden SUPER_ADMIN is excluded from totals
- [x] 5.5 Handle pages beyond available results safely
- [x] 5.6 Add pagination tests

## 6. Safe User Management Response

- [x] 6.1 Include safe identity fields
- [x] 6.2 Include current roles
- [x] 6.3 Include current account status
- [x] 6.4 Include tier id, name and priority
- [x] 6.5 Represent no-tier or Free state consistently
- [x] 6.6 Exclude password and sensitive system fields
- [x] 6.7 Preserve hidden SUPER_ADMIN exclusion in list and detail responses
- [x] 6.8 Add response-shape tests

## 7. Tier Assignment Backend

- [x] 7.1 Choose an explicit secure tier-assignment endpoint or refine the existing administrative update endpoint
- [x] 7.2 Create an allowlisted tier-assignment DTO
- [x] 7.3 Validate that the requested tier exists
- [x] 7.4 Validate that the target user exists and is eligible
- [x] 7.5 Allow ARTIST to assign tiers to eligible members
- [x] 7.6 Allow SUPER_ADMIN to assign tiers to eligible members
- [x] 7.7 Deny SUBSCRIBER tier assignment
- [x] 7.8 Prevent hidden or system-account tier assignment through ordinary management
- [x] 7.9 Return the updated safe user representation
- [x] 7.10 Add tests for success, invalid tier, hidden target and permission denial

## 8. Role Assignment Separation

- [x] 8.1 Separate backend role update DTOs from tier assignment DTOs where currently mixed
- [x] 8.2 Preserve SUPER_ADMIN-only ARTIST assignment
- [x] 8.3 Preserve the single-active-artist constraint
- [x] 8.4 Deny ARTIST from assigning ARTIST or SUPER_ADMIN
- [x] 8.5 Prevent SUPER_ADMIN from appearing as a normal assignable role
- [x] 8.6 Add regression tests for role-assignment boundaries

## 9. Tier Options Frontend Service

- [x] 9.1 Reuse or create a typed frontend tier-list service
- [x] 9.2 Load tier options from the existing backend endpoint
- [x] 9.3 Represent tier id, name, description and priority
- [x] 9.4 Remove all hardcoded role values from the tier selector
- [x] 9.5 Add controlled loading, error and retry states
- [x] 9.6 Add tests confirming Free, Silver and Gold are rendered from API data

## 10. User Search Frontend

- [x] 10.1 Add a search field to the Users page
- [x] 10.2 Search by name or email
- [x] 10.3 Submit or debounce search according to existing project conventions
- [x] 10.4 Reset pagination to page 1 when search changes
- [x] 10.5 Add clear-search behavior
- [x] 10.6 Add loading and empty-result states
- [x] 10.7 Add frontend search tests

## 11. User Filters Frontend

- [x] 11.1 Add a tier filter loaded from the tier API
- [x] 11.2 Add an account-status filter
- [x] 11.3 Add a permitted role filter for SUPER_ADMIN when appropriate
- [x] 11.4 Ensure SUPER_ADMIN is never exposed as a normal filter option
- [x] 11.5 Combine filters with search
- [x] 11.6 Reset pagination to page 1 when filters change
- [x] 11.7 Add a clear-filters action
- [x] 11.8 Add frontend filter tests

## 12. User Pagination Frontend

- [x] 12.1 Consume backend pagination metadata
- [x] 12.2 Add previous and next page controls
- [x] 12.3 Display current page and total pages
- [x] 12.4 Preserve search and filters while navigating pages
- [x] 12.5 Disable unavailable page actions
- [x] 12.6 Handle empty later pages safely
- [x] 12.7 Add pagination tests

## 13. User Table Refinement

- [x] 13.1 Display User, Email, Role, Tier, Status, Created At and Actions columns
- [x] 13.2 Display current tier name distinctly from role
- [x] 13.3 Display a consistent Free or no-tier label
- [x] 13.4 Preserve hidden SUPER_ADMIN behavior
- [x] 13.5 Add a clear Manage Access action
- [x] 13.6 Preserve responsive behavior using current visual conventions
- [x] 13.7 Add table rendering tests

## 14. User Access Management Interface

- [x] 14.1 Separate identity, role, tier and status sections
- [x] 14.2 Display role as read-only for ARTIST where privileged editing is not allowed
- [x] 14.3 Display permitted role controls for SUPER_ADMIN separately
- [x] 14.4 Add a tier selector for ARTIST and SUPER_ADMIN
- [x] 14.5 Populate the tier selector with existing tiers
- [x] 14.6 Preselect the user's current tier
- [x] 14.7 Disable save while tiers are loading or update is in progress
- [x] 14.8 Show validation and backend errors
- [x] 14.9 Show successful assignment feedback
- [x] 14.10 Add role-and-tier separation tests

## 15. Tier Assignment State Refresh

- [x] 15.1 Refresh or update selected user details after assignment
- [x] 15.2 Refresh or update the matching user-list row
- [x] 15.3 Preserve current search, filters and page
- [x] 15.4 Prevent optimistic state from remaining after a failed request
- [x] 15.5 Ensure the updated tier is visible without a full manual reload
- [x] 15.6 Add frontend state-refresh tests

## 16. Current Session and Feed Integration

- [x] 16.1 Verify `/auth/me` returns the current assigned tier
- [x] 16.2 Verify session refresh updates the member tier badge
- [x] 16.3 Verify Silver unlocks priority 2 and lower content
- [x] 16.4 Verify Gold unlocks priority 5 and lower content
- [x] 16.5 Verify downgrade to Free locks higher-tier content
- [x] 16.6 Preserve ARTIST and SUPER_ADMIN content-access bypass
- [x] 16.7 Add integration tests for assignment followed by session and Feed refresh

## 17. Tier Deletion Safety Review

- [x] 17.1 Review current behavior when deleting a tier assigned to users
- [x] 17.2 Review current behavior when deleting a tier assigned to posts
- [x] 17.3 Prevent unsafe deletion or apply the smallest safe correction if needed
- [x] 17.4 Add controlled error feedback for referenced tiers where applicable
- [x] 17.5 Document any remaining deletion limitation

## 18. End-to-End Validation

- [x] 18.1 Confirm Free, Silver and Gold exist in tier management
- [x] 18.2 Open a subscriber profile as ARTIST
- [x] 18.3 Confirm role and tier are separate
- [x] 18.4 Confirm the tier selector shows Free, Silver and Gold
- [x] 18.5 Assign Silver and save
- [x] 18.6 Confirm Silver appears in the user list and detail
- [x] 18.7 Login as that member and refresh the session
- [x] 18.8 Confirm the Silver badge appears
- [x] 18.9 Confirm Silver and lower content are available
- [x] 18.10 Assign Gold
- [x] 18.11 Confirm Gold and lower content are available
- [x] 18.12 Assign Free or clear the tier according to the existing convention
- [x] 18.13 Confirm higher-tier content becomes locked
- [x] 18.14 Search a user by name
- [x] 18.15 Search a user by email
- [x] 18.16 Filter users by tier
- [x] 18.17 Filter users by status
- [x] 18.18 Navigate multiple pages of results
- [x] 18.19 Confirm hidden SUPER_ADMIN never appears
- [x] 18.20 Confirm ARTIST cannot assign ARTIST or SUPER_ADMIN roles
- [x] 18.21 Confirm SUBSCRIBER cannot assign tiers

## 19. Quality and Regression Validation

- [x] 19.1 Run backend tests and fix change-related failures
- [x] 19.2 Run frontend tests and fix change-related failures
- [x] 19.3 Run backend lint and fix new issues
- [x] 19.4 Run frontend lint and fix new issues
- [x] 19.5 Run backend production build
- [x] 19.6 Run frontend production build
- [x] 19.7 Run Prisma validate
- [x] 19.8 Confirm no unnecessary migration was created
- [x] 19.9 Review the final diff for unrelated changes
- [x] 19.10 Verify no secrets were added
- [x] 19.11 Fix regressions within the defined scope

## 20. OpenSpec Completion

- [x] 20.1 Update task checkboxes only after implementation and verification
- [x] 20.2 Run `openspec validate user-tier-assignment-and-search`
- [x] 20.3 Produce a final implementation report
- [x] 20.4 Document endpoints, filters, pagination, authorization, tests and remaining limitations
