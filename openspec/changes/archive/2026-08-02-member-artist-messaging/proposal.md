# Proposal: Member Artist Messaging

## Why

The platform currently relies on external WhatsApp and Discord contact actions
for communication between members and the artist.

External contact remains useful, but it separates conversations from the member
account, tier, access validity and administrative workflow. The artist needs a
centralized inbox where messages remain available even when either participant
is offline.

The platform has one active artist, so it does not require a generic
user-to-user social messaging system. Each eligible member needs one private
conversation with the artist, while the artist needs a prioritized inbox based
on unread activity and the member's current effective tier.

## What Changes

- Add one private conversation between each eligible member and the active
  artist.
- Prevent members from messaging other members.
- Prevent duplicate conversations for the same member and artist.
- Allow members to send text messages to the artist.
- Allow the active artist to reply to member conversations.
- Persist messages before real-time delivery.
- Add WebSocket-based real-time message delivery.
- Preserve asynchronous access when either participant is offline.
- Add paginated message history.
- Add an artist inbox with conversation summaries.
- Add search by member name or email.
- Add filters for unread state, tier and access status.
- Prioritize conversations using unread state and current effective tier.
- Use the current effective tier instead of stale or expired tier information.
- Add unread-message counts for both participants.
- Add a navigation badge for unread messages.
- Add message read-state synchronization.
- Add responsive member and artist messaging interfaces.
- Add safe rate limits and anti-spam controls.
- Treat message content as plain text.
- Preserve current account status, role and hidden-user restrictions.
- Permit SUPER_ADMIN support access without displaying it as a normal chat
  participant.
- Add authorization and isolation tests.
- Preserve WhatsApp and Discord as optional external contact alternatives.

## Goals

- Centralize member-to-artist communication.
- Support real-time and asynchronous conversation.
- Keep every member isolated from other member conversations.
- Help the artist identify unread and higher-tier conversations.
- Preserve messages reliably in PostgreSQL.
- Reuse the existing authentication, tier access and visual foundation.
- Make the feature usable on mobile and desktop.
- Prepare the production architecture for WebSocket support.

## Non Goals

This change will not implement:

- Member-to-member messaging
- Group conversations
- Multiple artists
- Image attachments
- File attachments
- Audio messages
- Video messages
- Voice or video calls
- Message reactions
- Threaded replies
- Message editing
- Message deletion
- Push notifications
- Browser notifications
- Automatic email notifications
- WhatsApp automation
- Discord automation
- End-to-end encryption
- Advanced moderation
- Final branding and microcopy

## Impact

### Backend

- Messaging domain models
- Conversation and message services
- REST endpoints
- WebSocket gateway
- JWT authentication for socket connections
- Conversation authorization
- Tier-based inbox prioritization
- Read-state tracking
- Message rate limiting
- Automated tests

### Frontend

- Member conversation page
- Artist inbox
- Conversation list
- Message thread
- Composer
- Unread indicators
- Navigation badge
- WebSocket client state
- Mobile and desktop layouts
- Frontend tests

### Database

A migration is expected for:

- Conversation
- Message
- Read-state metadata
- Required indexes and uniqueness constraints

Existing users, posts, media, tiers and access history must be preserved.
