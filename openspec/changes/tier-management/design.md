# Design: Tier Management


## Backend Architecture

The feature will follow the existing NestJS architecture.

New module:

src/modules/tier/


Structure:

tier/
 ├── tier.controller.ts
 ├── tier.service.ts
 ├── tier.module.ts
 ├── dto/
 └── entities/


## Database

Prisma schema update:

New model:

Tier


Relationship:

User ---- belongsTo ---- Tier


Example:

User
 |
 | tierId
 |
Tier


## Authorization

Reuse existing JWT authentication.

Add:

- Admin guard
- Tier validation helper


## Frontend Architecture

Create:

src/pages/Tiers


Components:

- TierList
- TierForm
- TierCard


Route:

/tiers


Protected by administrator permission.


## Migration Strategy

1. Update Prisma schema
2. Generate migration
3. Apply migration
4. Implement backend module
5. Implement frontend interface
6. Validate API integration
