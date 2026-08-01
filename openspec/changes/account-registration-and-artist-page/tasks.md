## 1. Existing Architecture Review

- [x] 1.1 Review the existing authentication registration and login implementation
- [x] 1.2 Review User, Role, Artist, Profile and Media Prisma models
- [x] 1.3 Review current SUPER_ADMIN bootstrap or seed behavior, if any
- [x] 1.4 Review current role assignment and hidden-account rules
- [x] 1.5 Review the existing Feed response and frontend Feed composition
- [x] 1.6 Review current MinIO upload and protected media services
- [x] 1.7 Review existing profile-editing routes, DTOs and components
- [x] 1.8 Identify reusable components and document implementation decisions when necessary

## 2. Public Registration Backend

- [x] 2.1 Define an explicit public registration DTO allowlist
- [x] 2.2 Ensure registration accepts only permitted public account fields
- [x] 2.3 Normalize and validate registration email
- [x] 2.4 Apply the existing password policy and hashing implementation
- [x] 2.5 Create every public account with only the SUBSCRIBER role
- [x] 2.6 Apply the server-defined default account status
- [x] 2.7 Ensure public registration does not assign tierId
- [x] 2.8 Reject or strip role, tier, status, hidden and system properties
- [x] 2.9 Return controlled duplicate-email and validation errors
- [x] 2.10 Add backend tests for valid and invalid registration flows

## 3. Public Registration Frontend

- [x] 3.1 Create or complete the public registration route
- [x] 3.2 Create the registration page using existing layout conventions
- [x] 3.3 Create name, email, password and password-confirmation fields
- [x] 3.4 Add client-side required-field and password-confirmation validation
- [x] 3.5 Connect the registration form to the authentication API
- [x] 3.6 Implement controlled loading and API error states
- [x] 3.7 Apply the selected post-registration login or redirect behavior
- [x] 3.8 Ensure the authenticated destination is the Feed
- [x] 3.9 Add a Login-to-Register and Register-to-Login navigation flow
- [x] 3.10 Add frontend tests for successful and failed registration

## 4. Initial SUPER_ADMIN Bootstrap

- [x] 4.1 Select an idempotent bootstrap approach compatible with the existing NestJS application
- [x] 4.2 Add documented bootstrap environment-variable names to `.env.example`
- [x] 4.3 Validate bootstrap configuration without logging secrets
- [x] 4.4 Create the initial SUPER_ADMIN only when no equivalent account exists
- [x] 4.5 Reuse the existing password hashing implementation
- [x] 4.6 Mark the bootstrapped account hidden or system using the existing model
- [x] 4.7 Prevent duplicate SUPER_ADMIN creation on repeated execution
- [x] 4.8 Prevent ordinary startup from overwriting an existing SUPER_ADMIN password
- [x] 4.9 Avoid all hardcoded production credentials
- [x] 4.10 Add tests for bootstrap creation, idempotency and missing configuration
- [x] 4.11 Document the exact initial bootstrap command or startup behavior

## 5. Single Active Artist Enforcement

- [x] 5.1 Define an eligible account rule for artist promotion
- [x] 5.2 Implement a transactional service operation for artist promotion
- [x] 5.3 Prevent promotion when another active ARTIST already exists
- [x] 5.4 Prevent ARTIST from assigning the ARTIST role
- [x] 5.5 Prevent SUBSCRIBER from assigning or self-assigning ARTIST
- [x] 5.6 Prevent hidden and system accounts from becoming the public artist
- [x] 5.7 Add a database-level constraint when safely supported by the current schema
- [x] 5.8 Add backend tests for first promotion and second-artist rejection

## 6. Controlled Artist Replacement

- [x] 6.1 Implement a SUPER_ADMIN-only artist replacement operation
- [x] 6.2 Validate the replacement account eligibility
- [x] 6.3 Perform previous-artist and replacement-account changes atomically
- [x] 6.4 Preserve exactly one active ARTIST after replacement
- [x] 6.5 Preserve or transfer the singleton public artist profile safely
- [x] 6.6 Prevent ARTIST from using the replacement operation
- [x] 6.7 Return controlled errors for invalid or conflicting replacements
- [x] 6.8 Add backend tests for successful and rejected replacement flows

## 7. Artist Profile Database Model

- [x] 7.1 Determine whether the current Artist or Profile model can represent the singleton public page
- [x] 7.2 Extend the existing model or create an ArtistProfile model only when necessary
- [x] 7.3 Add or verify association with the active ARTIST account
- [x] 7.4 Add display name, biography and presentation fields
- [x] 7.5 Add avatar and banner media references or equivalent safe metadata
- [x] 7.6 Add WhatsApp value and enabled state
- [x] 7.7 Add Discord URL and enabled state
- [x] 7.8 Add configurable contact-action text if required
- [x] 7.9 Create a safe Prisma migration without resetting existing data
- [x] 7.10 Regenerate Prisma Client and validate migration status

## 8. Artist Profile Backend

- [x] 8.1 Create or adapt the Artist Profile module structure
- [x] 8.2 Implement a public artist-profile read operation
- [x] 8.3 Ensure the public response excludes private user and storage information
- [x] 8.4 Implement an ARTIST and SUPER_ADMIN management read operation
- [x] 8.5 Implement an allowlisted artist-profile update DTO
- [x] 8.6 Allow only the active ARTIST or SUPER_ADMIN to update the profile
- [x] 8.7 Return safe defaults for incomplete optional profile data
- [x] 8.8 Implement a controlled no-active-artist response
- [x] 8.9 Add backend tests for public reads and authorized updates

## 9. Avatar and Banner Upload

- [x] 9.1 Reuse the existing MinIO and media-storage service for artist media
- [x] 9.2 Implement avatar image upload
- [x] 9.3 Implement banner image upload
- [x] 9.4 Validate allowed image MIME types
- [x] 9.5 Validate configured avatar and banner size limits
- [x] 9.6 Generate safe storage keys and persist metadata
- [x] 9.7 Update the artist-profile media reference only after successful storage
- [x] 9.8 Implement controlled fallback when profile media is missing
- [x] 9.9 Handle media replacement according to existing cleanup conventions
- [x] 9.10 Add integration tests using real MinIO avatar and banner objects

## 10. Contact Channel Validation

- [x] 10.1 Define the accepted WhatsApp input and normalization strategy
- [x] 10.2 Generate or validate a safe WhatsApp external URL
- [x] 10.3 Validate supported Discord contact or invite URLs
- [x] 10.4 Support independent enabled states for WhatsApp and Discord
- [x] 10.5 Exclude disabled or invalid contact channels from public responses
- [x] 10.6 Preserve previous valid settings when an invalid update is rejected
- [x] 10.7 Add backend tests for valid, invalid, enabled and disabled contacts

## 11. Feed Backend Integration

- [x] 11.1 Include safe artist public-profile data in the Feed flow or provide a coordinated public endpoint
- [x] 11.2 Ensure artist profile retrieval does not require authentication
- [x] 11.3 Preserve viewer-aware tier access for posts
- [x] 11.4 Preserve protected media URL omission for unauthorized viewers
- [x] 11.5 Return public contact actions for locked-content presentation
- [x] 11.6 Return a controlled state when no artist is active
- [x] 11.7 Ensure artist-profile failures do not crash the entire Feed
- [x] 11.8 Add feed integration tests with and without an active artist

## 12. Artist Header Frontend

- [x] 12.1 Create the ArtistHeader component
- [x] 12.2 Create the ArtistBanner component with a controlled fallback
- [x] 12.3 Create the ArtistAvatar component with a controlled fallback
- [x] 12.4 Display artist name, biography and presentation text
- [x] 12.5 Create the ArtistContactActions component
- [x] 12.6 Render only enabled WhatsApp and Discord actions
- [x] 12.7 Integrate the ArtistHeader above the existing Feed list
- [x] 12.8 Preserve the current Feed loading, empty and error behavior
- [x] 12.9 Create a controlled NoArtistConfiguredState
- [x] 12.10 Add component tests for complete, incomplete and missing artist profiles

## 13. Artist Profile Management Frontend

- [x] 13.1 Create the artist-profile edit route for ARTIST and SUPER_ADMIN
- [x] 13.2 Create the ArtistProfileEditPage
- [x] 13.3 Create the artist-profile text-field form
- [x] 13.4 Create WhatsApp and Discord configuration controls
- [x] 13.5 Create independent enable and disable controls for contact channels
- [x] 13.6 Create avatar upload and preview
- [x] 13.7 Create banner upload and preview
- [x] 13.8 Connect profile updates to the backend API
- [x] 13.9 Add loading, validation, success and error states
- [x] 13.10 Refresh the Feed artist header after successful updates
- [x] 13.11 Add route and component tests for ARTIST, SUPER_ADMIN and SUBSCRIBER

## 14. Artist Assignment Frontend

- [x] 14.1 Add a SUPER_ADMIN-only artist-assignment interface
- [x] 14.2 List only eligible normal accounts as artist candidates
- [x] 14.3 Display the currently active artist
- [x] 14.4 Implement first artist promotion
- [x] 14.5 Implement an explicit artist replacement confirmation dialog
- [x] 14.6 Display clear feedback when a second artist cannot be assigned
- [x] 14.7 Hide artist-assignment controls from ARTIST and SUBSCRIBER
- [x] 14.8 Add frontend tests for assignment and replacement flows

## 15. Locked Content Contact Actions

- [x] 15.1 Update the locked-content component to accept artist contact actions
- [x] 15.2 Display WhatsApp action when enabled
- [x] 15.3 Display Discord action when enabled
- [x] 15.4 Allow the member to choose when both channels are available
- [x] 15.5 Display a controlled message when no contact channel is configured
- [x] 15.6 Ensure no payment, checkout or plan-management page is introduced
- [x] 15.7 Preserve all protected-media security rules
- [x] 15.8 Add frontend tests for every contact-action state

## 16. Navigation and Access Integration

- [x] 16.1 Add Register navigation for unauthenticated visitors
- [x] 16.2 Keep the Feed as the root route
- [x] 16.3 Add artist-profile editing navigation for ARTIST
- [x] 16.4 Add artist setup or assignment navigation for SUPER_ADMIN
- [x] 16.5 Keep artist-management routes hidden from SUBSCRIBER
- [x] 16.6 Protect management routes against direct unauthorized navigation
- [x] 16.7 Verify backend authorization remains the final security boundary
- [x] 16.8 Add role-based navigation and route tests

## 17. End-to-End Functional Validation

- [x] 17.1 Start PostgreSQL and MinIO using the existing project workflow
- [x] 17.2 Run the SUPER_ADMIN bootstrap using documented secure configuration
- [x] 17.3 Verify repeated bootstrap does not create a duplicate
- [x] 17.4 Register a new account through the public frontend
- [x] 17.5 Verify the account is created only as SUBSCRIBER
- [x] 17.6 Verify role and tier injection attempts fail
- [x] 17.7 Promote the subscriber to ARTIST using SUPER_ADMIN
- [x] 17.8 Verify a second active ARTIST cannot be assigned
- [x] 17.9 Configure artist name, biography and presentation
- [x] 17.10 Upload a real avatar to MinIO
- [x] 17.11 Upload a real banner to MinIO
- [x] 17.12 Configure and display WhatsApp
- [x] 17.13 Configure and display Discord
- [x] 17.14 Verify the artist header appears above the public Feed
- [x] 17.15 Verify locked content displays available contact actions
- [x] 17.16 Verify ARTIST can manage the profile
- [x] 17.17 Verify SUBSCRIBER cannot manage the artist profile
- [x] 17.18 Replace the artist through SUPER_ADMIN and verify the single-artist constraint

## 18. Quality and Regression Validation

- [x] 18.1 Run backend tests and fix change-related failures
- [x] 18.2 Run frontend tests and fix change-related failures
- [x] 18.3 Run backend lint and fix new issues
- [x] 18.4 Run frontend lint and fix new issues
- [x] 18.5 Run backend production build
- [x] 18.6 Run frontend production build
- [x] 18.7 Run Prisma validation
- [x] 18.8 Run Prisma migration status
- [x] 18.9 Verify no real bootstrap credentials or secrets were committed
- [x] 18.10 Review the final diff for unrelated changes
- [x] 18.11 Fix regressions within the defined change scope

## 19. OpenSpec Completion

- [x] 19.1 Update task checkboxes only after implementation and verification
- [x] 19.2 Run `openspec validate account-registration-and-artist-page`
- [x] 19.3 Produce a final implementation report
- [x] 19.4 Document bootstrap usage, migrations, endpoints, tests and remaining limitations
