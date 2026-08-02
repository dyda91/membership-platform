# Design: Account Security and Recovery

## Context

The platform currently provides:

- public registration;
- JWT login;
- database-backed role and account-status resolution;
- role-aware frontend navigation;
- hidden SUPER_ADMIN;
- one active ARTIST;
- member accounts;
- manual tier access;
- a public Feed;
- administrative interfaces;
- MinIO media storage;
- frontend Axios authentication handling.

The product is functionally mature, but account recovery and authentication
abuse protections are not yet complete.

## Goals

- Add secure password change and recovery.
- Invalidate old sessions after password security events.
- Prevent reset-token reuse.
- Prevent account enumeration.
- Reduce brute-force risk.
- Add configurable email delivery.
- Strengthen upload and authentication configuration.
- Preserve the current product behavior.
- Prepare for production hardening.

## Non-Goals

- Passkeys
- MFA
- OAuth
- Full server-side session store
- Enterprise identity provider
- Malware scanning
- Production infrastructure deployment
- Final branding

## Authentication Architecture

The JWT should continue identifying the account, while current database state
remains authoritative.

Suggested JWT claims:

```text
sub
email, only when currently needed
sessionVersion or tokenVersion
iat
exp

Roles, tier and account status should continue being resolved from the database.

Avoid treating role claims embedded in older tokens as authoritative.

Session Version Strategy

Add a numeric account security version, for example:

User.sessionVersion Int @default(0)

Every issued JWT includes the current version.

During JWT validation:

verify signature;
verify expiration;
load current account;
verify account status;
compare JWT version with current database version;
load current roles and effective tier;
attach the current request user.

Increment the version when:

password change succeeds;
password reset succeeds;
logout from all sessions is requested;
an administrator performs a security-sensitive account reset, if supported.

This invalidates previous tokens without maintaining a full session table.

Current Session During Password Change

Preferred secure behavior:

password change increments sessionVersion;
the current token becomes invalid;
backend may issue a new token explicitly after successful change; or
frontend logs the user out and requests login again.

The simplest and clearest initial product behavior is:

password changed
→ all sessions invalidated
→ frontend logs out
→ user signs in using the new password

Use this unless the existing architecture safely supports issuing a replacement
token.

Password Hashing

Reuse the current hashing algorithm and configuration.

Do not introduce a second password-hashing implementation.

Password hashes must never be:

returned by an API;
included in logs;
stored in audit-event metadata;
included in email.
Password Policy

Use one shared server-side validator.

Suggested baseline:

minimum 8 characters, preserving current compatibility;
maximum reasonable length, such as 128 characters;
reject all-whitespace values;
reject a small list of obvious weak examples if implemented safely;
do not impose arbitrary composition rules that encourage predictable
passwords.

The frontend mirrors the requirements for usability.

The backend remains authoritative.

Password Change Endpoint

Suggested route:

POST /auth/change-password

Body:

{
  "currentPassword": "...",
  "newPassword": "..."
}

The DTO must not accept:

userId;
email;
sessionVersion;
role;
tier.

The account comes from the authenticated request.

Forgot-Password Endpoint

Suggested route:

POST /auth/forgot-password

Body:

{
  "email": "user@example.com"
}

Always return a generic response after syntactic validation, for example:

If an eligible account exists, recovery instructions will be sent.

Avoid visibly different public behavior for:

existing account;
unknown account;
hidden account;
blocked account.

Internal processing may differ.

Password Reset Token Model

Suggested model:

PasswordResetToken

id
userId
tokenHash
expiresAt
usedAt
createdAt
requestIpHash optional

Only the token hash is stored.

The raw token exists only long enough to construct the reset URL and send the
email.

Suggested token generation:

cryptographically secure random bytes;
URL-safe encoding;
SHA-256 or an equivalent one-way hash for database lookup.

Token expiration should be configurable, with a safe default such as 30 or 60
minutes.

Reset Token Lifecycle

On forgot-password:

normalize email;
apply rate limiting;
return generic public response;
when eligible account exists, invalidate excessive outstanding tokens;
generate raw token;
hash token;
store reset record;
send email;
never log raw token.

On reset completion:

hash submitted raw token;
find an unused unexpired reset record;
validate new password;
update password hash;
mark token used;
invalidate every other outstanding token;
increment session version;
create audit event;
commit transactionally.
Reset URL

Use an environment-configured frontend URL, for example:

FRONTEND_URL=http://localhost:5173

Generated path:

/reset-password?token=<raw-token>

Do not generate URLs from untrusted request headers.

Email Delivery

Create a small email abstraction such as:

MailService
sendPasswordReset(...)

SMTP configuration may use:

SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASSWORD
SMTP_FROM
FRONTEND_URL

Do not commit real values.

.env.example should document only names and safe examples.

A local SMTP catcher may be added to Docker Compose when consistent with the
project, but production email-provider selection remains a deployment concern.

Do not print raw reset links to ordinary application logs.

Tests should use a fake mail provider.

Reset Email Content

The email should include:

platform identity placeholder;
reason for the message;
reset link;
expiration;
instruction to ignore the email if not requested.

Avoid including:

password;
role;
tier;
private profile information;
hidden-account information.

Final tone and branding remain for the branding change.

Rate Limiting

Use a maintained NestJS-compatible rate-limiting approach, preferably an
existing project dependency or focused official Nest package.

Apply stricter limits to:

login;
registration;
forgot password;
password reset.

General API rate limiting may be less strict.

Use environment variables for thresholds where practical.

Do not rely exclusively on client IP for account-specific failed-login
protection.

Failed-Login Model

Possible User fields:

failedLoginAttempts Int @default(0)
loginBlockedUntil DateTime?
lastFailedLoginAt DateTime?

Behavior:

normalize email;
load eligible account;
if temporarily blocked, perform timing-safe behavior and return generic
authentication failure or controlled protection response;
compare password;
on failure, increment counter;
when threshold reached, set temporary block time;
on success, reset counter and block timestamp.

Do not expose exact internal thresholds in public responses unless deliberately
chosen.

Unknown-email requests should still perform comparable work where practical to
reduce timing differences.

Account Lock Versus Account Status

Temporary login protection is not the same as administrative account status.

Keep separate:

status = ACTIVE/INACTIVE/...
loginBlockedUntil

Do not permanently deactivate accounts because of password mistakes.

Security Audit Model

Suggested model:

SecurityAuditEvent

id
userId
action
metadataJson optional
createdAt

Suggested actions:

PASSWORD_CHANGED
PASSWORD_RESET_REQUESTED
PASSWORD_RESET_COMPLETED
LOGIN_TEMPORARILY_BLOCKED
LOGOUT_ALL_SESSIONS

Do not store:

passwords;
raw tokens;
complete authorization headers;
SMTP credentials.

Administrative audit viewing may remain out of scope unless already useful.

Frontend Routes

Suggested routes:

/forgot-password
/reset-password
/profile/security

The exact authenticated route may follow existing profile conventions.

Forgot-Password Page

Use the existing authentication-page visual foundation.

Include:

email input;
generic success state;
link back to Login;
loading state;
controlled validation.

Do not display different messages based on account existence.

Reset-Password Page

Include:

new password;
confirmation;
password requirements;
loading state;
invalid or expired token state;
success state leading to Login;
request-new-link action.

Avoid validating account details publicly before submission unless the endpoint
can do so without leaking information.

Change-Password UI

Add an Account Security section containing:

current password;
new password;
confirmation;
policy description;
change action;
logout-all-sessions action.

Clear password fields after success or failure as appropriate.

Frontend Authentication Cleanup

When /auth/me or another authenticated request returns 401 because a token is
invalidated:

clear token;
clear current user;
clear authentication caches;
redirect to Login or public Feed;
optionally show a generic session-ended message.

Do not treat every 403 as expired authentication.

Token Storage Review

Review current token storage.

If JWT is stored in localStorage, document the risk and ensure:

no token is rendered into the DOM;
no sensitive HTML injection exists;
logout clears it;
password events invalidate it server-side.

Moving to HttpOnly cookies is a possible production-hardening improvement, but
should not be attempted partially without CSRF design.

Do not mix localStorage and cookie strategies inconsistently.

Security Headers

Review adding focused middleware such as Helmet when compatible.

At minimum review:

content-type sniffing protection;
frame protection;
referrer policy;
content security policy compatibility.

Do not enable a strict CSP blindly if it breaks MinIO media or Vite without
configuring required sources.

Document decisions.

CORS

Use explicit environment-driven allowed origins.

Suggested:

CORS_ORIGINS=http://localhost:5173

Support a comma-separated list if useful.

Avoid unrestricted production origin with credentials.

Development behavior should remain functional.

Upload Validation

Reuse current media validation and strengthen it.

Validate:

configured maximum size;
detected or signature-confirmed MIME;
allowed MIME list;
image/video type;
storage key safety.

Avoid trusting only:

filename extension;
browser-provided MIME.

If full video signature inspection is not available without a large dependency,
implement the strongest practical validation and document limitations.

Transactions

Password reset completion must be transactional:

password update;
token use;
outstanding-token invalidation;
session-version increment;
audit event.

Do not leave a token reusable if the password update succeeded.

Testing Strategy
Backend

Test:

password change;
wrong current password;
password policy;
forgot-password generic response;
token hashing;
token expiry;
token reuse;
reset success;
outstanding-token invalidation;
session invalidation;
logout all sessions;
failed-login tracking;
temporary login protection;
successful login reset;
rate limiting;
hidden-account privacy;
SMTP failure;
upload validation;
CORS configuration.
Frontend

Test:

forgot-password;
generic success;
reset password;
expired token;
password confirmation;
change password;
logout all;
stale-session cleanup;
error feedback;
mobile layouts.
Integration

Validate using local SMTP test infrastructure when available:

request reset;
inspect captured email safely;
open link;
reset password;
verify old token fails;
verify old password fails;
verify new password works;
verify token reuse fails.
Migration Strategy

Expected migration additions:

password-reset model;
session version;
failed-login fields;
security-audit model when implemented.

Migration rules:

preserve all users;
default session version safely;
default failed attempts to zero;
do not expose or rewrite existing passwords;
do not reset the database;
review SQL;
regenerate Prisma client.
Open Questions

No product question should block implementation.

When selecting technical details:

reuse existing password hashing;
prefer hashed single-use reset tokens;
use database-backed session invalidation;
preserve public-response privacy;
avoid logging secrets;
avoid partial cookie migration;
document thresholds and limitations
