# Feature: User Authentication & Authorization

**Feature ID:** 1  
**Branch pattern:** `feature/1-user-authentication`  
**Status:** Ready  
**Created:** 2026-09-28  
**Input:** Allow users to register and log in to the Courses Management System. The system has admin users and student users.

---

## User Stories

### US-1.1: Register an account

**As a** new user  
**I want to** register an account  
**So that** I can create a student account and access the system

**Priority:** P1  
**Independent test:** Submit valid registration information and create a student account with an active session  
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
**So that** my session is no longer active

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
**So that** users cannot use features they are not authorized to access

**Priority:** P1  
**Independent test:** Log in as an admin and as a student and attempt to access an admin-only endpoint  
**Acceptance scenarios:** see ### US-1.6 under Acceptance Criteria

### US-1.7: Seed the first admin

**As the** system operator  
**I want** the first admin account created by the seed process from environment variables  
**So that** the system has an initial admin account without hardcoding admin credentials in the source code

**Priority:** P1  
**Independent test:** Run `npm run seed` with all `ADMIN_*` variables set and verify an admin user exists; run it with one missing and verify it fails  
**Acceptance scenarios:** see ### US-1.7 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: The system MUST allow users to register an account.
- **FR-002**: Registration MUST create users with the `student` role.
- **FR-003**: The registration form MUST NOT allow a user to select the `admin` role.
- **FR-004**: Successful registration MUST immediately authenticate the newly registered student.
- **FR-005**: The system MUST allow registered users to log in using `userName` and `password`.
- **FR-006**: Usernames MUST be stored in lowercase.
- **FR-007**: Usernames MUST be treated as case-insensitive during login.
- **FR-008**: Every authenticated user MUST have a role.
- **FR-009**: The system MUST support an `admin` role.
- **FR-010**: The system MUST support a `student` role.
- **FR-011**: The system MUST identify the role of the authenticated user.
- **FR-012**: The system MUST allow functionality based on the authenticated user's role.
- **FR-013**: A user MUST NOT have the abilities of another role.
- **FR-014**: An unauthenticated request to protected functionality MUST return `401`.
- **FR-015**: An authenticated user without the required role MUST receive `403`.
- **FR-016**: An admin-only authorization failure MUST return `{ "message": "Admin role required." }`.
- **FR-017**: Authentication MUST use JWT plus a server-side session.
- **FR-018**: Sessions MUST remain valid for 24 hours from creation.
- **FR-019**: A valid session MUST survive an application refresh.
- **FR-020**: An expired or revoked session MUST NOT authenticate the user.
- **FR-021**: Logout MUST invalidate the current server-side session.
- **FR-022**: Logout MUST return `200` with `{ "message": "Signed out successfully." }`.
- **FR-023**: The first admin account MUST be created by the database seed process.
- **FR-024**: Admin seed credentials MUST come from environment variables and MUST NOT be hardcoded in source code.
- **FR-025**: The admin seed MUST provide values for every required User field.
- **FR-026**: `email`, `universityId`, and `userName` MUST be unique.
- **FR-027**: `universityId` MUST NOT have a required format beyond being a required unique value.
- **FR-028**: Required registration fields MUST reject empty values.
- **FR-029**: Required registration fields MUST reject whitespace-only values.
- **FR-030**: Email MUST have a valid email format.
- **FR-031**: Password MUST be at least 8 characters.
- **FR-032**: Password and confirm password MUST match.
- **FR-033**: Invalid registration information MUST return `400` with a `{ "message": "..." }` response and MUST NOT create a user.
- **FR-034**: Duplicate `userName`, `email`, or `universityId` MUST return `400` with a `{ "message": "..." }` response and MUST NOT create a user.
- **FR-035**: Invalid login information MUST return `401` with `{ "message": "Invalid username or password." }`.
- **FR-036**: Invalid login information MUST NOT create an authenticated session.

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

---

## Edge Cases

- Missing required registration information → `400`.
- Whitespace-only required registration information → `400`.
- Invalid email format → `400`.
- Password shorter than 8 characters → `400`.
- Passwords do not match → `400`.
- Duplicate username → `400`.
- Duplicate email → `400`.
- Duplicate university ID → `400`.
- Incorrect username or password → `401`.
- Expired session → `401`.
- Invalid session → `401`.
- Revoked session → `401`.
- Authenticated student attempts an admin-only endpoint → `403`.
- Missing required admin seed environment variable → seed process fails.
- Registration MUST NOT allow a user to create an admin account.

---

## Success Criteria

- **SC-001**: A user can register a student account with valid information.
- **SC-002**: A newly registered student is immediately authenticated.
- **SC-003**: A registered user can log in using `userName` and `password`.
- **SC-004**: The system correctly identifies whether an authenticated user is an admin or student.
- **SC-005**: A valid session survives an application refresh.
- **SC-006**: An expired, invalid, or revoked session cannot access protected functionality.
- **SC-007**: A logged-in user can log out and have their session invalidated.
- **SC-008**: An authenticated admin can access an admin-only endpoint.
- **SC-009**: An authenticated student cannot access an admin-only endpoint.
- **SC-010**: An unauthenticated user cannot access protected functionality.
- **SC-011**: The first admin is created through the seed process using environment variables.
- **SC-012**: Every acceptance scenario has an automated test before merge.
- **SC-013**: All automated tests pass before merge.
- **SC-014**: Nothing outside this feature is implemented.

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

**Purpose:** Create a student account and immediately authenticate the new student.

**Required fields:**

- `firstName`
- `lastName`
- `email`
- `universityId`
- `userName`
- `password`
- `confirmPassword`

**Success:** `201 Created`

Successful registration returns the created user's information, role, and authentication token.

```json
{
  "userId": 1,
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "universityId": "123456",
  "userName": "jdoe",
  "role": "student",
  "token": "<jwt>"
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
| Invalid email format | `400` | `Enter a valid email address.` |
| Missing university ID | `400` | `University ID is required.` |
| Missing username | `400` | `Username is required.` |
| Missing password | `400` | `Password is required.` |
| Missing confirm password | `400` | `Confirm password is required.` |
| Whitespace-only required field | `400` | Field-specific required message |
| Password fewer than 8 characters | `400` | `Password must be at least 8 characters.` |
| Passwords do not match | `400` | `Passwords do not match.` |
| Duplicate username | `400` | `Username is already taken.` |
| Duplicate email | `400` | `Email is already registered.` |
| Duplicate university ID | `400` | `University ID is already registered.` |

### Login

**Endpoint:** `POST /course-t6/login`

**Authentication:** Not required

**Purpose:** Authenticate an existing user.

**Fields:**

- `userName`
- `password`

**Success:** `200 OK`

Successful login returns the authenticated user's information, role, and session token.

**Invalid login:**

`401 Unauthorized`

```json
{
  "message": "Invalid username or password."
}
```

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

Authenticated but wrong role:

`403 Forbidden`

Admin-only authorization failure:

```json
{
  "message": "Admin role required."
}
```

---

## Screen Requirements

### Register Page

The Register page MUST:

- Provide fields for `firstName`, `lastName`, `email`, `universityId`, `userName`, `password`, and `confirmPassword`.
- NOT provide a role selector.
- Validate registration information.
- Display validation errors.
- Submit the registration request.
- Store/use the returned session after successful registration.
- Redirect the newly authenticated user to the **Home page**.

### Login Page

The Login page MUST:

- Provide `userName` and `password`.
- Allow the user to submit login information.
- Display an error when login fails.
- Store/use the returned session after successful login.
- Redirect the authenticated user to the **Home page**.

### Home Page

The Home page is the authenticated landing page.

After successful registration or login, the user MUST be redirected to the Home page.

### MenuBar

The MenuBar MUST:

- Be visible to authenticated users.
- Display **Sign out** for authenticated users.
- Allow the authenticated user to sign out.
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
| `universityId` | String | Required, unique |
| `userName` | String | Required, unique, stored lowercase |
| `password` | String | Required |
| `role` | String | Required, `admin` or `student` |

### `sessions` table

| Field | Type/Requirement | Rules |
|---|---|---|
| `id` | Primary key | Auto-generated |
| `token` | String | Required |
| `expirationDate` | Date | Required |
| `userId` | Foreign key | Required, references `users.id` |

A session MUST expire 24 hours after creation.

---

## Admin Seed Requirements

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

These variables MUST be documented in `.env.example` with blank values.

The same variables MUST be provided in `.env.test` for tests that require the seeded admin.

The seed process MUST fail when any required `ADMIN_*` variable is missing.

The admin username and password MUST NOT be hardcoded in source code.

The seeded account MUST have:

```text
role = admin
```

---

## Acceptance Criteria (Gherkin)

### US-1.1 — Register an account

#### Scenario: User registers successfully

- **Given** I am not registered
- **When** I provide a valid first name, last name, email, university ID, username, password, and matching confirm password
- **And** I submit the registration form
- **Then** a student account is created
- **And** the user's role is `student`
- **And** I am authenticated
- **And** I receive a valid session token
- **And** a protected request using my token succeeds

#### Scenario: User registers without a required field

- **Given** I am on the registration page
- **When** I leave a required field empty
- **And** I submit the registration form
- **Then** the API returns `400`
- **And** the response contains the required-field message
- **And** no user account is created

#### Scenario: User submits whitespace-only required information

- **Given** I am on the registration page
- **When** I provide only whitespace for a required field
- **And** I submit the registration form
- **Then** the API returns `400`
- **And** the response contains the required-field message
- **And** no user account is created

#### Scenario: User submits an invalid email

- **Given** I am on the registration page
- **When** I enter an invalid email address
- **And** I submit the registration form
- **Then** the API returns `400`
- **And** the response is `{ "message": "Enter a valid email address." }`
- **And** no user account is created

#### Scenario: User submits a password shorter than 8 characters

- **Given** I am on the registration page
- **When** I enter a password with fewer than 8 characters
- **And** I submit the registration form
- **Then** the API returns `400`
- **And** the response is `{ "message": "Password must be at least 8 characters." }`
- **And** no user account is created

#### Scenario: User submits mismatched passwords

- **Given** I am on the registration page
- **When** the password and confirm password do not match
- **And** I submit the registration form
- **Then** the API returns `400`
- **And** the response is `{ "message": "Passwords do not match." }`
- **And** no user account is created

#### Scenario: User registers with an existing username

- **Given** a user with username `jdoe` already exists
- **When** I submit registration using `jdoe`
- **Then** the API returns `400`
- **And** the response is `{ "message": "Username is already taken." }`
- **And** no new user account is created

#### Scenario: User registers with an existing email

- **Given** a user with email `jane@example.com` already exists
- **When** I submit registration using `jane@example.com`
- **Then** the API returns `400`
- **And** the response is `{ "message": "Email is already registered." }`
- **And** no new user account is created

#### Scenario: User registers with an existing university ID

- **Given** a user with university ID `123456` already exists
- **When** I submit registration using `123456`
- **Then** the API returns `400`
- **And** the response is `{ "message": "University ID is already registered." }`
- **And** no new user account is created

---

### US-1.2 — Log in

#### Scenario: User logs in successfully

- **Given** I have a registered user
- **When** I submit the correct username and password
- **Then** the API returns `200`
- **And** I am authenticated
- **And** the system identifies my user type
- **And** I receive a valid session token
- **And** I am redirected to the Home page

#### Scenario: User cannot log in with incorrect information

- **Given** I have a registered user
- **When** I submit an incorrect username or password
- **Then** the API returns `401`
- **And** the response is `{ "message": "Invalid username or password." }`
- **And** I am not authenticated

#### Scenario: User logs in using a different username capitalization

- **Given** a user exists with username `jdoe`
- **When** I log in using `JDoe`
- **And** I provide the correct password
- **Then** I am authenticated as that user

---

### US-1.3 — Keep my session active

#### Scenario: Session survives a page refresh

- **Given** I am authenticated with a valid session
- **When** I refresh the application
- **Then** I remain authenticated
- **And** I can access protected functionality

#### Scenario: Expired session is rejected

- **Given** my session has expired
- **When** I send a request to a protected endpoint
- **Then** the API returns `401`
- **And** I am no longer authenticated
- **And** I am sent to the Login page

#### Scenario: Invalid session is rejected

- **Given** I have an invalid session token
- **When** I send a request to a protected endpoint
- **Then** the API returns `401`
- **And** I am no longer authenticated
- **And** I am sent to the Login page

---

### US-1.4 — Log out

#### Scenario: User logs out successfully

- **Given** I am authenticated
- **And** I am on a protected page
- **When** I click **Sign out** in the MenuBar
- **Then** the API returns `200`
- **And** the response is `{ "message": "Signed out successfully." }`
- **And** the server invalidates my current session
- **And** I am no longer authenticated
- **And** I am sent to the Login page

#### Scenario: Request using an old token after logout is rejected

- **Given** I have logged in and received a valid session token
- **And** I have logged out
- **When** I send a protected request using my old token
- **Then** the API returns `401`
- **And** the old token cannot be used to access the protected endpoint

---

### US-1.5 — Use the system as my user type

#### Scenario: Admin logs in

- **Given** the seeded admin account exists
- **When** I log in using the admin's correct username and password
- **Then** the system identifies my role as `admin`
- **And** I am redirected to the Home page

#### Scenario: Student logs in

- **Given** I have a student account
- **When** I log in using the student's correct username and password
- **Then** the system identifies my role as `student`
- **And** I am redirected to the Home page

---

### US-1.6 — Restrict users by their user type

#### Scenario: Admin accesses an admin-only endpoint

- **Given** I am signed in as an admin
- **When** I send a request to an admin-only endpoint using my token
- **Then** the request succeeds

#### Scenario: Student cannot access an admin-only endpoint

- **Given** I am signed in as a student
- **When** I send a request to an admin-only endpoint using my token
- **Then** the API returns `403`
- **And** the response is `{ "message": "Admin role required." }`

#### Scenario: Unauthenticated user cannot access a protected endpoint

- **Given** I am not logged in
- **When** I send a request to a protected endpoint
- **Then** the API returns `401`
- **And** I am sent to the Login page

---

### US-1.7 — Seed the first admin

#### Scenario: Seed creates the first admin

- **Given** all required `ADMIN_*` environment variables are present
- **When** I run `npm run seed`
- **Then** an admin user is created
- **And** the user's role is `admin`
- **And** the admin has values for all required User fields

#### Scenario: Seed fails when an admin environment variable is missing

- **Given** one or more required `ADMIN_*` environment variables are missing
- **When** I run `npm run seed`
- **Then** the seed process fails
- **And** an admin user is not created using default or hardcoded credentials

---

## Test Coverage Map

Each scenario MUST map to at least one automated test.

| Story | Scenario | Test File | Test Name |
|---|---|---|---|
| US-1.1 | User registers successfully | `backend/tests/auth.test.js`, `frontend/tests/Register.test.js` | `User registers successfully` |
| US-1.1 | User registers without a required field | `backend/tests/auth.test.js`, `frontend/tests/Register.test.js` | `User registers without a required field` |
| US-1.1 | User submits whitespace-only required information | `backend/tests/auth.test.js`, `frontend/tests/Register.test.js` | `User submits whitespace-only required information` |
| US-1.1 | User submits an invalid email | `backend/tests/auth.test.js`, `frontend/tests/Register.test.js` | `User submits an invalid email` |
| US-1.1 | User submits a password shorter than 8 characters | `backend/tests/auth.test.js`, `frontend/tests/Register.test.js` | `User submits a password shorter than 8 characters` |
| US-1.1 | User submits mismatched passwords | `backend/tests/auth.test.js`, `frontend/tests/Register.test.js` | `User submits mismatched passwords` |
| US-1.1 | User registers with an existing username | `backend/tests/auth.test.js` | `User registers with an existing username` |
| US-1.1 | User registers with an existing email | `backend/tests/auth.test.js` | `User registers with an existing email` |
| US-1.1 | User registers with an existing university ID | `backend/tests/auth.test.js` | `User registers with an existing university ID` |
| US-1.2 | User logs in successfully | `backend/tests/auth.test.js`, `frontend/tests/Login.test.js` | `User logs in successfully` |
| US-1.2 | User cannot log in with incorrect information | `backend/tests/auth.test.js`, `frontend/tests/Login.test.js` | `User cannot log in with incorrect information` |
| US-1.2 | User logs in using a different username capitalization | `backend/tests/auth.test.js` | `User logs in using a different username capitalization` |
| US-1.3 | Session survives a page refresh | `backend/tests/authenticate.test.js`, `frontend/tests/router.test.js` | `Session survives a page refresh` |
| US-1.3 | Expired session is rejected | `backend/tests/authenticate.test.js`, `frontend/tests/router.test.js` | `Expired session is rejected` |
| US-1.3 | Invalid session is rejected | `backend/tests/authenticate.test.js`, `frontend/tests/router.test.js` | `Invalid session is rejected` |
| US-1.4 | User logs out successfully | `backend/tests/auth.test.js`, `frontend/tests/MenuBar.test.js` | `User logs out successfully` |
| US-1.4 | Request using an old token after logout is rejected | `backend/tests/authenticate.test.js` | `Request using an old token after logout is rejected` |
| US-1.5 | Admin logs in | `backend/tests/auth.test.js` | `Admin logs in` |
| US-1.5 | Student logs in | `backend/tests/auth.test.js` | `Student logs in` |
| US-1.6 | Admin accesses an admin-only endpoint | `backend/tests/authenticate.test.js` | `Admin accesses an admin-only endpoint` |
| US-1.6 | Student cannot access an admin-only endpoint | `backend/tests/authenticate.test.js` | `Student cannot access an admin-only endpoint` |
| US-1.6 | Unauthenticated user cannot access a protected endpoint | `backend/tests/authenticate.test.js`, `frontend/tests/router.test.js` | `Unauthenticated user cannot access a protected endpoint` |
| US-1.7 | Seed creates the first admin | `backend/tests/auth.test.js` | `Seed creates the first admin` |
| US-1.7 | Seed fails when an admin environment variable is missing | `backend/tests/auth.test.js` | `Seed fails when an admin environment variable is missing` |

---

## Agent Implementation Request

Use the following prompt when asking the implementation agent to implement this feature:

```text
Implement Feature 1 from @features/feature-1-user-authentication.md.

Only implement what is defined in this specification.

Follow the structure, architecture, API conventions, coding conventions, and best practices already established in the project.

Authentication routes must be:
POST /course-t6/register
POST /course-t6/login
POST /course-t6/logout

Registration must create student users only and must immediately authenticate the newly registered student.

The first admin must be created through the database seed process.

Admin seed credentials must come from environment variables and must never be hardcoded.

Use the exact environment variable names defined in this specification.

Map every acceptance scenario in the Test Coverage Map to at least one automated test.

Use the exact test file paths listed in the Test Coverage Map.

Do not add features, behavior, API rules, database rules, validation rules, or UI behavior that are not defined in this specification.

Before finishing:
1. Verify the required ADMIN_* variables are present for seed and test environments.
2. Run the database seed process.
3. Run the project's automated tests.
4. Confirm every acceptance scenario is covered by an automated test.
5. Confirm all tests pass.
6. Update the reference documentation listed below when the implementation establishes or changes those contracts.

Do not mark the feature complete if any requirement or acceptance scenario remains unimplemented or untested.
```

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`

---

## Definition of Done

- [ ] Users can register.
- [ ] Registration creates students only.
- [ ] Registration has no role selector.
- [ ] Successful registration immediately authenticates the new student.
- [ ] Users can log in with `userName` and `password`.
- [ ] Usernames are stored lowercase.
- [ ] Username login is case-insensitive.
- [ ] Sessions use JWT plus a server-side session.
- [ ] Sessions last 24 hours.
- [ ] Sessions survive a page refresh while valid.
- [ ] Expired, invalid, and revoked sessions return `401`.
- [ ] Logout invalidates the session and returns `200` with the required message.
- [ ] The Logout button is available in the MenuBar.
- [ ] Admin and student roles exist.
- [ ] The first admin is created through `npm run seed`.
- [ ] Admin credentials come from environment variables.
- [ ] Required admin seed fields are provided through environment variables.
- [ ] Missing admin seed variables cause the seed to fail.
- [ ] `.env.example` contains the required `ADMIN_*` variables with blank values.
- [ ] `.env.test` contains the required `ADMIN_*` variables for admin tests.
- [ ] `email`, `universityId`, and `userName` are unique.
- [ ] `userName` is stored lowercase.
- [ ] `universityId` has no additional format requirement.
- [ ] Registration validation rules and error responses are implemented.
- [ ] Login failure returns `401` with the required message.
- [ ] Admin users can access admin-only endpoints.
- [ ] Students receive `403` when accessing admin-only endpoints.
- [ ] Unauthenticated users receive `401` when accessing protected endpoints.
- [ ] Unauthenticated users are sent to the Login page.
- [ ] Successful registration and login redirect to the Home page.
- [ ] Every acceptance scenario has an automated test.
- [ ] All tests pass.
- [ ] `features/reference/api.md` is updated.
- [ ] `features/reference/data-model.md` is updated.
- [ ] `features/reference/behavior.md` is updated.
- [ ] `features/README.md` links Feature 1 to `feature-1-user-authentication.md`.
- [ ] Nothing outside this specification is implemented.

---

## Out of Scope

- Course creation → [Feature 3](feature-3-course-management.md)
- Course editing → [Feature 3](feature-3-course-management.md)
- Course deletion → [Feature 3](feature-3-course-management.md)
- Students enrolling into courses → [Feature 6](feature-6-enrollment-management.md)
- Searching for courses — Not planned in the current feature set
- Courses having dates/times → [Feature 5](feature-5-section-management.md)
- Adding students → [Feature 9](feature-9-student-management.md)
- Adding instructors → [Feature 4](feature-4-faculty-management.md)
- Managing grades — Not planned in the current feature set
