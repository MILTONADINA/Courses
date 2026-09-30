# Feature: Faculty Management

**Feature ID:** 4  
**Branch pattern:** `feature/4-faculty-management`  
**Status:** Draft  
**Created:** 2026-09-29  
**Input:** Allow admins to manage the faculty members who teach in the Courses Management System. A faculty member has a first name, last name, and department.  
**Depends on:** [Feature 1 — User Authentication & Authorization](feature-1-user-authentication.md)

---

## User Stories

### US-4.1: Add a faculty member

**As an** admin  
**I want to** add a faculty member  
**So that** the faculty member is available when sections are scheduled

**Priority:** P1  
**Independent test:** Sign in as an admin, submit a valid first name, last name, and department, and verify the faculty member is created  
**Acceptance scenarios:** see ### US-4.1 under Acceptance Criteria

### US-4.2: View faculty members

**As an** admin  
**I want to** view the faculty members in the system  
**So that** I can see who is available to teach

**Priority:** P1  
**Independent test:** Sign in as an admin, create faculty members, and verify the list returns them sorted by last name, then first name  
**Acceptance scenarios:** see ### US-4.2 under Acceptance Criteria

### US-4.3: Edit a faculty member

**As an** admin  
**I want to** edit a faculty member's information  
**So that** faculty records stay accurate

**Priority:** P1  
**Independent test:** Sign in as an admin, update an existing faculty member, and verify the new values are saved  
**Acceptance scenarios:** see ### US-4.3 under Acceptance Criteria

### US-4.4: Delete a faculty member

**As an** admin  
**I want to** delete a faculty member  
**So that** faculty who no longer teach are removed from the system

**Priority:** P1  
**Independent test:** Sign in as an admin, delete an existing faculty member, and verify the faculty member no longer exists  
**Acceptance scenarios:** see ### US-4.4 under Acceptance Criteria

### US-4.5: Restrict faculty management to admins

**As the** application  
**I want to** allow only admins to manage faculty members  
**So that** students cannot view or change faculty records

**Priority:** P1  
**Independent test:** Send each faculty request as a student and as an unauthenticated user and verify `403` and `401` respectively  
**Acceptance scenarios:** see ### US-4.5 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: The system MUST allow an admin to add a faculty member.
- **FR-002**: A faculty member MUST have a `firstName`, `lastName`, and `department`.
- **FR-003**: `firstName`, `lastName`, and `department` MUST be required.
- **FR-004**: Required faculty fields MUST reject empty values.
- **FR-005**: Required faculty fields MUST reject whitespace-only values.
- **FR-006**: Invalid faculty information MUST return `400` with a `{ "message": "..." }` response and MUST NOT create or change a faculty member.
- **FR-007**: `department` MUST be free text with no required format beyond being a required value.
- **FR-008**: The system MUST NOT require the combination of `firstName`, `lastName`, and `department` to be unique.
- **FR-009**: The system MUST allow an admin to view all faculty members.
- **FR-010**: The faculty list MUST be sorted by `lastName` ascending, then `firstName` ascending.
- **FR-011**: The system MUST allow an admin to view a single faculty member by id.
- **FR-012**: The system MUST allow an admin to edit a faculty member's `firstName`, `lastName`, and `department`.
- **FR-013**: Editing a faculty member MUST require all three fields and apply the same validation rules as adding.
- **FR-014**: The system MUST allow an admin to delete a faculty member.
- **FR-015**: The Faculty page MUST ask the admin to confirm before a faculty member is deleted.
- **FR-016**: Deleting a faculty member MUST return `200` with `{ "message": "Faculty member deleted successfully." }`.
- **FR-017**: Requesting, editing, or deleting a faculty member id that does not exist MUST return `404` with `{ "message": "Faculty member with id=<id> not found." }`.
- **FR-018**: A faculty member id that is not a number MUST return `400` with `{ "message": "Faculty member id must be a number." }`.
- **FR-019**: Every faculty endpoint MUST use the Feature 1 authentication check.
- **FR-020**: Every faculty endpoint MUST use the Feature 1 admin-only authorization check.
- **FR-021**: An unauthenticated faculty request MUST return `401`.
- **FR-022**: A faculty request from an authenticated student MUST return `403` with `{ "message": "Admin role required." }`.
- **FR-023**: A faculty member MUST NOT be a user account and MUST NOT be able to log in.
- **FR-024**: The Faculty page MUST be available only to authenticated admins.
- **FR-025**: The MenuBar MUST show a **Faculty** link to admins only.

---

## Assumptions

- Feature 1 authentication and the admin-only authorization check are on `dev`.
- Only admins manage faculty members.
- A faculty member is a record managed by an admin, not a user who logs in.
- Feature 1 defines only the `admin` and `student` roles; this feature does not add a `faculty` role.
- Two different faculty members can have the same name and department.
- A department is stored as text on the faculty member; departments are not managed separately.
- Deleting a faculty member is permanent.
- What happens when a faculty member assigned to a section is deleted is defined by [Feature 5](feature-5-section-management.md), which introduces sections.

---

## Edge Cases

- Missing required faculty field → `400`.
- Whitespace-only required faculty field → `400`.
- Faculty member id that does not exist → `404`.
- Faculty member id that is not a number → `400`.
- No faculty members exist → the list returns an empty array and the Faculty page shows an empty-state message.
- Two faculty members with the same name and department → both are saved.
- Admin cancels the delete confirmation → the faculty member is not deleted.
- Authenticated student sends a faculty request → `403`.
- Unauthenticated faculty request → `401`.
- Expired, invalid, or revoked session sends a faculty request → `401`.
- Student navigates to the Faculty page → sent to the Home page.

---

## Success Criteria

- **SC-001**: An admin can add a faculty member with a first name, last name, and department.
- **SC-002**: An admin can view all faculty members sorted by last name, then first name.
- **SC-003**: An admin can view a single faculty member.
- **SC-004**: An admin can edit a faculty member.
- **SC-005**: An admin can delete a faculty member after confirming.
- **SC-006**: Invalid faculty information is rejected and does not create or change a faculty member.
- **SC-007**: An authenticated student cannot view, add, edit, or delete faculty members.
- **SC-008**: An unauthenticated user cannot view, add, edit, or delete faculty members.
- **SC-009**: Every acceptance scenario has an automated test before merge.
- **SC-010**: All automated tests pass before merge.
- **SC-011**: Nothing outside this feature is implemented.

---

## Data Ownership & Isolation

Faculty members are shared institutional records, not owned by an individual user.

- Every admin MUST be able to view and manage every faculty member.
- Students MUST NOT be able to view or manage faculty members through this feature.
- Authorization MUST use the authenticated user's role from the Feature 1 session, not a value sent by the client.
- Hiding the Faculty link or page on the client MUST NOT be the only protection; the API MUST enforce the admin-only check.

---

## Key Entities

### Faculty Member

A person who teaches in the Courses Management System.

A Faculty Member has:

- A first name
- A last name
- A department

A Faculty Member is managed by admins. A Faculty Member is not a User and has no login information or role.

Later features relate Faculty Members to sections ([Feature 5](feature-5-section-management.md)).

---

## API Requirements

All faculty endpoints are mounted under `/course-t6/faculty`.

All faculty endpoints require:

- **Authentication:** Required (Feature 1 authentication check)
- **Authorization:** Admin only (Feature 1 admin-only authorization check)

### Faculty Member Response

Every endpoint that returns a faculty member MUST return these fields:

```json
{
  "id": 1,
  "firstName": "Ada",
  "lastName": "Lovelace",
  "department": "Computer Science"
}
```

### List Faculty Members

**Endpoint:** `GET /course-t6/faculty`

**Purpose:** Return every faculty member.

**Success:** `200 OK`

Returns an array of faculty members sorted by `lastName` ascending, then `firstName` ascending. Returns `[]` when no faculty members exist.

```json
[
  {
    "id": 2,
    "firstName": "Grace",
    "lastName": "Hopper",
    "department": "Mathematics"
  },
  {
    "id": 1,
    "firstName": "Ada",
    "lastName": "Lovelace",
    "department": "Computer Science"
  }
]
```

### Get a Faculty Member

**Endpoint:** `GET /course-t6/faculty/:id`

**Purpose:** Return one faculty member.

**Success:** `200 OK` with the faculty member response.

### Add a Faculty Member

**Endpoint:** `POST /course-t6/faculty`

**Purpose:** Create a faculty member.

**Required fields:**

- `firstName`
- `lastName`
- `department`

**Success:** `201 Created` with the created faculty member response.

### Edit a Faculty Member

**Endpoint:** `PUT /course-t6/faculty/:id`

**Purpose:** Replace a faculty member's information.

**Required fields:**

- `firstName`
- `lastName`
- `department`

**Success:** `200 OK` with the updated faculty member response.

### Delete a Faculty Member

**Endpoint:** `DELETE /course-t6/faculty/:id`

**Purpose:** Permanently delete a faculty member.

**Success:** `200 OK`

```json
{
  "message": "Faculty member deleted successfully."
}
```

### Faculty Errors

All faculty errors MUST return:

```json
{
  "message": "Human-readable explanation."
}
```

| Condition | Endpoints | Status | Message |
|---|---|---:|---|
| Missing first name | `POST`, `PUT` | `400` | `First name is required.` |
| Missing last name | `POST`, `PUT` | `400` | `Last name is required.` |
| Missing department | `POST`, `PUT` | `400` | `Department is required.` |
| Whitespace-only required field | `POST`, `PUT` | `400` | Field-specific required message |
| Id is not a number | `GET /:id`, `PUT`, `DELETE` | `400` | `Faculty member id must be a number.` |
| Id does not exist | `GET /:id`, `PUT`, `DELETE` | `404` | `Faculty member with id=<id> not found.` |
| No valid session | All | `401` | `Unauthorized.` |
| Authenticated student | All | `403` | `Admin role required.` |

---

## Screen Requirements

### Faculty Page

**Route:** `/faculty`

The Faculty page MUST:

- Be available only to authenticated admins.
- Display a **Faculty** heading.
- Display an **Add Faculty** primary button.
- Display faculty members in a table with **First name**, **Last name**, and **Department** columns, sorted as returned by the API.
- Provide **Edit** and **Delete** actions for each faculty member.
- Show a loading state while faculty members load.
- Show `No faculty members yet.` when no faculty members exist.
- Show an error alert when a faculty request fails.

### Add / Edit Faculty Dialog

The dialog MUST:

- Use the title **Add Faculty** when adding and **Edit Faculty** when editing.
- Provide **First name**, **Last name**, and **Department** fields.
- Pre-fill the fields with the faculty member's current values when editing.
- Validate that every field is filled in and not whitespace-only before submitting, using the same messages as the API.
- Display API validation errors.
- Provide **Save** and **Cancel** buttons.
- Close and refresh the faculty list after a successful save.
- Close without saving when **Cancel** is selected.

### Delete Confirmation Dialog

The dialog MUST:

- Display `Delete <firstName> <lastName>? This cannot be undone.`
- Provide **Delete** and **Cancel** buttons.
- Delete the faculty member and refresh the faculty list when **Delete** is selected.
- Close without deleting when **Cancel** is selected.

### MenuBar

The MenuBar MUST:

- Display a **Faculty** link to authenticated admins that opens the Faculty page.
- NOT display the **Faculty** link to students.

### Protected Pages

- An unauthenticated user attempting to open the Faculty page MUST be sent to the Login page.
- An authenticated student attempting to open the Faculty page MUST be sent to the Home page.

---

## Data Model Requirements

### `faculty` table

| Field | Type/Requirement | Rules |
|---|---|---|
| `id` | Primary key | Auto-generated |
| `firstName` | String | Required |
| `lastName` | String | Required |
| `department` | String | Required |

The table name MUST be `faculty` (not pluralized). The model MUST be registered in `backend/app/models/index.js`.

The `faculty` table has no relationship to `users` or `sessions`.

---

## Acceptance Criteria (Gherkin)

### US-4.1 — Add a faculty member

#### Scenario: Admin adds a faculty member successfully

* **Given** I am signed in as an admin
* **When** I provide a valid first name, last name, and department
* **And** I submit the Add Faculty form
* **Then** the API returns `201`
* **And** the response contains the new faculty member's id, first name, last name, and department
* **And** the faculty member appears in the faculty list

#### Scenario: Admin adds a faculty member without a required field

* **Given** I am signed in as an admin
* **When** I leave a required faculty field empty
* **And** I submit the Add Faculty form
* **Then** the API returns `400`
* **And** the response contains the required-field message
* **And** no faculty member is created

#### Scenario: Admin submits whitespace-only faculty information

* **Given** I am signed in as an admin
* **When** I provide only whitespace for a required faculty field
* **And** I submit the Add Faculty form
* **Then** the API returns `400`
* **And** the response contains the required-field message
* **And** no faculty member is created

#### Scenario: Admin adds a faculty member with the same name and department as another

* **Given** I am signed in as an admin
* **And** a faculty member named `Ada Lovelace` in `Computer Science` exists
* **When** I add another faculty member named `Ada Lovelace` in `Computer Science`
* **Then** the API returns `201`
* **And** both faculty members exist

---

### US-4.2 — View faculty members

#### Scenario: Admin views the faculty list

* **Given** I am signed in as an admin
* **And** faculty members exist
* **When** I open the Faculty page
* **Then** the API returns `200`
* **And** I see every faculty member's first name, last name, and department
* **And** the faculty members are sorted by last name, then first name

#### Scenario: Admin views the faculty list when no faculty members exist

* **Given** I am signed in as an admin
* **And** no faculty members exist
* **When** I open the Faculty page
* **Then** the API returns `200` with an empty list
* **And** I see `No faculty members yet.`

#### Scenario: Admin views a single faculty member

* **Given** I am signed in as an admin
* **And** a faculty member exists
* **When** I request that faculty member by id
* **Then** the API returns `200`
* **And** the response contains the faculty member's id, first name, last name, and department

#### Scenario: Admin requests a faculty member that does not exist

* **Given** I am signed in as an admin
* **When** I request a faculty member id that does not exist
* **Then** the API returns `404`
* **And** the response is `{ "message": "Faculty member with id=<id> not found." }`

#### Scenario: Admin requests a faculty member with an id that is not a number

* **Given** I am signed in as an admin
* **When** I request the faculty member id `abc`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Faculty member id must be a number." }`

---

### US-4.3 — Edit a faculty member

#### Scenario: Admin edits a faculty member successfully

* **Given** I am signed in as an admin
* **And** a faculty member exists
* **When** I change the faculty member's first name, last name, and department
* **And** I submit the Edit Faculty form
* **Then** the API returns `200`
* **And** the response contains the updated values
* **And** the faculty list shows the updated values

#### Scenario: Admin edits a faculty member without a required field

* **Given** I am signed in as an admin
* **And** a faculty member exists
* **When** I clear a required faculty field
* **And** I submit the Edit Faculty form
* **Then** the API returns `400`
* **And** the response contains the required-field message
* **And** the faculty member is not changed

#### Scenario: Admin edits a faculty member that does not exist

* **Given** I am signed in as an admin
* **When** I submit an edit for a faculty member id that does not exist
* **Then** the API returns `404`
* **And** the response is `{ "message": "Faculty member with id=<id> not found." }`

---

### US-4.4 — Delete a faculty member

#### Scenario: Admin deletes a faculty member successfully

* **Given** I am signed in as an admin
* **And** a faculty member exists
* **When** I select **Delete** for that faculty member
* **And** I confirm the deletion
* **Then** the API returns `200`
* **And** the response is `{ "message": "Faculty member deleted successfully." }`
* **And** the faculty member no longer appears in the faculty list

#### Scenario: Admin cancels deleting a faculty member

* **Given** I am signed in as an admin
* **And** a faculty member exists
* **When** I select **Delete** for that faculty member
* **And** I select **Cancel** in the confirmation dialog
* **Then** no delete request is sent
* **And** the faculty member still appears in the faculty list

#### Scenario: Admin deletes a faculty member that does not exist

* **Given** I am signed in as an admin
* **When** I send a delete request for a faculty member id that does not exist
* **Then** the API returns `404`
* **And** the response is `{ "message": "Faculty member with id=<id> not found." }`

---

### US-4.5 — Restrict faculty management to admins

#### Scenario: Student cannot manage faculty members

* **Given** I am signed in as a student
* **When** I send a request to list, view, add, edit, or delete faculty members
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`
* **And** no faculty member is created, changed, or deleted

#### Scenario: Unauthenticated user cannot manage faculty members

* **Given** I am not logged in
* **When** I send a request to list, view, add, edit, or delete faculty members
* **Then** the API returns `401`
* **And** no faculty member is created, changed, or deleted

#### Scenario: Student cannot open the Faculty page

* **Given** I am signed in as a student
* **When** I navigate to `/faculty`
* **Then** I am sent to the Home page

#### Scenario: Unauthenticated user cannot open the Faculty page

* **Given** I am not logged in
* **When** I navigate to `/faculty`
* **Then** I am sent to the Login page

#### Scenario: Faculty link is shown only to admins

* **Given** I am signed in
* **When** the MenuBar is displayed
* **Then** the **Faculty** link is visible if my role is `admin`
* **And** the **Faculty** link is not visible if my role is `student`

---

## Test Coverage Map

Each scenario MUST map to at least one automated test.

| Story | Scenario | Test File | Test Name |
|---|---|---|---|
| US-4.1 | Admin adds a faculty member successfully | `backend/tests/faculty.test.js`, `frontend/tests/Faculty.test.js` | `Admin adds a faculty member successfully` |
| US-4.1 | Admin adds a faculty member without a required field | `backend/tests/faculty.test.js`, `frontend/tests/Faculty.test.js` | `Admin adds a faculty member without a required field` |
| US-4.1 | Admin submits whitespace-only faculty information | `backend/tests/faculty.test.js`, `frontend/tests/Faculty.test.js` | `Admin submits whitespace-only faculty information` |
| US-4.1 | Admin adds a faculty member with the same name and department as another | `backend/tests/faculty.test.js` | `Admin adds a faculty member with the same name and department as another` |
| US-4.2 | Admin views the faculty list | `backend/tests/faculty.test.js`, `frontend/tests/Faculty.test.js` | `Admin views the faculty list` |
| US-4.2 | Admin views the faculty list when no faculty members exist | `backend/tests/faculty.test.js`, `frontend/tests/Faculty.test.js` | `Admin views the faculty list when no faculty members exist` |
| US-4.2 | Admin views a single faculty member | `backend/tests/faculty.test.js` | `Admin views a single faculty member` |
| US-4.2 | Admin requests a faculty member that does not exist | `backend/tests/faculty.test.js` | `Admin requests a faculty member that does not exist` |
| US-4.2 | Admin requests a faculty member with an id that is not a number | `backend/tests/faculty.test.js` | `Admin requests a faculty member with an id that is not a number` |
| US-4.3 | Admin edits a faculty member successfully | `backend/tests/faculty.test.js`, `frontend/tests/Faculty.test.js` | `Admin edits a faculty member successfully` |
| US-4.3 | Admin edits a faculty member without a required field | `backend/tests/faculty.test.js`, `frontend/tests/Faculty.test.js` | `Admin edits a faculty member without a required field` |
| US-4.3 | Admin edits a faculty member that does not exist | `backend/tests/faculty.test.js` | `Admin edits a faculty member that does not exist` |
| US-4.4 | Admin deletes a faculty member successfully | `backend/tests/faculty.test.js`, `frontend/tests/Faculty.test.js` | `Admin deletes a faculty member successfully` |
| US-4.4 | Admin cancels deleting a faculty member | `frontend/tests/Faculty.test.js` | `Admin cancels deleting a faculty member` |
| US-4.4 | Admin deletes a faculty member that does not exist | `backend/tests/faculty.test.js` | `Admin deletes a faculty member that does not exist` |
| US-4.5 | Student cannot manage faculty members | `backend/tests/faculty.test.js` | `Student cannot manage faculty members` |
| US-4.5 | Unauthenticated user cannot manage faculty members | `backend/tests/faculty.test.js` | `Unauthenticated user cannot manage faculty members` |
| US-4.5 | Student cannot open the Faculty page | `frontend/tests/router.test.js` | `Student cannot open the Faculty page` |
| US-4.5 | Unauthenticated user cannot open the Faculty page | `frontend/tests/router.test.js` | `Unauthenticated user cannot open the Faculty page` |
| US-4.5 | Faculty link is shown only to admins | `frontend/tests/MenuBar.test.js` | `Faculty link is shown only to admins` |

---

## Agent Implementation Request

Use the following prompt when asking the implementation agent to implement this feature:

```text
Implement Feature 4 from @features/feature-4-faculty-management.md on branch feature/4-faculty-management.

Only implement what is defined in this specification.

Follow the structure, architecture, API conventions, coding conventions, and best practices already established in the project.

Follow the layer order in @features/framework.md (models → routes → backend tests → frontend services → views → frontend tests → router).

Faculty routes must be:
GET /course-t6/faculty
GET /course-t6/faculty/:id
POST /course-t6/faculty
PUT /course-t6/faculty/:id
DELETE /course-t6/faculty/:id

Protect every faculty route with the Feature 1 authenticate and requireAdmin checks from backend/app/authorization/authorization.js.

A faculty member is not a user account. Do not add a faculty role and do not change the users or sessions tables.

The table name must be faculty. Sort the faculty list by lastName, then firstName.

Use the exact error messages defined in this specification.

Map every acceptance scenario in the Test Coverage Map to at least one automated test.

Use the exact test file paths listed in the Test Coverage Map.

Do not add features, behavior, API rules, database rules, validation rules, or UI behavior that are not defined in this specification.

Before finishing:
1. Run the project's automated tests.
2. Confirm every acceptance scenario is covered by an automated test.
3. Confirm all tests pass.
4. Update the reference documentation listed below to match the shipped code.

Do not mark the feature complete if any requirement or acceptance scenario remains unimplemented or untested.
```

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`

---

## Definition of Done

- [ ] Admins can add a faculty member with a first name, last name, and department.
- [ ] `firstName`, `lastName`, and `department` are required and reject empty and whitespace-only values.
- [ ] Duplicate faculty names and departments are allowed.
- [ ] Admins can view all faculty members sorted by last name, then first name.
- [ ] Admins can view a single faculty member.
- [ ] Admins can edit a faculty member.
- [ ] Admins can delete a faculty member after confirming.
- [ ] Non-existent faculty member ids return `404` with the required message.
- [ ] Non-numeric faculty member ids return `400` with the required message.
- [ ] Every faculty endpoint uses the Feature 1 authentication and admin-only authorization checks.
- [ ] Students receive `403` on every faculty endpoint.
- [ ] Unauthenticated users receive `401` on every faculty endpoint.
- [ ] Faculty members are not user accounts and no `faculty` role was added.
- [ ] The Faculty page shows loading, empty, and error states.
- [ ] The Faculty page is available only to admins; students are sent to the Home page and unauthenticated users to the Login page.
- [ ] The MenuBar shows the **Faculty** link to admins only.
- [ ] Every acceptance scenario has an automated test.
- [ ] All tests pass.
- [ ] `features/reference/api.md` is updated.
- [ ] `features/reference/data-model.md` is updated.
- [ ] `features/reference/behavior.md` is updated.
- [ ] `features/README.md` links Feature 4 to `feature-4-faculty-management.md`.
- [ ] Nothing outside this specification is implemented.

---

## Out of Scope

- Faculty user accounts, a `faculty` role, or faculty logging in — Not planned in the current feature set
- Assigning faculty members to sections → [Feature 5](feature-5-section-management.md)
- Rules for deleting a faculty member who is assigned to a section → [Feature 5](feature-5-section-management.md)
- Showing a section's instructor to students → [Feature 7](feature-7-student-course-listing.md)
- Managing departments as a separate list — Not planned in the current feature set
- Faculty contact information (email, phone, office) — Not planned in the current feature set
- Searching or filtering faculty members — Not planned in the current feature set
- Semester management → [Feature 2](feature-2-semester-management.md)
- Course management → [Feature 3](feature-3-course-management.md)
- Student management → [Feature 9](feature-9-student-management.md)
