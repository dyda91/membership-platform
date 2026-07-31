# Database Foundation Design

## Context

The project currently has the initial full-stack infrastructure configured:

- React frontend using Vite and TypeScript.
- NestJS backend using TypeScript.
- Prisma ORM configured with PostgreSQL.
- PostgreSQL running through Docker Compose.
- MinIO configured as local object storage.

This design defines how the initial application data model will be implemented.

See proposal.md for the motivation and see database-foundation.md specifications for functional requirements.

---

## Goals / Non-Goals

**Goals:**

- Define the initial relational database architecture.
- Implement the core domain entities required by the platform.
- Establish Prisma models and relationships.
- Create a migration-ready database structure.
- Prepare the backend architecture for future feature modules.

**Non-Goals:**

- Implement authentication flows.
- Implement payment processing.
- Implement subscription billing.
- Implement media upload processing.
- Implement notification services.
- Implement authorization middleware.

---

# Decisions

## Decision: Database Technology

### Choice

Use PostgreSQL as the primary relational database.

### Rationale

PostgreSQL provides:

- Strong relational modeling.
- Reliable transactions.
- Good support for future complex relationships.
- Compatibility with Prisma ORM.

### Alternatives considered

**MongoDB**

Rejected because the platform has strong relational requirements between:

- users;
- artists;
- tiers;
- posts;
- access permissions.

---

## Decision: ORM

### Choice

Use Prisma ORM.

### Rationale

Prisma provides:

- Type-safe database access.
- Migration management.
- Good integration with NestJS and TypeScript.
- Easier maintenance of schema evolution.

### Alternatives considered

**TypeORM**

Rejected because Prisma provides stronger generated typing and aligns better with the existing project setup.

---

## Decision: Entity Model

The initial database will contain:


User
|
| 1:0..1
|
Artist
|
| 1:N
|
Post
|
| 1:N
|
Media

Artist
|
| 1:N
|
Tier


### User

Responsible for authentication identity and system roles.

Contains:

- unique identifier;
- email;
- password hash;
- role.

---

### Artist

Represents the public creator profile.

Relationship:

- belongs to one User;
- owns multiple Posts;
- owns multiple Tiers.

---

### Tier

Represents artist-defined access levels.

Relationship:

- belongs to one Artist;
- can be referenced by premium content rules.

---

### Post

Represents artist publications.

Contains:

- public text;
- visibility information;
- timestamps.

Relationship:

- belongs to one Artist;
- may contain multiple Media items.

---

### Media

Represents stored media metadata.

Contains:

- storage reference;
- media type;
- relationship with Post.

The actual binary files will be stored in MinIO.

---

## Decision: Identifier Strategy

### Choice

Use generated UUID identifiers.

### Rationale

UUIDs provide:

- globally unique identifiers;
- safer public references;
- easier future distributed architecture.

---

## Decision: Timestamp Strategy

All main entities will contain:

- createdAt
- updatedAt

These fields will be automatically managed by Prisma.

---

## Decision: Data Deletion Strategy

### Choice

Use physical deletion initially.

### Rationale

The first version prioritizes simplicity.

Soft delete may be introduced later if requirements for auditing or recovery appear.

---

## Decision: Backend Module Structure

The backend will evolve into domain modules:


src/

prisma/

users/

artists/

tiers/

posts/

media/


Each module will contain:

- controller;
- service;
- DTOs;
- domain logic.

---

# Risks / Trade-offs

## Risk: Future authorization complexity

→ Mitigation:

The model keeps access relationships separated so authorization rules can evolve without redesigning the database.

---

## Risk: Media scaling limitations

→ Mitigation:

Only metadata is stored in PostgreSQL. Binary files are stored externally through MinIO.

---

## Risk: Future subscription complexity

→ Mitigation:

Tier entities are separated from users and posts, allowing subscription logic to be introduced later.

---

# Migration Plan

## Initial migration

1. Create Prisma models.
2. Generate initial migration.
3. Apply migration to PostgreSQL.
4. Validate generated tables.
5. Update backend services to consume the models.

## Rollback strategy

If migration issues occur:

1. Revert application changes.
2. Roll back the migration.
3. Restore previous database state.

---

# Open Questions

None at this stage.

Future changes may define:

- payment provider integration;
- subscription lifecycle;
- advanced permission rules;
- content moderation.
