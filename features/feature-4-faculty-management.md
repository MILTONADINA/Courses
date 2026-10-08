# Feature: Faculty Management

**Feature ID:** 4  
**Branch pattern:** `feature/4-faculty-management`  
**Status:** Shipped  
**Created:** 2026-09-29  
**Input:** Allow admins to manage the faculty members who teach in the Courses Management System. A faculty member has a first name, last name, and department.  
**Depends on:** [Feature 1 — User Authentication & Authorization](feature-1-user-authentication-authorization.md)

---

## User Stories

Every story is P1: each one must ship for the assignment's Faculty Management (CRUD) feature.

### US-4.1: Add a faculty member

**As a** signed-in admin  
**I want to** add a faculty member  
**So that** the faculty member is available when sections are scheduled

**Priority:** P1  
**Independent test:** Sign in as an admin, submit a valid first name, last name, and department, and verify the faculty member is created  
**Acceptance scenarios:** see ### US-4.1 under Acceptance Criteria

### US-4.2: View faculty members

**As a** signed-in admin  
**I want to** view the faculty members in the system  
**So that** I can see who is available to teach

**Priority:** P1  
**Independent test:** Sign in as an admin, create faculty members, and verify the list returns them sorted by last name, then first name  
**Acceptance scenarios:** see ### US-4.2 under Acceptance Criteria

### US-4.3: Edit a faculty member

**As a** signed-in admin  
**I want to** edit a faculty member's information  
**So that** faculty records stay accurate

**Priority:** P1  
**Independent test:** Sign in as an admin, update an existing faculty member, and verify the new values are saved  
**Acceptance scenarios:** see ### US-4.3 under Acceptance Criteria

### US-4.4: Delete a faculty member

**As a** signed-in admin  
**I want to** delete a faculty member  
**So that** the faculty list shows only people who still teach

**Priority:** P1  
**Independent test:** Sign in as an admin, delete an existing faculty member, and verify the faculty member no longer appears in the faculty list  
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
- **FR-002**: A faculty member MUST have a `firstName`, `lastName`, and `dept`.
- **FR-003**: `firstName`, `lastName`, and `dept` MUST be required.
- **FR-004**: Required faculty fields MUST reject empty values.
- **FR-005**: Required faculty fields MUST reject whitespace-only values.
- **FR-006**: Invalid faculty information MUST return `400` with a `{ "message": "..." }` response.
- **FR-007**: Invalid faculty information MUST NOT create or change a faculty member.
- **FR-008**: `dept` MUST be free text with no required format beyond being a required value.
- **FR-009**: The system MUST allow an admin to view all faculty members.
- **FR-010**: The faculty list MUST be sorted by `lastName` ascending, then `firstName` ascending.
- **FR-011**: The system MUST allow an admin to edit a faculty member's `firstName`, `lastName`, and `dept`.
- **FR-012**: Editing a faculty member MUST require all three fields and apply the same validation rules as adding.
- **FR-013**: The system MUST allow an admin to delete a faculty member.
- **FR-014**: Deleting a faculty member MUST return `200` with `{ "message": "Faculty member deleted successfully." }`.
- **FR-015**: Editing or deleting a faculty member id that does not exist MUST return `404` with `{ "message": "Faculty member with id=<id> not found." }`.
- **FR-016**: A faculty member id that is not a number MUST return `400` with `{ "message": "Faculty member id must be a number." }`.
- **FR-017**: Every faculty endpoint MUST use the Feature 1 authentication check.
- **FR-018**: Every faculty endpoint MUST use the Feature 1 admin-only authorization check.
- **FR-019**: An unauthenticated faculty request MUST return `401` with `{ "message": "Unauthorized." }`.
- **FR-020**: A faculty request from an authenticated student MUST return `403` with `{ "message": "Admin role required." }`.
- **FR-021**: A faculty member MUST NOT be a user account.
- **FR-022**: The Faculty page MUST be available only to authenticated admins.
- **FR-023**: The MenuBar MUST show a **Faculty** link to admins only.
- **FR-024**: When a faculty request fails without an API message, the Faculty page MUST show `Request failed.`

---

## Assumptions

- Feature 1 authentication and the admin-only authorization check are on `dev`.
- The faculty department field is `dept`, matching the project slide.
- Only admins manage faculty members.
- A faculty member is a record managed by an admin, not a user who logs in.
- Feature 1 defines only the `admin` and `student` roles; this feature does not add a `faculty` role.
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
- A faculty request fails without an API message → the Faculty page shows `Request failed.`
- Authenticated student sends a faculty request → `403`.
- Unauthenticated faculty request → `401`.
- Student navigates to the Faculty page → sent to the Home page.
- Unauthenticated user navigates to the Faculty page → sent to the Login page.

---

## Success Criteria

- **SC-001**: An admin can add a faculty member with a first name, last name, and department.
- **SC-002**: An admin can view all faculty members sorted by last name, then first name.
- **SC-003**: An admin can edit a faculty member.
- **SC-004**: An admin can delete a faculty member.
- **SC-005**: Invalid faculty information is rejected and does not create or change a faculty member.
- **SC-006**: An authenticated student cannot view, add, edit, or delete faculty members.
- **SC-007**: An unauthenticated user cannot view, add, edit, or delete faculty members.
- **SC-008**: Every acceptance scenario has an automated test before merge.
- **SC-009**: All automated tests pass before merge.
- **SC-010**: Nothing outside this feature is implemented.

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
  "dept": "Computer Science",
  "createdAt": "2026-09-30T20:15:00.000Z",
  "updatedAt": "2026-09-30T20:15:00.000Z"
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
    "dept": "Mathematics",
    "createdAt": "2026-09-30T20:16:00.000Z",
    "updatedAt": "2026-09-30T20:16:00.000Z"
  },
  {
    "id": 1,
    "firstName": "Ada",
    "lastName": "Lovelace",
    "dept": "Computer Science",
    "createdAt": "2026-09-30T20:15:00.000Z",
    "updatedAt": "2026-09-30T20:15:00.000Z"
  }
]
```

### Add a Faculty Member

**Endpoint:** `POST /course-t6/faculty`

**Purpose:** Create a faculty member.

**Request body:**

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "dept": "Computer Science"
}
```

**Success:** `201 Created` with the created faculty member response.

### Edit a Faculty Member

**Endpoint:** `PUT /course-t6/faculty/:id`

**Purpose:** Replace a faculty member's information.

**Request body:**

```json
{
  "firstName": "Ada",
  "lastName": "King",
  "dept": "Mathematics"
}
```

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
| Id is not a number | `PUT`, `DELETE` | `400` | `Faculty member id must be a number.` |
| Id does not exist | `PUT`, `DELETE` | `404` | `Faculty member with id=<id> not found.` |
| No valid session | All | `401` | `Unauthorized.` |
| Authenticated student | All | `403` | `Admin role required.` |

---

## Screen Requirements

### Faculty Page

**Route:** `/faculty`  
**Route name:** `faculty`

The Faculty page MUST:

- Be available only to authenticated admins.
- Display a **Faculty** heading.
- Display an **Add Faculty** primary button.
- Display faculty members in a table with **First name**, **Last name**, and **Department** columns, sorted as returned by the API.
- Provide **Edit** and **Delete** text-labeled actions for each faculty member (not icon-only).
- Delete the faculty member and refresh the faculty list when **Delete** is selected.
- Show a loading state while faculty members load.
- Show `No faculty members yet.` when no faculty members exist.
- Show the API error message when a faculty request fails, or `Request failed.` when the API gives no message.

### Add / Edit Faculty Dialog

The dialog MUST:

- Use the title **Add Faculty** when adding and **Edit Faculty** when editing.
- Provide **First name**, **Last name**, and **Department** fields.
- Pre-fill the fields with the faculty member's current values when editing.
- Validate that every field is filled in and not whitespace-only before submitting, using the same messages as the API.
- Do not send a save request when a required field is empty or whitespace-only.
- Display API validation errors.
- Provide **Save** and **Cancel** buttons.
- Close and refresh the faculty list after a successful save.
- Close without saving when **Cancel** is selected.

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
| `dept` | String | Required |
| `createdAt` | Timestamp | Automatically generated |
| `updatedAt` | Timestamp | Automatically generated |

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
* **When** I send `POST /course-t6/faculty` with a required field empty and all other fields valid
* **Then** the API returns `400`
* **And** the response contains the required-field message
* **And** no faculty member is created

#### Scenario: Admin submits whitespace-only faculty information

* **Given** I am signed in as an admin
* **When** I send `POST /course-t6/faculty` with only whitespace for a required field and all other fields valid
* **Then** the API returns `400`
* **And** the response contains the required-field message
* **And** no faculty member is created

#### Scenario: Add Faculty form blocks submit when a required field is empty

* **Given** I am signed in as an admin with the Add Faculty dialog open and all other fields valid
* **When** I leave a required field empty
* **And** I select **Save**
* **Then** I see that field's required message
* **And** no save request is sent

#### Scenario: Add Faculty form blocks submit when a required field is only whitespace

* **Given** I am signed in as an admin with the Add Faculty dialog open and all other fields valid
* **When** I enter only whitespace for a required field
* **And** I select **Save**
* **Then** I see that field's required message
* **And** no save request is sent

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

#### Scenario: Faculty page shows a loading state while faculty members load

* **Given** I am signed in as an admin
* **And** the faculty request will not finish right away
* **When** I open the Faculty page
* **Then** a loading state is shown until the faculty members arrive

#### Scenario: Faculty page shows the API error when faculty members fail to load

* **Given** I am signed in as an admin
* **And** the faculty request will fail with an error message
* **When** I open the Faculty page
* **Then** the page shows the error message returned by the API

#### Scenario: Faculty page shows a fallback error when the API gives no message

* **Given** I am signed in as an admin
* **And** the faculty request will fail without an error message
* **When** I open the Faculty page
* **Then** the page shows `Request failed.`

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
* **And** faculty member `1` exists
* **When** I send `PUT /course-t6/faculty/1` with a required field empty and all other fields valid
* **Then** the API returns `400`
* **And** the response contains the required-field message
* **And** the faculty member is not changed

#### Scenario: Edit Faculty form blocks submit when a required field is empty

* **Given** I am signed in as an admin with the Edit Faculty dialog open and all other fields valid
* **When** I clear a required field
* **And** I select **Save**
* **Then** I see that field's required message
* **And** no save request is sent

#### Scenario: Edit Faculty form blocks submit when a required field is only whitespace

* **Given** I am signed in as an admin with the Edit Faculty dialog open and all other fields valid
* **When** I replace a required field with only whitespace
* **And** I select **Save**
* **Then** I see that field's required message
* **And** no save request is sent

#### Scenario: Admin edits a faculty member that does not exist

* **Given** I am signed in as an admin
* **And** no faculty member with id `999` exists
* **When** I send `PUT /course-t6/faculty/999` with a valid first name, last name, and department
* **Then** the API returns `404`
* **And** the response is `{ "message": "Faculty member with id=999 not found." }`

#### Scenario: Admin edits a faculty member with an id that is not a number

* **Given** I am signed in as an admin
* **When** I send `PUT /course-t6/faculty/abc` with a valid first name, last name, and department
* **Then** the API returns `400`
* **And** the response is `{ "message": "Faculty member id must be a number." }`

---

### US-4.4 — Delete a faculty member

#### Scenario: Admin deletes a faculty member successfully

* **Given** I am signed in as an admin
* **And** a faculty member exists
* **When** I select **Delete** for that faculty member
* **Then** the API returns `200`
* **And** the response is `{ "message": "Faculty member deleted successfully." }`
* **And** the faculty member no longer appears in the faculty list

#### Scenario: Admin deletes a faculty member that does not exist

* **Given** I am signed in as an admin
* **And** no faculty member with id `999` exists
* **When** I send `DELETE /course-t6/faculty/999`
* **Then** the API returns `404`
* **And** the response is `{ "message": "Faculty member with id=999 not found." }`

#### Scenario: Admin deletes a faculty member with an id that is not a number

* **Given** I am signed in as an admin
* **When** I send `DELETE /course-t6/faculty/abc`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Faculty member id must be a number." }`

---

### US-4.5 — Restrict faculty management to admins

#### Scenario: Student cannot manage faculty members

* **Given** I am signed in as a student
* **When** I send a request to list, add, edit, or delete faculty members
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`
* **And** no faculty member is created, changed, or deleted

#### Scenario: Unauthenticated user cannot manage faculty members

* **Given** I am not logged in
* **When** I send a request to list, add, edit, or delete faculty members
* **Then** the API returns `401`
* **And** the response is `{ "message": "Unauthorized." }`
* **And** no faculty member is created, changed, or deleted

#### Scenario: Student cannot open the Faculty page

* **Given** I am signed in as a student
* **When** I navigate to `/faculty`
* **Then** I am sent to the Home page

#### Scenario: Unauthenticated user cannot open the Faculty page

* **Given** I am not logged in
* **When** I navigate to `/faculty`
* **Then** I am sent to the Login page

#### Scenario: Admin sees the Faculty link in the MenuBar

* **Given** I am signed in as an admin
* **When** I view the MenuBar
* **Then** the **Faculty** link is displayed

#### Scenario: Student does not see the Faculty link in the MenuBar

* **Given** I am signed in as a student
* **When** I view the MenuBar
* **Then** the **Faculty** link is not displayed

---

## Test Coverage Map

Each scenario MUST map to at least one automated test.

| Story | Scenario | Test File | Test Name |
|---|---|---|---|
| US-4.1 | Admin adds a faculty member successfully | `backend/tests/faculty.test.js`, `frontend/tests/Faculty.test.js` | `Admin adds a faculty member successfully` |
| US-4.1 | Admin adds a faculty member without a required field | `backend/tests/faculty.test.js` | `Admin adds a faculty member without a required field` |
| US-4.1 | Admin submits whitespace-only faculty information | `backend/tests/faculty.test.js` | `Admin submits whitespace-only faculty information` |
| US-4.1 | Add Faculty form blocks submit when a required field is empty | `frontend/tests/Faculty.test.js` | `Add Faculty form blocks submit when a required field is empty` |
| US-4.1 | Add Faculty form blocks submit when a required field is only whitespace | `frontend/tests/Faculty.test.js` | `Add Faculty form blocks submit when a required field is only whitespace` |
| US-4.2 | Admin views the faculty list | `backend/tests/faculty.test.js`, `frontend/tests/Faculty.test.js` | `Admin views the faculty list` |
| US-4.2 | Admin views the faculty list when no faculty members exist | `backend/tests/faculty.test.js`, `frontend/tests/Faculty.test.js` | `Admin views the faculty list when no faculty members exist` |
| US-4.2 | Faculty page shows a loading state while faculty members load | `frontend/tests/Faculty.test.js` | `Faculty page shows a loading state while faculty members load` |
| US-4.2 | Faculty page shows the API error when faculty members fail to load | `frontend/tests/Faculty.test.js` | `Faculty page shows the API error when faculty members fail to load` |
| US-4.2 | Faculty page shows a fallback error when the API gives no message | `frontend/tests/Faculty.test.js` | `Faculty page shows a fallback error when the API gives no message` |
| US-4.3 | Admin edits a faculty member successfully | `backend/tests/faculty.test.js`, `frontend/tests/Faculty.test.js` | `Admin edits a faculty member successfully` |
| US-4.3 | Admin edits a faculty member without a required field | `backend/tests/faculty.test.js` | `Admin edits a faculty member without a required field` |
| US-4.3 | Edit Faculty form blocks submit when a required field is empty | `frontend/tests/Faculty.test.js` | `Edit Faculty form blocks submit when a required field is empty` |
| US-4.3 | Edit Faculty form blocks submit when a required field is only whitespace | `frontend/tests/Faculty.test.js` | `Edit Faculty form blocks submit when a required field is only whitespace` |
| US-4.3 | Admin edits a faculty member that does not exist | `backend/tests/faculty.test.js` | `Admin edits a faculty member that does not exist` |
| US-4.3 | Admin edits a faculty member with an id that is not a number | `backend/tests/faculty.test.js` | `Admin edits a faculty member with an id that is not a number` |
| US-4.4 | Admin deletes a faculty member successfully | `backend/tests/faculty.test.js`, `frontend/tests/Faculty.test.js` | `Admin deletes a faculty member successfully` |
| US-4.4 | Admin deletes a faculty member that does not exist | `backend/tests/faculty.test.js` | `Admin deletes a faculty member that does not exist` |
| US-4.4 | Admin deletes a faculty member with an id that is not a number | `backend/tests/faculty.test.js` | `Admin deletes a faculty member with an id that is not a number` |
| US-4.5 | Student cannot manage faculty members | `backend/tests/faculty.test.js` | `Student cannot manage faculty members` |
| US-4.5 | Unauthenticated user cannot manage faculty members | `backend/tests/faculty.test.js` | `Unauthenticated user cannot manage faculty members` |
| US-4.5 | Student cannot open the Faculty page | `frontend/tests/Faculty.test.js` | `Student cannot open the Faculty page` |
| US-4.5 | Unauthenticated user cannot open the Faculty page | `frontend/tests/Faculty.test.js` | `Unauthenticated user cannot open the Faculty page` |
| US-4.5 | Admin sees the Faculty link in the MenuBar | `frontend/tests/Faculty.test.js` | `Admin sees the Faculty link in the MenuBar` |
| US-4.5 | Student does not see the Faculty link in the MenuBar | `frontend/tests/Faculty.test.js` | `Student does not see the Faculty link in the MenuBar` |

---

## Agent Implementation Request

Application code for this feature is written by hand. AI may be used only to build the automated tests, as required by the course slides.

### Handwritten application code

The following checklist is for the person coding this feature:

```text
Write Feature 4 by hand from @features/feature-4-faculty-management.md on branch feature/4-faculty-management.

Only implement what is defined in this specification.

Follow the structure, architecture, API conventions, coding conventions, and best practices already established in the project.

Follow the layer order in @features/framework.md (models → routes → backend tests → frontend services → views → frontend tests → router).

Faculty routes must be:
GET /course-t6/faculty
POST /course-t6/faculty
PUT /course-t6/faculty/:id
DELETE /course-t6/faculty/:id

Protect every faculty route with the Feature 1 authenticate and requireAdmin checks from backend/app/authorization/authorization.js.

A faculty member is not a user account. Do not add a faculty role and do not change the users or sessions tables.

The table name must be faculty. Sort the faculty list by lastName, then firstName.

Use the field name dept from the project slide.

The Faculty page route must be /faculty with route name faculty.
Show the API error message when a faculty request fails, or "Request failed." when the API gives no message.

Use the exact error messages defined in this specification.

Map every acceptance scenario in the Test Coverage Map to at least one automated test.

Use the exact test file paths listed in the Test Coverage Map.

Do not add features, behavior, API rules, database rules, validation rules, or UI behavior that are not defined in this specification.

Before finishing:
1. Run npm test from the project root (runs backend and frontend tests).
2. Confirm every acceptance scenario is covered by an automated test.
3. Confirm all tests pass.
4. Update the reference documentation listed below to match the shipped code.
5. Complete the Definition of Done and the merge checklist in @features/framework.md.

Do not mark the feature complete if any requirement or acceptance scenario remains unimplemented or untested.
```

### Automated tests (AI allowed)

AI may write or update only the automated tests. It MUST NOT write or change application code in `backend/app` or `frontend/src`.

- Use the exact scenarios, test file paths, and test names in the Test Coverage Map.
- API validation scenarios send requests directly to the API; faculty form validation scenarios show the field error and send no save request.
- Report any application-code failure for the developer to fix by hand; do not change the specification or weaken a test to make it pass.

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`, `features/reference/README.md` (provenance)

---

## Definition of Done

- [x] Admins can add a faculty member with a first name, last name, and department.
- [x] `firstName`, `lastName`, and `dept` are required and reject empty and whitespace-only values.
- [x] The database field is `dept`, matching the project slide.
- [x] Admins can view all faculty members sorted by last name, then first name.
- [x] Admins can edit a faculty member.
- [x] Admins can delete a faculty member.
- [x] Non-existent faculty member ids return `404` with the required message.
- [x] Non-numeric faculty member ids return `400` with the required message.
- [x] Every faculty endpoint uses the Feature 1 authentication and admin-only authorization checks.
- [x] Students receive `403` on every faculty endpoint.
- [x] Unauthenticated users receive `401` with `{ "message": "Unauthorized." }` on every faculty endpoint.
- [x] Faculty members are not user accounts and no `faculty` role was added.
- [x] The Faculty page route is `/faculty` with route name `faculty`.
- [x] The Faculty page shows loading and empty states.
- [x] The Faculty page shows the API error message when a request fails, or `Request failed.` when the API gives no message.
- [x] The Faculty page is available only to admins; students are sent to the Home page and unauthenticated users to the Login page.
- [x] The MenuBar shows the **Faculty** link to admins only.
- [x] Backend and frontend are implemented per this spec (**FR-001**-**FR-024** satisfied).
- [x] **Success Criteria (SC-001**-**SC-010)** are met.
- [x] Test Coverage Map is complete.
- [x] Every acceptance scenario has an automated test.
- [x] All tests pass (`npm test`).
- [x] `features/reference/api.md` is updated.
- [x] `features/reference/data-model.md` is updated.
- [x] `features/reference/behavior.md` is updated.
- [x] `features/reference/README.md` lists Feature 4 in its provenance table.
- [x] `features/README.md` links Feature 4 to `feature-4-faculty-management.md`.
- [x] Nothing outside this specification is implemented.
- [ ] Agility is synchronized with the amended faculty validation acceptance criteria (owner: Morgan; deferred until review).

---

## Out of Scope

- Assigning faculty members to sections → [Feature 5](feature-5-section-management.md)
- Rules for deleting a faculty member who is assigned to a section → [Feature 5](feature-5-section-management.md)
- Showing a section's instructor to students → [Feature 6](feature-6-enrollment-management.md)
- Semester management → [Feature 2](feature-2-semester-management.md)
- Course management → [Feature 3](feature-3-course-management.md)
- Student management → [Feature 9](feature-9-student-management.md)
