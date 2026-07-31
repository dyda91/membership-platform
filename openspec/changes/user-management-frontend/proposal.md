## Why

The platform backend already provides authenticated user management through JWT authentication and ADMIN role authorization, but the frontend does not yet consume these capabilities.

This change connects the administrator dashboard with the user management API, enabling administrators to view and manage platform users through the web interface.

## What Changes

- Add frontend authentication token handling for protected API requests.
- Configure Axios to automatically attach JWT Bearer tokens.
- Create frontend user management API integration.
- Implement Users management page in the administrator dashboard.
- Display users retrieved from the backend `/users` endpoint.
- Add loading and error handling states.
- Restrict user management access to authenticated administrators.

## Capabilities

### New Capabilities

- `user-management-frontend`: Provides administrator interface capabilities for viewing and interacting with platform users through the dashboard.

### Modified Capabilities

## Impact

- Frontend React application.
- Axios API client configuration.
- Dashboard routing and navigation.
- Integration with existing backend authentication API.
- Integration with existing backend `/users` endpoint.
