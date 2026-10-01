# Feature: Section Management

**Feature ID:** 5  
**Branch pattern:** `feature/5-section-management`  
**Status:** Ready  
**Created:** 2026-09-30  
**Input:** Allow admins to manage the sections offered in the Courses Management System. A section has a section number, a semester, a course, a faculty member who teaches it, the days of the week it meets, a start time, and an end time.  
**Depends on:** [Feature 1 — User Authentication & Authorization](feature-1-user-authentication-authorization.md), [Feature 2 — Semester Management](feature-2-semester-management.md), [Feature 3 — Course Management](feature-3-course-management.md), [Feature 4 — Faculty Management](feature-4-faculty-management.md)

---

## User Stories

Every story is P1: each one must ship for the assignment's Section Management (CRUD) feature, and Feature 6 cannot enroll students without sections.

### US-5.1: Add a section

**As a** signed-in admin  
**I want to** add a section of a course for a semester  
**So that** students can later enroll in it

**Priority:** P1  
**Independent test:** Sign in as an admin, submit a valid section with an existing semester, course, and faculty member, and verify the section is created  
**Acceptance scenarios:** see ### US-5.1 under Acceptance Criteria

### US-5.2: View sections

**As a** signed-in user  
**I want to** view sections  
**So that** I can see which sections are offered and who teaches them

**Priority:** P1  
**Independent test:** Create sections, then list them as an admin and as a student and verify each section includes its semester, course, and instructor information  
**Acceptance scenarios:** see ### US-5.2 under Acceptance Criteria

### US-5.3: Edit a section

**As a** signed-in admin  
**I want to** edit a section's information  
**So that** section records stay accurate

**Priority:** P1  
**Independent test:** Sign in as an admin, update an existing section, and verify the new values are saved  
**Acceptance scenarios:** see ### US-5.3 under Acceptance Criteria

### US-5.4: Delete a section

**As a** signed-in admin  
**I want to** delete a section  
**So that** students cannot enroll in a section that is no longer offered

**Priority:** P1  
**Independent test:** Sign in as an admin, delete an existing section, and verify the section no longer appears in the section list  
**Acceptance scenarios:** see ### US-5.4 under Acceptance Criteria

### US-5.5: Restrict section changes to admins

**As the** application  
**I want to** allow only admins to add, edit, or delete sections  
**So that** students cannot change the sections that are offered

**Priority:** P1  
**Independent test:** Send add, edit, and delete section requests as a student and as an unauthenticated user and verify `403` and `401` respectively  
**Acceptance scenarios:** see ### US-5.5 under Acceptance Criteria

### US-5.6: Keep sections linked to their semester, course, and faculty member

**As the** application  
**I want to** prevent deleting a semester, course, or faculty member that a section uses  
**So that** no section is left without its semester, course, or instructor

**Priority:** P1  
**Independent test:** Create a section, try to delete its semester, course, and faculty member as an admin, and verify each delete is rejected and the section still exists  
**Acceptance scenarios:** see ### US-5.6 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: The system MUST allow an admin to add a section.
- **FR-002**: A section MUST have a `sectionNumber`, `semesterId`, `courseId`, `facultyId`, `daysOfWeek`, `startTime`, and `endTime`.
- **FR-003**: Every section field MUST be required.
- **FR-004**: Required section fields MUST reject empty values.
- **FR-005**: `sectionNumber` and `daysOfWeek` MUST reject whitespace-only values.
- **FR-006**: `sectionNumber` and `daysOfWeek` MUST be free text with no required format beyond being a required value.
- **FR-007**: `semesterId`, `courseId`, and `facultyId` MUST be numbers.
- **FR-008**: `semesterId`, `courseId`, and `facultyId` MUST each reference an existing semester, course, and faculty member.
- **FR-009**: `startTime` and `endTime` MUST use the 24-hour `HH:MM` format.
- **FR-010**: Invalid section information MUST return `400` or `404` with a `{ "message": "..." }` response.
- **FR-011**: Invalid section information MUST NOT create or change a section.
- **FR-012**: The system MUST allow any signed-in user to view all sections.
- **FR-013**: The section list MUST accept an optional `semesterId` query parameter that returns only the sections of that semester.
- **FR-014**: A `semesterId` query parameter that is not a number MUST return `400` with `{ "message": "Semester id must be a number." }`.
- **FR-015**: The section list MUST be sorted by the semester's `startDate` ascending, then the course's `courseNumber` ascending, then `sectionNumber` ascending.
- **FR-016**: Every section returned by the API MUST include its semester's `semesterName`, its course's `courseNumber` and `courseName`, and its faculty member's `firstName` and `lastName`.
- **FR-017**: The system MUST allow an admin to edit every section field.
- **FR-018**: Editing a section MUST require every field and apply the same validation rules as adding.
- **FR-019**: The system MUST allow an admin to delete a section.
- **FR-020**: Deleting a section MUST return `200` with `{ "message": "Section deleted successfully." }`.
- **FR-021**: Editing or deleting a section id that does not exist MUST return `404` with `{ "message": "Section with id=<id> not found." }`.
- **FR-022**: A section id that is not a number MUST return `400` with `{ "message": "Section id must be a number." }`.
- **FR-023**: Every section endpoint MUST use the Feature 1 authentication check.
- **FR-024**: The add, edit, and delete section endpoints MUST use the Feature 1 admin-only authorization check.
- **FR-025**: An unauthenticated section request MUST return `401` with `{ "message": "Unauthorized." }`.
- **FR-026**: An add, edit, or delete section request from an authenticated student MUST return `403` with `{ "message": "Admin role required." }`.
- **FR-027**: Deleting a semester that has sections MUST return `400` with `{ "message": "Semester has sections and cannot be deleted." }`.
- **FR-028**: Deleting a course that has sections MUST return `400` with `{ "message": "Course has sections and cannot be deleted." }`.
- **FR-029**: Deleting a faculty member who has sections MUST return `400` with `{ "message": "Faculty member has sections and cannot be deleted." }`.
- **FR-030**: A rejected semester, course, or faculty member delete MUST NOT delete any record.
- **FR-031**: The Sections page MUST be available only to authenticated admins.
- **FR-032**: The MenuBar MUST show a **Sections** link to admins only.
- **FR-033**: When a section request fails without an API message, the Sections page MUST show `Request failed.`

---

## Assumptions

- Feature 1 authentication and the admin-only authorization check are on `dev`.
- Feature 2 provides the `semesters` table with `id`, `semesterName`, `startDate`, and `endDate`, and `GET /course-t6/semesters` for any signed-in user.
- Feature 3 provides the `courses` table with `id`, `courseNumber`, and `courseName`, and `GET /course-t6/courses` for admins.
- Feature 4 provides the `faculty` table with `id`, `firstName`, and `lastName`, and `GET /course-t6/faculty` for admins.
- The project slide names the instructor field `facultyId`. This specification uses `facultyId`.
- Only admins add, edit, and delete sections.
- Students read sections so they can enroll in them in Feature 6.
- Feature 4 allows only admins to read faculty members, so students cannot read faculty records directly.
- A section meets on the same days at the same start and end time every week.
- `daysOfWeek` is stored as the text the admin enters, for example `MWF` or `TR`.
- Deleting a section is permanent.
- Features 2, 3, and 4 do not check for sections when deleting, because sections did not exist yet. Feature 5 adds those checks because it introduces the link.
- What happens to enrollments when a section is deleted is defined by [Feature 6](feature-6-enrollment-management.md).

---

## Edge Cases

- Missing required section field → `400`.
- Whitespace-only `sectionNumber` or `daysOfWeek` → `400`.
- `semesterId`, `courseId`, or `facultyId` that is not a number → `400`.
- `semesterId`, `courseId`, or `facultyId` that does not exist → `404`.
- `startTime` or `endTime` not in `HH:MM` format → `400`.
- Section id that does not exist on `PUT` or `DELETE` → `404`.
- Section id that is not a number on `PUT` or `DELETE` → `400`.
- `semesterId` query parameter that is not a number → `400`.
- No sections exist → the list returns an empty array and the Sections page shows an empty-state message.
- A section request fails without an API message → the Sections page shows `Request failed.`
- Admin deletes a semester, course, or faculty member that a section uses → `400`, nothing is deleted.
- Authenticated student sends an add, edit, or delete section request → `403`.
- Unauthenticated section request → `401`.
- Student navigates to the Sections page → sent to the Home page.
- Unauthenticated user navigates to the Sections page → sent to the Login page.

---

## Success Criteria

- **SC-001**: An admin can add a section with a section number, semester, course, faculty member, days of the week, start time, and end time.
- **SC-002**: Any signed-in user can view all sections, or only the sections of one semester.
- **SC-003**: Every section returned includes its semester name, course number and name, and instructor name.
- **SC-004**: An admin can edit a section.
- **SC-005**: An admin can delete a section.
- **SC-006**: Invalid section information is rejected and does not create or change a section.
- **SC-007**: An authenticated student cannot add, edit, or delete sections.
- **SC-008**: An unauthenticated user cannot view, add, edit, or delete sections.
- **SC-009**: A semester, course, or faculty member that a section uses cannot be deleted.
- **SC-010**: Every acceptance scenario has an automated test before merge.
- **SC-011**: All automated tests pass before merge.
- **SC-012**: Nothing outside this feature is implemented.

---

## Data Ownership & Isolation

Sections are shared institutional records, not owned by an individual user.

- Every admin MUST be able to view and manage every section.
- Every signed-in student MUST be able to view every section but MUST NOT be able to add, edit, or delete sections.
- Authorization MUST use the authenticated user's role from the Feature 1 session, not a value sent by the client.
- Hiding the Sections link or page on the client MUST NOT be the only protection; the API MUST enforce the admin-only check on add, edit, and delete.

---

## Key Entities

### Section

A specific offering of a course in a semester, taught by a faculty member.

A Section has:

- A section number
- A semester
- A course
- A faculty member who teaches it
- The days of the week it meets
- A start time
- An end time

A Section belongs to one Semester ([Feature 2](feature-2-semester-management.md)), one Course ([Feature 3](feature-3-course-management.md)), and one Faculty Member ([Feature 4](feature-4-faculty-management.md)).

Later features relate Sections to student enrollments ([Feature 6](feature-6-enrollment-management.md)).

---

## API Requirements

All section endpoints are mounted under `/course-t6/sections`.

All section endpoints require:

- **Authentication:** Required (Feature 1 authentication check)

The add, edit, and delete endpoints also require:

- **Authorization:** Admin only (Feature 1 admin-only authorization check)

### Section Response

Every endpoint that returns a section MUST return these fields:

```json
{
  "id": 1,
  "sectionNumber": "01",
  "semesterId": 2,
  "courseId": 3,
  "facultyId": 4,
  "daysOfWeek": "MWF",
  "startTime": "09:00",
  "endTime": "09:50",
  "semester": { "id": 2, "semesterName": "Fall 2026" },
  "course": { "id": 3, "courseNumber": "CMSC 4113", "courseName": "Software Engineering IV" },
  "faculty": { "id": 4, "firstName": "Ada", "lastName": "Lovelace" },
  "createdAt": "2026-09-30T20:15:00.000Z",
  "updatedAt": "2026-09-30T20:15:00.000Z"
}
```

### List Sections

**Endpoint:** `GET /course-t6/sections`

**Authorization:** Any signed-in user

**Purpose:** Return every section, or only the sections of one semester.

**Optional query parameter:** `semesterId` — return only the sections of that semester.

**Success:** `200 OK`

Returns an array of section responses sorted by the semester's `startDate` ascending, then the course's `courseNumber` ascending, then `sectionNumber` ascending. Returns `[]` when no sections match.

### Add a Section

**Endpoint:** `POST /course-t6/sections`

**Authorization:** Admin only

**Purpose:** Create a section.

**Request body:**

```json
{
  "sectionNumber": "01",
  "semesterId": 2,
  "courseId": 3,
  "facultyId": 4,
  "daysOfWeek": "MWF",
  "startTime": "09:00",
  "endTime": "09:50"
}
```

**Success:** `201 Created` with the created section response.

### Edit a Section

**Endpoint:** `PUT /course-t6/sections/:id`

**Authorization:** Admin only

**Purpose:** Replace a section's information.

**Request body:**

```json
{
  "sectionNumber": "02",
  "semesterId": 2,
  "courseId": 3,
  "facultyId": 5,
  "daysOfWeek": "TR",
  "startTime": "13:00",
  "endTime": "14:15"
}
```

**Success:** `200 OK` with the updated section response.

### Delete a Section

**Endpoint:** `DELETE /course-t6/sections/:id`

**Authorization:** Admin only

**Purpose:** Permanently delete a section.

**Success:** `200 OK`

```json
{
  "message": "Section deleted successfully."
}
```

### Changes to Feature 2, 3, and 4 Delete Endpoints

| Endpoint | Condition | Status | Message |
|---|---|---:|---|
| `DELETE /course-t6/semesters/:id` | Semester has sections | `400` | `Semester has sections and cannot be deleted.` |
| `DELETE /course-t6/courses/:id` | Course has sections | `400` | `Course has sections and cannot be deleted.` |
| `DELETE /course-t6/faculty/:id` | Faculty member has sections | `400` | `Faculty member has sections and cannot be deleted.` |

Every other behavior of these endpoints stays as defined by Features 2, 3, and 4.

### Section Errors

All section errors MUST return:

```json
{
  "message": "Human-readable explanation."
}
```

| Condition | Endpoints | Status | Message |
|---|---|---:|---|
| Missing section number | `POST`, `PUT` | `400` | `Section number is required.` |
| Missing semester id | `POST`, `PUT` | `400` | `Semester id is required.` |
| Missing course id | `POST`, `PUT` | `400` | `Course id is required.` |
| Missing faculty member id | `POST`, `PUT` | `400` | `Faculty member id is required.` |
| Missing days of week | `POST`, `PUT` | `400` | `Days of week is required.` |
| Missing start time | `POST`, `PUT` | `400` | `Start time is required.` |
| Missing end time | `POST`, `PUT` | `400` | `End time is required.` |
| Whitespace-only section number or days of week | `POST`, `PUT` | `400` | Field-specific required message |
| Semester id is not a number | `GET` (query), `POST`, `PUT` | `400` | `Semester id must be a number.` |
| Course id is not a number | `POST`, `PUT` | `400` | `Course id must be a number.` |
| Faculty member id is not a number | `POST`, `PUT` | `400` | `Faculty member id must be a number.` |
| Semester does not exist | `POST`, `PUT` | `404` | `Semester with id=<id> not found.` |
| Course does not exist | `POST`, `PUT` | `404` | `Course with id=<id> not found.` |
| Faculty member does not exist | `POST`, `PUT` | `404` | `Faculty member with id=<id> not found.` |
| Start time not in `HH:MM` format | `POST`, `PUT` | `400` | `Start time must be in HH:MM format.` |
| End time not in `HH:MM` format | `POST`, `PUT` | `400` | `End time must be in HH:MM format.` |
| Section id is not a number | `PUT`, `DELETE` | `400` | `Section id must be a number.` |
| Section id does not exist | `PUT`, `DELETE` | `404` | `Section with id=<id> not found.` |
| No valid session | All | `401` | `Unauthorized.` |
| Authenticated student | `POST`, `PUT`, `DELETE` | `403` | `Admin role required.` |

---

## Screen Requirements

### Sections Page

**Route:** `/sections`  
**Route name:** `sections`

The Sections page MUST:

- Be available only to authenticated admins.
- Display a **Sections** heading.
- Display an **Add Section** primary button.
- Display sections in a table with **Semester**, **Course**, **Section**, **Instructor**, **Days**, and **Time** columns, sorted as returned by the API.
- Show the course as `<courseNumber> <courseName>`, the instructor as `<firstName> <lastName>`, and the time as `<startTime>–<endTime>`.
- Provide **Edit** and **Delete** actions for each section.
- Delete the section and refresh the section list when **Delete** is selected.
- Show a loading state while sections load.
- Show `No sections yet.` when no sections exist.
- Show the API error message when a section request fails, or `Request failed.` when the API gives no message.

### Add / Edit Section Dialog

The dialog MUST:

- Use the title **Add Section** when adding and **Edit Section** when editing.
- Provide a **Semester** select listing semesters from Feature 2.
- Provide a **Course** select listing courses from Feature 3.
- Provide an **Instructor** select listing faculty members from Feature 4 as `<firstName> <lastName>`.
- Provide **Section number** and **Days of week** text fields.
- Provide **Start time** and **End time** time fields.
- Pre-fill the fields with the section's current values when editing.
- Validate that every field is filled in, that text fields are not whitespace-only, and that times use the `HH:MM` format before submitting, using the same messages as the API.
- Display API validation errors.
- Provide **Save** and **Cancel** buttons.
- Close and refresh the section list after a successful save.
- Close without saving when **Cancel** is selected.

### MenuBar

The MenuBar MUST:

- Display a **Sections** link to authenticated admins that opens the Sections page.
- NOT display the **Sections** link to students.

### Protected Pages

- An unauthenticated user attempting to open the Sections page MUST be sent to the Login page.
- An authenticated student attempting to open the Sections page MUST be sent to the Home page.

---

## Data Model Requirements

### `sections` table

| Field | Type/Requirement | Rules |
|---|---|---|
| `id` | Primary key | Auto-generated |
| `sectionNumber` | String | Required |
| `semesterId` | Foreign key | Required, references `semesters.id` |
| `courseId` | Foreign key | Required, references `courses.id` |
| `facultyId` | Foreign key | Required, references `faculty.id` |
| `daysOfWeek` | String | Required |
| `startTime` | Time | Required, returned as `HH:MM` |
| `endTime` | Time | Required, returned as `HH:MM` |
| `createdAt` | Timestamp | Automatically generated |
| `updatedAt` | Timestamp | Automatically generated |

### Constraints

- Deleting a semester, course, or faculty member that a section references MUST be prevented (`ON DELETE RESTRICT` on `semesterId`, `courseId`, and `facultyId`).

### Associations

- A section belongs to one semester (`semesterId`), one course (`courseId`), and one faculty member (`facultyId`).
- A semester has many sections.
- A course has many sections.
- A faculty member has many sections.
- The model and its associations MUST be registered in `backend/app/models/index.js`.

---

## Acceptance Criteria (Gherkin)

### US-5.1 — Add a section

#### Scenario: Admin adds a section successfully

* **Given** I am signed in as an admin
* **And** a semester, a course, and a faculty member exist
* **When** I provide a section number, the semester, the course, the faculty member, days of the week, a start time, and an end time
* **And** I submit the Add Section form
* **Then** the API returns `201`
* **And** the response contains the new section with its semester name, course number and name, and instructor name
* **And** the section appears in the section list

#### Scenario: Admin adds a section without a required field

* **Given** I am signed in as an admin
* **When** I leave a required section field empty
* **And** I submit the Add Section form
* **Then** the API returns `400`
* **And** the response contains the required-field message
* **And** no section is created

#### Scenario: Admin submits whitespace-only section information

* **Given** I am signed in as an admin
* **When** I provide only whitespace for the section number or days of the week
* **And** I submit the Add Section form
* **Then** the API returns `400`
* **And** the response contains the required-field message
* **And** no section is created

#### Scenario: Admin adds a section with a semester id that is not a number

* **Given** I am signed in as an admin
* **When** I send `POST /course-t6/sections` with `semesterId` set to `abc` and every other field valid
* **Then** the API returns `400`
* **And** the response is `{ "message": "Semester id must be a number." }`
* **And** no section is created

#### Scenario: Admin adds a section with a course id that is not a number

* **Given** I am signed in as an admin
* **When** I send `POST /course-t6/sections` with `courseId` set to `abc` and every other field valid
* **Then** the API returns `400`
* **And** the response is `{ "message": "Course id must be a number." }`
* **And** no section is created

#### Scenario: Admin adds a section with a faculty member id that is not a number

* **Given** I am signed in as an admin
* **When** I send `POST /course-t6/sections` with `facultyId` set to `abc` and every other field valid
* **Then** the API returns `400`
* **And** the response is `{ "message": "Faculty member id must be a number." }`
* **And** no section is created

#### Scenario: Admin adds a section for a semester that does not exist

* **Given** I am signed in as an admin
* **And** no semester with id `999` exists
* **When** I send `POST /course-t6/sections` with `semesterId` set to `999` and every other field valid
* **Then** the API returns `404`
* **And** the response is `{ "message": "Semester with id=999 not found." }`
* **And** no section is created

#### Scenario: Admin adds a section for a course that does not exist

* **Given** I am signed in as an admin
* **And** no course with id `999` exists
* **When** I send `POST /course-t6/sections` with `courseId` set to `999` and every other field valid
* **Then** the API returns `404`
* **And** the response is `{ "message": "Course with id=999 not found." }`
* **And** no section is created

#### Scenario: Admin adds a section for a faculty member that does not exist

* **Given** I am signed in as an admin
* **And** no faculty member with id `999` exists
* **When** I send `POST /course-t6/sections` with `facultyId` set to `999` and every other field valid
* **Then** the API returns `404`
* **And** the response is `{ "message": "Faculty member with id=999 not found." }`
* **And** no section is created

#### Scenario: Admin adds a section with a time that is not in HH:MM format

* **Given** I am signed in as an admin
* **When** I provide the start time `9am`
* **And** I submit the Add Section form
* **Then** the API returns `400`
* **And** the response is `{ "message": "Start time must be in HH:MM format." }`
* **And** no section is created

---

### US-5.2 — View sections

#### Scenario: Admin views the section list

* **Given** I am signed in as an admin
* **And** sections exist
* **When** I open the Sections page
* **Then** the API returns `200`
* **And** I see every section's semester, course, section number, instructor, days, and time
* **And** the sections are sorted by semester start date, then course number, then section number

#### Scenario: Admin views the section list when no sections exist

* **Given** I am signed in as an admin
* **And** no sections exist
* **When** I open the Sections page
* **Then** the API returns `200` with an empty list
* **And** I see `No sections yet.`

#### Scenario: Sections page shows a loading state while sections load

* **Given** I am signed in as an admin
* **And** the sections request will not finish right away
* **When** I open the Sections page
* **Then** a loading state is shown until the sections arrive

#### Scenario: Sections page shows the API error when sections fail to load

* **Given** I am signed in as an admin
* **And** the sections request will fail with an error message
* **When** I open the Sections page
* **Then** the page shows the error message returned by the API

#### Scenario: Sections page shows a fallback error when the API gives no message

* **Given** I am signed in as an admin
* **And** the sections request will fail without an error message
* **When** I open the Sections page
* **Then** the page shows `Request failed.`

#### Scenario: Student views the sections of a semester

* **Given** I am signed in as a student
* **And** sections exist in semesters `1` and `2`
* **When** I send `GET /course-t6/sections?semesterId=1`
* **Then** the API returns `200`
* **And** the response contains only the sections of semester `1`
* **And** each section includes its course number and name, section number, days, times, and instructor name

#### Scenario: User filters sections by a semester id that is not a number

* **Given** I am signed in
* **When** I send `GET /course-t6/sections?semesterId=abc`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Semester id must be a number." }`

---

### US-5.3 — Edit a section

#### Scenario: Admin edits a section successfully

* **Given** I am signed in as an admin
* **And** a section exists
* **When** I change the section's information
* **And** I submit the Edit Section form
* **Then** the API returns `200`
* **And** the response contains the updated values
* **And** the section list shows the updated values

#### Scenario: Admin edits a section without a required field

* **Given** I am signed in as an admin
* **And** a section exists
* **When** I clear a required section field
* **And** I submit the Edit Section form
* **Then** the API returns `400`
* **And** the response contains the required-field message
* **And** the section is not changed

#### Scenario: Admin edits a section that does not exist

* **Given** I am signed in as an admin
* **And** no section with id `999` exists
* **When** I send `PUT /course-t6/sections/999` with valid section information
* **Then** the API returns `404`
* **And** the response is `{ "message": "Section with id=999 not found." }`

#### Scenario: Admin edits a section with an id that is not a number

* **Given** I am signed in as an admin
* **When** I send `PUT /course-t6/sections/abc` with valid section information
* **Then** the API returns `400`
* **And** the response is `{ "message": "Section id must be a number." }`

---

### US-5.4 — Delete a section

#### Scenario: Admin deletes a section successfully

* **Given** I am signed in as an admin
* **And** a section exists
* **When** I select **Delete** for that section
* **Then** the API returns `200`
* **And** the response is `{ "message": "Section deleted successfully." }`
* **And** the section no longer appears in the section list

#### Scenario: Admin deletes a section that does not exist

* **Given** I am signed in as an admin
* **And** no section with id `999` exists
* **When** I send `DELETE /course-t6/sections/999`
* **Then** the API returns `404`
* **And** the response is `{ "message": "Section with id=999 not found." }`

#### Scenario: Admin deletes a section with an id that is not a number

* **Given** I am signed in as an admin
* **When** I send `DELETE /course-t6/sections/abc`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Section id must be a number." }`

---

### US-5.5 — Restrict section changes to admins

#### Scenario: Student cannot add, edit, or delete sections

* **Given** I am signed in as a student
* **When** I send `POST /course-t6/sections`, `PUT /course-t6/sections/1`, or `DELETE /course-t6/sections/1`
* **Then** each request returns `403`
* **And** each response is `{ "message": "Admin role required." }`
* **And** no section is created, changed, or deleted

#### Scenario: Unauthenticated user cannot view or manage sections

* **Given** I am not logged in
* **When** I send `GET /course-t6/sections`, `POST /course-t6/sections`, `PUT /course-t6/sections/1`, or `DELETE /course-t6/sections/1`
* **Then** each request returns `401`
* **And** each response is `{ "message": "Unauthorized." }`
* **And** no section is created, changed, or deleted

#### Scenario: Student cannot open the Sections page

* **Given** I am signed in as a student
* **When** I navigate to `/sections`
* **Then** I am sent to the Home page

#### Scenario: Unauthenticated user cannot open the Sections page

* **Given** I am not logged in
* **When** I navigate to `/sections`
* **Then** I am sent to the Login page

#### Scenario: Admin sees the Sections link in the MenuBar

* **Given** I am signed in as an admin
* **When** I view the MenuBar
* **Then** the **Sections** link is displayed

#### Scenario: Student does not see the Sections link in the MenuBar

* **Given** I am signed in as a student
* **When** I view the MenuBar
* **Then** the **Sections** link is not displayed

---

### US-5.6 — Keep sections linked to their semester, course, and faculty member

#### Scenario: Admin cannot delete a semester that has sections

* **Given** I am signed in as an admin
* **And** semester `1` has a section
* **When** I send `DELETE /course-t6/semesters/1`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Semester has sections and cannot be deleted." }`
* **And** semester `1` and its section still exist

#### Scenario: Admin cannot delete a course that has sections

* **Given** I am signed in as an admin
* **And** course `1` has a section
* **When** I send `DELETE /course-t6/courses/1`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Course has sections and cannot be deleted." }`
* **And** course `1` and its section still exist

#### Scenario: Admin cannot delete a faculty member who has sections

* **Given** I am signed in as an admin
* **And** faculty member `1` teaches a section
* **When** I send `DELETE /course-t6/faculty/1`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Faculty member has sections and cannot be deleted." }`
* **And** faculty member `1` and the section still exist

---

## Test Coverage Map

Each scenario MUST map to at least one automated test.

| Story | Scenario | Test File | Test Name |
|---|---|---|---|
| US-5.1 | Admin adds a section successfully | `backend/tests/section.test.js`, `frontend/tests/Sections.test.js` | `Admin adds a section successfully` |
| US-5.1 | Admin adds a section without a required field | `backend/tests/section.test.js`, `frontend/tests/Sections.test.js` | `Admin adds a section without a required field` |
| US-5.1 | Admin submits whitespace-only section information | `backend/tests/section.test.js`, `frontend/tests/Sections.test.js` | `Admin submits whitespace-only section information` |
| US-5.1 | Admin adds a section with a semester id that is not a number | `backend/tests/section.test.js` | `Admin adds a section with a semester id that is not a number` |
| US-5.1 | Admin adds a section with a course id that is not a number | `backend/tests/section.test.js` | `Admin adds a section with a course id that is not a number` |
| US-5.1 | Admin adds a section with a faculty member id that is not a number | `backend/tests/section.test.js` | `Admin adds a section with a faculty member id that is not a number` |
| US-5.1 | Admin adds a section for a semester that does not exist | `backend/tests/section.test.js` | `Admin adds a section for a semester that does not exist` |
| US-5.1 | Admin adds a section for a course that does not exist | `backend/tests/section.test.js` | `Admin adds a section for a course that does not exist` |
| US-5.1 | Admin adds a section for a faculty member that does not exist | `backend/tests/section.test.js` | `Admin adds a section for a faculty member that does not exist` |
| US-5.1 | Admin adds a section with a time that is not in HH:MM format | `backend/tests/section.test.js`, `frontend/tests/Sections.test.js` | `Admin adds a section with a time that is not in HH:MM format` |
| US-5.2 | Admin views the section list | `backend/tests/section.test.js`, `frontend/tests/Sections.test.js` | `Admin views the section list` |
| US-5.2 | Admin views the section list when no sections exist | `backend/tests/section.test.js`, `frontend/tests/Sections.test.js` | `Admin views the section list when no sections exist` |
| US-5.2 | Sections page shows a loading state while sections load | `frontend/tests/Sections.test.js` | `Sections page shows a loading state while sections load` |
| US-5.2 | Sections page shows the API error when sections fail to load | `frontend/tests/Sections.test.js` | `Sections page shows the API error when sections fail to load` |
| US-5.2 | Sections page shows a fallback error when the API gives no message | `frontend/tests/Sections.test.js` | `Sections page shows a fallback error when the API gives no message` |
| US-5.2 | Student views the sections of a semester | `backend/tests/section.test.js` | `Student views the sections of a semester` |
| US-5.2 | User filters sections by a semester id that is not a number | `backend/tests/section.test.js` | `User filters sections by a semester id that is not a number` |
| US-5.3 | Admin edits a section successfully | `backend/tests/section.test.js`, `frontend/tests/Sections.test.js` | `Admin edits a section successfully` |
| US-5.3 | Admin edits a section without a required field | `backend/tests/section.test.js`, `frontend/tests/Sections.test.js` | `Admin edits a section without a required field` |
| US-5.3 | Admin edits a section that does not exist | `backend/tests/section.test.js` | `Admin edits a section that does not exist` |
| US-5.3 | Admin edits a section with an id that is not a number | `backend/tests/section.test.js` | `Admin edits a section with an id that is not a number` |
| US-5.4 | Admin deletes a section successfully | `backend/tests/section.test.js`, `frontend/tests/Sections.test.js` | `Admin deletes a section successfully` |
| US-5.4 | Admin deletes a section that does not exist | `backend/tests/section.test.js` | `Admin deletes a section that does not exist` |
| US-5.4 | Admin deletes a section with an id that is not a number | `backend/tests/section.test.js` | `Admin deletes a section with an id that is not a number` |
| US-5.5 | Student cannot add, edit, or delete sections | `backend/tests/section.test.js` | `Student cannot add, edit, or delete sections` |
| US-5.5 | Unauthenticated user cannot view or manage sections | `backend/tests/section.test.js` | `Unauthenticated user cannot view or manage sections` |
| US-5.5 | Student cannot open the Sections page | `frontend/tests/Sections.test.js` | `Student cannot open the Sections page` |
| US-5.5 | Unauthenticated user cannot open the Sections page | `frontend/tests/Sections.test.js` | `Unauthenticated user cannot open the Sections page` |
| US-5.5 | Admin sees the Sections link in the MenuBar | `frontend/tests/Sections.test.js` | `Admin sees the Sections link in the MenuBar` |
| US-5.5 | Student does not see the Sections link in the MenuBar | `frontend/tests/Sections.test.js` | `Student does not see the Sections link in the MenuBar` |
| US-5.6 | Admin cannot delete a semester that has sections | `backend/tests/section.test.js` | `Admin cannot delete a semester that has sections` |
| US-5.6 | Admin cannot delete a course that has sections | `backend/tests/section.test.js` | `Admin cannot delete a course that has sections` |
| US-5.6 | Admin cannot delete a faculty member who has sections | `backend/tests/section.test.js` | `Admin cannot delete a faculty member who has sections` |
---

## Agent Implementation Request

Use the following prompt when asking the implementation agent to implement this feature:

```text
Implement Feature 5 from @features/feature-5-section-management.md on branch feature/5-section-management.

Only implement what is defined in this specification.

Follow the structure, architecture, API conventions, coding conventions, and best practices already established in the project.

Follow the layer order in @features/framework.md (models → routes → backend tests → frontend services → views → frontend tests → router).

Section routes must be:
GET /course-t6/sections
POST /course-t6/sections
PUT /course-t6/sections/:id
DELETE /course-t6/sections/:id

Protect every section route with the Feature 1 authenticate check from backend/app/authorization/authorization.js. Also protect POST, PUT, and DELETE with requireAdmin.

GET /course-t6/sections accepts an optional semesterId query parameter.

Every section response must include semester { id, semesterName }, course { id, courseNumber, courseName }, and faculty { id, firstName, lastName }.

Sort the section list by the semester's startDate, then the course's courseNumber, then sectionNumber.

Use the field name facultyId. Store startTime and endTime as times and return them in HH:MM format.

Use ON DELETE RESTRICT on the semesterId, courseId, and facultyId foreign keys. Update the semester, course, and faculty delete endpoints to return 400 with the messages in this specification when sections reference them.

The Sections page route must be /sections with route name sections.
Show the API error message when a section request fails, or "Request failed." when the API gives no message.

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

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`, `features/reference/README.md` (provenance)

---

## Definition of Done

- [ ] Admins can add a section with a section number, semester, course, faculty member, days of the week, start time, and end time.
- [ ] Every section field is required; text fields reject empty and whitespace-only values.
- [ ] Non-numeric semester, course, and faculty member ids return `400` with the required messages.
- [ ] Semester, course, and faculty member ids that do not exist return `404` with the required messages.
- [ ] Start and end times must use the `HH:MM` format.
- [ ] Any signed-in user can view all sections, or only the sections of one semester.
- [ ] Every section returned includes its semester name, course number and name, and instructor name.
- [ ] Sections are sorted by semester start date, then course number, then section number.
- [ ] Admins can edit a section.
- [ ] Admins can delete a section.
- [ ] Non-existent section ids return `404` with the required message.
- [ ] Non-numeric section ids return `400` with the required message.
- [ ] Every section endpoint uses the Feature 1 authentication check; add, edit, and delete also use the admin-only check.
- [ ] Students receive `403` when adding, editing, or deleting sections.
- [ ] Unauthenticated users receive `401` with `{ "message": "Unauthorized." }` on every section endpoint.
- [ ] A semester, course, or faculty member that a section uses cannot be deleted.
- [ ] The Sections page route is `/sections` with route name `sections`.
- [ ] The Sections page shows loading and empty states.
- [ ] The Sections page shows the API error message when a request fails, or `Request failed.` when the API gives no message.
- [ ] The Sections page is available only to admins; students are sent to the Home page and unauthenticated users to the Login page.
- [ ] The MenuBar shows the **Sections** link to admins only.
- [ ] Backend and frontend are implemented per this spec (**FR-001**-**FR-033** satisfied).
- [ ] **Success Criteria (SC-001**-**SC-012)** are met.
- [ ] Test Coverage Map is complete.
- [ ] Every acceptance scenario has an automated test.
- [ ] All tests pass (`npm test`).
- [ ] `features/reference/api.md` is updated.
- [ ] `features/reference/data-model.md` is updated.
- [ ] `features/reference/behavior.md` is updated.
- [ ] `features/reference/README.md` lists Feature 5 in its provenance table.
- [ ] `features/README.md` links Feature 5 to `feature-5-section-management.md`.
- [ ] Nothing outside this specification is implemented.

---

## Out of Scope

- Semester management → [Feature 2](feature-2-semester-management.md)
- Course management → [Feature 3](feature-3-course-management.md)
- Faculty management → [Feature 4](feature-4-faculty-management.md)
- Enrolling students in sections → [Feature 6](feature-6-enrollment-management.md)
- Removing enrollments when a section is deleted → [Feature 6](feature-6-enrollment-management.md)
- Student course listing → Feature 7
- Section student listing → Feature 8
