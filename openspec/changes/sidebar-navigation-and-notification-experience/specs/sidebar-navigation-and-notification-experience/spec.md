# Sidebar Navigation and Notification Experience Specification

## ADDED Requirements

### Requirement: Desktop sidebar navigation

The system SHALL provide authenticated users with a left-side desktop
navigation appropriate to their current permissions.

#### Scenario: Authenticated user opens the application on desktop

- GIVEN an authenticated user
- AND a wide viewport
- WHEN an application page is rendered
- THEN primary navigation SHALL be displayed in a left sidebar
- AND the page content SHALL remain usable beside it

#### Scenario: Sidebar remains available during navigation

- GIVEN the authenticated user navigates between permitted routes
- WHEN the route changes
- THEN the sidebar SHALL remain available
- AND the application SHALL not recreate the entire authenticated shell
  unnecessarily

#### Scenario: Public visitor opens the Feed

- GIVEN the viewer is unauthenticated
- WHEN the public Feed is rendered
- THEN the authenticated sidebar SHALL not be displayed
- AND public Login and Register access SHALL remain available

### Requirement: Icon and label navigation

The system SHALL present primary navigation items with recognizable icons and
text labels.

#### Scenario: Expanded sidebar is displayed

- GIVEN the sidebar is expanded
- WHEN navigation items are rendered
- THEN each primary item SHALL include an icon and readable text label

#### Scenario: Compact sidebar is displayed

- GIVEN the available width requires compact navigation
- WHEN the sidebar enters compact mode
- THEN icons SHALL remain visible
- AND each item SHALL retain an accessible name
- AND labels MAY be available through tooltip or equivalent behavior

#### Scenario: Icon cannot load

- GIVEN an icon is unavailable
- WHEN the navigation item is rendered
- THEN the text or accessible label SHALL still identify the destination

### Requirement: Active-route indication

The system SHALL make the current navigation destination visually and
semantically clear.

#### Scenario: Feed is active

- GIVEN the current route is the Feed
- WHEN navigation is rendered
- THEN the Feed item SHALL have a distinct active state

#### Scenario: Nested post route is active

- GIVEN the current route is a nested Posts route
- WHEN navigation is rendered
- THEN the parent Posts navigation item SHALL remain identified as active

#### Scenario: Active state is read by assistive technology

- GIVEN a navigation item represents the current route
- WHEN assistive technology inspects the item
- THEN the current-page state SHALL be communicated semantically

### Requirement: Role-aware sidebar navigation

The system SHALL preserve role-aware navigation in the sidebar.

#### Scenario: Subscriber sidebar is rendered

- GIVEN the authenticated user is SUBSCRIBER
- WHEN the sidebar is rendered
- THEN Feed, Messages, Profile and permitted account destinations SHALL be
  available
- AND administrative destinations SHALL remain hidden

#### Scenario: Artist sidebar is rendered

- GIVEN the authenticated user is ARTIST
- WHEN the sidebar is rendered
- THEN Feed, Messages, Dashboard, Posts, Users, Tiers, artist configuration and
  permitted profile destinations SHALL be available

#### Scenario: Super administrator sidebar is rendered

- GIVEN the authenticated user is SUPER_ADMIN
- WHEN the sidebar is rendered
- THEN permitted system and administration destinations SHALL be available
- AND hidden-account behavior SHALL remain unchanged

#### Scenario: User directly requests a forbidden route

- GIVEN a route is absent from the user's sidebar
- WHEN the user requests the route directly
- THEN existing route guards and backend authorization SHALL continue to
  enforce access

### Requirement: Navigation grouping

The system SHALL organize sidebar destinations into understandable groups.

#### Scenario: Artist navigation is rendered

- GIVEN an ARTIST has several permitted destinations
- WHEN the expanded sidebar is rendered
- THEN public, management and account destinations SHALL be grouped clearly

#### Scenario: Subscriber navigation is rendered

- GIVEN a SUBSCRIBER has a small set of destinations
- WHEN the sidebar is rendered
- THEN unnecessary empty groups SHALL not be displayed

#### Scenario: Group labels are hidden in compact mode

- GIVEN the sidebar is compact
- WHEN group labels cannot fit
- THEN navigation order and spacing SHALL still preserve understandable
  grouping

### Requirement: Global unread-message indicator

The system SHALL display the authenticated user's unread-message state from
every authenticated page.

#### Scenario: Subscriber has an unread artist reply

- GIVEN the subscriber has unread messages
- WHEN any authenticated page is rendered
- THEN the Messages navigation item SHALL display an unread indicator

#### Scenario: Artist has unread member messages

- GIVEN the artist has unread member messages
- WHEN any authenticated page is rendered
- THEN the Messages item SHALL display the current total unread count

#### Scenario: Super administrator has support unread visibility

- GIVEN SUPER_ADMIN is permitted to view support messaging
- WHEN navigation is rendered
- THEN the Messages item SHALL display the unread state defined for support
  access
- AND SHALL not change the artist's read state merely by rendering the badge

#### Scenario: Messages become read

- GIVEN the current unread count reaches zero
- WHEN the shared unread state updates
- THEN the Messages badge SHALL disappear or display zero according to the
  selected convention without requiring a full page reload

#### Scenario: Unread count is large

- GIVEN the unread count exceeds the chosen display limit
- WHEN the badge is rendered
- THEN it SHALL use a controlled representation such as `99+`

### Requirement: Real-time unread synchronization

The system SHALL keep the sidebar unread indicator synchronized with messaging
state.

#### Scenario: Message arrives while user views another page

- GIVEN the authenticated user is viewing a route other than Messages
- WHEN a new unread message is received
- THEN the Messages badge SHALL update in real time

#### Scenario: Conversation is marked as read

- GIVEN the user opens and reads the relevant conversation
- WHEN the backend confirms the read state
- THEN the shared unread total SHALL update
- AND the sidebar badge SHALL update immediately

#### Scenario: Socket reconnects

- GIVEN real-time connectivity was interrupted
- WHEN the socket reconnects
- THEN the application SHALL refresh the unread count from the backend

#### Scenario: User logs out

- GIVEN the authenticated user logs out
- WHEN local authentication state is cleared
- THEN unread-message state SHALL also be cleared

### Requirement: Account identity area

The system SHALL provide a dedicated account area in the sidebar.

#### Scenario: Member account is displayed

- GIVEN the authenticated user is SUBSCRIBER
- WHEN the account area is rendered
- THEN safe identity, avatar or fallback, and current tier summary SHALL be
  visible

#### Scenario: Artist account is displayed

- GIVEN the authenticated user is ARTIST
- WHEN the account area is rendered
- THEN safe identity and ARTIST role context SHALL be visible

#### Scenario: Super administrator account is displayed

- GIVEN the authenticated user is SUPER_ADMIN
- WHEN the account area is rendered
- THEN safe identity and administrative role context SHALL be visible
- AND the account SHALL remain hidden from ordinary user-management lists

#### Scenario: Account identity is long

- GIVEN the display name or email is long
- WHEN the account area is rendered
- THEN the text SHALL truncate or wrap safely
- AND full identity SHALL remain accessible where appropriate

### Requirement: Tier and access presentation

The system SHALL present the member's current effective tier and validity
prominently but accurately.

#### Scenario: Subscriber has active Gold access

- GIVEN a subscriber has effective Gold access
- WHEN the account area is rendered
- THEN Gold SHALL be visible
- AND validity information MAY be displayed

#### Scenario: Subscriber has permanent access

- GIVEN the subscriber has permanent access
- WHEN the tier summary is rendered
- THEN the permanent state SHALL be communicated textually

#### Scenario: Subscriber access expired

- GIVEN the subscriber's premium access is expired
- WHEN the account area is rendered
- THEN expired premium access SHALL not be presented as active
- AND the effective Free or public state SHALL be clear

#### Scenario: Artist or administrator has no member tier

- GIVEN the current account is ARTIST or SUPER_ADMIN
- WHEN the account area is rendered
- THEN the role SHALL receive primary emphasis
- AND the interface SHALL not fabricate a member tier

### Requirement: Sidebar account actions

The system SHALL provide clear access to Profile, Account Security and Logout.

#### Scenario: Account menu opens

- GIVEN the authenticated user activates the account area
- WHEN account actions are shown
- THEN permitted profile and security destinations SHALL be available
- AND Logout SHALL be clearly distinguishable

#### Scenario: Logout is activated

- GIVEN the user activates Logout
- WHEN logout completes
- THEN authentication, unread and private cached state SHALL be cleared

#### Scenario: Keyboard user opens account actions

- GIVEN the account control has keyboard focus
- WHEN it is activated
- THEN the menu SHALL be usable without a pointer

### Requirement: Responsive sidebar behavior

The system SHALL adapt navigation according to available viewport width.

#### Scenario: Wide desktop is used

- GIVEN a wide viewport
- WHEN the authenticated shell is rendered
- THEN the expanded sidebar SHALL show icons, labels and account context

#### Scenario: Intermediate desktop width is used

- GIVEN the viewport cannot comfortably display the expanded sidebar
- WHEN the layout adapts
- THEN a compact icon sidebar MAY be used
- AND central content SHALL remain readable

#### Scenario: Sidebar state changes

- GIVEN the layout supports manual collapse
- WHEN the user collapses or expands the sidebar
- THEN the transition SHALL preserve navigation access
- AND SHALL respect reduced-motion preferences

#### Scenario: Content area is displayed

- GIVEN either sidebar state
- WHEN a page is rendered
- THEN content SHALL not be obscured by the sidebar
- AND horizontal page overflow SHALL not occur

### Requirement: Mobile navigation experience

The system SHALL provide appropriate navigation on narrow viewports without
requiring the desktop sidebar.

#### Scenario: Subscriber uses mobile navigation

- GIVEN a SUBSCRIBER uses a narrow viewport
- WHEN navigation is rendered
- THEN Feed, Messages and Profile SHALL remain easily reachable

#### Scenario: Artist uses mobile navigation

- GIVEN an ARTIST uses a narrow viewport
- WHEN navigation is rendered
- THEN primary daily destinations SHALL be easy to reach
- AND additional management destinations SHALL remain available through a
  controlled menu or drawer

#### Scenario: Mobile Messages badge is displayed

- GIVEN unread messages exist
- WHEN mobile navigation is rendered
- THEN Messages SHALL display the unread indicator

#### Scenario: Mobile menu is dismissed

- GIVEN a mobile drawer or menu is open
- WHEN the user selects a destination, presses Escape where applicable or
  activates Close
- THEN the menu SHALL close predictably

### Requirement: Central content layout

The system SHALL align application content correctly beside the new navigation.

#### Scenario: Feed is rendered on desktop

- GIVEN the expanded sidebar is visible
- WHEN the Feed is rendered
- THEN the creator profile and Feed SHALL remain centered within the usable
  content region

#### Scenario: Administrative page is rendered

- GIVEN a wide administration page is active
- WHEN the sidebar is visible
- THEN the page SHALL use the remaining width appropriately

#### Scenario: Dialog is opened

- GIVEN a dialog is opened from a page beside the sidebar
- WHEN the overlay is rendered
- THEN the dialog SHALL be positioned relative to the viewport
- AND not only to the content column

### Requirement: Navigation accessibility

The system SHALL provide an accessible navigation structure.

#### Scenario: Keyboard user navigates the sidebar

- GIVEN the user uses the keyboard
- WHEN navigating sidebar controls
- THEN focus order SHALL be logical
- AND visible focus SHALL be present

#### Scenario: Compact sidebar icon is focused

- GIVEN labels are visually hidden in compact mode
- WHEN an item receives focus
- THEN an accessible label and understandable contextual hint SHALL be
  available

#### Scenario: Unread badge is announced

- GIVEN unread messages exist
- WHEN assistive technology reads the Messages item
- THEN the unread count or unread state SHALL be understandable

#### Scenario: Navigation landmark is inspected

- GIVEN assistive technology inspects the page
- WHEN the sidebar is rendered
- THEN an appropriate navigation landmark and label SHALL be present

### Requirement: Existing behavior preservation

The system SHALL preserve existing application functionality during the layout
change.

#### Scenario: Subscriber uses messaging

- GIVEN the subscriber uses Messages
- WHEN navigation is refactored
- THEN sending, reading, retry and unread behavior SHALL remain functional

#### Scenario: Artist uses administration

- GIVEN the artist uses Dashboard, Posts, Users or Tiers
- WHEN navigation is refactored
- THEN all existing actions and permissions SHALL remain functional

#### Scenario: Public visitor uses the Feed

- GIVEN the viewer is unauthenticated
- WHEN navigation is refactored
- THEN the public creator profile, Feed, Login and Register SHALL remain
  functional

#### Scenario: Super administrator uses the platform

- GIVEN SUPER_ADMIN is authenticated
- WHEN the sidebar is rendered
- THEN permitted administration SHALL remain available
- AND hidden-account rules SHALL remain unchanged
