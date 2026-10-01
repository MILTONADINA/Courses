# Feature: Semester Management

**Feature ID:** 2  
**Branch pattern:** `feature/2-semester-management`  
**Status:** Ready  
**Created:** 2026-09-29  
**Input:** Admins maintain semesters. A semester has a name, a start date, and an end date. Signed-in students can see semesters so they can choose one later.  
**Depends on:** [Feature 1 — User Authentication & Authorization](feature-1-user-authentication.md)

---

## User Stories

### US-2.1: Create a semester

**As the** admin  
**I want to** create a semester with a name, start date, and end date  
**So that** the system has a semester that later features can use

**Priority:** P1  
**Independent test:** Submit a valid semester as an admin and receive the created semester  
**Acceptance scenarios:** see ### US-2.1 under Acceptance Criteria

### US-2.2: View semesters

**As a** signed-in user  
**I want to** see the list of semesters and open one semester  
**So that** I can find the semester I need

**Priority:** P1  
**Independent test:** Create a semester, then list semesters and open that semester  
**Acceptance scenarios:** see ### US-2.2 under Acceptance Criteria

### US-2.3: Update a semester

**As the** admin  
**I want to** change a semester's name, start date, or end date  
**So that** the semester stays accurate

**Priority:** P1  
**Independent test:** Update a semester as an admin and read it back with the new values  
**Acceptance scenarios:** see ### US-2.3 under Acceptance Criteria

### US-2.4: Delete a semester

**As the** admin  
**I want to** delete a semester  
**So that** a semester that should not be offered is removed

**Priority:** P1  
**Independent test:** Delete a semester as an admin and confirm a later read returns not found  
**Acceptance scenarios:** see ### US-2.4 under Acceptance Criteria

### US-2.5: Restrict semester changes to admins

**As the** application  
**I want to** allow only admins to create, update, or delete semesters  
**So that** students cannot change the semester catalog

**Priority:** P1  
**Independent test:** Call create, update, and delete as a student and as a signed-out user  
**Acceptance scenarios:** see ### US-2.5 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: Semester management MUST use the authenticated user and role from Feature 1.
- **FR-002**: An admin MUST be able to create a semester.
- **FR-003**: A semester MUST store `semesterName`, `startDate`, and `endDate`.
- **FR-004**: `semesterName`, `startDate`, and `endDate` MUST be required.
- **FR-005**: `semesterName` MUST be stored with leading and trailing whitespace removed.
- **FR-006**: A whitespace-only `semesterName` MUST be rejected as missing.
- **FR-007**: `semesterName` MUST be unique. Comparison MUST ignore letter case.
- **FR-008**: The stored `semesterName` MUST keep the casing submitted by the admin after trimming. It MUST NOT be lowercased.
- **FR-009**: `startDate` and `endDate` MUST be calendar dates in `YYYY-MM-DD` form.
- **FR-010**: `endDate` MUST be on or after `startDate`.
- **FR-011**: Successful creation MUST return `201` and the created semester.
- **FR-012**: Invalid semester information MUST return `400` with `{ "message": "..." }` and MUST NOT create or change a semester.
- **FR-013**: A signed-in admin or student MUST be able to list semesters.
- **FR-014**: The semester list MUST be ordered by `startDate` ascending, then by `semesterName` ascending.
- **FR-015**: A signed-in admin or student MUST be able to read one semester by id.
- **FR-016**: A missing semester MUST return `404` with `{ "message": "Semester with id=<id> not found." }`.
- **FR-017**: A non-numeric semester id MUST return `400` with `{ "message": "Semester id must be a number." }`.
- **FR-018**: An admin MUST be able to update `semesterName`, `startDate`, and `endDate`.
- **FR-019**: Update validation MUST use the same rules as creation. A semester MAY keep its current name. Renaming it to a name already used by a different semester MUST return `400`.
- **FR-020**: A successful update MUST return `200` and the updated semester.
- **FR-021**: An admin MUST be able to delete a semester.
- **FR-022**: A successful delete MUST return `200` with `{ "message": "Semester deleted successfully." }`.
- **FR-023**: After a semester is deleted, reading it MUST return `404`.
- **FR-024**: A student MUST NOT create, update, or delete a semester.
- **FR-025**: A student attempt to create, update, or delete a semester MUST return `403` with `{ "message": "Admin role required." }`.
- **FR-026**: A request with no valid session MUST return `401` with `{ "message": "Unauthorized." }`.
- **FR-027**: The Semesters page MUST show create, edit, and delete actions to an admin.
- **FR-028**: The Semesters page MUST NOT show create, edit, or delete actions to a student.
- **FR-029**: An unauthenticated visit to the Semesters page MUST send the user to the Login page.

---

## Assumptions

- Feature 1 authentication is available, including the admin-only check that returns `{ "message": "Admin role required." }`.
- The project slide spells the name field `semsterName`. This specification uses `semesterName`.
- Students may read semesters. Choosing a semester and enrolling belongs to Feature 6.
- No section records exist in this feature, so delete does not check for sections.

---

## Edge Cases

- Missing semester name, start date, or end date → `400`.
- Whitespace-only semester name → `400` with `Semester name is required.`
- Start date or end date that is not `YYYY-MM-DD` → `400`.
- End date before start date → `400`.
- Semester name already used, including a different capitalization → `400`.
- Updating a semester to another semester's name → `400`.
- Updating a semester while keeping its own name → `200`.
- Unknown semester id → `404`.
- Non-numeric semester id → `400` with `Semester id must be a number.`
- Student create, update, or delete → `403`.
- Missing or invalid session → `401`.

---

## Success Criteria

- **SC-001**: An admin can create, view, update, and delete a semester.
- **SC-002**: A signed-in student can list semesters and open one semester.
- **SC-003**: A student cannot create, update, or delete a semester.
- **SC-004**: A signed-out user cannot use the semester API and is sent to Login from the Semesters page.
- **SC-005**: Invalid semester information is rejected and does not change stored data.
- **SC-006**: Every acceptance scenario has an automated test before merge.
- **SC-007**: All automated tests pass before merge.

---

## Data Ownership & Isolation

Semesters are shared catalog records. They are not owned by the admin who created them.

- Create, update, and delete MUST require an authenticated user whose role is `admin`.
- List and read MUST require an authenticated user of either role.
- The client MUST NOT be trusted for the role. The server MUST read the role from the session.
- A student MUST NOT gain admin access by changing the page or the request body.

---

## Key Entities

### Semester

A named term with a start date and an end date. Later features attach sections to a semester. This feature does not create those links.

---

## API Requirements

All paths are under the API mount `/course-t6`.

| Method | Path | Authentication | Success |
|---|---|---|---|
| `POST` | `/course-t6/semesters` | Admin | `201` semester |
| `GET` | `/course-t6/semesters` | Signed-in user | `200` array |
| `GET` | `/course-t6/semesters/:id` | Signed-in user | `200` semester |
| `PUT` | `/course-t6/semesters/:id` | Admin | `200` semester |
| `DELETE` | `/course-t6/semesters/:id` | Admin | `200` message |

A semester response uses these fields:

```json
{
  "id": 1,
  "semesterName": "Fall 2026",
  "startDate": "2026-08-17",
  "endDate": "2026-12-11"
}
```

Create and update accept this body:

```json
{
  "semesterName": "Fall 2026",
  "startDate": "2026-08-17",
  "endDate": "2026-12-11"
}
```

### Semester Errors

| Condition | Status | Message |
|---|---:|---|
| Missing semester name | `400` | `Semester name is required.` |
| Whitespace-only semester name | `400` | `Semester name is required.` |
| Missing start date | `400` | `Start date is required.` |
| Missing end date | `400` | `End date is required.` |
| Invalid start date | `400` | `Enter a valid start date.` |
| Invalid end date | `400` | `Enter a valid end date.` |
| End date before start date | `400` | `End date must be on or after the start date.` |
| Duplicate semester name | `400` | `Semester name is already taken.` |
| Non-numeric id | `400` | `Semester id must be a number.` |
| Unknown id | `404` | `Semester with id=<id> not found.` |
| Student create, update, or delete | `403` | `Admin role required.` |
| No valid session | `401` | `Unauthorized.` |

---

## Screen Requirements

### Semesters Page

Route: `/semesters`  
Route name: `semesters`  
View: `frontend/src/views/Semesters.vue`  
Access: signed-in users only. A signed-out user is sent to the Login page.

The page MUST:

- Load `GET /course-t6/semesters` and show `semesterName`, `startDate`, and `endDate` for each semester.
- Let an admin open a form with Semester name, Start date, and End date.
- Let an admin create a semester and update the semester they chose.
- Let an admin delete a semester.
- Show the API `message` when a request fails.
- Hide create, edit, and delete from a student.
- Still show the semester list to a student.

### MenuBar

The MenuBar MUST show a **Semesters** link to `/semesters` for every signed-in user.

---

## Data Model Requirements

### `semesters` table

| Field | Type/Requirement | Rules |
|---|---|---|
| `id` | Primary key | Auto-generated |
| `semesterName` | String | Required, unique without regard to case, stored trimmed |
| `startDate` | Date only | Required, `YYYY-MM-DD` |
| `endDate` | Date only | Required, `YYYY-MM-DD`, on or after `startDate` |

No foreign keys are added in this feature.

---

## Acceptance Criteria (Gherkin)

### US-2.1 — Create a semester

#### Scenario: Admin creates a semester with valid information

* **Given** I am signed in as an admin
* **When** I submit semester name `Fall 2026`, start date `2026-08-17`, and end date `2026-12-11`
* **Then** the API returns `201`
* **And** the response contains `semesterName` `Fall 2026`, `startDate` `2026-08-17`, and `endDate` `2026-12-11`
* **And** the response contains an `id`

#### Scenario: Admin creates a semester without a required field

* **Given** I am signed in as an admin
* **When** I submit a semester with a required field empty
* **Then** the API returns `400`
* **And** the response contains that field's required message
* **And** no semester is created

#### Scenario: Admin submits a whitespace-only semester name

* **Given** I am signed in as an admin
* **When** I submit a semester name of only spaces with valid dates
* **Then** the API returns `400`
* **And** the response is `{ "message": "Semester name is required." }`
* **And** no semester is created

#### Scenario: Admin submits an invalid date

* **Given** I am signed in as an admin
* **When** I submit start date `August 17, 2026` and a valid end date
* **Then** the API returns `400`
* **And** the response is `{ "message": "Enter a valid start date." }`
* **And** no semester is created

#### Scenario: Admin submits an end date before the start date

* **Given** I am signed in as an admin
* **When** I submit start date `2026-12-11` and end date `2026-08-17`
* **Then** the API returns `400`
* **And** the response is `{ "message": "End date must be on or after the start date." }`
* **And** no semester is created

#### Scenario: Admin creates a semester with an existing name

* **Given** a semester named `Fall 2026` already exists
* **And** I am signed in as an admin
* **When** I submit semester name `fall 2026` with valid dates
* **Then** the API returns `400`
* **And** the response is `{ "message": "Semester name is already taken." }`
* **And** no new semester is created

---

### US-2.2 — View semesters

#### Scenario: Signed-in user views the semester list

* **Given** I am signed in
* **And** a semester named `Spring 2026` has start date `2026-01-12`
* **And** a semester named `Summer 2026` has start date `2026-01-12`
* **And** a semester named `Fall 2026` has start date `2026-08-17`
* **And** a semester named `Winter 2027` has start date `2027-01-11`
* **When** I request the semester list
* **Then** the API returns `200`
* **And** the names are in this order: `Spring 2026`, `Summer 2026`, `Fall 2026`, `Winter 2027`

#### Scenario: Signed-in user views one semester

* **Given** I am signed in
* **And** a semester exists
* **When** I request that semester by id
* **Then** the API returns `200`
* **And** the response `id` is the semester I requested

#### Scenario: User requests a semester that does not exist

* **Given** I am signed in
* **When** I request semester id `99999`
* **Then** the API returns `404`
* **And** the response is `{ "message": "Semester with id=99999 not found." }`

#### Scenario: User requests a semester id that is not a number

* **Given** I am signed in
* **When** I request semester id `abc`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Semester id must be a number." }`

---

### US-2.3 — Update a semester

#### Scenario: Admin updates a semester

* **Given** I am signed in as an admin
* **And** a semester exists
* **When** I update that semester to name `Spring 2027`, start date `2027-01-11`, and end date `2027-05-07`
* **Then** the API returns `200`
* **And** a later read returns those new values

#### Scenario: Admin keeps a semester's current name

* **Given** I am signed in as an admin
* **And** a semester named `Fall 2026` exists
* **When** I save that semester with semester name `Fall 2026` and valid dates
* **Then** the API returns `200`
* **And** the stored semester name is still `Fall 2026`

#### Scenario: Admin renames a semester to another semester's name

* **Given** I am signed in as an admin
* **And** semesters named `Fall 2026` and `Spring 2027` exist
* **When** I rename `Spring 2027` to `fall 2026`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Semester name is already taken." }`
* **And** the stored name of `Spring 2027` is unchanged

#### Scenario: Admin updates a semester without a required field

* **Given** I am signed in as an admin
* **And** a semester exists
* **When** I update that semester with an empty semester name
* **Then** the API returns `400`
* **And** the response is `{ "message": "Semester name is required." }`
* **And** the stored semester is unchanged

#### Scenario: Admin updates a semester that does not exist

* **Given** I am signed in as an admin
* **When** I update semester id `99999` with valid information
* **Then** the API returns `404`
* **And** the response is `{ "message": "Semester with id=99999 not found." }`

---

### US-2.4 — Delete a semester

#### Scenario: Admin deletes a semester

* **Given** I am signed in as an admin
* **And** a semester exists
* **When** I delete that semester
* **Then** the API returns `200`
* **And** the response is `{ "message": "Semester deleted successfully." }`

#### Scenario: Deleted semester is no longer returned

* **Given** I am signed in as an admin
* **And** I have deleted a semester
* **When** I request that semester by id
* **Then** the API returns `404`
* **And** the response contains `not found`

#### Scenario: Admin deletes a semester that does not exist

* **Given** I am signed in as an admin
* **When** I delete semester id `99999`
* **Then** the API returns `404`
* **And** the response is `{ "message": "Semester with id=99999 not found." }`

---

### US-2.5 — Restrict semester changes to admins

#### Scenario: Student cannot create a semester

* **Given** I am signed in as a student
* **When** I submit a valid semester
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`
* **And** no semester is created

#### Scenario: Student cannot update a semester

* **Given** I am signed in as a student
* **And** a semester exists
* **When** I update that semester with valid information
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`
* **And** the stored semester is unchanged

#### Scenario: Student cannot delete a semester

* **Given** I am signed in as a student
* **And** a semester exists
* **When** I delete that semester
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`
* **And** the semester still exists

#### Scenario: Student can view semesters

* **Given** I am signed in as a student
* **And** a semester exists
* **When** I request the semester list and that semester by id
* **Then** both requests return `200`

#### Scenario: Unauthenticated user cannot use semester endpoints

* **Given** I am not signed in
* **When** I request the semester list, one semester, create, update, or delete
* **Then** each request returns `401`
* **And** the response is `{ "message": "Unauthorized." }`

#### Scenario: Admin sees semester change actions

* **Given** I am signed in as an admin
* **When** I open the Semesters page
* **Then** I see create, edit, and delete actions

#### Scenario: Signed-in user sees the Semesters link

* **Given** I am signed in
* **When** I view the menu
* **Then** I see a Semesters link to the Semesters page

#### Scenario: Student does not see semester change actions

* **Given** I am signed in as a student
* **When** I open the Semesters page
* **Then** I see the semester list
* **And** I do not see create, edit, or delete actions

#### Scenario: Signed-out user is sent to Login

* **Given** I am not signed in
* **When** I open the Semesters page
* **Then** I am sent to the Login page

---

## Test Coverage Map

Each scenario MUST map to at least one automated test.

| Story | Scenario | Test File | Test Name |
|---|---|---|---|
| US-2.1 | Admin creates a semester with valid information | `backend/tests/semester.test.js` | `Admin creates a semester with valid information` |
| US-2.1 | Admin creates a semester without a required field | `backend/tests/semester.test.js` | `Admin creates a semester without a required field` |
| US-2.1 | Admin submits a whitespace-only semester name | `backend/tests/semester.test.js` | `Admin submits a whitespace-only semester name` |
| US-2.1 | Admin submits an invalid date | `backend/tests/semester.test.js` | `Admin submits an invalid date` |
| US-2.1 | Admin submits an end date before the start date | `backend/tests/semester.test.js` | `Admin submits an end date before the start date` |
| US-2.1 | Admin creates a semester with an existing name | `backend/tests/semester.test.js` | `Admin creates a semester with an existing name` |
| US-2.2 | Signed-in user views the semester list | `backend/tests/semester.test.js` | `Signed-in user views the semester list` |
| US-2.2 | Signed-in user views one semester | `backend/tests/semester.test.js` | `Signed-in user views one semester` |
| US-2.2 | User requests a semester that does not exist | `backend/tests/semester.test.js` | `User requests a semester that does not exist` |
| US-2.2 | User requests a semester id that is not a number | `backend/tests/semester.test.js` | `User requests a semester id that is not a number` |
| US-2.3 | Admin updates a semester | `backend/tests/semester.test.js` | `Admin updates a semester` |
| US-2.3 | Admin keeps a semester's current name | `backend/tests/semester.test.js` | `Admin keeps a semester's current name` |
| US-2.3 | Admin renames a semester to another semester's name | `backend/tests/semester.test.js` | `Admin renames a semester to another semester's name` |
| US-2.3 | Admin updates a semester without a required field | `backend/tests/semester.test.js` | `Admin updates a semester without a required field` |
| US-2.3 | Admin updates a semester that does not exist | `backend/tests/semester.test.js` | `Admin updates a semester that does not exist` |
| US-2.4 | Admin deletes a semester | `backend/tests/semester.test.js` | `Admin deletes a semester` |
| US-2.4 | Deleted semester is no longer returned | `backend/tests/semester.test.js` | `Deleted semester is no longer returned` |
| US-2.4 | Admin deletes a semester that does not exist | `backend/tests/semester.test.js` | `Admin deletes a semester that does not exist` |
| US-2.5 | Student cannot create a semester | `backend/tests/semester.test.js` | `Student cannot create a semester` |
| US-2.5 | Student cannot update a semester | `backend/tests/semester.test.js` | `Student cannot update a semester` |
| US-2.5 | Student cannot delete a semester | `backend/tests/semester.test.js` | `Student cannot delete a semester` |
| US-2.5 | Student can view semesters | `backend/tests/semester.test.js` | `Student can view semesters` |
| US-2.5 | Unauthenticated user cannot use semester endpoints | `backend/tests/semester.test.js` | `Unauthenticated user cannot use semester endpoints` |
| US-2.5 | Admin sees semester change actions | `frontend/tests/Semesters.test.js` | `Admin sees semester change actions` |
| US-2.5 | Signed-in user sees the Semesters link | `frontend/tests/Semesters.test.js` | `Signed-in user sees the Semesters link` |
| US-2.5 | Student does not see semester change actions | `frontend/tests/Semesters.test.js` | `Student does not see semester change actions` |
| US-2.5 | Signed-out user is sent to Login | `frontend/tests/Semesters.test.js` | `Signed-out user is sent to Login` |

---

## Agent Implementation Request

Use the following prompt when asking the implementation agent to implement this feature:

```text
Implement Feature 2 from @features/feature-2-semester-management.md.

Only implement what is defined in this specification.

Follow the structure, architecture, API conventions, coding conventions, and best practices already established in the project.

Semester routes must be:
POST /course-t6/semesters
GET /course-t6/semesters
GET /course-t6/semesters/:id
PUT /course-t6/semesters/:id
DELETE /course-t6/semesters/:id

Use the field name semesterName. Do not use the slide spelling semsterName.

Create, update, and delete require an admin. List and read require any signed-in user.

Map every acceptance scenario in the Test Coverage Map to at least one automated test.

Use the exact test file paths and test names listed in the Test Coverage Map.

Do not add courses, faculty, sections, enrollment, or student management.

If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.

Do not implement behavior not in this spec.
```

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`

---

## Definition of Done

- [ ] Admins can create a semester with name, start date, and end date.
- [ ] Signed-in users can list semesters and open one semester.
- [ ] Admins can update a semester.
- [ ] Admins can delete a semester.
- [ ] Students receive `403` with `Admin role required.` on create, update, and delete.
- [ ] Students can still list and open semesters.
- [ ] Signed-out API calls return `401`.
- [ ] Signed-out users who open `/semesters` are sent to Login.
- [ ] Required fields, dates, date order, and duplicate names return the specified `400` messages.
- [ ] Unknown ids return the specified `404` message.
- [ ] The Semesters page hides create, edit, and delete from students.
- [ ] The MenuBar links signed-in users to Semesters.
- [ ] The database field is `semesterName`, not `semsterName`.
- [ ] Every acceptance scenario has an automated test.
- [ ] All tests pass.
- [ ] `features/reference/api.md` is updated.
- [ ] `features/reference/data-model.md` is updated.
- [ ] `features/reference/behavior.md` is updated.
- [ ] `features/README.md` links Feature 2 to this file.
- [ ] Nothing outside this specification is implemented.

---

## Out of Scope

- Course records → [Feature 3](feature-3-course-management.md)
- Faculty records → [Feature 4](feature-4-faculty-management.md)
- Sections, including blocking delete when a section uses the semester → [Feature 5](feature-5-section-management.md)
- A student choosing a semester and enrolling → [Feature 6](feature-6-enrollment-management.md)
- Student course listing → [Feature 7](feature-7-student-course-listing.md)
- Adding or editing student accounts → [Feature 9](feature-9-student-management.md)
