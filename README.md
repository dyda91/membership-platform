# Platform

Initial project foundation.

## Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- TypeScript
- NestJS
- Prisma ORM
- PostgreSQL

### Infrastructure
- Docker Compose
- PostgreSQL
- MinIO

## Database

### Entities

| Entity   | Description                          | Key Relationships            |
|----------|--------------------------------------|------------------------------|
| User     | Authentication identity and roles    | has one Artist (optional)    |
| Artist   | Public creator profile               | belongs to User, has many Posts and Tiers |
| Post     | Artist publication                   | belongs to Artist, has many Media |
| Media    | Stored media metadata (MinIO)        | belongs to Post              |
| Tier     | Artist-defined access level          | belongs to Artist            |

### Enums

- **Role:** `USER`, `ARTIST`, `ADMIN`
- **PostStatus:** `DRAFT`, `PUBLISHED`
- **MediaType:** `IMAGE`, `VIDEO`

### Migrations

```bash
# Start database
docker compose up -d

# Generate and apply migration
cd backend
npx prisma migrate dev --name <name>

# Reset database (destroys data)
npx prisma migrate reset
```
