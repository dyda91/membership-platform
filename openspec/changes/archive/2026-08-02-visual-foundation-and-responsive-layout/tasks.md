## 1. Frontend Visual Audit

- [x] 1.1 Review global CSS, Tailwind configuration and existing design conventions
- [x] 1.2 Inventory shared and page-specific UI components
- [x] 1.3 Identify repeated button, field, card, badge and dialog styles
- [x] 1.4 Review desktop and mobile behavior of all current routes
- [x] 1.5 Review role-aware navigation definitions and duplication
- [x] 1.6 Review loading, empty, error and success patterns
- [x] 1.7 Review keyboard focus, labels and icon-button accessibility
- [x] 1.8 Record the selected visual direction and dependency decisions

## 2. Visual Tokens and Global Styles

- [x] 2.1 Define semantic color tokens
- [x] 2.2 Define background, surface, text and border conventions
- [x] 2.3 Define primary, secondary, success, warning and danger conventions
- [x] 2.4 Define focus-ring conventions
- [x] 2.5 Define typography conventions
- [x] 2.6 Define shared radius and shadow conventions
- [x] 2.7 Define consistent body background and foreground styles
- [x] 2.8 Add reduced-motion-safe global behavior where appropriate
- [x] 2.9 Remove or replace conflicting global styles
- [x] 2.10 Verify readable contrast for core states

## 3. Shared Layout Components

- [x] 3.1 Create or refactor the AppShell
- [x] 3.2 Create a reusable PageContainer with width variants
- [x] 3.3 Create a reusable PageHeader
- [x] 3.4 Create reusable PageSection or equivalent grouping
- [x] 3.5 Standardize page horizontal and vertical spacing
- [x] 3.6 Support narrow, standard and wide page layouts
- [x] 3.7 Apply the layout foundation without changing route behavior
- [x] 3.8 Add layout component tests where practical

## 4. Shared Navigation Model

- [x] 4.1 Centralize role-aware navigation definitions
- [x] 4.2 Preserve visitor navigation
- [x] 4.3 Preserve subscriber navigation
- [x] 4.4 Preserve artist navigation
- [x] 4.5 Preserve super-administrator navigation
- [x] 4.6 Ensure navigation does not replace route authorization
- [x] 4.7 Remove duplicated desktop and mobile role logic
- [x] 4.8 Add navigation-model tests for each role

## 5. Desktop Header

- [x] 5.1 Refactor the desktop header layout
- [x] 5.2 Display platform or artist identity consistently
- [x] 5.3 Display role-aware navigation without intermediate-width collisions
- [x] 5.4 Display authenticated user identity safely
- [x] 5.5 Preserve tier and access-summary presentation
- [x] 5.6 Improve Logout action presentation
- [x] 5.7 Handle long names and email addresses
- [x] 5.8 Add visible focus and active-route states
- [x] 5.9 Add header tests for visitor, subscriber, artist and super administrator

## 6. Mobile Navigation

- [x] 6.1 Add a mobile navigation trigger
- [x] 6.2 Create a responsive drawer, sheet or menu
- [x] 6.3 Render shared role-aware navigation items
- [x] 6.4 Add a clear close action
- [x] 6.5 Close navigation after selecting a route
- [x] 6.6 Support Escape dismissal where appropriate
- [x] 6.7 Prevent unwanted background interaction
- [x] 6.8 Restore focus predictably where practical
- [x] 6.9 Ensure Logout remains accessible
- [x] 6.10 Add mobile-navigation component tests

## 7. Button and Action Primitives

- [x] 7.1 Create or consolidate the shared Button component
- [x] 7.2 Implement primary, secondary, outline, ghost and danger variants
- [x] 7.3 Implement supported sizes
- [x] 7.4 Implement disabled state
- [x] 7.5 Implement loading state
- [x] 7.6 Create or consolidate IconButton
- [x] 7.7 Ensure icon-only actions have accessible names
- [x] 7.8 Ensure adequate mobile touch targets
- [x] 7.9 Replace repeated button styling in representative pages
- [x] 7.10 Add button tests

## 8. Form Primitives

- [x] 8.1 Create or consolidate Input
- [x] 8.2 Create or consolidate Textarea
- [x] 8.3 Create or consolidate Select
- [x] 8.4 Create or consolidate Checkbox
- [x] 8.5 Create a reusable Field structure
- [x] 8.6 Standardize labels, help text and validation messages
- [x] 8.7 Implement clear invalid, disabled and focus states
- [x] 8.8 Preserve native input semantics
- [x] 8.9 Verify date and time inputs on mobile
- [x] 8.10 Add form primitive tests

## 9. Badge and Status Primitives

- [x] 9.1 Create or consolidate the Badge component
- [x] 9.2 Support role badges
- [x] 9.3 Support tier badges
- [x] 9.4 Support account-status badges
- [x] 9.5 Support access-status badges
- [x] 9.6 Ensure labels accompany semantic colors
- [x] 9.7 Replace representative duplicated badge implementations
- [x] 9.8 Add badge tests

## 10. Surface and Card Primitives

- [x] 10.1 Create or consolidate Card and card-section patterns
- [x] 10.2 Define standard, muted and interactive surface variants
- [x] 10.3 Standardize border, radius, padding and shadow usage
- [x] 10.4 Avoid excessive nested surface decoration
- [x] 10.5 Replace representative duplicated card styles
- [x] 10.6 Add surface component tests where practical

## 11. Feedback and State Components

- [x] 11.1 Create or consolidate Spinner
- [x] 11.2 Create or consolidate Skeleton
- [x] 11.3 Create a shared EmptyState
- [x] 11.4 Create a shared ErrorState
- [x] 11.5 Create or consolidate Alert
- [x] 11.6 Standardize mutation success and error feedback
- [x] 11.7 Add retry support where safe
- [x] 11.8 Avoid exposing raw backend errors
- [x] 11.9 Add state-component tests

## 12. Dialog and Confirmation Foundation

- [x] 12.1 Review existing modal and dialog implementations
- [x] 12.2 Create or consolidate an accessible Dialog
- [x] 12.3 Create a reusable ConfirmDialog
- [x] 12.4 Support clear titles, descriptions and actions
- [x] 12.5 Add focus entry and dismissal behavior
- [x] 12.6 Add Escape handling where appropriate
- [x] 12.7 Prevent duplicate destructive submissions
- [x] 12.8 Ensure dialogs fit short and narrow viewports
- [x] 12.9 Add dialog tests

## 13. Authentication Pages Integration

- [x] 13.1 Apply the new layout to Login
- [x] 13.2 Apply shared fields and buttons to Login
- [x] 13.3 Apply the new layout to Register
- [x] 13.4 Apply shared fields and buttons to Register
- [x] 13.5 Improve responsive form width and spacing
- [x] 13.6 Preserve all authentication behavior
- [x] 13.7 Verify error and loading states
- [x] 13.8 Add or update authentication-page tests

## 14. Feed Shell Integration

- [x] 14.1 Apply the application layout to the Feed
- [x] 14.2 Apply the appropriate public content container
- [x] 14.3 Preserve the artist header and Feed list behavior
- [x] 14.4 Standardize Feed loading, empty and error states
- [x] 14.5 Verify mobile spacing and page width
- [x] 14.6 Preserve locked-media authorization
- [x] 14.7 Defer detailed Feed-card and media redesign
- [x] 14.8 Add or update Feed-shell tests

## 15. Profile Pages Integration

- [x] 15.1 Apply the shared layout to the member Profile page
- [x] 15.2 Apply shared fields, buttons and status badges
- [x] 15.3 Preserve tier and access-validity information
- [x] 15.4 Apply the shared layout to artist-profile management
- [x] 15.5 Preserve avatar, banner and contact functionality
- [x] 15.6 Verify mobile form behavior
- [x] 15.7 Add or update profile-page tests

## 16. Administrative Shell Integration

- [x] 16.1 Apply the wide administrative layout to Dashboard
- [x] 16.2 Apply the layout foundation to Posts pages
- [x] 16.3 Apply the layout foundation to Users
- [x] 16.4 Apply the layout foundation to Tiers
- [x] 16.5 Standardize page headers and primary actions
- [x] 16.6 Contain table overflow on narrow screens
- [x] 16.7 Preserve all search, filters and pagination behavior
- [x] 16.8 Preserve role-based route access
- [x] 16.9 Defer detailed administrative redesign
- [x] 16.10 Add or update administrative-shell tests

## 17. Responsive Review

- [x] 17.1 Validate the application at a narrow mobile width
- [x] 17.2 Validate the application at a larger mobile width
- [x] 17.3 Validate the application at a tablet width
- [x] 17.4 Validate the application at a laptop width
- [x] 17.5 Validate the application at a large desktop width
- [x] 17.6 Fix horizontal page overflow
- [x] 17.7 Fix clipped actions and inaccessible controls
- [x] 17.8 Fix header collisions
- [x] 17.9 Fix dialogs exceeding viewport dimensions
- [x] 17.10 Verify touch-target usability

## 18. Accessibility Foundation Review

- [x] 18.1 Verify heading hierarchy on representative pages
- [x] 18.2 Verify labels are associated with form controls
- [x] 18.3 Verify visible keyboard focus
- [x] 18.4 Verify icon-only controls have accessible names
- [x] 18.5 Verify dialog titles and descriptions
- [x] 18.6 Verify status is not communicated by color alone
- [x] 18.7 Verify keyboard access to primary navigation
- [x] 18.8 Verify reduced-motion handling for new transitions
- [x] 18.9 Fix change-related accessibility issues

## 19. Functional Regression Validation

- [x] 19.1 Verify public Feed access
- [x] 19.2 Verify Login and Register
- [x] 19.3 Verify subscriber navigation
- [x] 19.4 Verify artist navigation
- [x] 19.5 Verify super-administrator navigation
- [x] 19.6 Verify Dashboard access boundaries
- [x] 19.7 Verify post creation and editing
- [x] 19.8 Verify user search, filters and pagination
- [x] 19.9 Verify tier management
- [x] 19.10 Verify access granting, renewal and revocation
- [x] 19.11 Verify access history
- [x] 19.12 Verify expired-access presentation
- [x] 19.13 Verify hidden SUPER_ADMIN remains excluded
- [x] 19.14 Verify Logout and session cleanup

## 20. Quality Validation

- [x] 20.1 Run frontend tests and fix change-related failures
- [x] 20.2 Run frontend lint and fix new errors
- [x] 20.3 Run frontend production build
- [x] 20.4 Run backend regression tests
- [x] 20.5 Run backend production build
- [x] 20.6 Confirm no backend contract was changed unnecessarily
- [x] 20.7 Review added dependencies and remove unnecessary ones
- [x] 20.8 Review final diff for unrelated changes
- [x] 20.9 Verify no secrets or environment values were added
- [x] 20.10 Fix regressions within the defined scope

## 21. OpenSpec Completion

- [x] 21.1 Update checkboxes only for implemented and verified tasks
- [x] 21.2 Run `openspec validate visual-foundation-and-responsive-layout`
- [x] 21.3 Produce a final implementation report
- [x] 21.4 Document design tokens, components, dependencies, responsive checks and remaining limitations
