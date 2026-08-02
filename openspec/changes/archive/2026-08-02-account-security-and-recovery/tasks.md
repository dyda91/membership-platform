## 1. Security Architecture Review

- [x] 1.1 Review the current password hashing implementation
- [x] 1.2 Review JWT claims, expiration and validation
- [x] 1.3 Review frontend token storage and cleanup
- [x] 1.4 Review authentication DTOs and public error responses
- [x] 1.5 Review registration and login abuse protection
- [x] 1.6 Review current CORS configuration
- [x] 1.7 Review upload MIME, signature and size validation
- [x] 1.8 Review authentication-related logging for sensitive data
- [x] 1.9 Review existing email or notification infrastructure
- [x] 1.10 Document selected session, SMTP and rate-limit strategies

## 2. Database Security Models

- [x] 2.1 Add a sessionVersion or equivalent security-version field to User
- [x] 2.2 Add failed-login attempt fields
- [x] 2.3 Add temporary login-block timestamp
- [x] 2.4 Create PasswordResetToken model
- [x] 2.5 Add reset-token user relation
- [x] 2.6 Add token hash, expiration and used timestamp
- [x] 2.7 Add useful reset-token indexes
- [x] 2.8 Create SecurityAuditEvent model or equivalent
- [x] 2.9 Add safe security-event action enum
- [x] 2.10 Add useful security-event indexes

## 3. Safe Security Migration

- [x] 3.1 Create a Prisma migration without resetting the database
- [x] 3.2 Preserve all users and existing password hashes
- [x] 3.3 Initialize session versions safely
- [x] 3.4 Initialize failed-login counters safely
- [x] 3.5 Create reset-token and audit tables
- [x] 3.6 Review migration SQL for destructive behavior
- [x] 3.7 Apply migration to the current development database
- [x] 3.8 Regenerate Prisma Client
- [x] 3.9 Run Prisma validate
- [x] 3.10 Run Prisma migrate status

## 4. Shared Password Policy

- [x] 4.1 Create or consolidate one backend password-policy validator
- [x] 4.2 Preserve a compatible minimum password length
- [x] 4.3 Add a reasonable maximum password length
- [x] 4.4 Reject whitespace-only passwords
- [x] 4.5 Add a limited obvious weak-password check if justified
- [x] 4.6 Apply the policy to registration
- [x] 4.7 Apply the policy to password change
- [x] 4.8 Apply the policy to password reset
- [x] 4.9 Expose safe frontend requirement metadata or shared copy
- [x] 4.10 Add password-policy tests

## 5. Database-Backed Session Version

- [x] 5.1 Add sessionVersion to issued JWTs
- [x] 5.2 Validate token sessionVersion against the current database account
- [x] 5.3 Reject tokens with stale sessionVersion
- [x] 5.4 Preserve current database-backed role resolution
- [x] 5.5 Preserve current effective tier resolution
- [x] 5.6 Preserve inactive and blocked-account denial
- [x] 5.7 Standardize stale-token authentication errors
- [x] 5.8 Add session-version tests

## 6. Authenticated Password Change Backend

- [x] 6.1 Create an allowlisted change-password DTO
- [x] 6.2 Require the authenticated account from the request
- [x] 6.3 Verify the current password
- [x] 6.4 Validate the new password policy
- [x] 6.5 Hash the new password with the existing implementation
- [x] 6.6 Increment sessionVersion
- [x] 6.7 Record a password-changed audit event
- [x] 6.8 Perform security-sensitive changes transactionally
- [x] 6.9 Return a safe success response
- [x] 6.10 Add password-change tests

## 7. Logout All Sessions Backend

- [x] 7.1 Create a protected logout-all-sessions operation
- [x] 7.2 Increment sessionVersion
- [x] 7.3 Record a security audit event
- [x] 7.4 Return a safe success response
- [x] 7.5 Verify all previously issued tokens are rejected
- [x] 7.6 Add logout-all-sessions tests

## 8. Password Reset Token Service

- [x] 8.1 Generate cryptographically secure raw reset tokens
- [x] 8.2 Encode tokens safely for URLs
- [x] 8.3 Hash tokens before persistence
- [x] 8.4 Configure reset-token lifetime
- [x] 8.5 Create reset records for eligible accounts
- [x] 8.6 Prevent excessive valid outstanding tokens
- [x] 8.7 Find tokens using their hash
- [x] 8.8 Reject expired tokens
- [x] 8.9 Reject used tokens
- [x] 8.10 Add token-service tests

## 9. Forgot-Password Backend

- [x] 9.1 Create an allowlisted forgot-password DTO
- [x] 9.2 Normalize the submitted email
- [x] 9.3 Return generic public wording
- [x] 9.4 Preserve equivalent response behavior for unknown accounts
- [x] 9.5 Preserve hidden system-account privacy
- [x] 9.6 Create a reset token only for eligible accounts
- [x] 9.7 Avoid logging raw reset tokens
- [x] 9.8 Add forgot-password tests
- [x] 9.9 Add account-enumeration regression tests

## 10. Email Delivery Foundation

- [x] 10.1 Create or consolidate a MailService abstraction
- [x] 10.2 Add SMTP configuration validation
- [x] 10.3 Add SMTP environment-variable documentation to `.env.example`
- [x] 10.4 Implement password-reset email delivery
- [x] 10.5 Build reset links from configured FRONTEND_URL
- [x] 10.6 Include reset expiration in email content
- [x] 10.7 Prevent raw tokens from appearing in logs
- [x] 10.8 Handle delivery failures safely
- [x] 10.9 Create a fake mail provider for tests
- [x] 10.10 Add email-delivery tests

## 11. Local Email Testing Infrastructure

- [x] 11.1 Determine whether the current Docker workflow can include a local SMTP catcher
- [x] 11.2 Add a local SMTP service only if consistent with project infrastructure
- [x] 11.3 Document local SMTP startup and web-interface ports
- [x] 11.4 Keep SMTP credentials out of committed environment files
- [x] 11.5 Verify a real reset email can be captured locally
- [x] 11.6 Document any provider-specific production limitation

## 12. Password Reset Completion Backend

- [x] 12.1 Create an allowlisted reset-password DTO
- [x] 12.2 Hash and locate the submitted token
- [x] 12.3 Reject missing, expired or used tokens
- [x] 12.4 Validate the new password
- [x] 12.5 Update the password hash
- [x] 12.6 Mark the reset token as used
- [x] 12.7 Invalidate all other outstanding reset tokens
- [x] 12.8 Increment sessionVersion
- [x] 12.9 Record a reset-completed security event
- [x] 12.10 Perform the operation transactionally
- [x] 12.11 Add reset-completion tests

## 13. Login Rate Limiting

- [x] 13.1 Select a focused NestJS-compatible rate-limit implementation
- [x] 13.2 Configure stricter login limits
- [x] 13.3 Configure registration limits
- [x] 13.4 Configure forgot-password limits
- [x] 13.5 Configure reset-password limits
- [x] 13.6 Add environment-driven thresholds where practical
- [x] 13.7 Return controlled rate-limit responses
- [x] 13.8 Avoid exposing sensitive internal counters
- [x] 13.9 Add rate-limit tests

## 14. Failed-Login Protection

- [x] 14.1 Increment failed-login state for known eligible accounts
- [x] 14.2 Configure the temporary protection threshold
- [x] 14.3 Configure the protection duration
- [x] 14.4 Set loginBlockedUntil when the threshold is reached
- [x] 14.5 Deny login while temporary protection is active
- [x] 14.6 Reset failed-login state after successful login
- [x] 14.7 Allow login again after the protection interval
- [x] 14.8 Record a protection-activated security event
- [x] 14.9 Avoid revealing hidden-account state
- [x] 14.10 Add failed-login and recovery tests

## 15. Authentication Response Hardening

- [x] 15.1 Standardize invalid-login public messages
- [x] 15.2 Avoid explicitly distinguishing unknown email from wrong password
- [x] 15.3 Standardize invalid reset-token responses
- [x] 15.4 Preserve useful field validation without leaking account state
- [x] 15.5 Avoid returning internal exception details
- [x] 15.6 Add response-privacy tests

## 16. Security Audit Events

- [x] 16.1 Create a reusable security-audit service
- [x] 16.2 Record password-changed events
- [x] 16.3 Record reset-requested events only where privacy-safe
- [x] 16.4 Record reset-completed events
- [x] 16.5 Record temporary-login-protection events
- [x] 16.6 Record logout-all-sessions events
- [x] 16.7 Ensure no password or raw token is stored
- [x] 16.8 Restrict audit-event access
- [x] 16.9 Add security-audit tests

## 17. Forgot-Password Frontend

- [x] 17.1 Create the public forgot-password route
- [x] 17.2 Create the ForgotPasswordPage
- [x] 17.3 Add a validated email field
- [x] 17.4 Connect the form to the backend
- [x] 17.5 Display the generic success response
- [x] 17.6 Add loading and controlled error states
- [x] 17.7 Add a link back to Login
- [x] 17.8 Preserve mobile responsiveness
- [x] 17.9 Add forgot-password page tests

## 18. Reset-Password Frontend

- [x] 18.1 Create the public reset-password route
- [x] 18.2 Read the reset token safely from the URL
- [x] 18.3 Create new-password and confirmation controls
- [x] 18.4 Display password-policy requirements
- [x] 18.5 Connect the form to the reset endpoint
- [x] 18.6 Display success and navigate toward Login
- [x] 18.7 Display invalid-or-expired token state
- [x] 18.8 Provide request-new-link navigation
- [x] 18.9 Clear sensitive values after completion
- [x] 18.10 Add reset-password page tests

## 19. Account Security Frontend

- [x] 19.1 Add an authenticated Account Security route or profile section
- [x] 19.2 Create the change-password form
- [x] 19.3 Add current-password input
- [x] 19.4 Add new-password and confirmation inputs
- [x] 19.5 Display password-policy requirements
- [x] 19.6 Connect to the change-password endpoint
- [x] 19.7 Explain session invalidation after success
- [x] 19.8 Add logout-all-sessions action
- [x] 19.9 Require confirmation where appropriate
- [x] 19.10 Add Account Security tests

## 20. Frontend Session Invalidation Handling

- [x] 20.1 Review Axios authentication interceptors
- [x] 20.2 Clear stale token after session-version rejection
- [x] 20.3 Clear currentUser and authentication caches
- [x] 20.4 Redirect to Login or the public Feed appropriately
- [x] 20.5 Display a generic session-ended message where useful
- [x] 20.6 Preserve ordinary 403 behavior without forced logout
- [x] 20.7 Verify logout clears every local authentication value
- [x] 20.8 Add stale-session frontend tests

## 21. Token Storage Review

- [x] 21.1 Document the current frontend token-storage strategy
- [x] 21.2 Verify tokens are not rendered into the DOM
- [x] 21.3 Verify logout removes stored tokens
- [x] 21.4 Verify password events invalidate stored tokens server-side
- [x] 21.5 Avoid partial migration between localStorage and cookies
- [x] 21.6 Document HttpOnly cookie migration as a future production decision if applicable

## 22. Security Headers

- [x] 22.1 Review existing HTTP security middleware
- [x] 22.2 Add or configure focused security headers where compatible
- [x] 22.3 Review content-type sniffing protection
- [x] 22.4 Review frame protection
- [x] 22.5 Review referrer policy
- [x] 22.6 Review CSP compatibility with frontend and MinIO media
- [x] 22.7 Avoid enabling a breaking CSP without required source configuration
- [x] 22.8 Add middleware configuration tests where practical

## 23. CORS Hardening

- [x] 23.1 Replace hardcoded single-origin configuration with environment-driven origins
- [x] 23.2 Support explicit development frontend origin
- [x] 23.3 Support explicit production origins
- [x] 23.4 Reject unknown browser origins
- [x] 23.5 Preserve non-browser server-to-server behavior where appropriate
- [x] 23.6 Document CORS variables in `.env.example`
- [x] 23.7 Add CORS configuration tests where practical

## 24. Upload Security Review

- [x] 24.1 Review image upload validation
- [x] 24.2 Review video upload validation
- [x] 24.3 Review avatar and banner validation
- [x] 24.4 Verify configured maximum sizes
- [x] 24.5 Verify allowed MIME lists
- [x] 24.6 Add or strengthen file-signature checks
- [x] 24.7 Reject MIME and signature mismatches
- [x] 24.8 Reject unsupported files before final association
- [x] 24.9 Preserve current valid upload behavior
- [x] 24.10 Add upload-security tests

## 25. Security Configuration Documentation

- [x] 25.1 Update `.env.example` with security-related variable names
- [x] 25.2 Document SMTP configuration
- [x] 25.3 Document reset-token lifetime
- [x] 25.4 Document JWT lifetime and session-version behavior
- [x] 25.5 Document rate-limit thresholds
- [x] 25.6 Document failed-login protection
- [x] 25.7 Document CORS origins
- [x] 25.8 Document upload limits
- [x] 25.9 Ensure no real secret is committed

## 26. End-to-End Password Recovery Validation

- [x] 26.1 Request recovery for an existing subscriber
- [x] 26.2 Request recovery for an unknown email
- [x] 26.3 Confirm public responses do not reveal account existence
- [x] 26.4 Capture a real reset email using the local SMTP test flow
- [x] 26.5 Confirm no raw reset token appears in ordinary logs
- [x] 26.6 Open the reset link
- [x] 26.7 Reset the password successfully
- [x] 26.8 Confirm the old password fails
- [x] 26.9 Confirm the new password succeeds
- [x] 26.10 Confirm the reset token cannot be reused
- [x] 26.11 Confirm another outstanding token becomes invalid
- [x] 26.12 Confirm old JWTs no longer work

## 27. End-to-End Account Security Validation

- [x] 27.1 Change password with the correct current password
- [x] 27.2 Reject an incorrect current password
- [x] 27.3 Reject an invalid new password
- [x] 27.4 Confirm old JWTs are invalidated
- [x] 27.5 Login with the new password
- [x] 27.6 Request logout from all sessions
- [x] 27.7 Confirm all old tokens fail
- [x] 27.8 Verify SUBSCRIBER cannot modify another account password
- [x] 27.9 Verify ARTIST and SUPER_ADMIN account-security behavior
- [x] 27.10 Verify hidden SUPER_ADMIN remains undisclosed publicly

## 28. End-to-End Abuse Protection Validation

- [x] 28.1 Perform normal successful login
- [x] 28.2 Perform repeated invalid login attempts
- [x] 28.3 Confirm failed-attempt tracking
- [x] 28.4 Confirm temporary login protection activates
- [x] 28.5 Confirm protected response does not reveal excessive details
- [x] 28.6 Confirm login succeeds after the protection interval
- [x] 28.7 Confirm successful login clears failure state
- [x] 28.8 Confirm login rate limiting
- [x] 28.9 Confirm forgot-password rate limiting
- [x] 28.10 Confirm registration rate limiting

## 29. Business Regression Validation

- [x] 29.1 Verify public Feed
- [x] 29.2 Verify registration
- [x] 29.3 Verify ordinary login
- [x] 29.4 Verify subscriber access
- [x] 29.5 Verify artist administration
- [x] 29.6 Verify super-administrator administration
- [x] 29.7 Verify hidden SUPER_ADMIN exclusion
- [x] 29.8 Verify posts and media
- [x] 29.9 Verify tier access and validity
- [x] 29.10 Verify user management
- [x] 29.11 Verify artist profile
- [x] 29.12 Verify valid uploads remain functional

## 30. Quality Validation

- [x] 30.1 Run backend tests and fix change-related failures
- [x] 30.2 Run backend lint and fix new errors
- [x] 30.3 Run backend production build
- [x] 30.4 Run frontend tests and fix change-related failures
- [x] 30.5 Run frontend lint and fix new errors
- [x] 30.6 Run frontend production build
- [x] 30.7 Run Prisma validate
- [x] 30.8 Run Prisma migrate status
- [x] 30.9 Review migration SQL
- [x] 30.10 Review dependencies and remove unnecessary additions
- [x] 30.11 Review final diff for unrelated changes
- [x] 30.12 Verify no secrets or raw tokens were committed
- [x] 30.13 Fix regressions within scope

## 31. OpenSpec Completion

- [x] 31.1 Update checkboxes only after implementation and verification
- [x] 31.2 Run `openspec validate account-security-and-recovery`
- [x] 31.3 Produce a final implementation report
- [x] 31.4 Document migration, reset flow, session invalidation, email, rate limiting, upload security and remaining limitations
