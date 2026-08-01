## 1. Existing Implementation Review

- [x] 1.1 Review the current frontend routes, navigation, role guards and authenticated-user state
- [x] 1.2 Review current User, Tier, Post and Media Prisma models and migrations
- [x] 1.3 Review backend role, tier and user-visibility authorization behavior
- [x] 1.4 Trace the current media upload, association, URL generation and frontend rendering flow
- [x] 1.5 Identify current dependencies on Post title and coverMediaId before changing them
- [x] 1.6 Record the selected implementation approach in existing code comments or change documentation where necessary

## 2. Database and Post Model Refinement

- [x] 2.1 Make the Post title optional or remove it without breaking existing records
- [x] 2.2 Remove or deprecate manual cover-media selection after confirming it is unused
- [x] 2.3 Add or verify deterministic media ordering for each post
- [x] 2.4 Add thumbnail metadata only if required for the selected video-preview implementation
- [x] 2.5 Create a safe Prisma migration for required schema changes
- [x] 2.6 Apply the migration without resetting existing data
- [x] 2.7 Regenerate Prisma Client and validate the resulting schema

## 3. Centralized Access Evaluation

- [x] 3.1 Create or refine a reusable content-access service or helper
- [x] 3.2 Allow public posts without tier evaluation
- [x] 3.3 Allow ARTIST and SUPER_ADMIN to access managed post media
- [x] 3.4 Implement cumulative member-tier access using tier priority
- [x] 3.5 Deny premium-media access to unauthenticated visitors
- [x] 3.6 Deny premium-media access when the member has no sufficient tier
- [x] 3.7 Add automated tests for all access-evaluation branches

## 4. Hidden SUPER_ADMIN Enforcement

- [x] 4.1 Exclude SUPER_ADMIN and system accounts from user list queries exposed to ARTIST
- [x] 4.2 Exclude hidden accounts from user search results
- [x] 4.3 Exclude hidden accounts from pagination totals and user counters
- [x] 4.4 Exclude hidden accounts from user-selection controls and assignment candidates
- [x] 4.5 Prevent ARTIST from retrieving a SUPER_ADMIN account directly by identifier
- [x] 4.6 Prevent ARTIST from editing, deactivating or deleting SUPER_ADMIN accounts
- [x] 4.7 Add tests confirming SUPER_ADMIN invisibility through all user-management flows

## 5. Role and Tier Assignment Rules

- [x] 5.1 Allow SUPER_ADMIN to assign the ARTIST role
- [x] 5.2 Prevent ARTIST from assigning ARTIST or SUPER_ADMIN roles
- [x] 5.3 Prevent SUBSCRIBER from changing any role
- [x] 5.4 Allow ARTIST and SUPER_ADMIN to assign tiers to eligible members
- [x] 5.5 Prevent SUBSCRIBER from assigning or changing tiers
- [x] 5.6 Prevent subscriber self-profile requests from changing role or tierId
- [x] 5.7 Add backend tests for role and tier assignment boundaries

## 6. Feed Backend

- [x] 6.1 Create or adapt a viewer-aware feed endpoint
- [x] 6.2 Allow unauthenticated access to the public feed
- [x] 6.3 Read optional authentication context when a valid token is supplied
- [x] 6.4 Return only published posts ordered by newest first
- [x] 6.5 Implement pagination using the project's established convention
- [x] 6.6 Include public author and tier presentation metadata
- [x] 6.7 Include media access state for each post
- [x] 6.8 Return safe locked-media metadata when access is denied
- [x] 6.9 Ensure protected storage URLs are omitted for unauthorized viewers
- [x] 6.10 Add tests for visitor, subscriber, artist and super-administrator feed responses

## 7. Media Retrieval and Display Repair

- [x] 7.1 Reproduce the current issue where uploaded image text appears but the image does not
- [x] 7.2 Verify uploaded objects exist in MinIO after successful upload
- [x] 7.3 Verify media records contain the correct storage key, MIME type and post association
- [x] 7.4 Correct presigned URL or protected media endpoint generation
- [x] 7.5 Correct MinIO bucket policy, endpoint or CORS configuration if required
- [x] 7.6 Verify browser-accessible image responses use the correct content type
- [x] 7.7 Verify browser-accessible video responses support the required playback behavior
- [x] 7.8 Prevent protected URLs from being produced for unauthorized viewers
- [x] 7.9 Add controlled handling for missing or inaccessible MinIO objects
- [x] 7.10 Add integration tests for real image and video upload, association and retrieval

## 8. Simplified Post Backend

- [x] 8.1 Update post creation DTOs so title is not required
- [x] 8.2 Update post update DTOs so title is not required
- [x] 8.3 Remove manual coverMediaId requirements from post workflows
- [x] 8.4 Use ordered post media to determine the primary preview
- [x] 8.5 Preserve text-only post creation
- [x] 8.6 Preserve mixed image and video post creation
- [x] 8.7 Update post service and controller tests for titleless posts
- [x] 8.8 Update API documentation or request examples affected by the simplified post model

## 9. Frontend Route Architecture

- [x] 9.1 Make the root route render the Feed page
- [x] 9.2 Keep Login accessible to unauthenticated visitors
- [x] 9.3 Restrict Dashboard to ARTIST and SUPER_ADMIN
- [x] 9.4 Restrict Posts routes to ARTIST and SUPER_ADMIN
- [x] 9.5 Restrict Users routes to ARTIST and SUPER_ADMIN
- [x] 9.6 Restrict Tiers routes to ARTIST and SUPER_ADMIN
- [x] 9.7 Redirect unauthorized authenticated users to the Feed
- [x] 9.8 Preserve backend authorization as the final security boundary
- [x] 9.9 Add route-guard tests for each role

## 10. Role-Aware Navigation

- [x] 10.1 Create a visitor navigation state with Feed and Login
- [x] 10.2 Create a subscriber navigation state with Feed, Profile and Logout
- [x] 10.3 Create an artist navigation state with Feed, Dashboard, Posts, Users, Tiers, Profile and Logout
- [x] 10.4 Create a super-administrator navigation state with the appropriate administration options
- [x] 10.5 Remove Dashboard, Posts, Users and Tiers links from subscriber navigation
- [x] 10.6 Ensure hidden routes cannot be accessed merely by manually entering their URLs
- [x] 10.7 Add navigation-rendering tests for unauthenticated and authenticated roles

## 11. Feed Frontend

- [x] 11.1 Create the FeedPage
- [x] 11.2 Create the feed data service and typed response models
- [x] 11.3 Create the FeedList component
- [x] 11.4 Create the FeedPostCard component
- [x] 11.5 Display post text for public and premium posts
- [x] 11.6 Display public author and publication information
- [x] 11.7 Implement feed pagination or incremental loading
- [x] 11.8 Add loading, empty and error states
- [x] 11.9 Ensure public feed failures do not redirect visitors to Login unnecessarily

## 12. Feed Media Components

- [x] 12.1 Create an ordered PostMediaGallery component
- [x] 12.2 Create an image media component with reliable URL rendering
- [x] 12.3 Create a video media component with playback controls
- [x] 12.4 Use the first ordered image as the primary preview
- [x] 12.5 Use an available thumbnail or controlled video poster for the first video
- [x] 12.6 Create a LockedMedia component for insufficient tier access
- [x] 12.7 Keep premium post text visible while media remains locked
- [x] 12.8 Ensure locked components never receive a protected media URL
- [x] 12.9 Add a controlled MediaErrorState component
- [x] 12.10 Add frontend tests for image, video, locked and failed media states

## 13. Tier Badge and Member Experience

- [x] 13.1 Add the authenticated user's tier data to the frontend session state if not already available
- [x] 13.2 Create a compact TierBadge component
- [x] 13.3 Display the badge near the authenticated user's identity
- [x] 13.4 Display a configured free or public label when no paid tier is assigned
- [x] 13.5 Ensure the subscriber badge does not link to tier administration
- [x] 13.6 Remove or avoid creating a separate member plan page
- [x] 13.7 Add tests for badge rendering with and without an assigned tier

## 14. Simplified Post Form

- [x] 14.1 Remove the title field from the new-post interface
- [x] 14.2 Remove the title field from the edit-post interface
- [x] 14.3 Remove manual cover-media selection from post forms
- [x] 14.4 Keep text, media, tier and publication-status controls
- [x] 14.5 Display uploaded images and videos before post submission
- [x] 14.6 Preserve media ordering in the submitted post
- [x] 14.7 Provide clear upload and association error messages
- [x] 14.8 Update frontend post service types and payloads
- [x] 14.9 Add tests for text-only, image and video post forms

## 15. Profile Editing Boundaries

- [x] 15.1 Define an allowlist of subscriber self-editable profile fields
- [x] 15.2 Prevent role, tier, status and system flags from being submitted through self-profile DTOs
- [x] 15.3 Allow subscribers to edit their own basic profile
- [x] 15.4 Prevent subscribers from editing other users
- [x] 15.5 Preserve the artist public-profile editing workflow
- [x] 15.6 Add backend and frontend tests for profile-editing boundaries

## 16. Dashboard Integration

- [x] 16.1 Keep the existing Dashboard available to ARTIST and SUPER_ADMIN
- [x] 16.2 Remove Dashboard as the default post-login destination for SUBSCRIBER
- [x] 16.3 Update dashboard links so administrative pages remain functional after route refactoring
- [x] 16.4 Verify Dashboard does not expose hidden SUPER_ADMIN account information
- [x] 16.5 Add access tests for Dashboard by role

## 17. Integration and Regression Testing

- [x] 17.1 Run backend unit tests and fix failures introduced by this change
- [x] 17.2 Run frontend tests and fix failures introduced by this change
- [x] 17.3 Run backend lint and resolve new errors
- [x] 17.4 Run frontend lint and resolve new errors
- [x] 17.5 Run backend production build
- [x] 17.6 Run frontend production build
- [x] 17.7 Validate visitor feed behavior
- [x] 17.8 Validate subscriber navigation, tier badge and cumulative content access
- [x] 17.9 Validate artist administration, post creation and tier assignment
- [x] 17.10 Validate SUPER_ADMIN invisibility from artist-facing user management
- [x] 17.11 Validate real image upload and feed display through MinIO
- [x] 17.12 Validate real video upload and feed playback through MinIO
- [x] 17.13 Validate that unauthorized feed responses contain no premium media URL
- [x] 17.14 Fix all regressions within the defined change scope

## 18. OpenSpec Completion

- [x] 18.1 Update task checkboxes as each task is completed
- [x] 18.2 Run `openspec validate platform-experience`
- [x] 18.3 Review the final diff for unrelated or accidental changes
- [x] 18.4 Produce a final implementation report with files, migrations, endpoints, tests and remaining limitations
