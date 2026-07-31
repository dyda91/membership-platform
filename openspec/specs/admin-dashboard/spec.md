# admin-dashboard Specification

## Purpose
Provides administrative capabilities for managing users, posts and subscription access.
## Requirements
### Requirement: Manage users

The system SHALL allow administrators to view and manage users.

#### Scenario: Administrator views users
- **WHEN** an administrator accesses user management
- **THEN** the system SHALL display registered users

### Requirement: Manage tier assignments

The system SHALL allow administrators to manually assign subscription tiers.

#### Scenario: Administrator changes user tier
- **WHEN** an administrator assigns a different tier
- **THEN** the user's permissions SHALL reflect the new tier

