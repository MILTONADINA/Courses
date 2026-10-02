# Feature: User Authentication & Authorization

**Feature ID:** 1  
**Branch pattern:** `feature/1-user-authentication-authorization`  
**Status:** Shipped; specification amendment pending review  
**Created:** 2026-09-28  
**Input:** Allow users to register and log in to the Courses Management System. The system has admin users and student users.

---

## User Stories

Every story is P1: each one must ship for the assignment's authentication and authorization feature.

### US-1.1: Register an account

**As a** new user  
**I want to** register an account  
**So that** I can sign in as a student

**Priority:** P1  
**Independent test:** Submit valid registration information and verify a student account is created  
**Acceptance scenarios:** see ### US-1.1 under Acceptance Criteria

### US-1.2: Log in

**As a** registered user  
**I want to** log in to the system  
**So that** I can access the system

**Priority:** P1  
**Independent test:** Submit valid username and password and successfully authenticate  
**Acceptance scenarios:** see ### US-1.2 under Acceptance Criteria

### US-1.3: Keep my session active

**As a** logged-in user  
**I want** my session to remain active when I refresh the application  
**So that** I do not have to log in again on every page refresh

**Priority:** P1  
**Independent test:** Log in, refresh the application, and verify the user remains authenticated while the session is valid  
**Acceptance scenarios:** see ### US-1.3 under Acceptance Criteria

### US-1.4: Log out

**As a** logged-in user  
**I want to** log out of the system  
**So that** no one else can use my account on this device

**Priority:** P1  
**Independent test:** Log in, click Sign out, and verify the session is invalidated  
**Acceptance scenarios:** see ### US-1.4 under Acceptance Criteria

### US-1.5: Use the system as my user type

**As a** logged-in user  
**I want** the system to know whether I am an admin or student  
**So that** I can use the features available to my user type

**Priority:** P1  
**Independent test:** Log in as an admin and as a student and verify that the system identifies the correct user type  
**Acceptance scenarios:** see ### US-1.5 under Acceptance Criteria

### US-1.6: Restrict users by their user type

**As the** application  
**I want to** limit users to the functionality authorized for their user type  
**So that** students cannot perform admin tasks

**Priority:** P1  
**Independent test:** Log in as an admin and as a student and attempt to access an admin-only endpoint  
**Acceptance scenarios:** see ### US-1.6 under Acceptance Criteria

### US-1.7: Seed the first admin

**As the** system operator  
**I want** the first admin account to be created by a setup step  
**So that** the system has an admin without credentials written into the source code

**Priority:** P1  
**Independent test:** Run the seed with every admin value set and verify an admin exists; run it with one value missing and verify it fails  
**Acceptance scenarios:** see ### US-1.7 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: The system MUST allow users to register an account.
- **FR-002**: Registration MUST create users with the `student` role.
- **FR-003**: The registration form MUST NOT allow a user to select the `admin` role.
- **FR-004**: The system MUST allow registered users to log in using `userName` and `password`.
- **FR-005**: Usernames MUST be stored in lowercase.
- **FR-006**: Usernames MUST be treated as case-insensitive during login.
- **FR-007**: Every authenticated user MUST have a role.
- **FR-008**: The system MUST support an `admin` role.
- **FR-009**: The system MUST support a `student` role.
- **FR-010**: The system MUST identify the role of the authenticated user.
- **FR-011**: The system MUST allow functionality based on the authenticated user's role.
- **FR-012**: An unauthenticated request to protected functionality MUST return `401` with `{ "message": "Unauthorized." }`.
- **FR-013**: An authenticated user without the required role MUST receive `403`.
- **FR-014**: An admin-only authorization failure MUST return `{ "message": "Admin role required." }`.
- **FR-015**: Authentication MUST use JWT plus a server-side session.
- **FR-016**: Sessions MUST remain valid for 24 hours from creation.
- **FR-017**: A valid session MUST survive an application refresh.
- **FR-018**: An expired or revoked session MUST NOT authenticate the user.
- **FR-019**: Logout MUST invalidate the current server-side session.
- **FR-020**: Logout MUST return `200` with `{ "message": "Signed out successfully." }`.
- **FR-021**: The first admin account MUST be created by the database seed process.
- **FR-022**: Admin seed credentials MUST come from environment variables.
- **FR-023**: Admin credentials MUST NOT be hardcoded in source code.
- **FR-024**: The admin seed MUST provide values for every required User field.
- **FR-025**: `userName` and `email` MUST be unique.
- **FR-026**: `universityId` MUST NOT have a format rule.
- **FR-027**: Required registration fields MUST reject empty values.
- **FR-028**: Required registration fields MUST reject whitespace-only values.
- **FR-029**: Password MUST be at least 8 characters.
- **FR-030**: Invalid or duplicate registration information MUST return `400` with a `{ "message": "..." }` response.
- **FR-031**: Invalid or duplicate registration information MUST NOT create a user.
- **FR-032**: Login MUST return `400` with the field's required message when `userName` or `password` is missing or whitespace-only.
- **FR-033**: Invalid login information MUST return `401` with `{ "message": "Invalid username or password." }`.
- **FR-034**: Invalid login information MUST NOT create an authenticated session.
- **FR-035**: Login MUST reuse the user's existing non-expired, non-revoked session instead of creating a new one.
- **FR-036**: Feature 1 MUST provide a reusable admin-only authorization check that returns `403` with `{ "message": "Admin role required." }` for non-admin users.
- **FR-037**: Feature 1 MUST NOT add a product admin-only endpoint.
- **FR-038**: The JWT signing secret MUST come from the `AUTH_SECRET` environment variable, with no hardcoded fallback.

---

## Assumptions

- There are two user types: `admin` and `student`.
- A user must have an account before they can log in.
- Normal registration creates students only.
- The first admin is created through database seeding.
- Authentication establishes who the user is.
- Authorization determines what the authenticated user is allowed to do.
- A valid session lasts 24 hours.
- A valid session survives an application refresh.
- Later features apply the admin-only check to their admin routes.

---

## Edge Cases

- Missing required registration information → `400`.
- Whitespace-only required registration information → `400`.
- Password shorter than 8 characters → `400`.
- Duplicate username → `400`.
- Duplicate email → `400`.
- Registration request includes `"role": "admin"` → the account is created as a student.
- Missing or whitespace-only username or password on login → `400`.
- Incorrect username or password → `401`.
- Expired session → `401`.
- Invalid session → `401`.
- Revoked session → `401`.
- Logout without a valid session → `401`.
- Authenticated student attempts an admin-only endpoint → `403`.
- Missing required admin seed environment variable → seed process fails.
- A request fails without an API message → the page shows `Registration failed.`, `Login failed.`, or `Logout failed.`
- `AUTH_SECRET` is not set → protected requests return `401`.

---

## Success Criteria

- **SC-001**: A user can register a student account with valid information.
- **SC-002**: A registered user can log in using `userName` and `password`.
- **SC-003**: The system correctly identifies whether an authenticated user is an admin or student.
- **SC-004**: A valid session survives an application refresh.
- **SC-005**: An expired, invalid, or revoked session cannot access protected functionality.
- **SC-006**: A logged-in user can log out and have their session invalidated.
- **SC-007**: An authenticated admin can access an admin-only endpoint.
- **SC-008**: An authenticated student cannot access an admin-only endpoint.
- **SC-009**: An unauthenticated user cannot access protected functionality.
- **SC-010**: The first admin is created through the seed process using environment variables.
- **SC-011**: Every acceptance scenario has an automated test before merge.
- **SC-012**: All automated tests pass before merge.
- **SC-013**: Nothing outside this feature is implemented.

---

## Data Ownership & Isolation

Feature 1 establishes the identity and role boundary used by later features.

- Every authenticated request MUST resolve to the authenticated user represented by the valid session.
- Authorization MUST use the authenticated user's role.
- An unauthenticated request MUST NOT be treated as belonging to a user.
- A student MUST NOT receive admin permissions through client-side changes.
- Later features MUST use the authenticated user's identity and role when enforcing access.

---

## Key Entities

### User

A registered user of the Courses Management System.

A User has:

- Identity information
- Login information
- A role of `admin` or `student`

### Session

A server-side record associated with an authenticated user and JWT.

---

## API Requirements

### Registration

**Endpoint:** `POST /course-t6/register`

**Authentication:** Not required

**Purpose:** Create a student account.

**Required fields:**

- `firstName`
- `lastName`
- `email`
- `universityId`
- `userName`
- `password`

A `role` in the request body is ignored; the account is always created as a `student`.

**Success:** `201 Created` with the created user. The password is never returned.

```json
{
  "id": 1,
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "universityId": "123456",
  "userName": "jdoe",
  "role": "student"
}
```

### Registration Errors

All registration validation errors MUST return `400` with:

```json
{
  "message": "Human-readable explanation."
}
```

| Condition | Status | Message |
|---|---:|---|
| Missing first name | `400` | `First name is required.` |
| Missing last name | `400` | `Last name is required.` |
| Missing email | `400` | `Email is required.` |
| Missing university ID | `400` | `University ID is required.` |
| Missing username | `400` | `Username is required.` |
| Missing password | `400` | `Password is required.` |
| Whitespace-only required field | `400` | Field-specific required message |
| Password fewer than 8 characters | `400` | `Password must be at least 8 characters.` |
| Duplicate username | `400` | `Username is already taken.` |
| Duplicate email | `400` | `Email is already registered.` |

### Login

**Endpoint:** `POST /course-t6/login`

**Authentication:** Not required

**Purpose:** Authenticate an existing user.

**Fields:**

- `userName`
- `password`

**Success:** `200 OK`

```json
{
  "userId": 1,
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "userName": "jdoe",
  "role": "student",
  "token": "<jwt>"
}
```

If the user already has a non-expired, non-revoked session, login returns that session's token instead of creating a new session (FR-035).

**Response field names:** the login response uses the User field names from the project data model (`userName`, `firstName`, `lastName`). This intentionally differs from the example payload in `.cursor/rules/auth-patterns.mdc` (`username`, `fName`, `lName`); the frontend stores this response as the `user` object.

### Login Errors

| Condition | Status | Message |
|---|---:|---|
| Missing or whitespace-only username | `400` | `Username is required.` |
| Missing or whitespace-only password | `400` | `Password is required.` |
| Incorrect username or password | `401` | `Invalid username or password.` |

### Logout

**Endpoint:** `POST /course-t6/logout`

**Authentication:** Required

**Purpose:** Invalidate the current session.

**Success:** `200 OK`

```json
{
  "message": "Signed out successfully."
}
```

### Authorization Errors

No valid session:

`401 Unauthorized`

```json
{
  "message": "Unauthorized."
}
```

Authenticated but wrong role:

`403 Forbidden`

Admin-only authorization failure:

```json
{
  "message": "Admin role required."
}
```

### Server Errors

An unexpected server error returns `500` with `{ "message": "Registration failed." }`, `{ "message": "Login failed." }`, or `{ "message": "Logout failed." }`.

### Admin-only Authorization Check

Feature 1 does not add a product admin-only endpoint (FR-037). In this specification, **admin-only endpoint** means any route protected by the admin-only authorization check.

- Feature 1 provides the check; later features (Semester, Course, Faculty, Section, Student Management) apply it to their admin routes.
- Feature 1's US-1.6 scenarios verify the check using a **test-only route** defined inside `backend/tests/authenticate.test.js`. That route exists only in the test file and MUST NOT be added to the application's routes.

---

## Screen Requirements

### Register Page

**Route:** `/register`  
**Route name:** `register`

The Register page MUST:

- Provide fields for `firstName`, `lastName`, `email`, `universityId`, `userName`, and `password`.
- NOT provide a role selector.
- Validate registration information before submitting, using the same rules and messages as the API.
- Do not send a registration request when client validation fails.
- Display validation errors.
- Show `Registration failed.` when a request fails without an API message.
- Show a loading state on the **Register** button while the request runs.
- Submit the registration request.
- Redirect to the **Login page** after successful registration.
- Link to the Login page with **Sign in**.

### Login Page

**Route:** `/login`  
**Route name:** `login`

The Login page MUST:

- Provide `userName` and `password`.
- Allow the user to submit login information.
- Display an error when login fails, or `Login failed.` when the API gives no message.
- Show a loading state on the **Sign in** button while the request runs.
- Store/use the returned session after successful login.
- Redirect the authenticated user to the **Home page**.
- Link to the Register page with **Create an account**.

### Home Page

**Route:** `/`  
**Route name:** `home`

The Home page is the authenticated landing page.

After successful login, the user MUST be redirected to the Home page.

### MenuBar

The MenuBar MUST:

- Be visible to authenticated users.
- Be hidden on the Login and Register pages.
- Display **Sign out** for authenticated users.
- Allow the authenticated user to sign out.
- Display an error when sign out fails, or `Logout failed.` when the API gives no message.
- NOT display **Sign out** when there is no authenticated session.

### Protected Pages

- An unauthenticated user attempting to access a protected page MUST be sent to the Login page.
- An authenticated user without permission to access a protected function MUST be denied access.

---

## Data Model Requirements

### `users` table

| Field | Type/Requirement | Rules |
|---|---|---|
| `id` | Primary key | Auto-generated |
| `firstName` | String | Required |
| `lastName` | String | Required |
| `email` | String | Required, unique |
| `universityId` | String | Required |
| `userName` | String | Required, unique, stored lowercase |
| `password` | String | Required |
| `role` | String | Required, `admin` or `student` |

### `sessions` table

| Field | Type/Requirement | Rules |
|---|---|---|
| `id` | Primary key | Auto-generated |
| `token` | String | Required |
| `email` | String | Required; the email of the session's user |
| `expirationDate` | Date | Required |
| `userId` | Foreign key | Required, references `users.id` |

A session MUST expire 24 hours after creation. Session fields follow `.cursor/rules/auth-patterns.mdc`, including reuse of a non-expired session on login (FR-035). Logout clears the session's `token` so it can no longer authenticate (FR-019).

### Associations

- A user has many sessions.
- A session belongs to one user through `userId`.
- Both models and their associations MUST be registered in `backend/app/models/index.js`.

### Admin Seed Requirements

The first admin account MUST be created through the database seed process.

The seed MUST be executable using:

```text
npm run seed
```

The seed MUST require these environment variables:

```text
ADMIN_FIRST_NAME=
ADMIN_LAST_NAME=
ADMIN_EMAIL=
ADMIN_UNIVERSITY_ID=
ADMIN_USERNAME=
ADMIN_PASSWORD=
```

These variables MUST be documented in `backend/.env.example` with blank values.

The same variables MUST be present in `backend/.env.test.example` with non-secret test values. CI creates `backend/.env.test` by copying `backend/.env.test.example` (`.github/workflows/test.yml`), so tests that require the seeded admin depend on these values being in the example file. Developers' local `backend/.env.test` MUST contain them too.

The seed process MUST fail when any required `ADMIN_*` variable is missing. An empty value counts as missing, because `backend/.env.example` ships the variables blank.

The admin username and password MUST NOT be hardcoded in source code.

The seeded account MUST have:

```text
role = admin
```

---

## Acceptance Criteria (Gherkin)

### US-1.1 — Register an account

#### Scenario: User registers successfully

* **Given** I am not registered
* **When** I provide a valid first name, last name, email, university ID, username, and password
* **And** I submit the registration form
* **Then** a student account is created
* **And** the user's role is `student`
* **And** I am sent to the Login page

#### Scenario: Registration ignores a supplied admin role

* **Given** I am not registered
* **When** I submit valid registration information with `"role": "admin"`
* **Then** the API returns `201`
* **And** the created account's role is `student`

#### Scenario: User registers without a required field

* **Given** I am not registered
* **When** I send `POST /course-t6/register` with a required field empty and all other fields valid
* **Then** the API returns `400`
* **And** the response contains the required-field message
* **And** no user account is created


#### Scenario: User submits whitespace-only required information

* **Given** I am not registered
* **When** I send `POST /course-t6/register` with only whitespace for a required field and all other fields valid
* **Then** the API returns `400`
* **And** the response contains the required-field message
* **And** no user account is created


#### Scenario: User submits a password shorter than 8 characters

* **Given** I am not registered
* **When** I send `POST /course-t6/register` with a password shorter than 8 characters and all other fields valid
* **Then** the API returns `400`
* **And** the response is `{ "message": "Password must be at least 8 characters." }`
* **And** no user account is created


#### Scenario: Register form blocks submit when a required field is empty

* **Given** I am on the registration page with all other fields valid
* **When** I leave a required field empty
* **And** I submit the registration form
* **Then** I see that field's required message
* **And** no registration request is sent

#### Scenario: Register form blocks submit when a required field is only whitespace

* **Given** I am on the registration page with all other fields valid
* **When** I enter only whitespace for a required field
* **And** I submit the registration form
* **Then** I see that field's required message
* **And** no registration request is sent

#### Scenario: Register form blocks submit when the password is shorter than 8 characters

* **Given** I am on the registration page with all other fields valid
* **When** I enter a password shorter than 8 characters
* **And** I submit the registration form
* **Then** I see `Password must be at least 8 characters.`
* **And** no registration request is sent

#### Scenario: User registers with an existing username

* **Given** a user with username `jdoe` already exists
* **When** I submit registration using `jdoe`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Username is already taken." }`
* **And** no new user account is created

#### Scenario: User registers with an existing email

* **Given** a user with email `jane@example.com` already exists
* **When** I submit registration using `jane@example.com`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Email is already registered." }`
* **And** no new user account is created

#### Scenario: Register page shows the API error when registration fails

* **Given** I am on the registration page
* **And** the registration request will fail with an error message
* **When** I submit valid registration information
* **Then** the page shows the error message returned by the API
* **And** I stay on the registration page

#### Scenario: Register button shows a loading state while registering

* **Given** I am on the registration page
* **And** the registration request will not finish right away
* **When** I submit valid registration information
* **Then** the **Register** button shows a loading state

#### Scenario: Register page shows a fallback error when the API gives no message

* **Given** I am on the registration page
* **And** the registration request will fail without an error message
* **When** I submit valid registration information
* **Then** the page shows `Registration failed.`

---

### US-1.2 — Log in

#### Scenario: User logs in successfully

* **Given** I have a registered user
* **When** I submit the correct username and password
* **Then** the API returns `200`
* **And** I am authenticated
* **And** the system identifies my user type
* **And** I receive a valid session token
* **And** I am redirected to the Home page

#### Scenario: User cannot log in with incorrect information

* **Given** I have a registered user
* **When** I submit an incorrect username or password
* **Then** the API returns `401`
* **And** the response is `{ "message": "Invalid username or password." }`
* **And** I am not authenticated

#### Scenario: User logs in using a different username capitalization

* **Given** a user exists with username `jdoe`
* **When** I log in using `JDoe`
* **And** I provide the correct password
* **Then** I am authenticated as that user

#### Scenario: Login reuses an existing valid session

* **Given** I have logged in and my session has not expired or been revoked
* **When** I log in again with the correct username and password
* **Then** the API returns `200`
* **And** the response contains the same session token as my existing session
* **And** no additional session is created for me

#### Scenario: User submits login without a required field

* **Given** I have a registered user
* **When** I submit a login request with `userName` or `password` missing or whitespace-only
* **Then** the API returns `400`
* **And** the response is the missing field's required message (`Username is required.` or `Password is required.`)
* **And** I am not authenticated

#### Scenario: Sign in button shows a loading state while signing in

* **Given** I am on the login page
* **And** the login request will not finish right away
* **When** I submit my username and password
* **Then** the **Sign in** button shows a loading state

#### Scenario: Login page shows a fallback error when the API gives no message

* **Given** I am on the login page
* **And** the login request will fail without an error message
* **When** I submit my username and password
* **Then** the page shows `Login failed.`

---

### US-1.3 — Keep my session active

#### Scenario: Session survives a page refresh

* **Given** I am authenticated with a valid session
* **When** I refresh the application
* **Then** I remain authenticated
* **And** I can access protected functionality

#### Scenario: Expired session is rejected

* **Given** my session has expired
* **When** I send a request to a protected endpoint
* **Then** the API returns `401`
* **And** I am no longer authenticated
* **And** I am sent to the Login page

#### Scenario: Invalid session is rejected

* **Given** I have an invalid session token
* **When** I send a request to a protected endpoint
* **Then** the API returns `401`
* **And** I am no longer authenticated
* **And** I am sent to the Login page

---

### US-1.4 — Log out

#### Scenario: User logs out successfully

* **Given** I am authenticated
* **And** I am on a protected page
* **When** I click **Sign out** in the MenuBar
* **Then** the API returns `200`
* **And** the response is `{ "message": "Signed out successfully." }`
* **And** the server invalidates my current session
* **And** I am no longer authenticated
* **And** I am sent to the Login page

#### Scenario: Request using an old token after logout is rejected

* **Given** I have logged in and received a valid session token
* **And** I have logged out
* **When** I send a protected request using my old token
* **Then** the API returns `401`
* **And** the old token cannot be used to access the protected endpoint

#### Scenario: User cannot log out without a session

* **Given** I am not authenticated
* **When** I send `POST /course-t6/logout`
* **Then** the API returns `401`
* **And** the response is `{ "message": "Unauthorized." }`

#### Scenario: Sign out shows an error when it fails

* **Given** I am signed in
* **And** the sign-out request will fail with an error message
* **When** I click **Sign out** in the MenuBar
* **Then** the MenuBar shows the error message returned by the API
* **And** I remain signed in

#### Scenario: Sign out shows a fallback error when the API gives no message

* **Given** I am signed in
* **And** the sign-out request will fail without an error message
* **When** I click **Sign out** in the MenuBar
* **Then** the MenuBar shows `Logout failed.`

---

### US-1.5 — Use the system as my user type

#### Scenario: Admin logs in

* **Given** the seeded admin account exists
* **When** I log in using the admin's correct username and password
* **Then** the system identifies my role as `admin`
* **And** I am redirected to the Home page

#### Scenario: Student logs in

* **Given** I have a student account
* **When** I log in using the student's correct username and password
* **Then** the system identifies my role as `student`
* **And** I am redirected to the Home page

---

### US-1.6 — Restrict users by their user type

#### Scenario: Admin accesses an admin-only endpoint

* **Given** I am signed in as an admin
* **When** I send a request to an admin-only endpoint using my token
* **Then** the request succeeds

#### Scenario: Student cannot access an admin-only endpoint

* **Given** I am signed in as a student
* **When** I send a request to an admin-only endpoint using my token
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`

#### Scenario: Unauthenticated user cannot access a protected endpoint

* **Given** I am not logged in
* **When** I send a request to a protected endpoint
* **Then** the API returns `401`
* **And** I am sent to the Login page

#### Scenario: Protected request is rejected when the auth secret is missing

* **Given** `AUTH_SECRET` is not set
* **And** I have a session token
* **When** I send a request to a protected endpoint
* **Then** the API returns `401`

---

### US-1.7 — Seed the first admin

#### Scenario: Seed creates the first admin

* **Given** all required `ADMIN_*` environment variables are present
* **When** I run `npm run seed`
* **Then** an admin user is created
* **And** the user's role is `admin`
* **And** the admin has values for all required User fields

#### Scenario: Seed fails when an admin environment variable is missing

* **Given** one or more required `ADMIN_*` environment variables are missing
* **When** I run `npm run seed`
* **Then** the seed process fails
* **And** an admin user is not created using default or hardcoded credentials

---

## Test Coverage Map

Each scenario MUST map to at least one automated test.

| Story | Scenario | Test File | Test Name |
|---|---|---|---|
| US-1.1 | User registers successfully | `backend/tests/auth.test.js`, `frontend/tests/Register.test.js` | `User registers successfully` |
| US-1.1 | Registration ignores a supplied admin role | `backend/tests/auth.test.js` | `Registration ignores a supplied admin role` |
| US-1.1 | User registers without a required field | `backend/tests/auth.test.js` | `User registers without a required field` |
| US-1.1 | User submits whitespace-only required information | `backend/tests/auth.test.js` | `User submits whitespace-only required information` |
| US-1.1 | User submits a password shorter than 8 characters | `backend/tests/auth.test.js` | `User submits a password shorter than 8 characters` |
| US-1.1 | Register form blocks submit when a required field is empty | `frontend/tests/Register.test.js` | `Register form blocks submit when a required field is empty` |
| US-1.1 | Register form blocks submit when a required field is only whitespace | `frontend/tests/Register.test.js` | `Register form blocks submit when a required field is only whitespace` |
| US-1.1 | Register form blocks submit when the password is shorter than 8 characters | `frontend/tests/Register.test.js` | `Register form blocks submit when the password is shorter than 8 characters` |
| US-1.1 | User registers with an existing username | `backend/tests/auth.test.js` | `User registers with an existing username` |
| US-1.1 | User registers with an existing email | `backend/tests/auth.test.js` | `User registers with an existing email` |
| US-1.1 | Register page shows the API error when registration fails | `frontend/tests/Register.test.js` | `Register page shows the API error when registration fails` |
| US-1.1 | Register button shows a loading state while registering | `frontend/tests/Register.test.js` | `Register button shows a loading state while registering` |
| US-1.1 | Register page shows a fallback error when the API gives no message | `frontend/tests/Register.test.js` | `Register page shows a fallback error when the API gives no message` |
| US-1.2 | User logs in successfully | `backend/tests/auth.test.js`, `frontend/tests/Login.test.js` | `User logs in successfully` |
| US-1.2 | User cannot log in with incorrect information | `backend/tests/auth.test.js`, `frontend/tests/Login.test.js` | `User cannot log in with incorrect information` |
| US-1.2 | User logs in using a different username capitalization | `backend/tests/auth.test.js` | `User logs in using a different username capitalization` |
| US-1.2 | Login reuses an existing valid session | `backend/tests/auth.test.js` | `Login reuses an existing valid session` |
| US-1.2 | User submits login without a required field | `backend/tests/auth.test.js` | `User submits login without a required field` |
| US-1.2 | Sign in button shows a loading state while signing in | `frontend/tests/Login.test.js` | `Sign in button shows a loading state while signing in` |
| US-1.2 | Login page shows a fallback error when the API gives no message | `frontend/tests/Login.test.js` | `Login page shows a fallback error when the API gives no message` |
| US-1.3 | Session survives a page refresh | `backend/tests/authenticate.test.js`, `frontend/tests/router.test.js` | `Session survives a page refresh` |
| US-1.3 | Expired session is rejected | `backend/tests/authenticate.test.js`, `frontend/tests/router.test.js` | `Expired session is rejected` |
| US-1.3 | Invalid session is rejected | `backend/tests/authenticate.test.js`, `frontend/tests/router.test.js` | `Invalid session is rejected` |
| US-1.4 | User logs out successfully | `backend/tests/auth.test.js`, `frontend/tests/MenuBar.test.js` | `User logs out successfully` |
| US-1.4 | Request using an old token after logout is rejected | `backend/tests/authenticate.test.js` | `Request using an old token after logout is rejected` |
| US-1.4 | User cannot log out without a session | `backend/tests/auth.test.js` | `User cannot log out without a session` |
| US-1.4 | Sign out shows an error when it fails | `frontend/tests/MenuBar.test.js` | `Sign out shows an error when it fails` |
| US-1.4 | Sign out shows a fallback error when the API gives no message | `frontend/tests/MenuBar.test.js` | `Sign out shows a fallback error when the API gives no message` |
| US-1.5 | Admin logs in | `backend/tests/auth.test.js`, `frontend/tests/Login.test.js` | `Admin logs in` |
| US-1.5 | Student logs in | `backend/tests/auth.test.js`, `frontend/tests/Login.test.js` | `Student logs in` |
| US-1.6 | Admin accesses an admin-only endpoint | `backend/tests/authenticate.test.js` | `Admin accesses an admin-only endpoint` |
| US-1.6 | Student cannot access an admin-only endpoint | `backend/tests/authenticate.test.js` | `Student cannot access an admin-only endpoint` |
| US-1.6 | Unauthenticated user cannot access a protected endpoint | `backend/tests/authenticate.test.js`, `frontend/tests/router.test.js` | `Unauthenticated user cannot access a protected endpoint` |
| US-1.6 | Protected request is rejected when the auth secret is missing | `backend/tests/authenticate.test.js` | `Protected request is rejected when the auth secret is missing` |
| US-1.7 | Seed creates the first admin | `backend/tests/auth.test.js` | `Seed creates the first admin` |
| US-1.7 | Seed fails when an admin environment variable is missing | `backend/tests/auth.test.js` | `Seed fails when an admin environment variable is missing` |

---

## Agent Implementation Request

Application code for this feature is written by hand. AI may be used only to build the automated tests, as required by the course slides.

### Handwritten application code

The following checklist is for the person coding this feature:

```text
Write Feature 1 by hand from @features/feature-1-user-authentication-authorization.md on branch feature/1-user-authentication-authorization.

Only implement what is defined in this specification.

Follow the structure, architecture, API conventions, coding conventions, and best practices already established in the project.

Follow the layer order in @features/framework.md (models → routes → backend tests → frontend services → views → frontend tests → router).

Authentication routes must be:
POST /course-t6/register
POST /course-t6/login
POST /course-t6/logout

Registration must create student users only, must ignore a role in the request body, and must not sign the user in. After registering, send the user to the Login page.

Login must return 400 with the field's required message when userName or password is missing, and 401 for incorrect credentials.

The first admin must be created through the database seed process (npm run seed, script in backend/app/scripts/).

Admin seed credentials must come from environment variables and must never be hardcoded. An empty value counts as missing.

Use the exact environment variable names and error messages defined in this specification.

Map every acceptance scenario in the Test Coverage Map to at least one automated test.

Use the exact test file paths listed in the Test Coverage Map.

Test the admin-only authorization check with a test-only route defined inside backend/tests/authenticate.test.js. Do not add a product admin-only route.

Put the ADMIN_* variables with non-secret test values in backend/.env.test.example so CI can run the seed tests.

Do not add features, behavior, API rules, database rules, validation rules, or UI behavior that are not defined in this specification.

Before finishing:
1. Verify the required ADMIN_* variables are present for seed and test environments.
2. Run the database seed process.
3. Run npm test from the project root (runs backend and frontend tests).
4. Confirm every acceptance scenario is covered by an automated test.
5. Confirm all tests pass.
6. Update the reference documentation listed below to match the shipped code.
7. Complete the Definition of Done and the merge checklist in @features/framework.md.

Do not mark the feature complete if any requirement or acceptance scenario remains unimplemented or untested.
```

### Automated tests (AI allowed)

AI may write or update only the automated tests. It MUST NOT write or change application code in `backend/app` or `frontend/src`.

- Use the exact scenarios, test file paths, and test names in the Test Coverage Map.
- API validation scenarios send requests directly to the API; form validation scenarios show the field error and send no registration request.
- Report any application-code failure for the developer to fix by hand; do not change the specification or weaken a test to make it pass.

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`, `features/reference/README.md` (provenance)

---

## Definition of Done

- [x] Users can register.
- [x] Registration creates students only and ignores a role in the request body.
- [x] Registration has no role selector.
- [x] Successful registration sends the user to the Login page without signing them in.
- [x] Users can log in with `userName` and `password`.
- [x] Login with a missing or whitespace-only `userName` or `password` returns `400` with the required message.
- [x] The JWT secret comes from `AUTH_SECRET` with no hardcoded fallback.
- [x] Usernames are stored lowercase.
- [x] Username login is case-insensitive.
- [x] Login reuses an existing non-expired, non-revoked session.
- [x] Sessions use JWT plus a server-side session.
- [x] Sessions last 24 hours.
- [x] Sessions survive a page refresh while valid.
- [x] Expired, invalid, and revoked sessions return `401`.
- [x] Logout invalidates the session and returns `200` with the required message.
- [x] Logout without a valid session returns `401`.
- [x] The Sign out button is available in the MenuBar and shows an error if sign out fails.
- [x] Admin and student roles exist.
- [x] The first admin is created through `npm run seed`.
- [x] Admin credentials come from environment variables.
- [x] Required admin seed fields are provided through environment variables.
- [x] Missing or empty admin seed variables cause the seed to fail.
- [x] `backend/.env.example` contains the required `ADMIN_*` variables with blank values.
- [x] `backend/.env.test.example` contains the required `ADMIN_*` variables with non-secret test values.
- [x] `userName` and `email` are unique.
- [x] `userName` is stored lowercase.
- [x] `universityId` has no format rule.
- [x] Registration validation rules and error responses are implemented.
- [x] Login failure returns `401` with the required message.
- [x] The admin-only authorization check exists and no product admin-only route was added in this feature.
- [x] Admin users can access admin-only endpoints.
- [x] Students receive `403` when accessing admin-only endpoints.
- [x] Unauthenticated users receive `401` when accessing protected endpoints.
- [x] Unauthenticated users are sent to the Login page.
- [x] Successful login redirects to the Home page.
- [x] The Register and Sign in buttons show a loading state while their request runs.
- [x] Backend and frontend are implemented per this spec (**FR-001**–**FR-038** satisfied).
- [x] **Success Criteria (SC-001**–**SC-013)** are met for this amendment.
- [x] Test Coverage Map is complete.
- [x] Every acceptance scenario has an automated test with the file path and name in the amended Test Coverage Map.
- [x] All tests pass (`npm test`) after the registration tests are aligned with this amendment.
- [x] Existing registration tests use the clarified API and form scenario names; client-invalid forms send no request (owner: Milton).
- [x] Agility is synchronized with the amended registration acceptance criteria (owner: Milton; synchronized after review).
- [x] `features/reference/api.md` is updated.
- [x] `features/reference/data-model.md` is updated.
- [x] `features/reference/behavior.md` is updated.
- [x] `features/reference/README.md` lists Feature 1 in its provenance table.
- [x] `features/README.md` links Feature 1 to `feature-1-user-authentication-authorization.md`.
- [x] Nothing outside this specification is implemented.

---

**Amendment verification:** All 36 acceptance scenarios match their mapped test names and paths. Root `npm test` passes with 27 backend and 21 frontend tests using native MySQL `course-t6-test`, including the admin seed scenarios. Agility criteria and references are synchronized; application code and story statuses are unchanged.

## Out of Scope

- Course creation, editing, and deletion → Feature 3
- Students enrolling in sections → [Feature 6](feature-6-enrollment-management.md)
- Section days and times → Feature 5
- Admin adding students → Feature 9
- Adding faculty → [Feature 4](feature-4-faculty-management.md)
- Password reset (`POST /reset-password`)
