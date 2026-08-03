## 1. Messaging Architecture Review

- [x] 1.1 Review current User, Artist, role and account-status models
- [x] 1.2 Review active-artist resolution
- [x] 1.3 Review current JWT and sessionVersion validation
- [x] 1.4 Review effective tier and access-status service
- [x] 1.5 Review existing navigation and unread-badge patterns
- [x] 1.6 Review frontend API and real-time dependencies
- [x] 1.7 Review current rate-limiting implementation
- [x] 1.8 Review deployment assumptions relevant to WebSocket
- [x] 1.9 Document REST, WebSocket, pagination and read-state decisions
- [x] 1.10 Confirm attachments and external notifications remain out of scope

## 2. Conversation Database Model

- [x] 2.1 Add Conversation model
- [x] 2.2 Add member relationship
- [x] 2.3 Add artist relationship
- [x] 2.4 Add memberLastReadAt
- [x] 2.5 Add artistLastReadAt
- [x] 2.6 Add lastMessageAt
- [x] 2.7 Add createdAt and updatedAt
- [x] 2.8 Add unique member-and-artist constraint
- [x] 2.9 Add indexes for member lookup and artist inbox ordering
- [x] 2.10 Verify hidden/system users cannot become ordinary member participants

## 3. Message Database Model

- [x] 3.1 Add Message model
- [x] 3.2 Add conversation relationship
- [x] 3.3 Add sender relationship
- [x] 3.4 Add plain-text content
- [x] 3.5 Add createdAt
- [x] 3.6 Add indexes for conversation history
- [x] 3.7 Add sender and timestamp index if required
- [x] 3.8 Ensure message records do not store tier priority snapshots unnecessarily

## 4. Safe Messaging Migration

- [x] 4.1 Create a Prisma migration without resetting the database
- [x] 4.2 Preserve existing users, roles, tiers, posts, media and access data
- [x] 4.3 Create Conversation and Message tables
- [x] 4.4 Create uniqueness constraints and indexes
- [x] 4.5 Review migration SQL for destructive operations
- [x] 4.6 Apply migration to the development database
- [x] 4.7 Regenerate Prisma Client
- [x] 4.8 Run Prisma validate
- [x] 4.9 Run Prisma migrate status
- [x] 4.10 Verify current application data remains intact

## 5. Messaging Module Foundation

- [x] 5.1 Create MessagingModule
- [x] 5.2 Create MessagingService
- [x] 5.3 Create MessagingController
- [x] 5.4 Reuse PrismaModule
- [x] 5.5 Reuse authentication and role guards
- [x] 5.6 Add safe messaging serializers
- [x] 5.7 Register the module in AppModule
- [x] 5.8 Add module initialization tests

## 6. Active Artist Conversation Resolution

- [x] 6.1 Reuse or create a safe active-artist resolver
- [x] 6.2 Create or return the member's existing conversation
- [x] 6.3 Prevent duplicate conversations
- [x] 6.4 Handle uniqueness conflicts safely
- [x] 6.5 Reject arbitrary artist identifiers from member input
- [x] 6.6 Handle no-active-artist state
- [x] 6.7 Preserve the one-active-artist rule
- [x] 6.8 Add conversation-resolution tests

## 7. Conversation Authorization

- [x] 7.1 Allow a member to access only their own conversation
- [x] 7.2 Allow the active artist to access eligible conversations
- [x] 7.3 Define SUPER_ADMIN support access behavior
- [x] 7.4 Prevent SUPER_ADMIN from appearing as a normal participant
- [x] 7.5 Deny member-to-member conversation access
- [x] 7.6 Deny inactive or disabled accounts
- [x] 7.7 Prevent hidden/system accounts from appearing in the inbox
- [x] 7.8 Add isolation and authorization tests

## 8. Message DTOs and Validation

- [x] 8.1 Create an allowlisted send-message DTO
- [x] 8.2 Trim or validate whitespace-only content
- [x] 8.3 Add a configurable maximum message length
- [x] 8.4 Preserve intentional line breaks
- [x] 8.5 Reject unsupported attachment fields
- [x] 8.6 Reject arbitrary sender identifiers
- [x] 8.7 Treat content as plain text
- [x] 8.8 Add validation tests

## 9. Persisted Message Send Service

- [x] 9.1 Authorize the sender for the conversation
- [x] 9.2 Validate the current account status
- [x] 9.3 Persist the message transactionally
- [x] 9.4 Update Conversation.lastMessageAt transactionally
- [x] 9.5 Return a safe persisted-message representation
- [x] 9.6 Ensure failed persistence does not report successful delivery
- [x] 9.7 Add member-send tests
- [x] 9.8 Add artist-reply tests
- [x] 9.9 Add persistence-failure tests

## 10. Member Conversation REST API

- [x] 10.1 Add an endpoint to create or retrieve the member conversation
- [x] 10.2 Return safe artist identity
- [x] 10.3 Return safe conversation metadata
- [x] 10.4 Prevent participant manipulation through request parameters
- [x] 10.5 Add a REST fallback send endpoint
- [x] 10.6 Add member-conversation endpoint tests

## 11. Message History API

- [x] 11.1 Create a paginated conversation-history endpoint
- [x] 11.2 Select cursor or deterministic page pagination
- [x] 11.3 Return the latest message page
- [x] 11.4 Support loading older messages
- [x] 11.5 Return messages in chronological display order
- [x] 11.6 Add safe pagination limits
- [x] 11.7 Prevent duplicate or overlapping history behavior
- [x] 11.8 Add history pagination tests

## 12. Artist Inbox Query API

- [x] 12.1 Create a protected artist conversation-list endpoint
- [x] 12.2 Return safe member identity
- [x] 12.3 Return last-message preview
- [x] 12.4 Return last activity
- [x] 12.5 Return artist unread count
- [x] 12.6 Return current effective tier
- [x] 12.7 Return current effective access status and validity summary
- [x] 12.8 Exclude hidden and system users
- [x] 12.9 Add backend pagination
- [x] 12.10 Add artist-inbox response tests

## 13. Inbox Priority and Sorting

- [x] 13.1 Integrate the centralized effective-access service
- [x] 13.2 Calculate current tier priority dynamically
- [x] 13.3 Avoid premium priority for expired access
- [x] 13.4 Avoid premium priority for revoked access
- [x] 13.5 Avoid premium priority for scheduled access before start
- [x] 13.6 Implement default unread-plus-tier-plus-recency ordering
- [x] 13.7 Implement Most Recent sorting
- [x] 13.8 Implement Unread sorting
- [x] 13.9 Implement Tier sorting
- [x] 13.10 Add priority and sorting tests

## 14. Inbox Search and Filters

- [x] 14.1 Add case-insensitive member-name search
- [x] 14.2 Add case-insensitive member-email search
- [x] 14.3 Add unread filter
- [x] 14.4 Add effective-tier filter
- [x] 14.5 Add effective-access-status filter
- [x] 14.6 Combine filters using AND semantics
- [x] 14.7 Preserve hidden-user exclusion
- [x] 14.8 Reset pagination behavior when queries change
- [x] 14.9 Add search and filter tests

## 15. Read State Backend

- [x] 15.1 Add a mark-conversation-read operation
- [x] 15.2 Update memberLastReadAt for the member
- [x] 15.3 Update artistLastReadAt for the artist
- [x] 15.4 Prevent read timestamps from moving backwards
- [x] 15.5 Calculate member unread count
- [x] 15.6 Calculate artist unread count
- [x] 15.7 Add total unread-count endpoint
- [x] 15.8 Add read-state and unread-count tests

## 16. Messaging Rate Limits

- [x] 16.1 Reuse the current rate-limiting infrastructure
- [x] 16.2 Configure REST message-send limits
- [x] 16.3 Configure WebSocket message-send limits
- [x] 16.4 Apply per-account protection
- [x] 16.5 Add safe maximum payload handling
- [x] 16.6 Return controlled rate-limit errors
- [x] 16.7 Avoid tier-based unlimited sending
- [x] 16.8 Add rate-limit and abuse tests

## 17. WebSocket Gateway Foundation

- [x] 17.1 Add the required NestJS WebSocket dependency only if absent
- [x] 17.2 Create MessagingGateway
- [x] 17.3 Select a stable namespace or path
- [x] 17.4 Add connection lifecycle handling
- [x] 17.5 Add structured safe gateway errors
- [x] 17.6 Register the gateway in MessagingModule
- [x] 17.7 Add gateway initialization tests

## 18. WebSocket Authentication

- [x] 18.1 Extract the JWT from a safe handshake field
- [x] 18.2 Verify JWT signature and expiration
- [x] 18.3 Validate sessionVersion
- [x] 18.4 Resolve current roles and account status from the database
- [x] 18.5 Reject invalid, stale and disabled-account connections
- [x] 18.6 Attach a safe authenticated-user object to the socket
- [x] 18.7 Avoid logging raw JWTs
- [x] 18.8 Add socket-authentication tests

## 19. WebSocket Conversation Rooms

- [x] 19.1 Add authorized conversation join behavior
- [x] 19.2 Add conversation leave behavior
- [x] 19.3 Add per-user rooms
- [x] 19.4 Add artist-inbox room
- [x] 19.5 Prevent arbitrary room subscription
- [x] 19.6 Reauthorize conversation access on join
- [x] 19.7 Add unauthorized-room tests

## 20. Real-Time Message Send and Delivery

- [x] 20.1 Route socket sends through MessagingService
- [x] 20.2 Persist before emitting
- [x] 20.3 Emit the persisted message to the conversation room
- [x] 20.4 Emit conversation-summary updates to the artist inbox
- [x] 20.5 Emit unread-count updates to the recipient user room
- [x] 20.6 Return an acknowledgement with the persisted message id
- [x] 20.7 Return a controlled failure acknowledgement
- [x] 20.8 Prevent duplicate event emission
- [x] 20.9 Add real-time delivery tests

## 21. Real-Time Read-State Updates

- [x] 21.1 Support authorized read-state socket events
- [x] 21.2 Persist read timestamps
- [x] 21.3 Emit updated unread counts
- [x] 21.4 Emit optional read-state information to the other participant
- [x] 21.5 Prevent one participant from changing the other's read state
- [x] 21.6 Add read-event tests

## 22. Frontend Messaging Types and Services

- [x] 22.1 Create typed Conversation interfaces
- [x] 22.2 Create typed Message interfaces
- [x] 22.3 Create typed Inbox query and pagination interfaces
- [x] 22.4 Create messaging REST services
- [x] 22.5 Create unread-count service
- [x] 22.6 Add controlled API error mapping
- [x] 22.7 Add service tests

## 23. Frontend WebSocket Client

- [x] 23.1 Add a compatible WebSocket client dependency only if required
- [x] 23.2 Create a reusable messaging socket service or hook
- [x] 23.3 Authenticate using the current stored token
- [x] 23.4 Connect only for authenticated messaging users
- [x] 23.5 Handle connect, disconnect and reconnect
- [x] 23.6 Join and leave the selected conversation safely
- [x] 23.7 Handle stale-session authentication failure
- [x] 23.8 Avoid exposing tokens in URLs or logs
- [x] 23.9 Add socket-client tests where practical

## 24. Messaging Navigation

- [x] 24.1 Add Messages to authenticated navigation
- [x] 24.2 Preserve visitor navigation
- [x] 24.3 Show member unread count
- [x] 24.4 Show artist total unread count
- [x] 24.5 Add an accessible unread badge
- [x] 24.6 Cap large displayed counts safely
- [x] 24.7 Update the badge through real-time and REST refreshes
- [x] 24.8 Add navigation-badge tests

## 25. Member Messaging Page

- [x] 25.1 Create the member Messages route
- [x] 25.2 Create MemberMessagesPage
- [x] 25.3 Load or create the member conversation
- [x] 25.4 Display safe artist identity
- [x] 25.5 Load the latest message history
- [x] 25.6 Load older messages
- [x] 25.7 Join the conversation socket room
- [x] 25.8 Mark artist replies as read when appropriately viewed
- [x] 25.9 Add loading, empty and error states
- [x] 25.10 Add member-page tests

## 26. Message Thread Components

- [x] 26.1 Create MessageThread
- [x] 26.2 Create MessageBubble
- [x] 26.3 Distinguish sent and received messages
- [x] 26.4 Display safe timestamps
- [x] 26.5 Preserve line breaks
- [x] 26.6 Render content as plain text
- [x] 26.7 Add a load-older-messages control
- [x] 26.8 Preserve scroll position when prepending older messages
- [x] 26.9 Scroll to new messages when appropriate
- [x] 26.10 Add thread component tests

## 27. Message Composer

- [x] 27.1 Create MessageComposer
- [x] 27.2 Enforce the configured maximum length
- [x] 27.3 Reject whitespace-only sends
- [x] 27.4 Support multiline text
- [x] 27.5 Add accessible send controls
- [x] 27.6 Add temporary sending state
- [x] 27.7 Replace temporary messages after acknowledgement
- [x] 27.8 Display failed state
- [x] 27.9 Support retry without duplicate insertion
- [x] 27.10 Prevent duplicate submission
- [x] 27.11 Add composer tests

## 28. Artist Inbox Page

- [x] 28.1 Create the artist Messages route or role-aware page
- [x] 28.2 Create ArtistMessagesPage
- [x] 28.3 Load paginated conversation summaries
- [x] 28.4 Add search controls
- [x] 28.5 Add unread filter
- [x] 28.6 Add tier filter
- [x] 28.7 Add access-status filter
- [x] 28.8 Add sorting controls
- [x] 28.9 Preserve selected conversation where appropriate
- [x] 28.10 Add artist-page tests

## 29. Conversation List

- [x] 29.1 Create ConversationList
- [x] 29.2 Create ConversationListItem
- [x] 29.3 Display member avatar or fallback
- [x] 29.4 Display member name and safe email
- [x] 29.5 Display last-message preview
- [x] 29.6 Display last activity
- [x] 29.7 Display current effective tier
- [x] 29.8 Display effective access status
- [x] 29.9 Display unread count
- [x] 29.10 Add selected and priority states without relying only on color
- [x] 29.11 Add list component tests

## 30. Artist Conversation Panel

- [x] 30.1 Display selected member identity
- [x] 30.2 Display current effective tier and validity summary
- [x] 30.3 Load selected conversation history
- [x] 30.4 Join the selected conversation room
- [x] 30.5 Mark member messages read when appropriately viewed
- [x] 30.6 Reuse MessageThread
- [x] 30.7 Reuse MessageComposer
- [x] 30.8 Handle no-selected-conversation state
- [x] 30.9 Add conversation-panel tests

## 31. Real-Time Frontend Synchronization

- [x] 31.1 Insert new persisted messages without duplication
- [x] 31.2 Replace temporary messages using acknowledgement ids
- [x] 31.3 Update conversation last-message previews
- [x] 31.4 Update inbox ordering
- [x] 31.5 Update unread counts
- [x] 31.6 Preserve the currently selected conversation
- [x] 31.7 Handle messages arriving in another conversation
- [x] 31.8 Refresh missed data after reconnect
- [x] 31.9 Add synchronization tests

## 32. Mobile Messaging Experience

- [x] 32.1 Create the mobile artist inbox-first layout
- [x] 32.2 Open a selected conversation as a separate mobile view
- [x] 32.3 Add a clear return-to-list action
- [x] 32.4 Keep the composer reachable above the mobile viewport and keyboard
- [x] 32.5 Keep thread scrolling independent
- [x] 32.6 Prevent horizontal overflow
- [x] 32.7 Verify mobile member messaging
- [x] 32.8 Add mobile-layout tests where practical

## 33. Messaging Accessibility

- [x] 33.1 Verify heading hierarchy
- [x] 33.2 Verify conversation-list item names
- [x] 33.3 Verify unread state is not communicated only by color
- [x] 33.4 Verify send control has an accessible name
- [x] 33.5 Verify message status text
- [x] 33.6 Verify keyboard access to inbox and thread
- [x] 33.7 Verify focus after mobile conversation navigation
- [x] 33.8 Verify new-message announcements are not excessively disruptive
- [x] 33.9 Fix change-related accessibility issues

## 34. End-to-End Real-Time Validation

- [x] 34.1 Login as a subscriber
- [x] 34.2 Open the member conversation
- [x] 34.3 Login as ARTIST in another browser session
- [x] 34.4 Open the artist inbox
- [x] 34.5 Send a member message while the artist is online
- [x] 34.6 Confirm immediate artist delivery
- [x] 34.7 Confirm database persistence
- [x] 34.8 Reply while the member is online
- [x] 34.9 Confirm immediate member delivery
- [x] 34.10 Confirm unread counts clear when read

## 35. End-to-End Asynchronous Validation

- [x] 35.1 Disconnect the artist
- [x] 35.2 Send a member message
- [x] 35.3 Confirm persistence
- [x] 35.4 Reconnect the artist
- [x] 35.5 Confirm the missed message appears
- [x] 35.6 Disconnect the member
- [x] 35.7 Send an artist reply
- [x] 35.8 Reconnect the member
- [x] 35.9 Confirm the missed reply appears
- [x] 35.10 Restart the backend and confirm history remains

## 36. Tier Priority Validation

- [x] 36.1 Create or identify Free, Silver and Gold members
- [x] 36.2 Send unread messages from each
- [x] 36.3 Confirm priority ordering uses active effective tier
- [x] 36.4 Expire Gold access
- [x] 36.5 Confirm Gold premium priority is removed
- [x] 36.6 Revoke Silver access
- [x] 36.7 Confirm Silver premium priority is removed
- [x] 36.8 Confirm unread Free conversation remains visible
- [x] 36.9 Confirm alternative sorting options work

## 37. Authorization and Isolation Validation

- [x] 37.1 Confirm one member cannot list all conversations
- [x] 37.2 Confirm one member cannot access another conversation by id
- [x] 37.3 Confirm one member cannot join another socket room
- [x] 37.4 Confirm one member cannot send as the artist
- [x] 37.5 Confirm ARTIST can access eligible conversations
- [x] 37.6 Confirm SUBSCRIBER cannot access the artist inbox
- [x] 37.7 Confirm stale JWT is rejected by REST
- [x] 37.8 Confirm stale JWT is rejected by WebSocket
- [x] 37.9 Confirm disabled account is rejected
- [x] 37.10 Confirm hidden SUPER_ADMIN does not appear as participant

## 38. Abuse and Content Safety Validation

- [x] 38.1 Reject empty messages
- [x] 38.2 Reject whitespace-only messages
- [x] 38.3 Reject oversized messages
- [x] 38.4 Verify HTML is rendered as text
- [x] 38.5 Verify script text does not execute
- [x] 38.6 Trigger REST message rate limiting
- [x] 38.7 Trigger WebSocket message rate limiting
- [x] 38.8 Confirm controlled errors
- [x] 38.9 Confirm legitimate messaging works after the limit interval

## 39. Business Regression Validation

- [x] 39.1 Verify public Feed
- [x] 39.2 Verify Login and Register
- [x] 39.3 Verify password recovery
- [x] 39.4 Verify member profile
- [x] 39.5 Verify artist Dashboard
- [x] 39.6 Verify Posts
- [x] 39.7 Verify Users
- [x] 39.8 Verify Tiers
- [x] 39.9 Verify tier validity and history
- [x] 39.10 Verify WhatsApp and Discord remain functional
- [x] 39.11 Verify SUPER_ADMIN remains hidden
- [x] 39.12 Verify navigation and Logout

## 40. Quality Validation

- [x] 40.1 Run backend tests and fix change-related failures
- [x] 40.2 Run backend lint and fix new errors
- [x] 40.3 Run backend production build
- [x] 40.4 Run frontend tests and fix change-related failures
- [x] 40.5 Run frontend lint and fix new errors
- [x] 40.6 Run frontend production build
- [x] 40.7 Run Prisma validate
- [x] 40.8 Run Prisma migrate status
- [x] 40.9 Review migration SQL
- [x] 40.10 Review WebSocket and frontend dependencies
- [x] 40.11 Review final diff for unrelated changes
- [x] 40.12 Verify no secrets, JWTs or private messages were added to logs or fixtures
- [x] 40.13 Fix regressions within scope

## 41. OpenSpec Completion

- [x] 41.1 Update checkboxes only after implementation and verification
- [x] 41.2 Run `openspec validate member-artist-messaging`
- [x] 41.3 Produce a final implementation report
- [x] 41.4 Document models, REST endpoints, socket events, authorization, prioritization, tests and deployment implications
