# Feature: Enrollment Management

**Feature ID:** 6  
**Branch pattern:** `feature/6-enrollment-management`  
**Status:** Ready  
**Created:** 2026-09-30  
**Input:** Allow student users to enroll themselves in sections for a selected semester and drop their own enrollments.  
**Depends on:** [Feature 1 — User Authentication & Authorization](feature-1-user-authentication.md), [Feature 2 — Semester Management](feature-2-semester-management.md), [Feature 5 — Section Management](feature-5-section-management.md)

---

## User Stories

### US-6.1: View sections available for enrollment

**As a** student  
**I want to** select a semester and view its sections  
**So that** I can choose the section I want to enroll in

**Priority:** P1  
**Independent test:** Log in as a student, select a semester, and verify the sections for that semester are displayed  
**Acceptance scenarios:** see ### US-6.1 under Acceptance Criteria

### US-6.2: Enroll in a section

**As a** student  
**I want to** enroll myself in a section  
**So that** I can join a section for the selected semester

**Priority:** P1  
**Independent test:** Log in as a student, select a valid section, enroll, and verify an enrollment is created for the signed-in student  
**Acceptance scenarios:** see ### US-6.2 under Acceptance Criteria

### US-6.3: View my enrollments

**As a** student  
**I want** the system to know which sections I am already enrolled in  
**So that** the Enroll page can show whether I should Enroll or Drop

**Priority:** P1  
**Independent test:** Log in as a student and retrieve only that student's enrollments  
**Acceptance scenarios:** see ### US-6.3 under Acceptance Criteria

### US-6.4: Drop my enrollment

**As a** student  
**I want to** drop one of my own enrollments  
**So that** I am no longer enrolled in that section

**Priority:** P1  
**Independent test:** Log in as a student, delete one of the student's enrollments, and verify it no longer exists  
**Acceptance scenarios:** see ### US-6.4 under Acceptance Criteria

### US-6.5: Restrict enrollment management to students

**As the** application  
**I want to** allow only student users to use enrollment routes  
**So that** admins cannot enroll or drop enrollments through Feature 6

**Priority:** P1  
**Independent test:** Call all enrollment endpoints as an admin and verify the API returns `403`  
**Acceptance scenarios:** see ### US-6.5 under Acceptance Criteria

### US-6.6: Protect the Enroll page by role

**As the** application  
**I want** the Enroll page to be accessible only to authenticated students  
**So that** signed-out users and admins cannot use the student enrollment interface

**Priority:** P1  
**Independent test:** Visit the Enroll route as a student, admin, and signed-out user and verify the correct routing behavior  
**Acceptance scenarios:** see ### US-6.6 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: Only authenticated users with role `student` MUST be allowed to use enrollment routes.
- **FR-002**: Feature 6 MUST introduce a reusable student-only authorization check.
- **FR-003**: The student-only authorization check MUST return `403` with `{ "message": "Student role required." }` when an authenticated non-student attempts access.
- **FR-004**: The Enroll page MUST allow the student to select a semester.
- **FR-005**: After selecting a semester, the system MUST display the sections belonging to that semester.
- **FR-006**: Each displayed section MUST show course number and name, section number, meeting days/times, and instructor name.
- **FR-007**: A student MUST be able to enroll themselves in a section.
- **FR-008**: The server MUST determine `studentId` from the authenticated user and MUST NOT trust a `studentId` supplied by the client.
- **FR-009**: If a request body includes `studentId`, the server MUST ignore it and use the authenticated user's id.
- **FR-010**: Creating an enrollment MUST require `sectionId`.
- **FR-011**: `sectionId` MUST be numeric.
- **FR-012**: A student MUST NOT enroll in a section that does not exist.
- **FR-013**: A student MUST NOT enroll in the same section more than once.
- **FR-014**: A student MUST NOT enroll in more than one section of the same course during the same semester.
- **FR-015**: A successful enrollment MUST create one enrollment row for the authenticated student and selected section.
- **FR-016**: The system MUST allow a student to retrieve only their own enrollments.
- **FR-017**: The Enroll page MUST use the student's enrollments to show either **Enroll** or **Drop** for each section.
- **FR-018**: A student MUST be able to delete only their own enrollment.
- **FR-019**: Deleting an enrollment MUST remove the enrollment row.
- **FR-020**: `enrollmentId` in a delete route MUST be numeric.
- **FR-021**: If an enrollment does not exist or does not belong to the authenticated student, the API MUST return `404`.
- **FR-022**: The API MUST NOT reveal whether an enrollment belonging to another student exists.
- **FR-023**: Admin users calling any Feature 6 enrollment route MUST receive `403` with `{ "message": "Student role required." }`.
- **FR-024**: Requests without a valid authenticated session MUST receive `401` with `{ "message": "Unauthorized." }`.
- **FR-025**: No enrollment status field is required. The existence of an enrollment row means the student is enrolled.
- **FR-026**: Dropping an enrollment MUST delete the row rather than changing an enrollment status.
- **FR-027**: Feature 6 MUST NOT add section capacity or section active/inactive rules.
- **FR-028**: The MenuBar MUST add an **Enroll** item for authenticated students only.
- **FR-029**: The **Enroll** MenuBar item MUST NOT be shown to admins.
- **FR-030**: The Enroll page route MUST be `/enroll` with route name `enroll`.
- **FR-031**: A signed-out user navigating to `/enroll` MUST be sent to the Login page.
- **FR-032**: An admin navigating to `/enroll` MUST be sent to the Home page.

---

## Assumptions

- Students manage their own enrollments.
- Admin enrollment is not part of Feature 6.
- Students enroll in sections, not directly in courses.
- The student selects a semester before choosing a section.
- Feature 2 provides `GET /course-t6/semesters` for the semester selector.
- Feature 5 provides `GET /course-t6/sections?semesterId=<id>` readable by students.
- Feature 5's section response includes course number and name, section number, meeting days/times, and instructor name.
- A student may have multiple enrollments in the same semester as long as they are for different courses.
- A student may not enroll in multiple sections of the same course in the same semester.
- Sections have no capacity field for this feature.
- Sections have no active/inactive status for this feature.
- Enrollment state is represented by the existence or absence of an enrollment row.
- Feature 5 owns cleanup behavior when a section is deleted and MUST handle related enrollments.
- Feature 9 owns cleanup behavior when a student is deleted and MUST handle related enrollments.

---

## Edge Cases

- Missing `sectionId` → `400`.
- Non-numeric `sectionId` → `400`.
- Section does not exist → `404`.
- Student is already enrolled in the selected section → `400`.
- Student is already enrolled in another section of the same course in the same semester → `400`.
- Client supplies another student's `studentId` → ignored; enrollment is created for the authenticated student.
- Non-numeric enrollment ID → `400`.
- Enrollment does not exist → `404`.
- Enrollment belongs to another student → `404`.
- Admin calls an enrollment endpoint → `403`.
- Unauthenticated request → `401`.
- Signed-out user navigates to `/enroll` → Login page.
- Admin navigates to `/enroll` → Home page.

---

## Success Criteria

- **SC-001**: A student can select a semester and view its sections.
- **SC-002**: A student can enroll in a valid section.
- **SC-003**: Enrollment uses the authenticated student's identity rather than a student ID supplied by the client.
- **SC-004**: Supplying another student's `studentId` does not create an enrollment for that student.
- **SC-005**: A student cannot enroll twice in the same section.
- **SC-006**: A student cannot enroll in two sections of the same course in the same semester.
- **SC-007**: A student can retrieve only their own enrollments.
- **SC-008**: A student can drop one of their own enrollments.
- **SC-009**: A student cannot delete another student's enrollment.
- **SC-010**: Admin users cannot use enrollment routes.
- **SC-011**: Unauthenticated users cannot use enrollment routes.
- **SC-012**: The Enroll page shows the correct Enroll or Drop action for each section.
- **SC-013**: Only students can access the `/enroll` page.
- **SC-014**: Every acceptance scenario has at least one automated test before merge.
- **SC-015**: All automated tests pass before merge.
- **SC-016**: Nothing outside this specification is implemented.

---

## Data Ownership & Isolation

Enrollment data belongs to the authenticated student.

- `studentId` MUST always come from the authenticated user.
- A client MUST NOT be able to create an enrollment on behalf of another student.
- A supplied `studentId` in the request body MUST NOT override the authenticated user's id.
- `GET /course-t6/enrollments` MUST return only enrollments belonging to the authenticated student.
- A student MUST only be able to delete an enrollment they own.
- An enrollment belonging to another student MUST be treated as not found.
- The API MUST return `404`, not `403`, when a requested enrollment does not exist or is not owned by the authenticated student.

---

## Key Entities

### Enrollment

Represents a student's enrollment in a section.

An Enrollment connects:

- one student
- one section

### Student

A User with role `student` who owns their own enrollments.

### Section

A specific section that belongs to a course and semester.

---

## API Requirements

### Create Enrollment

**Endpoint:** `POST /course-t6/enrollments`

**Authentication:** Required, student only

**Request body:**

```json
{
  "sectionId": 3
}
```

`studentId` MUST NOT be trusted from the request body.

**Success:** `201 Created`

Example response:

```json
{
  "id": 5,
  "sectionId": 3,
  "studentId": 7,
  "createdAt": "2026-09-30T20:15:00.000Z",
  "updatedAt": "2026-09-30T20:15:00.000Z"
}
```

### Get My Enrollments

**Endpoint:** `GET /course-t6/enrollments`

**Authentication:** Required, student only

**Success:** `200 OK`

Example response:

```json
[
  {
    "id": 5,
    "sectionId": 3,
    "studentId": 7,
    "createdAt": "2026-09-30T20:15:00.000Z",
    "updatedAt": "2026-09-30T20:15:00.000Z"
  }
]
```

The response MUST contain only enrollments belonging to the authenticated student.

### Delete Enrollment

**Endpoint:** `DELETE /course-t6/enrollments/:id`

**Authentication:** Required, student only

**Success:** `200 OK`

```json
{
  "message": "Enrollment deleted successfully."
}
```

### Enrollment Errors

| Condition | Status | Message |
|---|---:|---|
| Missing `sectionId` | `400` | `Section id is required.` |
| `sectionId` is not a number | `400` | `Section id must be a number.` |
| Section does not exist | `404` | `Section with id=<id> not found.` |
| Already enrolled in the section | `400` | `You are already enrolled in this section.` |
| Already enrolled in another section of the same course | `400` | `You are already enrolled in a section of this course.` |
| Enrollment ID is not a number | `400` | `Enrollment id must be a number.` |
| Enrollment does not exist | `404` | `Enrollment with id=<id> not found.` |
| Enrollment belongs to another student | `404` | `Enrollment with id=<id> not found.` |
| Admin calls enrollment route | `403` | `Student role required.` |
| No valid session | `401` | `Unauthorized.` |

---

## Screen Requirements

### Enroll Page

**Route:** `/enroll`  
**Route name:** `enroll`

The Enroll page MUST be available to authenticated students only.

The page MUST:

- Load semesters from Feature 2.
- Allow the student to choose a semester.
- Load sections for the selected semester from Feature 5.
- Show each section's:
  - course number
  - course name
  - section number
  - meeting days
  - meeting times
  - instructor name
- Determine whether the student is already enrolled in each displayed section.
- Show **Enroll** when the student is not enrolled in that section.
- Show **Drop** when the student is enrolled in that section.
- Allow the student to enroll in a section.
- Allow the student to drop their own enrollment.
- Display API errors when enrollment or dropping fails.

### Route Access

- Authenticated students may access `/enroll`.
- Signed-out users navigating to `/enroll` MUST be sent to the Login page.
- Admin users navigating to `/enroll` MUST be sent to the Home page.

### MenuBar

The MenuBar MUST:

- Show **Enroll** to authenticated students.
- Hide **Enroll** from admins.
- Link **Enroll** to `/enroll`.

---

## Data Model Requirements

### `enrollments` table

| Field | Type/Requirement | Rules |
|---|---|---|
| `id` | Primary key | Auto-generated |
| `sectionId` | Foreign key | Required, references `sections.id` |
| `studentId` | Foreign key | Required, references `users.id` |
| `createdAt` | Timestamp | Automatically generated |
| `updatedAt` | Timestamp | Automatically generated |

### Constraints

- `(studentId, sectionId)` MUST be unique.
- `studentId` MUST reference a user with role `student`.
- No enrollment `status` field is required.
- Enrollment date may be obtained from `createdAt`.
- Section deletion cleanup is owned by Feature 5.
- Student deletion cleanup is owned by Feature 9.

---

## Acceptance Criteria (Gherkin)

### US-6.1 — View sections available for enrollment

#### Scenario: Student views sections for a selected semester

* **Given** I am signed in as a student
* **And** a semester has sections
* **When** I select that semester on the Enroll page
* **Then** I see the sections belonging to that semester
* **And** each section shows its course number and name, section number, meeting days/times, and instructor name

---

### US-6.2 — Enroll in a section

#### Scenario: Student enrolls in a section successfully

* **Given** I am signed in as a student
* **And** the selected section exists
* **And** I am not already enrolled in that section
* **And** I am not enrolled in another section of the same course in the same semester
* **When** I submit `POST /course-t6/enrollments` with the section ID
* **Then** the API returns `201`
* **And** an enrollment is created for my authenticated user
* **And** the enrollment references the selected section

#### Scenario: Supplied student ID does not override authenticated student

* **Given** I am signed in as student `7`
* **And** another student has id `8`
* **When** I submit `POST /course-t6/enrollments` with a valid section ID and `"studentId": 8`
* **Then** the API returns `201`
* **And** the created enrollment has `studentId` `7`
* **And** no enrollment is created for student `8`

#### Scenario: Student submits enrollment without section ID

* **Given** I am signed in as a student
* **When** I submit an enrollment request without `sectionId`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Section id is required." }`
* **And** no enrollment is created

#### Scenario: Student submits a non-numeric section ID

* **Given** I am signed in as a student
* **When** I submit an enrollment request with a non-numeric `sectionId`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Section id must be a number." }`
* **And** no enrollment is created

#### Scenario: Student enrolls in a section that does not exist

* **Given** I am signed in as a student
* **When** I submit an enrollment request for section ID `999`
* **And** section `999` does not exist
* **Then** the API returns `404`
* **And** the response is `{ "message": "Section with id=999 not found." }`
* **And** no enrollment is created

#### Scenario: Student tries to enroll in the same section twice

* **Given** I am signed in as a student
* **And** I am already enrolled in section `3`
* **When** I submit another enrollment request for section `3`
* **Then** the API returns `400`
* **And** the response is `{ "message": "You are already enrolled in this section." }`
* **And** no second enrollment is created

#### Scenario: Student tries to enroll in another section of the same course

* **Given** I am signed in as a student
* **And** I am already enrolled in one section of a course for the selected semester
* **When** I try to enroll in another section of that same course in the same semester
* **Then** the API returns `400`
* **And** the response is `{ "message": "You are already enrolled in a section of this course." }`
* **And** no additional enrollment is created

---

### US-6.3 — View my enrollments

#### Scenario: Student retrieves their own enrollments

* **Given** I am signed in as a student
* **And** I have existing enrollments
* **When** I request `GET /course-t6/enrollments`
* **Then** the API returns `200`
* **And** the response contains my enrollments
* **And** each enrollment includes `id` and `sectionId`
* **And** the response does not contain enrollments belonging to another student

#### Scenario: Enroll page shows Enroll for a section I am not enrolled in

* **Given** I am signed in as a student
* **And** I am not enrolled in a displayed section
* **When** I view the Enroll page
* **Then** that section shows an **Enroll** action

#### Scenario: Enroll page shows Drop for a section I am enrolled in

* **Given** I am signed in as a student
* **And** I am enrolled in a displayed section
* **When** I view the Enroll page
* **Then** that section shows a **Drop** action

---

### US-6.4 — Drop my enrollment

#### Scenario: Student drops their own enrollment

* **Given** I am signed in as a student
* **And** enrollment `5` belongs to me
* **When** I send `DELETE /course-t6/enrollments/5`
* **Then** the API returns `200`
* **And** the response is `{ "message": "Enrollment deleted successfully." }`
* **And** enrollment `5` no longer exists

#### Scenario: Student submits a non-numeric enrollment ID

* **Given** I am signed in as a student
* **When** I send a delete request using a non-numeric enrollment ID
* **Then** the API returns `400`
* **And** the response is `{ "message": "Enrollment id must be a number." }`

#### Scenario: Student tries to drop an enrollment that does not exist

* **Given** I am signed in as a student
* **When** I send a delete request for enrollment `999`
* **And** enrollment `999` does not exist
* **Then** the API returns `404`
* **And** the response is `{ "message": "Enrollment with id=999 not found." }`

#### Scenario: Student tries to drop another student's enrollment

* **Given** I am signed in as a student
* **And** enrollment `5` belongs to another student
* **When** I send `DELETE /course-t6/enrollments/5`
* **Then** the API returns `404`
* **And** the response is `{ "message": "Enrollment with id=5 not found." }`
* **And** the enrollment is not deleted

---

### US-6.5 — Restrict enrollment management to students

#### Scenario: Admin cannot access enrollment routes

* **Given** I am signed in as an admin
* **When** I send `POST /course-t6/enrollments`
* **Then** the API returns `403`
* **And** the response is `{ "message": "Student role required." }`
* **When** I send `GET /course-t6/enrollments`
* **Then** the API returns `403`
* **And** the response is `{ "message": "Student role required." }`
* **When** I send `DELETE /course-t6/enrollments/1`
* **Then** the API returns `403`
* **And** the response is `{ "message": "Student role required." }`

#### Scenario: Unauthenticated user cannot access enrollment routes

* **Given** I am not authenticated
* **When** I send a request to a Feature 6 enrollment endpoint
* **Then** the API returns `401`
* **And** the response is `{ "message": "Unauthorized." }`

#### Scenario: Student sees Enroll in the MenuBar

* **Given** I am signed in as a student
* **When** I view the MenuBar
* **Then** **Enroll** is displayed

#### Scenario: Admin does not see Enroll in the MenuBar

* **Given** I am signed in as an admin
* **When** I view the MenuBar
* **Then** **Enroll** is not displayed

---

### US-6.6 — Protect the Enroll page by role

#### Scenario: Student can access the Enroll page

* **Given** I am signed in as a student
* **When** I navigate to `/enroll`
* **Then** the Enroll page is displayed

#### Scenario: Signed-out user is sent to Login from the Enroll page

* **Given** I am not authenticated
* **When** I navigate to `/enroll`
* **Then** I am sent to the Login page

#### Scenario: Admin is sent to Home from the Enroll page

* **Given** I am signed in as an admin
* **When** I navigate to `/enroll`
* **Then** I am sent to the Home page

---

## Test Coverage Map

Each scenario MUST map to at least one automated test.

| Story | Scenario | Test File | Test Name |
|---|---|---|---|
| US-6.1 | Student views sections for a selected semester | `frontend/tests/Enroll.test.js` | `Student views sections for a selected semester` |
| US-6.2 | Student enrolls in a section successfully | `backend/tests/enrollments.test.js`, `frontend/tests/Enroll.test.js` | `Student enrolls in a section successfully` |
| US-6.2 | Supplied student ID does not override authenticated student | `backend/tests/enrollments.test.js` | `Supplied student ID does not override authenticated student` |
| US-6.2 | Student submits enrollment without section ID | `backend/tests/enrollments.test.js` | `Student submits enrollment without section ID` |
| US-6.2 | Student submits a non-numeric section ID | `backend/tests/enrollments.test.js` | `Student submits a non-numeric section ID` |
| US-6.2 | Student enrolls in a section that does not exist | `backend/tests/enrollments.test.js` | `Student enrolls in a section that does not exist` |
| US-6.2 | Student tries to enroll in the same section twice | `backend/tests/enrollments.test.js` | `Student tries to enroll in the same section twice` |
| US-6.2 | Student tries to enroll in another section of the same course | `backend/tests/enrollments.test.js` | `Student tries to enroll in another section of the same course` |
| US-6.3 | Student retrieves their own enrollments | `backend/tests/enrollments.test.js` | `Student retrieves their own enrollments` |
| US-6.3 | Enroll page shows Enroll for a section I am not enrolled in | `frontend/tests/Enroll.test.js` | `Enroll page shows Enroll for a section I am not enrolled in` |
| US-6.3 | Enroll page shows Drop for a section I am enrolled in | `frontend/tests/Enroll.test.js` | `Enroll page shows Drop for a section I am enrolled in` |
| US-6.4 | Student drops their own enrollment | `backend/tests/enrollments.test.js`, `frontend/tests/Enroll.test.js` | `Student drops their own enrollment` |
| US-6.4 | Student submits a non-numeric enrollment ID | `backend/tests/enrollments.test.js` | `Student submits a non-numeric enrollment ID` |
| US-6.4 | Student tries to drop an enrollment that does not exist | `backend/tests/enrollments.test.js` | `Student tries to drop an enrollment that does not exist` |
| US-6.4 | Student tries to drop another student's enrollment | `backend/tests/enrollments.test.js` | `Student tries to drop another student's enrollment` |
| US-6.5 | Admin cannot access enrollment routes | `backend/tests/enrollments.test.js` | `Admin cannot access enrollment routes` |
| US-6.5 | Unauthenticated user cannot access enrollment routes | `backend/tests/enrollments.test.js` | `Unauthenticated user cannot access enrollment routes` |
| US-6.5 | Student sees Enroll in the MenuBar | `frontend/tests/Enroll.test.js` | `Student sees Enroll in the MenuBar` |
| US-6.5 | Admin does not see Enroll in the MenuBar | `frontend/tests/Enroll.test.js` | `Admin does not see Enroll in the MenuBar` |
| US-6.6 | Student can access the Enroll page | `frontend/tests/Enroll.test.js` | `Student can access the Enroll page` |
| US-6.6 | Signed-out user is sent to Login from the Enroll page | `frontend/tests/Enroll.test.js` | `Signed-out user is sent to Login from the Enroll page` |
| US-6.6 | Admin is sent to Home from the Enroll page | `frontend/tests/Enroll.test.js` | `Admin is sent to Home from the Enroll page` |

---

## Agent Implementation Request

```text
Implement Feature 6 from @features/feature-6-enrollment-management.md.

Only implement what is defined in this specification.

Follow the project's existing architecture, API conventions, security rules, coding conventions, and feature framework.

Feature dependencies:
- Feature 1 provides authentication.
- Feature 2 provides GET /course-t6/semesters.
- Feature 5 provides GET /course-t6/sections?semesterId=<id> including course information and instructor name.

Enrollment routes must be:
POST /course-t6/enrollments
GET /course-t6/enrollments
DELETE /course-t6/enrollments/:id

Enrollment management is student-only.

Feature 6 must add a reusable student-only authorization check that returns:
403 { "message": "Student role required." }

On create, derive studentId from the authenticated user.
Never trust studentId from the request body.
If studentId is supplied in the request body, ignore it.

Students may only retrieve and delete their own enrollments.

When an enrollment does not exist or belongs to another student, return 404.
Do not reveal ownership through a 403 response.

The Enroll page route must be /enroll with route name enroll.
Signed-out users are sent to Login.
Admins are sent to Home.

Map every Gherkin scenario in the Test Coverage Map to at least one automated test.

Use the exact test file paths listed in the Test Coverage Map.

Do not implement capacity, waitlists, enrollment statuses, admin enrollment, admin removal, or other behavior not defined in this specification.

Run the full test suite before finishing.

If this feature changes API, data model, or product behavior, update the reference files listed below in the same PR.

Update features/README.md so Feature 6 links to feature-6-enrollment-management.md.

Do not mark the feature complete if any requirement or acceptance scenario remains unimplemented or untested.
```

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`

---

## Definition of Done

- [ ] Student users can select a semester and view its sections.
- [ ] Students can enroll themselves in a section.
- [ ] `studentId` comes from the authenticated user.
- [ ] A supplied `studentId` cannot override the authenticated user's id.
- [ ] Missing `sectionId` returns `400` with the required message.
- [ ] Non-numeric `sectionId` returns `400` with the required message.
- [ ] Missing section returns `404` with the required message.
- [ ] Students cannot enroll twice in the same section.
- [ ] Students cannot enroll in multiple sections of the same course in the same semester.
- [ ] Students can retrieve only their own enrollments.
- [ ] POST enrollment returns the created enrollment including `id` and `sectionId`.
- [ ] GET enrollments returns enrollment records including `id` and `sectionId`.
- [ ] The Enroll page correctly displays Enroll or Drop for each section.
- [ ] Students can drop their own enrollments.
- [ ] Students cannot drop another student's enrollment.
- [ ] Missing or foreign enrollments return `404`.
- [ ] Feature 6 provides a reusable student-only authorization check.
- [ ] Admin users receive `403` on POST, GET, and DELETE enrollment routes.
- [ ] Unauthenticated users receive `401` on enrollment routes.
- [ ] Student users see **Enroll** in the MenuBar.
- [ ] Admin users do not see **Enroll** in the MenuBar.
- [ ] `/enroll` is accessible to authenticated students.
- [ ] Signed-out users navigating to `/enroll` are sent to Login.
- [ ] Admins navigating to `/enroll` are sent to Home.
- [ ] The `enrollments` table contains `id`, `sectionId`, `studentId`, `createdAt`, and `updatedAt`.
- [ ] `(studentId, sectionId)` is unique.
- [ ] No enrollment status field is added.
- [ ] No capacity or active/inactive section logic is added.
- [ ] Every acceptance scenario has an automated test.
- [ ] All tests pass.
- [ ] `features/reference/api.md` is updated.
- [ ] `features/reference/data-model.md` is updated.
- [ ] `features/reference/behavior.md` is updated.
- [ ] `features/README.md` links Feature 6 to `feature-6-enrollment-management.md`.
- [ ] Nothing outside this specification is implemented.

---

## Out of Scope

- Creating, editing, or deleting courses → [Feature 3](feature-3-course-management.md)
- Faculty management → [Feature 4](feature-4-faculty-management.md)
- Creating, editing, or deleting sections → [Feature 5](feature-5-section-management.md)
- Section deletion cleanup for related enrollments → [Feature 5](feature-5-section-management.md)
- Separate **My Enrolled Sections** page → [Feature 7](feature-7-student-course-listing.md)
- Admin section roster → [Feature 8](feature-8-section-student-listing.md)
- Student deletion cleanup for related enrollments → [Feature 9](feature-9-student-management.md)
- Admin enrolling students
- Admin removing students from enrollments
- Section capacity
- Waitlists
- Section active/inactive status
- Enrollment status values such as `dropped`, `completed`, or `pending`
- Enrollment approval workflows
