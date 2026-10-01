# Feature: Enrollment Management

**Feature ID:** 6  
**Branch pattern:** `feature/6-enrollment-management`  
**Status:** Ready  
**Created:** 2026-09-30  
**Input:** Allow student users to enroll themselves in sections for a selected semester, change their enrollments to another section, and drop their own enrollments.  
**Depends on:** [Feature 1 — User Authentication & Authorization](feature-1-user-authentication-authorization.md), Feature 2 — Semester Management, Feature 5 — Section Management

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
**So that** I can take that class this semester

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
**So that** I can leave a class I no longer want to take

**Priority:** P1  
**Independent test:** Log in as a student, delete one of the student's enrollments, and verify it no longer exists  
**Acceptance scenarios:** see ### US-6.4 under Acceptance Criteria

### US-6.5: Restrict enrollment management to students

**As the** application  
**I want to** allow only student users to use enrollment routes  
**So that** admins cannot enroll or drop enrollments through Feature 6

**Priority:** P1  
**Independent test:** Call all enrollment endpoints as an admin and verify the API returns `403`, and verify the MenuBar shows **Enroll** only to students  
**Acceptance scenarios:** see ### US-6.5 under Acceptance Criteria

### US-6.6: Protect the Enroll page by role

**As the** application  
**I want** the Enroll page to be accessible only to authenticated students  
**So that** signed-out users and admins cannot use the student enrollment interface

**Priority:** P1  
**Independent test:** Visit the Enroll route as a student, admin, and signed-out user and verify the correct routing behavior  
**Acceptance scenarios:** see ### US-6.6 under Acceptance Criteria

### US-6.7: Remove enrollments when their section or student is deleted

**As the** application  
**I want** enrollments to be removed when their section or student is deleted  
**So that** no enrollment points to a section or student that no longer exists

**Priority:** P1  
**Independent test:** Delete a section that has enrollments and a student who has enrollments, and verify none of their enrollments remain  
**Acceptance scenarios:** see ### US-6.7 under Acceptance Criteria

### US-6.8: Change my enrollment to another section

**As a** student  
**I want to** move one of my enrollments to another section  
**So that** I can switch sections in one step

**Priority:** P1  
**Independent test:** Log in as a student with an enrollment, change it to another section, and verify the enrollment now references the new section  
**Acceptance scenarios:** see ### US-6.8 under Acceptance Criteria

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
- **FR-014**: A successful enrollment MUST create one enrollment row for the authenticated student and selected section.
- **FR-015**: The system MUST allow a student to retrieve only their own enrollments.
- **FR-016**: The Enroll page MUST use the student's enrollments to show either **Enroll** or **Drop** for each section.
- **FR-017**: A student MUST be able to delete only their own enrollment.
- **FR-018**: Deleting an enrollment MUST remove the enrollment row.
- **FR-019**: The enrollment `:id` in update and delete routes MUST be numeric.
- **FR-020**: If an enrollment does not exist or does not belong to the authenticated student, the API MUST return `404`.
- **FR-021**: The API MUST NOT reveal whether an enrollment belonging to another student exists.
- **FR-022**: Admin users calling any Feature 6 enrollment route MUST receive `403` with `{ "message": "Student role required." }`.
- **FR-023**: Requests without a valid authenticated session MUST receive `401` with `{ "message": "Unauthorized." }`.
- **FR-024**: The MenuBar MUST add an **Enroll** item for authenticated students only.
- **FR-025**: The **Enroll** MenuBar item MUST NOT be shown to admins.
- **FR-026**: The Enroll page route MUST be `/enroll` with route name `enroll`.
- **FR-027**: A signed-out user navigating to `/enroll` MUST be sent to the Login page.
- **FR-028**: An admin navigating to `/enroll` MUST be sent to the Home page.
- **FR-029**: When a section is deleted, the system MUST delete all enrollments for that section.
- **FR-030**: When a student is deleted, the system MUST delete all enrollments for that student.
- **FR-031**: When the selected semester has no sections, the Enroll page MUST show `No sections for this semester.`
- **FR-032**: When an API request on the Enroll page fails (loading semesters, sections, or enrollments, enrolling, changing, or dropping), the Enroll page MUST display the error message returned by the API.
- **FR-033**: After a successful enroll, that section MUST show **Drop**; after a successful drop, that section MUST show **Enroll**.
- **FR-034**: When no semesters exist, the Enroll page MUST show `No semesters available.`
- **FR-035**: A student MUST be able to change one of their own enrollments to another section.
- **FR-036**: Changing an enrollment MUST apply the same `sectionId` rules as creating one (FR-010–FR-013).
- **FR-037**: Changing an enrollment MUST update only `sectionId`; a `studentId` in the request body MUST be ignored.
- **FR-038**: Each section the student is enrolled in MUST show a **Change section** action on the Enroll page.
- **FR-039**: When no other section is available, the Change section dialog MUST show `No other sections available.`
- **FR-040**: After a successful change, the original section MUST show **Enroll** and the new section MUST show **Drop**.

---

## Assumptions

- Students manage their own enrollments.
- Admin enrollment is not part of Feature 6.
- Students enroll in sections, not directly in courses.
- The student selects a semester before choosing a section.
- Feature 2 provides `GET /course-t6/semesters` readable by students for the semester selector.
- Feature 5 provides `GET /course-t6/sections?semesterId=<id>` readable by students.
- Feature 5's section response includes course number and name, section number, meeting days/times, and instructor name.
- Enrollment state is represented by the existence or absence of an enrollment row.
- Feature 6 owns enrollment cleanup when a section is deleted, because Feature 5 is built before the `enrollments` table exists.
- Feature 6 owns enrollment cleanup when a student is deleted, so Feature 9 does not need to depend on Feature 6.

---

## Edge Cases

- Missing `sectionId` → `400`.
- Non-numeric `sectionId` → `400`.
- Section does not exist → `404`.
- Student is already enrolled in the selected section → `400`.
- Client supplies another student's `studentId` → ignored; enrollment is created for the authenticated student.
- Non-numeric enrollment ID → `400`.
- Enrollment does not exist → `404`.
- Enrollment belongs to another student → `404`.
- Admin calls an enrollment endpoint → `403`.
- Unauthenticated request → `401`.
- Signed-out user navigates to `/enroll` → Login page.
- Admin navigates to `/enroll` → Home page.
- No semesters exist → Enroll page shows `No semesters available.`
- Selected semester has no sections → Enroll page shows `No sections for this semester.`
- Any Enroll page API request fails → Enroll page shows the API error message.
- Section with enrollments is deleted → its enrollments are deleted.
- Student with enrollments is deleted → their enrollments are deleted.
- Change with a missing or non-numeric `sectionId` → `400`.
- Change to a section that does not exist → `404`.
- Change to a section the student is already enrolled in → `400`.
- Client supplies a `studentId` when changing → ignored; the enrollment keeps its owner.
- No other section is available → Change section dialog shows `No other sections available.`

---

## Success Criteria

- **SC-001**: A student can select a semester and view its sections.
- **SC-002**: A student can enroll in a valid section.
- **SC-003**: Enrollment uses the authenticated student's identity rather than a student ID supplied by the client.
- **SC-004**: Supplying another student's `studentId` does not create an enrollment for that student.
- **SC-005**: A student cannot enroll twice in the same section.
- **SC-006**: A student can retrieve only their own enrollments.
- **SC-007**: A student can drop one of their own enrollments.
- **SC-008**: A student cannot delete another student's enrollment.
- **SC-009**: Admin users cannot use enrollment routes.
- **SC-010**: Unauthenticated users cannot use enrollment routes.
- **SC-011**: The Enroll page shows the correct Enroll or Drop action for each section.
- **SC-012**: Only students can access the `/enroll` page.
- **SC-013**: Every acceptance scenario has at least one automated test before merge.
- **SC-014**: All automated tests pass before merge.
- **SC-015**: Nothing outside this specification is implemented.
- **SC-016**: Deleting a section or student leaves no enrollments pointing to it.
- **SC-017**: The Enroll page shows empty-state and API error messages.
- **SC-018**: The Enroll page switches between **Enroll** and **Drop** right after a successful action.
- **SC-019**: A student can change one of their own enrollments to another section.
- **SC-020**: A student cannot change another student's enrollment.

---

## Data Ownership & Isolation

Enrollment data belongs to the authenticated student.

- `studentId` MUST always come from the authenticated user.
- A client MUST NOT be able to create an enrollment on behalf of another student.
- A supplied `studentId` in the request body MUST NOT override the authenticated user's id.
- `GET /course-t6/enrollments` MUST return only enrollments belonging to the authenticated student.
- A student MUST only be able to change or delete an enrollment they own.
- Changing an enrollment MUST NOT change its `studentId`.
- The Enroll page MUST show **Drop** and **Change section** only for the signed-in student's own enrollments.
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

### Change Enrollment

**Endpoint:** `PUT /course-t6/enrollments/:id`

**Authentication:** Required, student only

**Request body:**

```json
{
  "sectionId": 4
}
```

Only `sectionId` changes. `studentId` MUST NOT be trusted from the request body.

**Success:** `200 OK` with the updated enrollment.

Example response:

```json
{
  "id": 5,
  "sectionId": 4,
  "studentId": 7,
  "createdAt": "2026-09-30T20:15:00.000Z",
  "updatedAt": "2026-10-01T09:30:00.000Z"
}
```

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

| Condition | Routes | Status | Message |
|---|---|---:|---|
| Missing `sectionId` | `POST`, `PUT` | `400` | `Section id is required.` |
| `sectionId` is not a number | `POST`, `PUT` | `400` | `Section id must be a number.` |
| Section does not exist | `POST`, `PUT` | `404` | `Section with id=<id> not found.` |
| Already enrolled in the section | `POST`, `PUT` | `400` | `You are already enrolled in this section.` |
| Enrollment ID is not a number | `PUT`, `DELETE` | `400` | `Enrollment id must be a number.` |
| Enrollment does not exist | `PUT`, `DELETE` | `404` | `Enrollment with id=<id> not found.` |
| Enrollment belongs to another student | `PUT`, `DELETE` | `404` | `Enrollment with id=<id> not found.` |
| Admin calls enrollment route | All | `403` | `Student role required.` |
| No valid session | All | `401` | `Unauthorized.` |

---

## Screen Requirements

### Enroll Page

**Route:** `/enroll`  
**Route name:** `enroll`

The Enroll page MUST be available to authenticated students only.

The page MUST:

- Load semesters from Feature 2.
- Show a loading state while semesters, sections, or enrollments load.
- Allow the student to choose a semester.
- Show `No semesters available.` when no semesters exist.
- Load sections for the selected semester from Feature 5.
- Show `No sections for this semester.` when the selected semester has no sections.
- List sections in the order returned by Feature 5.
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
- Show **Change section** for each section the student is enrolled in.
- After a successful enroll, show **Drop** for that section; after a successful drop, show **Enroll**.
- Display the API error message when loading semesters, sections, or enrollments fails, or when enrolling or dropping fails.

### Change Section Dialog

The dialog MUST:

- Use the title **Change section**.
- Provide a **New section** select listing the other sections of the selected semester that the student is not enrolled in.
- Show `No other sections available.` when there are none.
- Validate that a new section is chosen before submitting, using the API message `Section id is required.`
- Display API errors.
- Show a loading state on **Save** while the request runs.
- Provide **Save** and **Cancel** buttons.
- Close after a successful save; the original section then shows **Enroll** and the new section shows **Drop**.
- Close without saving when **Cancel** is selected.

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
- Deleting a section MUST delete its enrollments (`sectionId` foreign key `ON DELETE CASCADE`).
- Deleting a student MUST delete their enrollments (`studentId` foreign key `ON DELETE CASCADE`).

### Associations

- An enrollment belongs to one section (`sectionId`) and one student (`studentId` → `users.id`).
- A section has many enrollments.
- A user with role `student` has many enrollments.
- The model and its associations MUST be registered in `backend/app/models/index.js`.

---

## Acceptance Criteria (Gherkin)

### US-6.1 — View sections available for enrollment

#### Scenario: Student views sections for a selected semester

* **Given** I am signed in as a student
* **And** a semester has sections
* **When** I select that semester on the Enroll page
* **Then** I see the sections belonging to that semester
* **And** each section shows its course number and name, section number, meeting days/times, and instructor name

#### Scenario: Enroll page shows a loading state while sections load

* **Given** I am signed in as a student on the Enroll page
* **And** the sections request will not finish right away
* **When** I select a semester
* **Then** a loading state is shown until the sections arrive

#### Scenario: Enroll page shows a message when no semesters exist

* **Given** I am signed in as a student
* **And** no semesters exist
* **When** I open the Enroll page
* **Then** I see `No semesters available.`

#### Scenario: Enroll page shows a message when the semester has no sections

* **Given** I am signed in as a student
* **And** a semester has no sections
* **When** I select that semester on the Enroll page
* **Then** I see `No sections for this semester.`

#### Scenario: Enroll page shows the API error when sections fail to load

* **Given** I am signed in as a student on the Enroll page
* **And** the sections request will fail with an error message
* **When** I select a semester
* **Then** the page shows the error message returned by the API

#### Scenario: Enroll page shows the API error when semesters fail to load

* **Given** I am signed in as a student
* **And** the semesters request will fail with an error message
* **When** I open the Enroll page
* **Then** the page shows the error message returned by the API

---

### US-6.2 — Enroll in a section

#### Scenario: Student enrolls in a section successfully

* **Given** I am signed in as a student
* **And** the selected section exists
* **And** I am not already enrolled in that section
* **When** I submit `POST /course-t6/enrollments` with the section ID
* **Then** the API returns `201`
* **And** an enrollment is created for my authenticated user
* **And** the enrollment references the selected section

#### Scenario: Section shows Drop after the student enrolls

* **Given** I am signed in as a student on the Enroll page
* **And** I am not enrolled in a displayed section
* **When** I click **Enroll** for that section
* **Then** that section shows a **Drop** action

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
* **And** section `999` does not exist
* **When** I submit an enrollment request for section ID `999`
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

#### Scenario: Enroll page shows the API error when enrolling fails

* **Given** I am signed in as a student on the Enroll page
* **And** the enroll request will fail with an error message
* **When** I click **Enroll** for a displayed section
* **Then** the page shows the error message returned by the API
* **And** that section still shows an **Enroll** action

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

#### Scenario: Enroll page shows the API error when enrollments fail to load

* **Given** I am signed in as a student
* **And** the enrollments request will fail with an error message
* **When** I open the Enroll page
* **Then** the page shows the error message returned by the API

---

### US-6.4 — Drop my enrollment

#### Scenario: Student drops their own enrollment

* **Given** I am signed in as a student
* **And** enrollment `5` belongs to me
* **When** I send `DELETE /course-t6/enrollments/5`
* **Then** the API returns `200`
* **And** the response is `{ "message": "Enrollment deleted successfully." }`
* **And** enrollment `5` no longer exists

#### Scenario: Section shows Enroll after the student drops

* **Given** I am signed in as a student on the Enroll page
* **And** I am enrolled in a displayed section
* **When** I click **Drop** for that section
* **Then** that section shows an **Enroll** action

#### Scenario: Student submits a non-numeric enrollment ID

* **Given** I am signed in as a student
* **When** I send a delete request using a non-numeric enrollment ID
* **Then** the API returns `400`
* **And** the response is `{ "message": "Enrollment id must be a number." }`

#### Scenario: Student tries to drop an enrollment that does not exist

* **Given** I am signed in as a student
* **And** enrollment `999` does not exist
* **When** I send a delete request for enrollment `999`
* **Then** the API returns `404`
* **And** the response is `{ "message": "Enrollment with id=999 not found." }`

#### Scenario: Student tries to drop another student's enrollment

* **Given** I am signed in as a student
* **And** enrollment `5` belongs to another student
* **When** I send `DELETE /course-t6/enrollments/5`
* **Then** the API returns `404`
* **And** the response is `{ "message": "Enrollment with id=5 not found." }`
* **And** the enrollment is not deleted

#### Scenario: Enroll page shows the API error when dropping fails

* **Given** I am signed in as a student on the Enroll page
* **And** I am enrolled in a displayed section
* **And** the drop request will fail with an error message
* **When** I click **Drop** for that section
* **Then** the page shows the error message returned by the API
* **And** that section still shows a **Drop** action

---

### US-6.5 — Restrict enrollment management to students

#### Scenario: Admin cannot access enrollment routes

* **Given** I am signed in as an admin
* **When** I send `POST /course-t6/enrollments`, `GET /course-t6/enrollments`, `PUT /course-t6/enrollments/1`, or `DELETE /course-t6/enrollments/1`
* **Then** each request returns `403`
* **And** each response is `{ "message": "Student role required." }`

#### Scenario: Unauthenticated user cannot access enrollment routes

* **Given** I am not authenticated
* **When** I send `POST /course-t6/enrollments`, `GET /course-t6/enrollments`, `PUT /course-t6/enrollments/1`, or `DELETE /course-t6/enrollments/1`
* **Then** each request returns `401`
* **And** each response is `{ "message": "Unauthorized." }`

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

### US-6.7 — Remove enrollments when their section or student is deleted

#### Scenario: Deleting a section deletes its enrollments

* **Given** a section has enrollments
* **When** the section is deleted
* **Then** no enrollments for that section remain
* **And** enrollments for other sections are unchanged

#### Scenario: Deleting a student deletes their enrollments

* **Given** a student has enrollments
* **When** the student is deleted
* **Then** no enrollments for that student remain
* **And** enrollments for other students are unchanged

---

### US-6.8 — Change my enrollment to another section

#### Scenario: Student changes their enrollment to another section

* **Given** I am signed in as a student
* **And** enrollment `5` belongs to me and references section `3`
* **And** section `4` exists and I am not enrolled in it
* **When** I send `PUT /course-t6/enrollments/5` with `"sectionId": 4`
* **Then** the API returns `200`
* **And** enrollment `5` references section `4`
* **And** enrollment `5` still belongs to me

#### Scenario: Section shows Drop after the student changes sections

* **Given** I am signed in as a student on the Enroll page
* **And** I am enrolled in a displayed section
* **And** I am not enrolled in another displayed section
* **When** I click **Change section** for my section
* **And** I choose the other section and click **Save**
* **Then** my original section shows an **Enroll** action
* **And** the chosen section shows a **Drop** action

#### Scenario: Supplied student ID does not change the enrollment owner

* **Given** I am signed in as student `7`
* **And** enrollment `5` belongs to me
* **And** another student has id `8`
* **When** I send `PUT /course-t6/enrollments/5` with a valid section ID and `"studentId": 8`
* **Then** the API returns `200`
* **And** enrollment `5` still has `studentId` `7`

#### Scenario: Student changes an enrollment without section ID

* **Given** I am signed in as a student
* **And** enrollment `5` belongs to me
* **When** I submit a change for enrollment `5` without `sectionId`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Section id is required." }`
* **And** enrollment `5` is unchanged

#### Scenario: Student changes an enrollment to a non-numeric section ID

* **Given** I am signed in as a student
* **And** enrollment `5` belongs to me
* **When** I submit a change for enrollment `5` with a non-numeric `sectionId`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Section id must be a number." }`
* **And** enrollment `5` is unchanged

#### Scenario: Student changes an enrollment to a section that does not exist

* **Given** I am signed in as a student
* **And** enrollment `5` belongs to me
* **And** section `999` does not exist
* **When** I submit a change for enrollment `5` to section `999`
* **Then** the API returns `404`
* **And** the response is `{ "message": "Section with id=999 not found." }`
* **And** enrollment `5` is unchanged

#### Scenario: Student changes an enrollment to a section they are already enrolled in

* **Given** I am signed in as a student
* **And** enrollment `5` belongs to me
* **And** I am already enrolled in section `4`
* **When** I submit a change for enrollment `5` to section `4`
* **Then** the API returns `400`
* **And** the response is `{ "message": "You are already enrolled in this section." }`
* **And** enrollment `5` is unchanged

#### Scenario: Student changes an enrollment using a non-numeric enrollment ID

* **Given** I am signed in as a student
* **When** I send `PUT /course-t6/enrollments/abc` with a valid section ID
* **Then** the API returns `400`
* **And** the response is `{ "message": "Enrollment id must be a number." }`

#### Scenario: Student tries to change an enrollment that does not exist

* **Given** I am signed in as a student
* **And** enrollment `999` does not exist
* **When** I send `PUT /course-t6/enrollments/999` with a valid section ID
* **Then** the API returns `404`
* **And** the response is `{ "message": "Enrollment with id=999 not found." }`

#### Scenario: Student tries to change another student's enrollment

* **Given** I am signed in as a student
* **And** enrollment `5` belongs to another student
* **When** I send `PUT /course-t6/enrollments/5` with a valid section ID
* **Then** the API returns `404`
* **And** the response is `{ "message": "Enrollment with id=5 not found." }`
* **And** the enrollment is not changed

#### Scenario: Change section dialog shows a message when no other sections are available

* **Given** I am signed in as a student on the Enroll page
* **And** I am enrolled in every displayed section
* **When** I click **Change section** for one of my sections
* **Then** I see `No other sections available.`

#### Scenario: Change section dialog requires a new section

* **Given** I am signed in as a student with the Change section dialog open
* **When** I click **Save** without choosing a section
* **Then** I see `Section id is required.`
* **And** no change request is sent

#### Scenario: Change section dialog shows the API error when the change fails

* **Given** I am signed in as a student with the Change section dialog open
* **And** the change request will fail with an error message
* **When** I choose another section and click **Save**
* **Then** the dialog shows the error message returned by the API
* **And** my original section still shows a **Drop** action

---

## Test Coverage Map

Each scenario MUST map to at least one automated test.

| Story | Scenario | Test File | Test Name |
|---|---|---|---|
| US-6.1 | Student views sections for a selected semester | `frontend/tests/Enroll.test.js` | `Student views sections for a selected semester` |
| US-6.1 | Enroll page shows a loading state while sections load | `frontend/tests/Enroll.test.js` | `Enroll page shows a loading state while sections load` |
| US-6.1 | Enroll page shows a message when no semesters exist | `frontend/tests/Enroll.test.js` | `Enroll page shows a message when no semesters exist` |
| US-6.1 | Enroll page shows a message when the semester has no sections | `frontend/tests/Enroll.test.js` | `Enroll page shows a message when the semester has no sections` |
| US-6.1 | Enroll page shows the API error when sections fail to load | `frontend/tests/Enroll.test.js` | `Enroll page shows the API error when sections fail to load` |
| US-6.1 | Enroll page shows the API error when semesters fail to load | `frontend/tests/Enroll.test.js` | `Enroll page shows the API error when semesters fail to load` |
| US-6.2 | Student enrolls in a section successfully | `backend/tests/enrollment.test.js` | `Student enrolls in a section successfully` |
| US-6.2 | Section shows Drop after the student enrolls | `frontend/tests/Enroll.test.js` | `Section shows Drop after the student enrolls` |
| US-6.2 | Supplied student ID does not override authenticated student | `backend/tests/enrollment.test.js` | `Supplied student ID does not override authenticated student` |
| US-6.2 | Student submits enrollment without section ID | `backend/tests/enrollment.test.js` | `Student submits enrollment without section ID` |
| US-6.2 | Student submits a non-numeric section ID | `backend/tests/enrollment.test.js` | `Student submits a non-numeric section ID` |
| US-6.2 | Student enrolls in a section that does not exist | `backend/tests/enrollment.test.js` | `Student enrolls in a section that does not exist` |
| US-6.2 | Student tries to enroll in the same section twice | `backend/tests/enrollment.test.js` | `Student tries to enroll in the same section twice` |
| US-6.2 | Enroll page shows the API error when enrolling fails | `frontend/tests/Enroll.test.js` | `Enroll page shows the API error when enrolling fails` |
| US-6.3 | Student retrieves their own enrollments | `backend/tests/enrollment.test.js` | `Student retrieves their own enrollments` |
| US-6.3 | Enroll page shows Enroll for a section I am not enrolled in | `frontend/tests/Enroll.test.js` | `Enroll page shows Enroll for a section I am not enrolled in` |
| US-6.3 | Enroll page shows Drop for a section I am enrolled in | `frontend/tests/Enroll.test.js` | `Enroll page shows Drop for a section I am enrolled in` |
| US-6.3 | Enroll page shows the API error when enrollments fail to load | `frontend/tests/Enroll.test.js` | `Enroll page shows the API error when enrollments fail to load` |
| US-6.4 | Student drops their own enrollment | `backend/tests/enrollment.test.js` | `Student drops their own enrollment` |
| US-6.4 | Section shows Enroll after the student drops | `frontend/tests/Enroll.test.js` | `Section shows Enroll after the student drops` |
| US-6.4 | Student submits a non-numeric enrollment ID | `backend/tests/enrollment.test.js` | `Student submits a non-numeric enrollment ID` |
| US-6.4 | Student tries to drop an enrollment that does not exist | `backend/tests/enrollment.test.js` | `Student tries to drop an enrollment that does not exist` |
| US-6.4 | Student tries to drop another student's enrollment | `backend/tests/enrollment.test.js` | `Student tries to drop another student's enrollment` |
| US-6.4 | Enroll page shows the API error when dropping fails | `frontend/tests/Enroll.test.js` | `Enroll page shows the API error when dropping fails` |
| US-6.5 | Admin cannot access enrollment routes | `backend/tests/enrollment.test.js` | `Admin cannot access enrollment routes` |
| US-6.5 | Unauthenticated user cannot access enrollment routes | `backend/tests/enrollment.test.js` | `Unauthenticated user cannot access enrollment routes` |
| US-6.5 | Student sees Enroll in the MenuBar | `frontend/tests/Enroll.test.js` | `Student sees Enroll in the MenuBar` |
| US-6.5 | Admin does not see Enroll in the MenuBar | `frontend/tests/Enroll.test.js` | `Admin does not see Enroll in the MenuBar` |
| US-6.6 | Student can access the Enroll page | `frontend/tests/Enroll.test.js` | `Student can access the Enroll page` |
| US-6.6 | Signed-out user is sent to Login from the Enroll page | `frontend/tests/Enroll.test.js` | `Signed-out user is sent to Login from the Enroll page` |
| US-6.6 | Admin is sent to Home from the Enroll page | `frontend/tests/Enroll.test.js` | `Admin is sent to Home from the Enroll page` |
| US-6.7 | Deleting a section deletes its enrollments | `backend/tests/enrollment.test.js` | `Deleting a section deletes its enrollments` |
| US-6.7 | Deleting a student deletes their enrollments | `backend/tests/enrollment.test.js` | `Deleting a student deletes their enrollments` |
| US-6.8 | Student changes their enrollment to another section | `backend/tests/enrollment.test.js` | `Student changes their enrollment to another section` |
| US-6.8 | Section shows Drop after the student changes sections | `frontend/tests/Enroll.test.js` | `Section shows Drop after the student changes sections` |
| US-6.8 | Supplied student ID does not change the enrollment owner | `backend/tests/enrollment.test.js` | `Supplied student ID does not change the enrollment owner` |
| US-6.8 | Student changes an enrollment without section ID | `backend/tests/enrollment.test.js` | `Student changes an enrollment without section ID` |
| US-6.8 | Student changes an enrollment to a non-numeric section ID | `backend/tests/enrollment.test.js` | `Student changes an enrollment to a non-numeric section ID` |
| US-6.8 | Student changes an enrollment to a section that does not exist | `backend/tests/enrollment.test.js` | `Student changes an enrollment to a section that does not exist` |
| US-6.8 | Student changes an enrollment to a section they are already enrolled in | `backend/tests/enrollment.test.js` | `Student changes an enrollment to a section they are already enrolled in` |
| US-6.8 | Student changes an enrollment using a non-numeric enrollment ID | `backend/tests/enrollment.test.js` | `Student changes an enrollment using a non-numeric enrollment ID` |
| US-6.8 | Student tries to change an enrollment that does not exist | `backend/tests/enrollment.test.js` | `Student tries to change an enrollment that does not exist` |
| US-6.8 | Student tries to change another student's enrollment | `backend/tests/enrollment.test.js` | `Student tries to change another student's enrollment` |
| US-6.8 | Change section dialog shows a message when no other sections are available | `frontend/tests/Enroll.test.js` | `Change section dialog shows a message when no other sections are available` |
| US-6.8 | Change section dialog requires a new section | `frontend/tests/Enroll.test.js` | `Change section dialog requires a new section` |
| US-6.8 | Change section dialog shows the API error when the change fails | `frontend/tests/Enroll.test.js` | `Change section dialog shows the API error when the change fails` |

---

## Agent Implementation Request

Use the following prompt when asking the implementation agent to implement this feature:

```text
Implement Feature 6 from @features/feature-6-enrollment-management.md on branch feature/6-enrollment-management.

Only implement what is defined in this specification.

Follow the project's existing architecture, API conventions, security rules, coding conventions, and feature framework.

Follow the layer order in @features/framework.md (models → routes → backend tests → frontend services → views → frontend tests → router).

Feature dependencies:
- Feature 1 provides authentication.
- Feature 2 provides GET /course-t6/semesters readable by students.
- Feature 5 provides GET /course-t6/sections?semesterId=<id> including course information and instructor name.

Enrollment routes must be:
POST /course-t6/enrollments
GET /course-t6/enrollments
PUT /course-t6/enrollments/:id
DELETE /course-t6/enrollments/:id

Enrollment management is student-only.

Add a reusable requireStudent check to backend/app/authorization/authorization.js, next to authenticate and requireAdmin. It must return:
403 { "message": "Student role required." }
Protect every enrollment route with authenticate and requireStudent.

Register the Enrollment model and its associations in backend/app/models/index.js.

On create, derive studentId from the authenticated user.
Never trust studentId from the request body.
If studentId is supplied in the request body, ignore it.

Students may only retrieve, change, and delete their own enrollments.
On change, update only sectionId, apply the same sectionId rules as create, and ignore studentId from the request body.

When an enrollment does not exist or belongs to another student, return 404.
Do not reveal ownership through a 403 response.

The Enroll page route must be /enroll with route name enroll.
Signed-out users are sent to Login.
Admins are sent to Home.
Show a loading state while semesters, sections, or enrollments load.
Show "No semesters available." when no semesters exist.
Show "No sections for this semester." when the selected semester has no sections.
List sections in the order returned by Feature 5.
After enrolling, show Drop for that section; after dropping, show Enroll.
Show Change section for each enrolled section. The Change section dialog lists the other sections of the selected semester the student is not enrolled in, shows "No other sections available." when there are none, and has Save and Cancel.
After a successful change, the original section shows Enroll and the new section shows Drop.
Show the API error message when any request on the Enroll page fails.

Deleting a section must delete its enrollments, and deleting a student must delete their enrollments.
Use ON DELETE CASCADE on the sectionId and studentId foreign keys.

Use the exact error messages defined in this specification.

Map every Gherkin scenario in the Test Coverage Map to at least one automated test.

Use the exact test file paths listed in the Test Coverage Map.

Do not implement admin enrollment, admin removal, or other behavior not defined in this specification.

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

- [ ] Student users can select a semester and view its sections.
- [ ] Students can enroll themselves in a section.
- [ ] `studentId` comes from the authenticated user.
- [ ] A supplied `studentId` cannot override the authenticated user's id.
- [ ] Missing `sectionId` returns `400` with the required message.
- [ ] Non-numeric `sectionId` returns `400` with the required message.
- [ ] Missing section returns `404` with the required message.
- [ ] Students cannot enroll twice in the same section.
- [ ] Students can retrieve only their own enrollments.
- [ ] POST enrollment returns the created enrollment including `id` and `sectionId`.
- [ ] GET enrollments returns enrollment records including `id` and `sectionId`.
- [ ] The Enroll page correctly displays Enroll or Drop for each section.
- [ ] The Enroll page shows a loading state while semesters, sections, or enrollments load.
- [ ] The Enroll page shows `No semesters available.` when no semesters exist.
- [ ] The Enroll page shows `No sections for this semester.` when the selected semester has no sections.
- [ ] Sections are listed in the order returned by Feature 5.
- [ ] After enrolling, the section shows Drop; after dropping, it shows Enroll.
- [ ] The Enroll page shows the API error message when any of its requests fail.
- [ ] Students can drop their own enrollments.
- [ ] Students cannot drop another student's enrollment.
- [ ] Students can change one of their own enrollments to another section.
- [ ] Changing an enrollment updates only `sectionId` and ignores a supplied `studentId`.
- [ ] Changing to a missing, non-numeric, non-existent, or already-enrolled section returns the required error.
- [ ] Students cannot change another student's enrollment.
- [ ] The Change section dialog shows `No other sections available.` when there are none, validates the new section, shows a loading state on **Save**, shows API errors, and closes without saving on **Cancel**.
- [ ] After a change, the original section shows Enroll and the new section shows Drop.
- [ ] Missing or foreign enrollments return `404`.
- [ ] Feature 6 provides a reusable student-only authorization check.
- [ ] Admin users receive `403` on POST, GET, PUT, and DELETE enrollment routes.
- [ ] Unauthenticated users receive `401` on enrollment routes.
- [ ] Student users see **Enroll** in the MenuBar.
- [ ] Admin users do not see **Enroll** in the MenuBar.
- [ ] `/enroll` is accessible to authenticated students.
- [ ] Signed-out users navigating to `/enroll` are sent to Login.
- [ ] Admins navigating to `/enroll` are sent to Home.
- [ ] The `enrollments` table contains `id`, `sectionId`, `studentId`, `createdAt`, and `updatedAt`.
- [ ] `(studentId, sectionId)` is unique.
- [ ] The Enrollment model and its associations are registered in `backend/app/models/index.js`.
- [ ] Deleting a section deletes its enrollments.
- [ ] Deleting a student deletes their enrollments.
- [ ] Backend and frontend are implemented per this spec (**FR-001**–**FR-040** satisfied).
- [ ] **Success Criteria (SC-001**–**SC-020)** are met.
- [ ] Test Coverage Map is complete.
- [ ] Every acceptance scenario has an automated test.
- [ ] All tests pass (`npm test`).
- [ ] `features/reference/api.md` is updated.
- [ ] `features/reference/data-model.md` is updated.
- [ ] `features/reference/behavior.md` is updated.
- [ ] `features/reference/README.md` lists Feature 6 in its provenance table.
- [ ] `features/README.md` links Feature 6 to `feature-6-enrollment-management.md`.
- [ ] Nothing outside this specification is implemented.

---

## Out of Scope

- Creating, editing, or deleting courses → Feature 3
- Faculty management → [Feature 4](feature-4-faculty-management.md)
- Creating, editing, or deleting sections → Feature 5
- Separate **My Enrolled Sections** page → Feature 7
- Admin section roster → Feature 8
- Admin enrolling students
- Admin removing students from enrollments
