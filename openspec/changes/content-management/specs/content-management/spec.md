# Content Management Specification

## ADDED Requirements

### Requirement: Post Management

The system SHALL allow artists to create and manage posts.

#### Scenario: Create post

- GIVEN an authenticated artist
- WHEN creating a post
- THEN the system SHALL persist the post.

#### Scenario: Edit post

- GIVEN an existing post
- WHEN the artist edits it
- THEN the changes SHALL be saved.

#### Scenario: Delete post

- GIVEN an existing post
- WHEN the artist deletes it
- THEN the post SHALL no longer be visible.

---

### Requirement: Media Upload

The system SHALL allow uploading media.

#### Scenario: Upload image

- GIVEN a valid image
- WHEN uploading
- THEN the media SHALL be stored.

#### Scenario: Upload video

- GIVEN a valid video
- WHEN uploading
- THEN the media SHALL be stored.

---

### Requirement: Tier Protected Content

The system SHALL associate posts with subscription tiers.

#### Scenario: Public post

- GIVEN no tier restriction
- WHEN viewing the post
- THEN every visitor SHALL access it.

#### Scenario: Premium post

- GIVEN a required tier
- WHEN an unauthorized user views it
- THEN the media SHALL remain protected.
