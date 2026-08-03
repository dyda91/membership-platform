# Member Artist Messaging Specification

## ADDED Requirements

### Requirement: One member-to-artist conversation

The system SHALL provide at most one private conversation between each eligible
member and the active artist.

#### Scenario: Member opens messaging for the first time

- GIVEN an active authenticated SUBSCRIBER
- AND an active artist exists
- WHEN the member opens messaging
- THEN the system SHALL create or return the member's conversation with the
  artist

#### Scenario: Member opens messaging again

- GIVEN a conversation already exists for the member and artist
- WHEN the member opens messaging
- THEN the existing conversation SHALL be returned
- AND no duplicate conversation SHALL be created

#### Scenario: Member attempts to message another member

- GIVEN an authenticated SUBSCRIBER
- WHEN the user attempts to create or access a conversation with another member
- THEN the system SHALL deny the operation

#### Scenario: No active artist exists

- GIVEN no active artist is configured
- WHEN a member opens messaging
- THEN the system SHALL display a controlled unavailable state
- AND SHALL not create an invalid conversation

### Requirement: Private conversation authorization

The system SHALL restrict each conversation to its member, the active artist and
authorized system support.

#### Scenario: Member accesses own conversation

- GIVEN the authenticated member owns the conversation
- WHEN the conversation is requested
- THEN access SHALL be allowed

#### Scenario: Member accesses another conversation

- GIVEN the authenticated member does not own the conversation
- WHEN the conversation is requested
- THEN access SHALL be denied

#### Scenario: Artist accesses a member conversation

- GIVEN the authenticated user is the active ARTIST
- WHEN an eligible conversation is requested
- THEN access SHALL be allowed

#### Scenario: Super administrator accesses a conversation

- GIVEN the authenticated user is SUPER_ADMIN
- WHEN support or moderation access is requested
- THEN access MAY be allowed
- AND SUPER_ADMIN SHALL not appear as a normal conversation participant

#### Scenario: Inactive account attempts messaging

- GIVEN an account is disabled or not permitted to authenticate
- WHEN messaging is requested
- THEN access SHALL be denied

### Requirement: Text message persistence

The system SHALL persist every accepted message before real-time delivery.

#### Scenario: Member sends a valid message

- GIVEN the member is authorized for the conversation
- AND the message satisfies validation
- WHEN the member sends the message
- THEN the system SHALL persist it
- AND return the persisted message

#### Scenario: Artist sends a valid reply

- GIVEN the active artist is authorized for the conversation
- WHEN the artist sends a valid reply
- THEN the system SHALL persist it
- AND return the persisted message

#### Scenario: Real-time delivery fails

- GIVEN a message was persisted successfully
- WHEN WebSocket delivery fails or the recipient is offline
- THEN the message SHALL remain available in history

#### Scenario: Database persistence fails

- GIVEN a message cannot be persisted
- WHEN send is attempted
- THEN the system SHALL not emit the message as successfully delivered
- AND a controlled error SHALL be returned

### Requirement: Message content validation

The system SHALL validate and safely handle message text.

#### Scenario: Valid text is submitted

- GIVEN message text is non-empty and within the configured limit
- WHEN it is submitted
- THEN the message MAY be accepted

#### Scenario: Empty message is submitted

- GIVEN message text is empty or whitespace-only
- WHEN it is submitted
- THEN the system SHALL reject it

#### Scenario: Oversized message is submitted

- GIVEN message text exceeds the configured maximum
- WHEN it is submitted
- THEN the system SHALL reject it

#### Scenario: Markup or script text is submitted

- GIVEN the message contains HTML or script-like content
- WHEN it is rendered
- THEN the content SHALL be treated as plain text
- AND SHALL not execute as markup or script

### Requirement: Asynchronous conversation history

The system SHALL make persisted messages available after either participant
returns.

#### Scenario: Artist is offline when member sends

- GIVEN the artist has no active socket connection
- WHEN the member sends a valid message
- THEN the message SHALL be persisted
- AND SHALL appear when the artist later opens the conversation

#### Scenario: Member is offline when artist replies

- GIVEN the member has no active socket connection
- WHEN the artist sends a reply
- THEN the reply SHALL be persisted
- AND SHALL appear when the member later opens messaging

#### Scenario: Application restarts

- GIVEN messages were persisted previously
- WHEN the backend restarts
- THEN conversation history SHALL remain available

### Requirement: Real-time message delivery

The system SHALL deliver new persisted messages to connected authorized
participants in real time.

#### Scenario: Artist is connected

- GIVEN the artist has an authenticated active socket
- WHEN a member message is persisted
- THEN the artist SHALL receive the new-message event

#### Scenario: Member is connected

- GIVEN the member has an authenticated active socket
- WHEN the artist reply is persisted
- THEN the member SHALL receive the new-message event

#### Scenario: Unauthorized socket joins a conversation

- GIVEN the socket user is not authorized for the conversation
- WHEN the socket attempts to subscribe
- THEN the system SHALL deny the subscription

#### Scenario: Socket reconnects

- GIVEN a participant loses the socket connection
- WHEN the client reconnects
- THEN the client SHALL retrieve missed persisted messages

### Requirement: WebSocket authentication

The system SHALL authenticate socket connections using the existing account
security model.

#### Scenario: Valid socket token is supplied

- GIVEN a valid non-stale JWT is supplied during connection
- WHEN the socket is authenticated
- THEN current account, role and status SHALL be resolved from the database

#### Scenario: Stale session token is supplied

- GIVEN the token sessionVersion is stale
- WHEN the socket connects
- THEN the connection SHALL be rejected

#### Scenario: Invalid token is supplied

- GIVEN the token is invalid or expired
- WHEN the socket connects
- THEN the connection SHALL be rejected

#### Scenario: Account becomes disabled

- GIVEN a connected participant's account becomes disabled
- WHEN authorization is re-evaluated or the client reconnects
- THEN messaging access SHALL be denied

### Requirement: Paginated message history

The system SHALL paginate conversation messages.

#### Scenario: Initial message history is requested

- GIVEN a conversation contains messages
- WHEN the initial history request is made
- THEN the most recent page SHALL be returned in chronological display order

#### Scenario: Older history is requested

- GIVEN older messages exist
- WHEN the participant requests the previous page
- THEN older messages SHALL be returned
- AND existing messages SHALL remain visible

#### Scenario: No older messages exist

- GIVEN all messages are loaded
- WHEN older history is requested
- THEN the system SHALL indicate that no older messages remain

#### Scenario: Duplicate history request occurs

- GIVEN overlapping pages are requested
- WHEN results are merged
- THEN duplicate messages SHALL not be displayed

### Requirement: Artist conversation inbox

The system SHALL provide the active artist with a list of member conversations.

#### Scenario: Artist opens inbox

- GIVEN conversations exist
- WHEN the active artist opens messaging
- THEN conversation summaries SHALL be returned

#### Scenario: Conversation summary is displayed

- GIVEN a conversation contains messages
- WHEN it appears in the inbox
- THEN the summary SHALL include safe member identity, last-message preview,
  last activity, unread count, effective tier and effective access status

#### Scenario: Conversation has no messages

- GIVEN a conversation was created but contains no message
- WHEN the inbox is rendered
- THEN it SHALL be handled without a broken last-message state

#### Scenario: Hidden system account exists

- GIVEN a hidden SUPER_ADMIN exists
- WHEN the artist inbox is queried
- THEN it SHALL not appear as a member conversation

### Requirement: Tier-prioritized artist inbox

The system SHALL support prioritization using unread state and the member's
current effective tier.

#### Scenario: Unread Gold and unread Free conversations exist

- GIVEN both conversations contain unread member messages
- AND Gold is currently active
- WHEN priority sorting is selected
- THEN the Gold conversation SHALL be ranked before the Free conversation

#### Scenario: Member's premium access expired

- GIVEN a conversation member previously had Gold
- AND the current access is expired
- WHEN priority is calculated
- THEN the conversation SHALL not retain active Gold priority

#### Scenario: Member's access was revoked

- GIVEN a conversation member has revoked premium access
- WHEN priority is calculated
- THEN premium priority SHALL not be granted

#### Scenario: Scheduled access has not started

- GIVEN premium access is scheduled for the future
- WHEN priority is calculated
- THEN premium priority SHALL not yet be granted

#### Scenario: Recent Free message versus old read Gold message

- GIVEN a Free conversation has unread recent activity
- AND a Gold conversation has no unread activity
- WHEN priority sorting is applied
- THEN unread status SHALL remain a primary operational signal
- AND the Free conversation SHALL not be hidden indefinitely

### Requirement: Inbox sorting options

The system SHALL allow the artist to change inbox ordering.

#### Scenario: Priority sort is selected

- GIVEN conversation summaries exist
- WHEN Priority is selected
- THEN unread and current effective tier SHALL influence ordering

#### Scenario: Recent sort is selected

- GIVEN conversation summaries exist
- WHEN Most Recent is selected
- THEN last activity SHALL determine ordering

#### Scenario: Unread sort is selected

- GIVEN read and unread conversations exist
- WHEN Unread is selected
- THEN conversations with unread messages SHALL appear first

#### Scenario: Tier sort is selected

- GIVEN members have different current effective tiers
- WHEN Tier is selected
- THEN effective tier priority SHALL influence ordering

### Requirement: Artist inbox search and filters

The system SHALL support server-side inbox discovery.

#### Scenario: Artist searches by member name

- GIVEN multiple conversations exist
- WHEN a partial member name is searched
- THEN matching conversations SHALL be returned

#### Scenario: Artist searches by member email

- GIVEN multiple conversations exist
- WHEN a partial member email is searched
- THEN matching conversations SHALL be returned

#### Scenario: Artist filters unread conversations

- GIVEN read and unread conversations exist
- WHEN the unread filter is selected
- THEN only conversations with unread artist messages SHALL be returned

#### Scenario: Artist filters by tier

- GIVEN members have different effective tiers
- WHEN a tier filter is selected
- THEN matching effective-tier conversations SHALL be returned

#### Scenario: Artist filters by access status

- GIVEN members have active, expired, revoked or other access states
- WHEN an access-status filter is selected
- THEN matching conversations SHALL be returned

### Requirement: Read-state tracking

The system SHALL track when each participant has read conversation activity.

#### Scenario: Artist opens a conversation

- GIVEN unread member messages exist
- WHEN the artist opens and views the conversation
- THEN artist read state SHALL advance
- AND the artist unread count SHALL decrease

#### Scenario: Member opens the conversation

- GIVEN unread artist replies exist
- WHEN the member opens and views the conversation
- THEN member read state SHALL advance
- AND the member unread count SHALL decrease

#### Scenario: New message arrives after read state

- GIVEN the conversation was fully read
- WHEN a new message is persisted
- THEN the recipient unread count SHALL increase

#### Scenario: Read-state event is delivered

- GIVEN both participants are connected
- WHEN one participant marks the conversation as read
- THEN the other client MAY receive a read-state update

### Requirement: Navigation unread badge

The system SHALL show a safe unread-message indicator in authenticated
navigation.

#### Scenario: Member has unread artist replies

- GIVEN the member has unread messages
- WHEN navigation is rendered
- THEN a Messages badge SHALL display the unread count or indicator

#### Scenario: Artist has unread member messages

- GIVEN one or more conversations contain unread member messages
- WHEN artist navigation is rendered
- THEN the Messages badge SHALL reflect the total unread count

#### Scenario: All messages are read

- GIVEN no unread messages remain
- WHEN navigation is rendered
- THEN the unread badge SHALL be hidden or display zero according to the visual
  convention

#### Scenario: Subscriber is unauthenticated

- GIVEN no authenticated account exists
- WHEN public navigation is rendered
- THEN no private-message badge SHALL be shown

### Requirement: Member messaging interface

The system SHALL provide each eligible member with a private artist conversation
interface.

#### Scenario: Member opens Messages

- GIVEN the member is authenticated
- WHEN the Messages route opens
- THEN the member SHALL see only the conversation with the active artist

#### Scenario: Member sends text

- GIVEN the composer contains valid text
- WHEN Send is activated
- THEN the message SHALL appear after backend acknowledgement

#### Scenario: Send is processing

- GIVEN a send request is in progress
- WHEN the composer is rendered
- THEN duplicate submission SHALL be prevented

#### Scenario: Send fails

- GIVEN the message cannot be persisted
- WHEN the error is returned
- THEN the message SHALL not be shown as successfully sent
- AND retry behavior MAY be available

### Requirement: Artist messaging interface

The system SHALL provide a responsive inbox and selected-conversation interface
for the active artist.

#### Scenario: Artist opens messaging on desktop

- GIVEN a wide viewport
- WHEN the inbox is rendered
- THEN conversation list and selected conversation MAY appear side by side

#### Scenario: Artist opens messaging on mobile

- GIVEN a narrow viewport
- WHEN messaging is rendered
- THEN the conversation list SHALL open first
- AND selecting a conversation SHALL open its thread
- AND a clear return-to-list action SHALL be available

#### Scenario: Artist selects a conversation

- GIVEN the inbox contains multiple conversations
- WHEN one conversation is selected
- THEN the message history and member access summary SHALL be displayed

#### Scenario: New message arrives in another conversation

- GIVEN the artist is viewing one conversation
- WHEN another conversation receives a message
- THEN its unread indicator and ordering SHALL update without replacing the
  current thread unexpectedly

### Requirement: Message rate limiting and spam protection

The system SHALL limit excessive message sending.

#### Scenario: Normal message rate

- GIVEN the participant sends within configured limits
- WHEN messages are submitted
- THEN they SHALL be processed normally

#### Scenario: Excessive message rate

- GIVEN the participant exceeds the configured message limit
- WHEN another message is submitted
- THEN the system SHALL temporarily reject or throttle sending

#### Scenario: Rate-limited response

- GIVEN sending is rate-limited
- WHEN the response is returned
- THEN it SHALL be controlled
- AND SHALL not expose internal counters

#### Scenario: Oversized repeated payloads are attempted

- GIVEN a client repeatedly submits invalid oversized messages
- WHEN validation and throttling run
- THEN the platform SHALL remain protected from normal abuse

### Requirement: Message delivery states

The system SHALL distinguish local sending state from persisted delivery.

#### Scenario: Message is being submitted

- GIVEN the user activated Send
- WHEN the backend has not yet acknowledged persistence
- THEN the frontend MAY display a temporary sending state

#### Scenario: Persistence succeeds

- GIVEN the backend persisted the message
- WHEN acknowledgement is received
- THEN the temporary state SHALL be replaced by the persisted message

#### Scenario: Persistence fails

- GIVEN the backend rejects or fails to persist the message
- WHEN the response is received
- THEN the frontend SHALL display a failed state
- AND SHALL not falsely report delivery

### Requirement: Existing platform behavior preservation

The system SHALL preserve current account, tier, content and administration
behavior.

#### Scenario: Member messaging is introduced

- GIVEN the member already has tier access and Feed permissions
- WHEN messaging is used
- THEN current Feed authorization SHALL remain unchanged

#### Scenario: Artist uses messaging

- GIVEN the active artist uses the inbox
- WHEN messages are managed
- THEN existing Posts, Users, Tiers and Dashboard operations SHALL remain
  available

#### Scenario: External contact actions exist

- GIVEN WhatsApp or Discord is enabled
- WHEN messaging is introduced
- THEN those external contact actions MAY remain available

#### Scenario: Super administrator remains hidden

- GIVEN SUPER_ADMIN has support access
- WHEN ordinary member and artist messaging interfaces are rendered
- THEN SUPER_ADMIN SHALL not appear as the artist or a normal member participant
