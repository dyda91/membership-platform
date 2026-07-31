## Decisions

### Frontend Stack

The frontend will use:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios


Rationale:

React and TypeScript provide a maintainable component architecture and strong typing for a growing application.


Alternative considered:

Next.js.

Reason not chosen:

The initial platform does not require server-side rendering and a Vite SPA provides a simpler starting point.


### Backend Stack

The backend will use:

- Node.js
- TypeScript
- NestJS
- Prisma ORM
- PostgreSQL


Rationale:

The platform requires authentication, authorization, users, content management and administrative modules. NestJS provides a modular architecture suitable for these requirements.


Alternative considered:

Express.js.

Reason not chosen:

Express requires more manual architectural decisions as the application grows.


### Infrastructure

The initial environment will use:

- Docker Compose
- PostgreSQL container
- MinIO for local media storage


Production storage can later migrate to an object storage provider.