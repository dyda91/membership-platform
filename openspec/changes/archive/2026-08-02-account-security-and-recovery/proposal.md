# Proposal: Account Security and Recovery

## Why

The platform now provides its core product experience, including public account
registration, authentication, role-based administration, content publishing,
manual tier access, a public creator profile and refined responsive interfaces.

However, the current account lifecycle does not yet provide the security and
recovery capabilities required for real users. Members need to change and
recover passwords safely, while authentication endpoints need protection
against repeated login attempts, account enumeration and automated abuse.

Before production deployment, the application also needs a consistent strategy
for session invalidation, password-reset token handling, sensitive endpoint
protection, upload validation and authentication-related audit events.

## What Changes

- Add authenticated password-change functionality.
- Require the current password before changing a password.
- Add public forgot-password functionality.
- Add secure, single-use password-reset tokens.
- Store only reset-token hashes in the database.
- Add expiration and invalidation rules for password-reset tokens.
- Prevent password-reset responses from revealing whether an email exists.
- Add configurable SMTP email delivery.
- Add responsive forgot-password and reset-password pages.
- Invalidate previous authenticated sessions after password changes or resets.
- Add a database-backed session or token-version strategy where required.
- Add logout-from-all-sessions capability.
- Add login and registration rate limiting.
- Add temporary protection after repeated failed login attempts.
- Reset failed-login state after successful authentication.
- Prevent hidden or system accounts from being exposed through recovery flows.
- Standardize authentication error responses.
- Review JWT expiration, validation and frontend cleanup behavior.
- Review sensitive token storage in the frontend.
- Add security headers and authentication-related HTTP protections where
  compatible with the current architecture.
- Review CORS configuration for explicit development and production origins.
- Strengthen file-upload MIME, signature and size validation.
- Add authentication and sensitive-account audit events.
- Preserve all current role, tier, Feed and administration behavior.

## Goals

- Allow legitimate users to recover access safely.
- Prevent reset tokens from being reused or stored in plaintext.
- Make password changes invalidate previously issued sessions.
- Reduce brute-force and credential-stuffing risk.
- Prevent account enumeration.
- Improve security without breaking the existing product flow.
- Keep SUPER_ADMIN hidden from normal user-facing behavior.
- Prepare authentication and uploads for production deployment.
- Maintain clear, usable account-security interfaces.

## Non Goals

This change will not implement:

- OAuth login
- Social login
- Passkeys
- Multi-factor authentication
- SMS password recovery
- Integrated payment security
- Full enterprise identity management
- Device fingerprinting
- Antivirus scanning of uploaded files
- Digital-rights management
- Final production deployment
- Final branding and microcopy
- A complete migration from JWT to server-side sessions unless required for
  correctness

## Impact

### Backend

- Authentication module
- Password hashing and comparison flows
- Password-reset token model and services
- Session invalidation
- Failed-login tracking
- Rate limiting
- Email delivery abstraction
- CORS and security middleware
- Upload validation
- Security audit events
- Automated tests

### Frontend

- Forgot-password page
- Reset-password page
- Change-password interface
- Logout-all-sessions action
- Authentication error handling
- Expired-session handling
- Security feedback states
- Frontend tests

### Database

A migration is expected for password-reset records and potentially:

- password/session version;
- failed-login counters;
- temporary lock timestamps;
- security audit events.

Existing users, roles, tiers, posts, media and access assignments must be
preserved.
