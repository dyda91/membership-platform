# Design: Member Artist Messaging

## Context

The platform has one active artist and multiple subscriber accounts.

Members currently contact the artist through WhatsApp or Discord. Internal
messaging should centralize communication while remaining narrower than a
general social-network messaging system.

The platform already provides:

- JWT authentication;
- database-backed sessionVersion validation;
- current account and role resolution;
- hidden SUPER_ADMIN;
- one active ARTIST;
- effective tier and access-validity service;
- responsive public and administrative interfaces;
- navigation badges and shared UI primitives;
- PostgreSQL and Prisma;
- NestJS backend;
- React frontend.

## Goals

- Add reliable private text messaging between each member and the artist.
- Persist messages before delivery.
- Support real-time updates with asynchronous fallback.
- Isolate every member conversation.
- Prioritize artist attention using unread state and current effective tier.
- Reuse the current security and access architecture.
- Keep the design suitable for one artist.
- Avoid unnecessary messaging complexity.

## Non-Goals

- Member-to-member chat
- Groups
- Multiple artists
- Attachments
- Calls
- Audio
- Reactions
- Edit or delete
- Push notifications
- End-to-end encryption
- Full moderation platform

## Domain Model

Recommended models:

```text
Conversation

id
memberId
artistId
memberLastReadAt
artistLastReadAt
lastMessageAt
createdAt
updatedAt
Message

id
conversationId
senderId
content
createdAt

Optional derived fields should not be stored when they can be computed safely.

Conversation Uniqueness

Add a unique constraint:

@@unique([memberId, artistId])

This guarantees one conversation per member and active artist.

Because the product supports only one active artist, ordinary members should
normally have one conversation.

Do not use a generic participant join table unless the current requirements
genuinely require groups or multiple participants.

Relationships

Conversation:

member → User
artist → User
messages → Message[]

Message:

conversation → Conversation
sender → User

Both sender identities must be validated against the conversation.

A message sender must be:

the conversation member; or
the conversation artist.

SUPER_ADMIN support access should not create messages as a fake artist.

If SUPER_ADMIN sending is later required, it needs an explicit support identity
design and audit behavior.

Message Content

Messages are plain text.

Recommended limits:

minimum: 1 non-whitespace character
maximum: 4000 characters

The exact maximum may be configurable.

Store normalized line endings if useful, but preserve intentional line breaks.

Do not store sanitized HTML because HTML is not supported.

Render through normal React text escaping.

Message Persistence Flow

REST or WebSocket sends should use one service method.

Conceptual flow:

authenticate
→ authorize conversation
→ validate account status
→ validate content
→ apply rate limit
→ persist message
→ update Conversation.lastMessageAt
→ commit
→ emit persisted event
→ return persisted message

The WebSocket gateway must not bypass the service or validation layer.

REST and WebSocket Responsibilities

Recommended architecture:

REST

Use REST for:

creating or resolving the member conversation;
listing artist conversations;
paginated message history;
initial unread counts;
search and filters;
marking read, when convenient;
fallback message send if WebSocket is unavailable.
WebSocket

Use WebSocket for:

new-message events;
conversation-summary updates;
unread-count updates;
read-state updates;
optional presence.

REST remains the recovery and source-of-truth path.

The chat must still function after reconnecting even if some socket events were
missed.

Suggested REST Endpoints

Member conversation:

GET /messages/conversation

Artist inbox:

GET /messages/conversations

Conversation detail:

GET /messages/conversations/:conversationId

History:

GET /messages/conversations/:conversationId/messages

Send:

POST /messages/conversations/:conversationId/messages

Mark read:

POST /messages/conversations/:conversationId/read

Unread total:

GET /messages/unread-count

Exact paths may follow current module conventions.

Do not expose arbitrary conversation creation with arbitrary participants.

WebSocket Gateway

Suggested namespace:

/messaging

or the project's existing default gateway convention.

Suggested events:

Client to server:

conversation:join
conversation:leave
message:send
conversation:read

Server to client:

message:new
message:acknowledged
message:failed
conversation:updated
conversation:read-updated
unread:updated

Avoid exposing internal database events directly.

Socket Authentication

Use the current JWT and sessionVersion.

Preferred handshake options:

authentication payload; or
Authorization-like handshake field supported by the selected client.

Do not put the JWT into URL query strings if avoidable because URLs can be
logged.

During connection:

verify JWT signature and expiration;
load current user;
compare sessionVersion;
validate account status;
attach safe authenticated user data to the socket.

For sensitive room joins, re-authorize conversation access.

Socket Rooms

Suggested room names:

conversation:<conversationId>
user:<userId>
artist-inbox:<artistId>

Use:

conversation room for thread updates;
user room for unread counts;
artist inbox room for conversation-summary changes.

Never allow a client to choose an unrestricted room name without server-side
authorization.

Active Artist Resolution

Create or reuse a service method to resolve the one active artist.

Conversation creation should fail safely if:

no active artist exists;
multiple active artists violate current constraints.

Do not infer the artist from frontend input.

Inbox Summary

A conversation summary should contain:

id
member {
  id
  name
  email
  avatarUrl
}
lastMessagePreview
lastMessageSender
lastMessageAt
artistUnreadCount
effectiveTier {
  id
  name
  priority
}
accessStatus
accessExpiresAt
accessPermanent

Only safe administrative fields should be returned.

Do not expose password or hidden-account metadata.

Tier Priority

Use the centralized effective-access service.

Do not rely on:

old User.tierId alone;
JWT tier claims;
tier at conversation creation;
tier stored permanently on messages.

At query time, determine:

effectiveTierPriority
effectiveAccessStatus

Only active/permanent/expiring-soon access receives premium priority according
to the current tier-access rules.

Expired, revoked, scheduled or absent access should not receive active premium
priority.

Priority Sorting

Recommended default artist ordering:

conversations with unread member messages;
effective tier priority descending;
last activity descending.

This provides premium prioritization without completely hiding Free members.

Alternative sorting must be available:

Priority;
Most recent;
Unread;
Tier.

Do not store a permanent priority rank because access can expire.

Search and Filters

Suggested inbox query:

search
unread
tierId
accessStatus
sort
page
limit

Search by:

member name;
member email.

Apply hidden/system exclusions.

Combine filters with AND semantics.

Reset page when frontend filters change.

Pagination

Conversation inbox should use backend pagination.

Message history should preferably use cursor pagination based on:

createdAt;
id as a tie-breaker.

Cursor pagination is suitable because new messages are appended continuously.

If current project conventions strongly prefer page pagination, use it carefully
and preserve deterministic ordering.

Read State

For this one-to-one model, timestamps on Conversation are sufficient:

memberLastReadAt
artistLastReadAt

Unread calculation:

For artist:

messages where senderId = memberId
and createdAt > artistLastReadAt

For member:

messages where senderId = artistId
and createdAt > memberLastReadAt

For efficiency, queries may use counts and indexes.

If unread counting becomes expensive, denormalized counters may be considered,
but timestamps are preferred initially.

Mark Read

Mark read when:

the conversation is open;
messages have been loaded;
the document or view is visible where practical.

Do not mark as read merely because an inbox summary was returned.

Update timestamps monotonically; never move a read timestamp backwards.

Presence

Presence is optional.

If included, use a lightweight in-memory connected-user indicator and clearly
treat it as approximate.

Do not store permanent online state in PostgreSQL.

Because deployment may later use multiple backend instances, presence must not
become a critical correctness dependency.

Messages and unread counts remain correct without presence.

Member Interface

Suggested route:

/messages

For SUBSCRIBER:

MemberMessagesPage
├── ArtistConversationHeader
├── MessageHistory
├── LoadOlderMessages
└── MessageComposer

Display:

artist name;
avatar;
safe availability text if desired;
message history;
composer.

Do not show internal priority or member administration data.

Artist Interface

Suggested route:

/messages

Role-aware rendering may use the same route.

Desktop:

ArtistMessagesPage
├── InboxSidebar
│   ├── Search
│   ├── Filters
│   ├── Sort
│   └── ConversationList
└── ConversationPanel
    ├── MemberSummary
    ├── MessageHistory
    └── MessageComposer

Mobile:

Inbox list
→ selected conversation
→ return button

Avoid rendering a wide two-column layout on narrow screens.

Navigation Badge

Add Messages to authenticated navigation.

Subscriber:

unread artist reply count.

Artist:

total unread member-message count.

SUPER_ADMIN:

support badge only if normal navigation currently exposes messaging support.

The badge should cap display where useful, such as:

99+

Use text or accessible label in addition to visual shape.

Optimistic UI

Use cautious acknowledgement-based sending.

Suggested flow:

create client temporary id;
display sending;
submit;
backend persists and returns real id;
replace temporary message;
on failure, show failed state with retry.

Do not show a message as delivered solely because it was emitted locally.

Prevent duplicate insertion when both REST response and socket event arrive.

Deduplicate by persisted message id.

Socket Reconnection

Frontend should:

reconnect using the current token;
rejoin authorized current conversation;
refresh unread count;
reload messages newer than the last known persisted message where practical.

Do not assume every event was delivered exactly once.

Rate Limiting

Apply:

endpoint/gateway request throttling;
message content validation;
maximum message size;
optional short send cooldown;
limits per account and possibly per source.

Do not use tier to grant unlimited spam.

Rate-limit errors should be user-friendly.

Security

Mandatory:

JWT authentication;
current sessionVersion;
current account status;
conversation authorization;
plain-text rendering;
rate limiting;
no arbitrary room subscription;
no participant ids accepted blindly;
no conversation leakage through sequential ids;
no hidden SUPER_ADMIN exposure;
pagination limits;
safe errors.

Use UUIDs if consistent with current database models.

Database Indexes

Recommended:

Conversation:

@@unique([memberId, artistId])
@@index([artistId, lastMessageAt])
@@index([memberId])

Message:

@@index([conversationId, createdAt])
@@index([senderId, createdAt])

Exact indexes should match actual queries.

Transactions

Sending a message should transactionally:

persist Message;
update Conversation.lastMessageAt.

Emit only after commit.

Conversation creation should use uniqueness-safe create-or-fetch logic.

Handle unique conflicts without creating duplicates.

Backend Module Structure

Suggested:

src/messaging/
├── messaging.module.ts
├── messaging.controller.ts
├── messaging.service.ts
├── messaging.gateway.ts
├── messaging-auth.service.ts
├── dto/
├── serializers/
└── tests/

Reuse current auth and Prisma modules.

Frontend Structure

Suggested:

src/features/messaging/
├── components/
│   ├── ConversationList.tsx
│   ├── ConversationListItem.tsx
│   ├── MessageThread.tsx
│   ├── MessageBubble.tsx
│   ├── MessageComposer.tsx
│   ├── MessagingHeader.tsx
│   └── UnreadBadge.tsx
├── pages/
│   ├── MemberMessagesPage.tsx
│   └── ArtistMessagesPage.tsx
├── services/
├── hooks/
└── types.ts

Follow existing project conventions instead of forcing this exact structure.

WebSocket Client Dependency

First inspect existing dependencies.

If Socket.IO is used on NestJS, a matching lightweight client may be required.

Any dependency must:

be maintained;
be justified;
be documented;
not replace the current frontend architecture.
Testing Strategy
Backend

Test:

unique conversation;
member isolation;
artist access;
SUPER_ADMIN behavior;
valid send;
invalid sender;
empty content;
oversized content;
persistence before emission;
history pagination;
unread counts;
mark read;
tier priority;
expired tier;
filters;
rate limit;
socket authentication;
stale sessionVersion;
unauthorized room join.
Frontend

Test:

member thread;
artist inbox;
conversation selection;
mobile transition;
send state;
send failure;
real-time insertion;
deduplication;
unread badge;
mark read;
search;
filters;
sort;
reconnection.
Integration

Validate:

member sends while artist online;
member sends while artist offline;
artist reads later;
artist replies while member online;
artist replies while member offline;
missed messages load after reconnect;
Gold active conversation is prioritized;
expired Gold is no longer premium-prioritized;
Free unread remains visible;
one member cannot access another conversation.
Deployment Considerations

The future production architecture must support WebSocket upgrades.

The deployment change must account for:

WebSocket support at the hosting provider;
HTTPS/WSS;
CORS/socket origins;
one or multiple backend instances;
sticky sessions or shared pub/sub if scaled horizontally;
graceful reconnect.

For the first MVP, one backend instance is sufficient.

Do not add Redis solely for hypothetical scale in this change.

Open Questions

No product question should block implementation.

When choosing details:

preserve message persistence;
preserve authorization;
prioritize simple one-to-one architecture;
calculate tier priority dynamically;
make WebSocket optional for correctness;
avoid unnecessary dependencies;
document deployment implications.
