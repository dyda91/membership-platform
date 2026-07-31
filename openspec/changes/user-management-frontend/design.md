## Context

The backend user management capability is already implemented using NestJS, JWT authentication, Prisma and role-based authorization.

The frontend dashboard currently exists but does not yet consume protected backend resources. The Users section requires authentication-aware API communication to access the `/users` endpoint.

This design follows the requirements defined in the user-management-frontend specification.

## Goals / Non-Goals

**Goals:**

- Establish a frontend authentication flow capable of storing and reusing JWT access tokens.
- Configure the API client to automatically authenticate protected requests.
- Provide a dashboard page for administrators to view users.
- Keep frontend authorization aligned with backend ADMIN role enforcement.
- Provide predictable loading and error handling during API communication.

**Non-Goals:**

- Changing backend authentication behavior.
- Creating new backend endpoints.
- Implementing complete user CRUD operations in this change.
- Managing password reset or account recovery flows.
- Changing database models.

## Decisions

### Decision: Use Axios interceptor for authentication headers

The frontend will attach the JWT token through an Axios request interceptor.

Alternative considered:
- Manually adding Authorization headers in each API call.

Reason:
- Interceptors centralize authentication behavior.
- Future protected endpoints can reuse the same authentication mechanism.

### Decision: Store access token in browser storage

The frontend will persist the access token after successful authentication.

Alternative considered:
- Keeping token only in memory.

Reason:
- Persistent storage allows page refreshes without requiring a new login.
- Token lifecycle management can be improved in future authentication changes.

### Decision: Create a dedicated users API service

User-related API communication will be isolated in a frontend service layer.

Alternative considered:
- Calling Axios directly inside React components.

Reason:
- Separates presentation from data access.
- Makes future CRUD expansion easier.

### Decision: Protect user management through backend authorization

The frontend will provide the Users interface only for authenticated administrators, but the backend remains the source of truth for authorization.

Alternative considered:
- Relying only on frontend route protection.

Reason:
- Frontend restrictions improve user experience, but backend validation prevents unauthorized access.

## Risks / Trade-offs

- [Risk] Token stored in browser storage may increase exposure in case of frontend security vulnerabilities.
  → Mitigation: Use HTTPS in production and improve token strategy in future security iterations.

- [Risk] Frontend permissions may become inconsistent with backend roles.
  → Mitigation: Keep backend authorization authoritative and validate API responses.

- [Risk] API failures may affect dashboard usability.
  → Mitigation: Implement loading, empty state and error feedback components.

## Migration Plan

1. Add authentication-aware API client configuration.
2. Connect the dashboard Users route to the backend endpoint.
3. Validate access using an ADMIN account.
4. Test unauthorized access behavior.
5. Deploy frontend changes independently from backend.

Rollback:

- Remove the Users frontend route.
- Revert Axios authentication changes.
- Backend remains unchanged.

## Open Questions

None.
