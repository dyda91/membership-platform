## Why

The platform needs a structured way to manage users and their roles beyond authentication. This change introduces user management capabilities required to support artists, administrators, subscribers, and future platform features.

## What Changes

- Add user management capabilities including user profiles, roles, and account status.
- Define user types supported by the platform (artist, administrator, subscriber, and anonymous visitor context).
- Allow administrators to manage user information and permissions.
- Provide the foundation for associating users with subscription tiers and platform interactions.
- Establish user data management rules and lifecycle handling.

## Capabilities

### New Capabilities

- `user-management`: Defines user profiles, roles, account status, and administrative management of users.

### Modified Capabilities

<!-- No existing capabilities are modified in this change. -->
## Impact

- Backend user domain modules and database models.
- Authentication and authorization flows.
- API endpoints related to user management.
- Database schema through Prisma migrations.
- Admin dashboard features that depend on user administration.
- Future subscription and content access controls.
