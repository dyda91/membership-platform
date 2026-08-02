# account-security-and-recovery Specification

## Purpose
TBD - created by archiving change account-security-and-recovery. Update Purpose after archive.
## Requirements
### Requirement: Authenticated password change

The system SHALL allow authenticated users to change their own password
securely.

#### Scenario: User provides correct current password

- GIVEN an active authenticated account
- AND the current password is correct
- AND the new password satisfies the password policy
- WHEN the user submits a password change
- THEN the system SHALL replace the stored password hash
- AND SHALL invalidate previously issued authenticated sessions
- AND SHALL record a security audit event

#### Scenario: Current password is incorrect

- GIVEN an authenticated account
- WHEN the user provides an incorrect current password
- THEN the system SHALL reject the operation
- AND the stored password SHALL remain unchanged

#### Scenario: New password is invalid

- GIVEN an authenticated account
- WHEN the new password does not satisfy the password policy
- THEN the system SHALL reject the operation
- AND SHALL explain the applicable requirements safely

#### Scenario: Subscriber attempts to change another account password

- GIVEN the authenticated user is SUBSCRIBER
- WHEN the user attempts to change another account's password
- THEN the system SHALL deny the operation

### Requirement: Password policy

The system SHALL apply one consistent password policy to registration, password
change and password reset.

#### Scenario: Password satisfies policy

- GIVEN a password meets the configured requirements
- WHEN it is submitted through an account-security flow
- THEN the system SHALL accept it for further processing

#### Scenario: Password is too short

- GIVEN a password is shorter than the configured minimum
- WHEN it is submitted
- THEN the system SHALL reject it

#### Scenario: Password equals a prohibited value

- GIVEN the implementation maintains a small prohibited-password check
- WHEN an obviously weak prohibited password is submitted
- THEN the system SHALL reject it

#### Scenario: Password policy is displayed

- GIVEN a password form is rendered
- WHEN the user reviews the form
- THEN the applicable requirements SHALL be presented consistently

### Requirement: Forgot-password request

The system SHALL allow a visitor to request a password-reset flow without
revealing whether an account exists.

#### Scenario: Existing email is submitted

- GIVEN an active eligible account exists for the submitted email
- WHEN a password-reset request is submitted
- THEN the system SHALL create a secure reset token
- AND SHALL attempt to deliver reset instructions
- AND SHALL return a generic success response

#### Scenario: Unknown email is submitted

- GIVEN no account exists for the submitted email
- WHEN a password-reset request is submitted
- THEN the system SHALL return the same generic success response
- AND SHALL not reveal account existence

#### Scenario: Hidden system-account email is submitted

- GIVEN the submitted email belongs to a hidden or system-managed account
- WHEN the public reset request is processed
- THEN the response SHALL remain generic
- AND the account SHALL not be exposed

#### Scenario: Repeated reset requests are submitted

- GIVEN repeated requests are made for one email or network source
- WHEN configured limits are exceeded
- THEN the system SHALL throttle the requests safely

### Requirement: Secure password-reset token

The system SHALL generate cryptographically secure, expiring and single-use
password-reset tokens.

#### Scenario: Reset token is created

- GIVEN an eligible account requests password recovery
- WHEN the reset record is created
- THEN the raw token SHALL be generated using a cryptographically secure source
- AND only a hash of the token SHALL be persisted

#### Scenario: Reset token is valid

- GIVEN a reset token exists, is unexpired and unused
- WHEN it is presented correctly
- THEN the system SHALL allow the password-reset form to proceed

#### Scenario: Reset token has expired

- GIVEN the reset token expiration time has passed
- WHEN the token is presented
- THEN the system SHALL reject it

#### Scenario: Reset token was already used

- GIVEN a reset token was consumed previously
- WHEN it is submitted again
- THEN the system SHALL reject it

#### Scenario: Reset token does not match

- GIVEN an invalid raw token is submitted
- WHEN the system compares its hash
- THEN the system SHALL reject it without exposing token details

### Requirement: Password reset completion

The system SHALL allow an eligible account to set a new password using a valid
reset token.

#### Scenario: Valid reset is completed

- GIVEN a valid unexpired unused reset token
- AND a new password satisfying the policy
- WHEN the reset is submitted
- THEN the system SHALL update the password hash
- AND mark the reset token as used
- AND invalidate previous authenticated sessions
- AND record a security audit event

#### Scenario: Reset password is invalid

- GIVEN a valid reset token
- WHEN the new password violates the policy
- THEN the reset SHALL be rejected
- AND the token SHALL remain available until expiration unless security rules
  require otherwise

#### Scenario: Multiple valid reset tokens exist

- GIVEN multiple unused reset records exist for one account
- WHEN one password reset succeeds
- THEN all other outstanding reset tokens for the account SHALL become invalid

### Requirement: Password-reset email delivery

The system SHALL deliver password-reset instructions through configurable email
infrastructure.

#### Scenario: SMTP is configured

- GIVEN valid SMTP configuration exists
- WHEN a reset email is sent
- THEN the system SHALL deliver a reset link using the configured frontend base
  URL

#### Scenario: SMTP delivery fails

- GIVEN a reset record was created
- WHEN email delivery fails
- THEN the system SHALL record a controlled delivery failure
- AND SHALL not expose the raw token in logs or API responses

#### Scenario: SMTP is not configured

- GIVEN required SMTP configuration is absent
- WHEN the application starts or a reset is requested
- THEN the system SHALL report a controlled configuration state
- AND SHALL not silently use hardcoded credentials

#### Scenario: Email content is generated

- GIVEN a reset email is prepared
- WHEN the content is rendered
- THEN it SHALL include an expiration warning
- AND SHALL not include passwords or private account metadata

### Requirement: Session invalidation

The system SHALL invalidate previously issued authenticated sessions after
security-sensitive password events.

#### Scenario: Password is changed

- GIVEN the account changes its password successfully
- WHEN an older token is used afterward
- THEN the backend SHALL reject the session

#### Scenario: Password is reset

- GIVEN the account resets its password successfully
- WHEN a token issued before the reset is used
- THEN the backend SHALL reject the session

#### Scenario: Current session is retained intentionally

- GIVEN the selected implementation retains the session that performed an
  authenticated password change
- WHEN the password change succeeds
- THEN the behavior SHALL be explicit and tested
- AND all other older sessions SHALL be invalidated

### Requirement: Logout from all sessions

The system SHALL allow an authenticated user to invalidate all active
authentication tokens.

#### Scenario: User logs out from all sessions

- GIVEN an active authenticated account
- WHEN the user requests logout from all sessions
- THEN the system SHALL invalidate existing tokens for the account
- AND SHALL clear the current frontend session

#### Scenario: Old token is used afterward

- GIVEN logout from all sessions succeeded
- WHEN any previously issued token is used
- THEN the backend SHALL reject it

### Requirement: Database-backed token validity

The system SHALL verify token validity against current account security state.

#### Scenario: Token version matches

- GIVEN the token contains the expected security or session version
- AND the account remains active
- WHEN the token is validated
- THEN the request MAY continue according to role and authorization rules

#### Scenario: Token version is stale

- GIVEN the account security version changed after token issuance
- WHEN the older token is validated
- THEN the system SHALL reject it

#### Scenario: Account is blocked

- GIVEN an otherwise valid token belongs to a blocked or inactive account
- WHEN an authenticated endpoint is requested
- THEN the system SHALL deny access

### Requirement: Login rate limiting

The system SHALL limit repeated authentication attempts.

#### Scenario: Normal login attempts

- GIVEN requests remain within configured limits
- WHEN valid or invalid credentials are submitted
- THEN login processing SHALL continue normally

#### Scenario: Too many requests from one source

- GIVEN the configured request threshold is exceeded
- WHEN another login request is made
- THEN the system SHALL reject or delay the request according to the selected
  rate-limit strategy

#### Scenario: Rate-limit response is returned

- GIVEN login is rate-limited
- WHEN the response is generated
- THEN it SHALL be controlled
- AND SHALL not expose internal counters or sensitive account information

### Requirement: Failed-login protection

The system SHALL track repeated failed login attempts for eligible accounts.

#### Scenario: Login fails

- GIVEN an account exists for the normalized email
- WHEN the submitted password is incorrect
- THEN the failed-attempt state SHALL be updated safely

#### Scenario: Failure threshold is reached

- GIVEN repeated failed attempts reach the configured threshold
- WHEN another authentication attempt is made
- THEN the account SHALL be temporarily protected from login
- AND the response SHALL not reveal excessive internal details

#### Scenario: Protection period ends

- GIVEN the temporary protection interval has passed
- WHEN valid credentials are provided
- THEN login SHALL be allowed
- AND failed-attempt state SHALL be cleared

#### Scenario: Login succeeds before threshold

- GIVEN failed attempts exist below the threshold
- WHEN the correct password is submitted
- THEN login SHALL succeed
- AND failed-attempt state SHALL be reset

### Requirement: Account enumeration resistance

The system SHALL avoid disclosing whether an account exists through public
authentication recovery responses.

#### Scenario: Forgot-password responses are compared

- GIVEN one request uses an existing email
- AND another uses an unknown email
- WHEN responses are compared
- THEN both SHALL use equivalent public wording and status behavior where
  practical

#### Scenario: Login email is unknown

- GIVEN no account exists for the submitted email
- WHEN login fails
- THEN the response SHALL not explicitly state that the account does not exist

#### Scenario: Hidden account is targeted

- GIVEN a hidden account exists
- WHEN public recovery or login errors occur
- THEN the response SHALL not reveal its hidden status

### Requirement: Authentication security audit events

The system SHALL record important authentication security events.

#### Scenario: Password changes

- GIVEN a password change succeeds
- WHEN the security event is recorded
- THEN the event SHALL identify the account, action and timestamp
- AND SHALL not store the password

#### Scenario: Password reset succeeds

- GIVEN password reset succeeds
- WHEN the event is recorded
- THEN the action and account SHALL be attributable

#### Scenario: Temporary login protection activates

- GIVEN repeated login failures trigger temporary protection
- WHEN the event is recorded
- THEN the event SHALL identify the affected account safely

#### Scenario: Sensitive audit data is requested

- GIVEN an ordinary SUBSCRIBER requests internal security events
- WHEN authorization is evaluated
- THEN internal audit data SHALL not be exposed

### Requirement: Frontend password recovery

The system SHALL provide usable forgot-password and reset-password interfaces.

#### Scenario: Visitor opens forgot-password

- GIVEN the viewer is not authenticated
- WHEN the forgot-password route is opened
- THEN an email form SHALL be displayed

#### Scenario: Forgot-password request succeeds publicly

- GIVEN any syntactically valid email is submitted
- WHEN the backend accepts the request
- THEN the frontend SHALL display the generic recovery message

#### Scenario: Visitor opens a valid reset link

- GIVEN the reset link contains a valid token
- WHEN the reset page opens
- THEN the new-password and confirmation fields SHALL be available

#### Scenario: Reset link is invalid or expired

- GIVEN the reset token cannot be used
- WHEN the reset page is submitted or validated
- THEN the frontend SHALL display a controlled invalid-or-expired state
- AND provide a way to request a new reset

### Requirement: Frontend change-password interface

The system SHALL provide an authenticated password-change interface.

#### Scenario: User opens account security

- GIVEN the user is authenticated
- WHEN the account-security page or section is opened
- THEN current password, new password and confirmation controls SHALL be
  available

#### Scenario: Password change succeeds

- GIVEN valid password-change information
- WHEN the backend confirms success
- THEN the frontend SHALL explain the resulting session behavior
- AND clear sensitive form values

#### Scenario: Password change fails

- GIVEN current password or new password validation fails
- WHEN the error is returned
- THEN the frontend SHALL display a controlled message
- AND SHALL not retain plaintext passwords longer than necessary

### Requirement: Authentication token frontend handling

The system SHALL handle expired or invalidated authentication tokens
consistently.

#### Scenario: API rejects a stale token

- GIVEN a token was invalidated after a password event
- WHEN an authenticated request returns an authentication failure
- THEN the frontend SHALL clear local authenticated state
- AND redirect to an appropriate public or login state

#### Scenario: Ordinary forbidden response occurs

- GIVEN the account remains authenticated but lacks permission
- WHEN the API returns a normal forbidden response
- THEN the frontend SHALL not automatically treat every forbidden response as
  logout

#### Scenario: Logout occurs

- GIVEN a local authenticated session exists
- WHEN logout completes
- THEN token and user-derived caches SHALL be cleared

### Requirement: Upload security validation

The system SHALL strengthen server-side validation for uploaded media and profile
images.

#### Scenario: Allowed image is uploaded

- GIVEN a supported image has a valid MIME type, signature and size
- WHEN it is uploaded
- THEN the existing storage flow MAY continue

#### Scenario: Extension and file content disagree

- GIVEN a file extension claims an allowed image or video
- AND its detected signature does not match
- WHEN upload validation runs
- THEN the upload SHALL be rejected

#### Scenario: File exceeds configured size

- GIVEN an uploaded file exceeds the applicable size limit
- WHEN upload validation runs
- THEN the system SHALL reject it before normal persistence completes

#### Scenario: Unsupported media is uploaded

- GIVEN a file type is not allowed
- WHEN upload validation runs
- THEN the system SHALL reject it with a controlled response

### Requirement: CORS and security configuration

The system SHALL use explicit environment-driven security configuration.

#### Scenario: Development origin is configured

- GIVEN an allowed development frontend origin is configured
- WHEN requests are made from that origin
- THEN CORS SHALL permit the expected application requests

#### Scenario: Unknown origin requests the API

- GIVEN a browser request originates from an unapproved origin
- WHEN CORS is evaluated
- THEN the origin SHALL not receive ordinary cross-origin access

#### Scenario: Production configuration is absent

- GIVEN required production security configuration is missing
- WHEN production startup is attempted
- THEN the application SHALL report a controlled configuration error or warning
  according to the selected strictness

### Requirement: Existing business behavior preservation

The system SHALL preserve current roles, tiers, Feed and administration behavior
during security improvements.

#### Scenario: Artist uses administration

- GIVEN an authenticated ARTIST with a valid session
- WHEN administration is used
- THEN existing permitted capabilities SHALL remain available

#### Scenario: Subscriber views content

- GIVEN an authenticated SUBSCRIBER with active tier access
- WHEN the Feed is requested
- THEN current tier and validity rules SHALL remain unchanged

#### Scenario: Hidden super administrator exists

- GIVEN the hidden SUPER_ADMIN account exists
- WHEN public recovery and ordinary user interfaces are used
- THEN the account SHALL remain hidden

#### Scenario: Password event invalidates token

- GIVEN a valid role or tier existed in an old token
- WHEN the password security version changes
- THEN the old token SHALL not continue granting access

