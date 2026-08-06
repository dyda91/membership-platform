## 1. Navigation and Layout Audit

- [x] 1.1 Review the current authenticated header and application shell
- [x] 1.2 Review the centralized role-aware navigation model
- [x] 1.3 Review all authenticated routes and nested-route patterns
- [x] 1.4 Review the shared messaging unread provider or hook
- [x] 1.5 Review account, tier, role and validity data available in currentUser
- [x] 1.6 Review current desktop, tablet and mobile navigation behavior
- [x] 1.7 Review current content-container widths and alignment
- [x] 1.8 Review icon dependencies already installed
- [x] 1.9 Review focus, tooltips and account-menu primitives
- [x] 1.10 Document the selected expanded, compact and mobile navigation strategies

## 2. Navigation Model Consolidation

- [x] 2.1 Consolidate navigation items into one typed source
- [x] 2.2 Add icon metadata
- [x] 2.3 Add group metadata
- [x] 2.4 Add route-match behavior for nested routes
- [x] 2.5 Add mobile-priority metadata
- [x] 2.6 Preserve visitor destinations
- [x] 2.7 Preserve SUBSCRIBER destinations
- [x] 2.8 Preserve ARTIST destinations
- [x] 2.9 Preserve SUPER_ADMIN destinations
- [x] 2.10 Add navigation-model tests for each role

## 3. Authenticated Application Shell

- [x] 3.1 Refactor the authenticated shell to support a sidebar
- [x] 3.2 Keep the public shell separate
- [x] 3.3 Add a sidebar region
- [x] 3.4 Add a main-content region with `min-width: 0` behavior
- [x] 3.5 Preserve nested route rendering
- [x] 3.6 Prevent unnecessary shell remounting during route changes
- [x] 3.7 Preserve dialog viewport positioning
- [x] 3.8 Add application-shell tests

## 4. Sidebar Brand and Identity Area

- [x] 4.1 Add a compact platform or artist identity region
- [x] 4.2 Link the identity region to the Feed where appropriate
- [x] 4.3 Preserve fallback behavior when no logo exists
- [x] 4.4 Support expanded and compact sidebar modes
- [x] 4.5 Add accessible labeling
- [x] 4.6 Add identity-region tests

## 5. Expanded Desktop Sidebar

- [x] 5.1 Create the expanded desktop sidebar
- [x] 5.2 Render icon and label for every primary item
- [x] 5.3 Render only permitted groups
- [x] 5.4 Add spacing between public, management, artist and account groups
- [x] 5.5 Add active-route presentation
- [x] 5.6 Add hover and focus presentation
- [x] 5.7 Add sidebar height and scrolling behavior
- [x] 5.8 Ensure bottom account area remains reachable
- [x] 5.9 Add expanded-sidebar tests

## 6. Sidebar Navigation Items

- [x] 6.1 Create or consolidate a reusable SidebarNavItem
- [x] 6.2 Support icon
- [x] 6.3 Support text label
- [x] 6.4 Support active state
- [x] 6.5 Support optional unread badge
- [x] 6.6 Support compact state
- [x] 6.7 Add `aria-current` behavior
- [x] 6.8 Add accessible labels
- [x] 6.9 Add navigation-item tests

## 7. Compact Sidebar

- [x] 7.1 Create a compact sidebar state for intermediate widths
- [x] 7.2 Keep all permitted routes accessible
- [x] 7.3 Keep icons visible
- [x] 7.4 Add keyboard-accessible tooltip or contextual label
- [x] 7.5 Preserve active state
- [x] 7.6 Preserve unread badge
- [x] 7.7 Reduce account card safely
- [x] 7.8 Add compact-sidebar tests

## 8. Sidebar Collapse Behavior

- [x] 8.1 Determine whether manual collapse adds practical value
- [x] 8.2 Add collapse and expand control when justified
- [x] 8.3 Add an accessible control name
- [x] 8.4 Preserve navigation access in both states
- [x] 8.5 Respect reduced-motion settings
- [x] 8.6 Persist only a safe local preference when useful
- [x] 8.7 Avoid causing layout overflow during transition
- [x] 8.8 Add collapse-behavior tests

## 9. Global Unread State Integration

- [x] 9.1 Reuse one shared messaging unread source
- [x] 9.2 Load unread count after authentication
- [x] 9.3 Update unread after new-message events
- [x] 9.4 Update unread after mark-read confirmation
- [x] 9.5 Refresh unread after reconnect
- [x] 9.6 Clear unread after logout
- [x] 9.7 Avoid duplicate unread counters
- [x] 9.8 Avoid duplicate socket listeners
- [x] 9.9 Add shared-unread state tests

## 10. Messages Navigation Badge

- [x] 10.1 Add unread badge to the expanded Messages item
- [x] 10.2 Add unread badge or indicator to the compact Messages item
- [x] 10.3 Add unread badge to mobile Messages navigation
- [x] 10.4 Hide the badge when count is zero
- [x] 10.5 Cap large counts at a controlled value
- [x] 10.6 Add accessible unread text
- [x] 10.7 Update without full page reload
- [x] 10.8 Add Messages badge tests

## 11. Account Identity Card

- [x] 11.1 Create the sidebar account card
- [x] 11.2 Display avatar or fallback
- [x] 11.3 Display safe name or email
- [x] 11.4 Handle long identity text
- [x] 11.5 Display SUBSCRIBER tier context
- [x] 11.6 Display ARTIST role context
- [x] 11.7 Display SUPER_ADMIN role context
- [x] 11.8 Support expanded and compact presentation
- [x] 11.9 Add account-card tests

## 12. Tier and Validity Emphasis

- [x] 12.1 Display effective tier for SUBSCRIBER
- [x] 12.2 Display active validity date when present
- [x] 12.3 Display permanent access
- [x] 12.4 Display expired access without presenting premium tier as active
- [x] 12.5 Display Free or public fallback accurately
- [x] 12.6 Avoid fabricated tiers for ARTIST and SUPER_ADMIN
- [x] 12.7 Use textual status in addition to color
- [x] 12.8 Add tier-summary tests

## 13. Account Actions Menu

- [x] 13.1 Add an account-actions trigger
- [x] 13.2 Add Profile action
- [x] 13.3 Add Account Security action
- [x] 13.4 Add role-specific artist configuration action where appropriate
- [x] 13.5 Add Logout action
- [x] 13.6 Preserve keyboard operation
- [x] 13.7 Preserve focus entry and dismissal
- [x] 13.8 Clear authentication, unread and socket state on Logout
- [x] 13.9 Add account-menu tests

## 14. Active Route Matching

- [x] 14.1 Add exact matching where appropriate
- [x] 14.2 Add nested Posts route matching
- [x] 14.3 Add nested Profile and Security route matching
- [x] 14.4 Add artist-configuration route matching
- [x] 14.5 Avoid multiple unrelated items appearing active
- [x] 14.6 Add route-match tests

## 15. Feed Layout Integration

- [x] 15.1 Place the Feed beside the sidebar
- [x] 15.2 Center Feed content within the usable content region
- [x] 15.3 Preserve public artist hero
- [x] 15.4 Preserve FeedPostCard behavior
- [x] 15.5 Preserve gallery and video behavior
- [x] 15.6 Preserve locked-content behavior
- [x] 15.7 Prevent excessive empty space
- [x] 15.8 Add Feed-with-sidebar tests

## 16. Messaging Layout Integration

- [x] 16.1 Place member messaging correctly beside the sidebar
- [x] 16.2 Place artist inbox correctly beside the sidebar
- [x] 16.3 Preserve thread and composer height behavior
- [x] 16.4 Preserve unread synchronization
- [x] 16.5 Preserve realtime and REST fallback
- [x] 16.6 Avoid sidebar overlap with message composer
- [x] 16.7 Add messaging-layout regression tests

## 17. Administrative Layout Integration

- [x] 17.1 Integrate Dashboard with the sidebar shell
- [x] 17.2 Integrate Posts with the sidebar shell
- [x] 17.3 Integrate Users with the sidebar shell
- [x] 17.4 Integrate Tiers with the sidebar shell
- [x] 17.5 Integrate artist-profile configuration
- [x] 17.6 Preserve wide administrative containers
- [x] 17.7 Preserve filters, tables, cards and dialogs
- [x] 17.8 Add administration-layout regression tests

## 18. Profile and Security Integration

- [x] 18.1 Integrate Profile with the sidebar
- [x] 18.2 Integrate Account Security with the sidebar
- [x] 18.3 Preserve password-change behavior
- [x] 18.4 Preserve logout-all-sessions behavior
- [x] 18.5 Preserve tier and validity presentation
- [x] 18.6 Add profile-and-security layout tests

## 19. Mobile Navigation Architecture

- [x] 19.1 Select bottom-navigation-plus-drawer or an equivalent mobile strategy
- [x] 19.2 Reuse the centralized navigation model
- [x] 19.3 Preserve visitor public navigation
- [x] 19.4 Add SUBSCRIBER mobile primary destinations
- [x] 19.5 Add ARTIST mobile primary destinations
- [x] 19.6 Add SUPER_ADMIN mobile primary destinations
- [x] 19.7 Keep additional routes reachable
- [x] 19.8 Add mobile-navigation architecture tests

## 20. Mobile Primary Navigation

- [x] 20.1 Add Feed mobile destination
- [x] 20.2 Add Messages mobile destination
- [x] 20.3 Add Profile or Dashboard according to role
- [x] 20.4 Add More destination where required
- [x] 20.5 Display active route
- [x] 20.6 Display Messages unread badge
- [x] 20.7 Add safe-area and content-bottom spacing
- [x] 20.8 Avoid covering message composer and page actions
- [x] 20.9 Add mobile-primary-navigation tests

## 21. Mobile Additional Navigation

- [x] 21.1 Add a controlled drawer or menu for secondary routes
- [x] 21.2 Render permitted management destinations
- [x] 21.3 Render artist configuration destinations
- [x] 21.4 Render account and security destinations
- [x] 21.5 Add account context
- [x] 21.6 Add Logout
- [x] 21.7 Close after route selection
- [x] 21.8 Support Escape and explicit close where appropriate
- [x] 21.9 Add mobile-additional-navigation tests

## 22. Public Header Preservation

- [x] 22.1 Preserve the public unauthenticated shell
- [x] 22.2 Preserve Login action
- [x] 22.3 Preserve Register action
- [x] 22.4 Preserve forgot-password navigation
- [x] 22.5 Preserve responsive public layout
- [x] 22.6 Ensure authenticated sidebar does not flash before session resolution
- [x] 22.7 Add public-header regression tests

## 23. Responsive Layout Validation

- [x] 23.1 Validate at approximately 320 px width
- [x] 23.2 Validate at approximately 375 px width
- [x] 23.3 Validate at tablet width
- [x] 23.4 Validate at compact-sidebar width
- [x] 23.5 Validate at laptop width
- [x] 23.6 Validate at 1280 px desktop
- [x] 23.7 Validate at 1440 px or larger
- [x] 23.8 Fix global horizontal overflow
- [x] 23.9 Fix clipped navigation and account actions
- [x] 23.10 Fix content obscured by mobile navigation

## 24. Accessibility Review

- [x] 24.1 Add semantic navigation landmarks
- [x] 24.2 Add accessible navigation labels
- [x] 24.3 Verify `aria-current`
- [x] 24.4 Verify keyboard focus order
- [x] 24.5 Verify visible focus
- [x] 24.6 Verify compact-item accessible names
- [x] 24.7 Verify tooltips work with keyboard
- [x] 24.8 Verify unread count announcement
- [x] 24.9 Verify account-menu keyboard behavior
- [x] 24.10 Verify reduced-motion behavior
- [x] 24.11 Fix change-related accessibility issues

## 25. Role and Authorization Regression

- [x] 25.1 Verify visitor navigation
- [x] 25.2 Verify SUBSCRIBER navigation
- [x] 25.3 Verify ARTIST navigation
- [x] 25.4 Verify SUPER_ADMIN navigation
- [x] 25.5 Verify forbidden routes remain protected
- [x] 25.6 Verify hidden SUPER_ADMIN remains excluded from ordinary user interfaces
- [x] 25.7 Verify single-artist behavior remains unchanged
- [x] 25.8 Verify tier-management visibility boundaries
- [x] 25.9 Verify Dashboard visibility boundaries

## 26. Messaging Notification Regression

- [x] 26.1 Verify unread appears while viewing Feed
- [x] 26.2 Verify unread appears while viewing Dashboard
- [x] 26.3 Verify unread appears while viewing Profile
- [x] 26.4 Verify unread disappears after confirmed read
- [x] 26.5 Verify unread updates after socket reconnect
- [x] 26.6 Verify unread clears after Logout
- [x] 26.7 Verify member count behavior
- [x] 26.8 Verify artist count behavior
- [x] 26.9 Verify SUPER_ADMIN support behavior
- [x] 26.10 Verify no duplicate unread listeners

## 27. Functional Regression

- [x] 27.1 Verify public Feed
- [x] 27.2 Verify Login and Register
- [x] 27.3 Verify forgot and reset password
- [x] 27.4 Verify Messages sending and reading
- [x] 27.5 Verify Dashboard
- [x] 27.6 Verify Posts
- [x] 27.7 Verify Users
- [x] 27.8 Verify Tiers
- [x] 27.9 Verify artist-profile configuration
- [x] 27.10 Verify Profile
- [x] 27.11 Verify Account Security
- [x] 27.12 Verify Logout
- [x] 27.13 Verify mobile navigation

## 28. Quality Validation

- [x] 28.1 Run frontend tests and fix change-related failures
- [x] 28.2 Run frontend lint and fix new errors
- [x] 28.3 Run frontend production build
- [x] 28.4 Run backend regression tests
- [x] 28.5 Run backend lint
- [x] 28.6 Run backend production build
- [x] 28.7 Run Prisma validate
- [x] 28.8 Confirm no database migration was created
- [x] 28.9 Review dependencies and remove unnecessary additions
- [x] 28.10 Review final diff for unrelated changes
- [x] 28.11 Verify no secrets or tokens were added
- [x] 28.12 Fix regressions within scope

## 29. OpenSpec Completion

- [x] 29.1 Update checkboxes only after implementation and verification
- [x] 29.2 Run `openspec validate sidebar-navigation-and-notification-experience`
- [x] 29.3 Produce a final implementation report
- [x] 29.4 Document sidebar architecture, mobile strategy, unread integration, role navigation and remaining limitations
