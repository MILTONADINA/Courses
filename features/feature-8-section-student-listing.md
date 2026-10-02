# Feature: Section Student Listing

**Feature ID:** 8  
**Branch pattern:** `feature/8-section-student-listing`  
**Status:** Ready  
**Created:** 2026-10-01  
**Input:** A signed-in admin can see the students enrolled in a section.  
**Depends on:** [Feature 1 — User Authentication & Authorization](feature-1-user-authentication-authorization.md), [Feature 5 — Section Management](feature-5-section-management.md), [Feature 6 — Enrollment Management](feature-6-enrollment-management.md)

---

## User Stories

Every story is P1: each one must ship for the assignment's Section Student Listing feature.

### US-8.1: View the students enrolled in a section

**As a** signed-in admin  
**I want to** see the students enrolled in a section  
**So that** I know who is taking that section

**Priority:** P1  
**Independent test:** Enroll two students in a section, then open that section's student list as an admin and confirm both students are listed  
**Acceptance scenarios:** see ### US-8.1 under Acceptance Criteria

### US-8.2: Restrict section student lists to admins

**As the** application  
**I want to** show section student lists only to admins  
**So that** a student cannot see which other students are enrolled in a section

**Priority:** P1  
**Independent test:** Request a section's student list as an admin, as a student, and as a signed-out user  
**Acceptance scenarios:** see ### US-8.2 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: The system MUST allow an admin to list the students enrolled in a section.
- **FR-002**: The section student list MUST include the section's `sectionNumber`, its course's `courseNumber` and `courseName`, and its semester's `semesterName`.
- **FR-003**: Each listed student MUST include the student's `id`, `firstName`, `lastName`, `universityId`, and `email`.
- **FR-004**: A listed student MUST NOT include `password`.
- **FR-005**: The list MUST include only students enrolled in the requested section.
- **FR-006**: Students MUST be sorted by `lastName` ascending, then `firstName` ascending.
- **FR-007**: When the section has no enrollments, the API MUST return `200` with an empty `students` array.
- **FR-008**: A section id that is not a number MUST return `400` with `{ "message": "Section id must be a number." }`.
- **FR-009**: A section id that does not exist MUST return `404` with `{ "message": "Section with id=<id> not found." }`.
- **FR-010**: The section student list endpoint MUST use the Feature 1 authentication check and admin-only authorization check.
- **FR-011**: A request from an authenticated student MUST return `403` with `{ "message": "Admin role required." }`.
- **FR-012**: A request with no valid session MUST return `401` with `{ "message": "Unauthorized." }`.
- **FR-013**: The Sections page MUST show a **Students** action for each section that opens that section's Section students page.
- **FR-014**: The Section students page route MUST be `/sections/:id/students` with route name `section-students`.
- **FR-015**: An authenticated student who opens the Section students page MUST be sent to the Home page.
- **FR-016**: An unauthenticated user who opens the Section students page MUST be sent to the Login page.
- **FR-017**: The Section students page MUST show a loading state while the list loads.
- **FR-018**: When the section has no enrollments, the Section students page MUST show `No students enrolled.`
- **FR-019**: When the list request fails, the Section students page MUST show the error message returned by the API.
- **FR-020**: When the list request fails without an API message, the Section students page MUST show `Request failed.`
- **FR-021**: The Section students page MUST NOT add, remove, or change enrollments.

---

## Assumptions

- Feature 1 provides the `users` table with `id`, `firstName`, `lastName`, `email`, `universityId`, and `role`, plus the authentication and admin-only authorization checks.
- Feature 5 provides the `sections` table, the Sections page at `/sections` for admins, and each section's semester and course.
- Feature 6 provides the `enrollments` table that links a section to a student.
- Only users with role `student` have enrollments (Feature 6), so every listed user is a student.
- Students enroll and drop themselves in Feature 6. This feature only lists those enrollments.
- Admins reach a section's student list from the Sections page, so the MenuBar gets no new link.

---

## Edge Cases

- Section has no enrollments → `200` with `students: []`, and the page shows `No students enrolled.`
- A student is enrolled in another section → that student is not in this section's list.
- Section id that is not a number → `400`.
- Section id that does not exist → `404`.
- Authenticated student requests the list → `403`.
- Unauthenticated request → `401`.
- The list request fails with an API message → the page shows that message.
- The list request fails without an API message → the page shows `Request failed.`
- Student opens `/sections/:id/students` → Home page.
- Signed-out user opens `/sections/:id/students` → Login page.

---

## Success Criteria

- **SC-001**: An admin can see every student enrolled in a section, with each student's name, university ID, and email.
- **SC-002**: The list shows which section it belongs to: the course number and name, section number, and semester name.
- **SC-003**: A section with no enrollments returns an empty list and the page shows `No students enrolled.`
- **SC-004**: The list never includes a student who is not enrolled in that section, and never includes a password.
- **SC-005**: An authenticated student cannot see a section's student list and is sent to Home from the Section students page.
- **SC-006**: A signed-out user cannot see a section's student list and is sent to Login from the Section students page.
- **SC-007**: The Section students page does not add, remove, or change enrollments.
- **SC-008**: Every acceptance scenario has an automated test before merge.
- **SC-009**: All automated tests pass before merge.
- **SC-010**: Nothing outside this specification is implemented.

---

## Data Ownership & Isolation

A section's student list contains other students' names, university IDs, and email addresses, so only admins may see it.

- Every admin MUST be able to view the student list of every section.
- A student MUST NOT be able to view any section's student list, including a section they are enrolled in.
- Authorization MUST use the authenticated user's role from the Feature 1 session, not a value sent by the client.
- Hiding the **Students** action or page on the client MUST NOT be the only protection; the API MUST enforce the admin-only check.

---

## Key Entities

### Section student list

The students enrolled in one section. It shows the section's course, section number, and semester, and each enrolled student's name, university ID, and email. This feature does not create or change enrollments, sections, or users.

---

## API Requirements

All paths are under the API mount `/course-t6`.

| Method | Path | Authentication | Success |
|---|---|---|---|
| `GET` | `/course-t6/sections/:id/students` | Admin | `200` object |

There is no create, update, or delete route in this feature.

### List a Section's Students

**Endpoint:** `GET /course-t6/sections/:id/students`

**Authorization:** Admin only (Feature 1 admin-only authorization check)

**Success:** `200 OK`

```json
{
  "section": {
    "id": 3,
    "sectionNumber": "01",
    "courseNumber": "CMSC 4113",
    "courseName": "Software Engineering IV",
    "semesterName": "Fall 2026"
  },
  "students": [
    {
      "id": 8,
      "firstName": "Grace",
      "lastName": "Hopper",
      "universityId": "100200",
      "email": "grace.hopper@example.com"
    },
    {
      "id": 7,
      "firstName": "Alan",
      "lastName": "Turing",
      "universityId": "100100",
      "email": "alan.turing@example.com"
    }
  ]
}
```

`students` is sorted by `lastName`, then `firstName`. It is `[]` when the section has no enrollments.

### Section Student List Errors

All errors MUST return:

```json
{
  "message": "Human-readable explanation."
}
```

| Condition | Routes | Status | Message |
|---|---|---:|---|
| Section id is not a number | `GET` | `400` | `Section id must be a number.` |
| Section does not exist | `GET` | `404` | `Section with id=<id> not found.` |
| Authenticated student | `GET` | `403` | `Admin role required.` |
| No valid session | `GET` | `401` | `Unauthorized.` |

---

## Screen Requirements

### Section Students Page

**Route:** `/sections/:id/students`  
**Route name:** `section-students`  
**View:** `frontend/src/views/SectionStudents.vue`

The page MUST be available only to authenticated admins. A signed-out user is sent to the Login page. A signed-in student is sent to the Home page.

The page MUST:

- Load `GET /course-t6/sections/:id/students` for the section in the route.
- Display the heading `<courseNumber> <courseName> — Section <sectionNumber> (<semesterName>)`.
- Display students in a table with **Last name**, **First name**, **University ID**, and **Email** columns, in the order returned by the API.
- Show a loading state while the list loads.
- Show `No students enrolled.` when the section has no enrollments.
- Show the API error message when the request fails, or `Request failed.` when the API gives no message.
- NOT show actions that add, remove, or change enrollments.

### Sections Page

The Sections page from Feature 5 MUST:

- Show a **Students** text-labeled action (not icon-only) for each section that opens `/sections/:id/students` for that section.

---

## Data Model Requirements

This feature adds no table and no columns. It reads the section's course and semester (Feature 5), the section's enrollments (Feature 6), and each enrolled student's user record (Feature 1).

### Associations

- This feature adds no associations.

---

## Acceptance Criteria (Gherkin)

### US-8.1 — View the students enrolled in a section

#### Scenario: Admin views the students enrolled in a section

* **Given** I am signed in as an admin
* **And** section `3` is section `01` of `CMSC 4113` `Software Engineering IV` for `Fall 2026`
* **And** student `Grace Hopper` with university ID `100200` and email `grace.hopper@example.com` is enrolled in section `3`
* **When** I send `GET /course-t6/sections/3/students`
* **Then** the API returns `200`
* **And** the response contains `sectionNumber` `01`, `courseNumber` `CMSC 4113`, `courseName` `Software Engineering IV`, and `semesterName` `Fall 2026`
* **And** the students include `firstName` `Grace`, `lastName` `Hopper`, `universityId` `100200`, and `email` `grace.hopper@example.com`

#### Scenario: Section students are sorted by last name, then first name

* **Given** I am signed in as an admin
* **And** `Alan Turing`, `Grace Hopper`, and `Ada Hopper` are enrolled in section `3`
* **When** I send `GET /course-t6/sections/3/students`
* **Then** the API returns `200`
* **And** the students are listed in the order `Ada Hopper`, `Grace Hopper`, `Alan Turing`

#### Scenario: Section student list does not include students from other sections

* **Given** I am signed in as an admin
* **And** a student is enrolled in section `4` but not in section `3`
* **When** I send `GET /course-t6/sections/3/students`
* **Then** the API returns `200`
* **And** the students do not include that student

#### Scenario: Section student list does not include passwords

* **Given** I am signed in as an admin
* **And** a student is enrolled in section `3`
* **When** I send `GET /course-t6/sections/3/students`
* **Then** the API returns `200`
* **And** no student in the response includes `password`

#### Scenario: Admin views a section with no students

* **Given** I am signed in as an admin
* **And** section `3` has no enrollments
* **When** I send `GET /course-t6/sections/3/students`
* **Then** the API returns `200`
* **And** the students are an empty list

#### Scenario: Admin views the students of a section that does not exist

* **Given** I am signed in as an admin
* **And** no section with id `999` exists
* **When** I send `GET /course-t6/sections/999/students`
* **Then** the API returns `404`
* **And** the response is `{ "message": "Section with id=999 not found." }`

#### Scenario: Admin views the students of a section with an id that is not a number

* **Given** I am signed in as an admin
* **When** I send `GET /course-t6/sections/abc/students`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Section id must be a number." }`

#### Scenario: Admin opens a section's student list from the Sections page

* **Given** I am signed in as an admin on the Sections page
* **And** section `3` is listed
* **When** I select **Students** for section `3`
* **Then** I am on `/sections/3/students`

#### Scenario: Section students page shows the enrolled students

* **Given** I am signed in as an admin
* **And** `Grace Hopper` is enrolled in section `01` of `CMSC 4113` `Software Engineering IV` for `Fall 2026`
* **When** I open the Section students page for that section
* **Then** I see the heading `CMSC 4113 Software Engineering IV — Section 01 (Fall 2026)`
* **And** I see `Hopper`, `Grace`, the university ID, and the email in the student table

#### Scenario: Section students page shows a loading state

* **Given** I am signed in as an admin
* **And** the section student list will not finish right away
* **When** I open the Section students page
* **Then** a loading state is shown until the list arrives

#### Scenario: Section students page shows a message when no students are enrolled

* **Given** I am signed in as an admin
* **And** the section has no enrollments
* **When** I open the Section students page
* **Then** I see `No students enrolled.`

#### Scenario: Section students page shows the API error when the list fails

* **Given** I am signed in as an admin
* **And** the section student list request will fail with an error message
* **When** I open the Section students page
* **Then** the page shows the error message returned by the API

#### Scenario: Section students page shows a fallback error when the API gives no message

* **Given** I am signed in as an admin
* **And** the section student list request will fail without an error message
* **When** I open the Section students page
* **Then** the page shows `Request failed.`

#### Scenario: Section students page does not offer enrollment actions

* **Given** I am signed in as an admin on the Section students page
* **When** the page is displayed
* **Then** I do not see actions that add, remove, or change enrollments

---

### US-8.2 — Restrict section student lists to admins

#### Scenario: Student cannot view a section's students

* **Given** I am signed in as a student
* **When** I send `GET /course-t6/sections/3/students`
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`

#### Scenario: Unauthenticated user cannot view a section's students

* **Given** I am not signed in
* **When** I send `GET /course-t6/sections/3/students`
* **Then** the API returns `401`
* **And** the response is `{ "message": "Unauthorized." }`

#### Scenario: Student is sent to Home from the Section students page

* **Given** I am signed in as a student
* **When** I navigate to `/sections/3/students`
* **Then** I am sent to the Home page

#### Scenario: Signed-out user is sent to Login from the Section students page

* **Given** I am not signed in
* **When** I navigate to `/sections/3/students`
* **Then** I am sent to the Login page

---

## Test Coverage Map

Each scenario MUST map to at least one automated test.

| Story | Scenario | Test File | Test Name |
|---|---|---|---|
| US-8.1 | Admin views the students enrolled in a section | `backend/tests/sectionStudents.test.js` | `Admin views the students enrolled in a section` |
| US-8.1 | Section students are sorted by last name, then first name | `backend/tests/sectionStudents.test.js` | `Section students are sorted by last name, then first name` |
| US-8.1 | Section student list does not include students from other sections | `backend/tests/sectionStudents.test.js` | `Section student list does not include students from other sections` |
| US-8.1 | Section student list does not include passwords | `backend/tests/sectionStudents.test.js` | `Section student list does not include passwords` |
| US-8.1 | Admin views a section with no students | `backend/tests/sectionStudents.test.js` | `Admin views a section with no students` |
| US-8.1 | Admin views the students of a section that does not exist | `backend/tests/sectionStudents.test.js` | `Admin views the students of a section that does not exist` |
| US-8.1 | Admin views the students of a section with an id that is not a number | `backend/tests/sectionStudents.test.js` | `Admin views the students of a section with an id that is not a number` |
| US-8.1 | Admin opens a section's student list from the Sections page | `frontend/tests/SectionStudents.test.js` | `Admin opens a section's student list from the Sections page` |
| US-8.1 | Section students page shows the enrolled students | `frontend/tests/SectionStudents.test.js` | `Section students page shows the enrolled students` |
| US-8.1 | Section students page shows a loading state | `frontend/tests/SectionStudents.test.js` | `Section students page shows a loading state` |
| US-8.1 | Section students page shows a message when no students are enrolled | `frontend/tests/SectionStudents.test.js` | `Section students page shows a message when no students are enrolled` |
| US-8.1 | Section students page shows the API error when the list fails | `frontend/tests/SectionStudents.test.js` | `Section students page shows the API error when the list fails` |
| US-8.1 | Section students page shows a fallback error when the API gives no message | `frontend/tests/SectionStudents.test.js` | `Section students page shows a fallback error when the API gives no message` |
| US-8.1 | Section students page does not offer enrollment actions | `frontend/tests/SectionStudents.test.js` | `Section students page does not offer enrollment actions` |
| US-8.2 | Student cannot view a section's students | `backend/tests/sectionStudents.test.js` | `Student cannot view a section's students` |
| US-8.2 | Unauthenticated user cannot view a section's students | `backend/tests/sectionStudents.test.js` | `Unauthenticated user cannot view a section's students` |
| US-8.2 | Student is sent to Home from the Section students page | `frontend/tests/SectionStudents.test.js` | `Student is sent to Home from the Section students page` |
| US-8.2 | Signed-out user is sent to Login from the Section students page | `frontend/tests/SectionStudents.test.js` | `Signed-out user is sent to Login from the Section students page` |

---

## Agent Implementation Request

Application code for this feature is written by hand ("create code (by hand) and test"). AI may be used only to build the automated tests ("Building automated tests (with AI)"). The checklist below is for the person coding the feature.

### Handwritten application code

Write these by hand on branch `feature/8-section-student-listing`, in the layer order in `features/framework.md` (models → routes → backend tests → frontend services → views → frontend tests → router). Build only what this specification defines.

- [ ] Route `GET /course-t6/sections/:id/students`, protected by `authenticate` and `requireAdmin` from `backend/app/authorization/authorization.js`.
- [ ] The response has the section's `id`, `sectionNumber`, `courseNumber`, `courseName`, and `semesterName`, and a `students` array.
- [ ] Each student has `id`, `firstName`, `lastName`, `universityId`, and `email`, and never `password`.
- [ ] Only students enrolled in that section are returned, sorted by `lastName`, then `firstName`.
- [ ] A section with no enrollments returns `200` with `students: []`.
- [ ] Error messages match this specification exactly.
- [ ] No create, update, or delete route, and no table, columns, or associations are added.
- [ ] The Section students page route is `/sections/:id/students` with route name `section-students`; signed-out users are sent to Login and students to Home.
- [ ] Each row of the Sections page has a **Students** action that opens `/sections/:id/students`.
- [ ] The page shows the heading `<courseNumber> <courseName> — Section <sectionNumber> (<semesterName>)` and Last name, First name, University ID, and Email columns in the order returned by the API.
- [ ] The page shows a loading state, `No students enrolled.` when the list is empty, the API message when the request fails, and `Request failed.` when the API gives no message.
- [ ] The page has no actions that add, remove, or change enrollments, and no MenuBar link is added.

### Automated tests (AI allowed)

AI may write only the automated tests. It MUST NOT write or change application code in `backend/app` or `frontend/src`.

- [ ] Every row in the Test Coverage Map has a test in the listed file with the listed test name.
- [ ] `npm test` passes from the project root.
- [ ] A test that fails because the application code does not match this specification is fixed in the handwritten code, not by changing the test.

When the code and tests are done, update the reference documentation listed below and complete the Definition of Done and the merge checklist in `features/framework.md`.

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/behavior.md`, `features/reference/README.md` (provenance)

---

## Definition of Done

- [ ] An admin can list the students enrolled in a section.
- [ ] The response includes the section's section number, course number and name, and semester name.
- [ ] Each student includes `id`, `firstName`, `lastName`, `universityId`, and `email`, and never `password`.
- [ ] The list includes only students enrolled in that section, sorted by last name, then first name.
- [ ] A section with no enrollments returns `200` with `students: []`.
- [ ] A non-numeric section id returns `400` with `Section id must be a number.`
- [ ] A section id that does not exist returns `404` with `Section with id=<id> not found.`
- [ ] Students receive `403` with `Admin role required.`
- [ ] Unauthenticated users receive `401` with `{ "message": "Unauthorized." }`.
- [ ] The Sections page shows a **Students** action for each section that opens its Section students page.
- [ ] The Section students page route is `/sections/:id/students` with route name `section-students`.
- [ ] Students who open the Section students page are sent to Home; signed-out users are sent to Login.
- [ ] The Section students page shows the section heading and a Last name, First name, University ID, and Email table.
- [ ] The Section students page shows a loading state, `No students enrolled.` when empty, the API message on failure, and `Request failed.` when the API gives no message.
- [ ] The Section students page does not add, remove, or change enrollments.
- [ ] No table, columns, or associations are added.
- [ ] Backend and frontend are implemented per this spec (**FR-001**–**FR-021** satisfied).
- [ ] **Success Criteria (SC-001**–**SC-010)** are met.
- [ ] Test Coverage Map is complete.
- [ ] Every acceptance scenario has an automated test.
- [ ] All tests pass (`npm test`).
- [ ] `features/reference/api.md` is updated.
- [ ] `features/reference/behavior.md` is updated.
- [ ] `features/reference/README.md` lists Feature 8 in its provenance table.
- [ ] `features/README.md` links Feature 8 to `feature-8-section-student-listing.md`.
- [ ] Nothing outside this specification is implemented.

---

## Out of Scope

- Creating, editing, or deleting sections → [Feature 5](feature-5-section-management.md)
- Enrolling, dropping, or changing a section → [Feature 6](feature-6-enrollment-management.md)
- Admin enrolling students or removing students from enrollments
- A student's own list of enrolled sections → [Feature 7](feature-7-student-course-listing.md)
- Adding, editing, or deleting student accounts → [Feature 9](feature-9-student-management.md)
