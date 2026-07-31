# posts Specification

## Purpose
Defines the creation and management of content posts containing text and optional media.
## Requirements
### Requirement: Create posts

The system SHALL allow authorized users to create posts.

#### Scenario: Create text post
- **WHEN** an authorized user creates a post containing text
- **THEN** the system SHALL save the post content

### Requirement: Post media attachment

The system SHALL allow posts to contain optional media attachments.

#### Scenario: Post contains media
- **WHEN** a post includes an image or video
- **THEN** the system SHALL associate the media with the post

