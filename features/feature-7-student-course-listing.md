# Feature: Student Course Listing

**Feature ID:** 7  
**Branch pattern:** `feature/7-student-course-listing`  
**Status:** Ready  
**Created:** 2026-10-01  
**Input:** Give a signed-in student a page that lists the sections they already enrolled in, so they can see their classes without going back to Enroll.  
**Depends on:** [Feature 6 — Enrollment Management](feature-6-enrollment-management.md)

---

## User Stories

Both stories are P1. The assignment has a student course listing, and it is useless if a student can see someone else's classes.

### US-7.1: View my enrolled sections

**As a** signed-in student  
**I want to** see the sections I am enrolled in  
**So that** I can check my classes and when they meet

**Priority:** P1  
**Independent test:** Enroll a student in a section, open that student's course list, and check that the course, section, semester, time, and instructor are all there  
**Acceptance scenarios:** see ### US-7.1 under Acceptance Criteria

### US-7.2: Restrict the course list to the signed-in student

**As the** application  
**I want to** show each student only their own enrolled sections  
**So that** one student cannot look up another student's classes

**Priority:** P1  
**Independent test:** Ask for the list as the enrolled student, as a different student, as an admin, and while signed out  
**Acceptance scenarios:** see ### US-7.2 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: The course list MUST use the authenticated user from Feature 1 and the student-only check from Feature 6.
- **FR-002**: An authenticated user who is not a student MUST receive `403` with `{ "message": "Student role required." }`.
- **FR-003**: A student MUST be able to list the sections they are enrolled in.
- **FR-004**: Each listed section MUST include the course number, course name, section number, semester name, meeting days, meeting times, and instructor name stored for that section.
- **FR-005**: The list MUST include only enrollments whose student is the authenticated user.
- **FR-006**: When the student has no enrollments, the list MUST return `200` with `[]`.
- **FR-007**: A request with no valid session MUST return `401` with `{ "message": "Unauthorized." }`.
- **FR-008**: The My courses page MUST be available to signed-in students.
- **FR-009**: An authenticated admin who opens the My courses page MUST be sent to the Home page.
- **FR-010**: An unauthenticated visit to the My courses page MUST send the user to the Login page.
- **FR-011**: The MenuBar MUST show a **My courses** link to `/my-courses` for students only.
- **FR-012**: The My courses page MUST show a loading state while the course list loads.
- **FR-013**: When the student has no enrollments, the My courses page MUST show `No enrolled sections.`
- **FR-014**: When the My courses page request fails, the page MUST display the error message returned by the API.
- **FR-015**: When the My courses page request fails without an API message, the page MUST show `Request failed.`
- **FR-016**: The My courses page MUST NOT enroll, drop, or change a section.

---

## Assumptions

- Students enroll, drop, and change sections on the Enroll page from Feature 6. This feature only lists what they already picked.
- Feature 6's enrollment list returns ids only. It does not include the course name, meeting time, or instructor. Students also cannot call the admin course or faculty routes. That is why this feature adds `GET /course-t6/my-courses` and puts those display fields on the response.
- I am showing the same section info Feature 6 already shows on the Enroll page, plus the semester name, so the student can tell which term the class is in.
- Days and times are whatever Feature 5 stored. I am not inventing a format for them.
- The assignment does not say the list has to be in a certain order, so I am not adding a sort.
- Feature 6 already has the student-only check. Reuse it. Admins get `{ "message": "Student role required." }`.

---

## Edge Cases

- Student with no enrollments → `200` with `[]`, and the page shows `No enrolled sections.`
- Student is enrolled in more than one section → the list includes each of those sections.
- Another student is enrolled in a section → that section is not in this student's list.
- Admin requests the list → `403`.
- Unauthenticated request → `401`.
- The list request fails with an API message → the page shows that message.
- The list request fails without an API message → the page shows `Request failed.`
- Admin opens `/my-courses` → Home page.
- Signed-out user opens `/my-courses` → Login page.

---

## Success Criteria

- **SC-001**: A student can see each section they are enrolled in, including its course number, course name, section number, semester name, meeting days, meeting times, and instructor name.
- **SC-002**: A student with no enrollments gets an empty list and sees `No enrolled sections.`
- **SC-003**: A student cannot see another student's enrolled sections.
- **SC-004**: An admin cannot use the course-list API and is sent to Home from the My courses page.
- **SC-005**: A signed-out user cannot use the course-list API and is sent to Login from the My courses page.
- **SC-006**: The My courses page does not enroll, drop, or change a section.
- **SC-007**: Every acceptance scenario has an automated test before merge.
- **SC-008**: All automated tests pass before merge.
- **SC-009**: Nothing outside this specification is implemented.
- **SC-010**: The My courses page shows a loading state, `No enrolled sections.` when the list is empty, the API error message when a request fails, and `Request failed.` when the API gives no message.

---

## Data Ownership & Isolation

This list is only the student who is signed in.

- Read the student from the session. Do not let the page pick a student id.
- If the request includes someone else's `studentId`, ignore it and still return the signed-in student's classes.
- An admin does not get this list.
- The My courses page and the **My courses** menu link are for students only.

---

## Key Entities

### Enrolled section

One row is one section the signed-in student is already in. Show the course, section number, semester, days, times, and instructor that are already stored. Do not create or change the enrollment from this page.

---

## API Requirements

All paths are under the API mount `/course-t6`.

| Method | Path | Authentication | Success |
|---|---|---|---|
| `GET` | `/course-t6/my-courses` | Student | `200` array |

Read only. No create, update, or delete on this route.

When the student has no enrollments, `GET /course-t6/my-courses` returns `200` with `[]`.

A listed section uses these fields:

```json
{
  "enrollmentId": 5,
  "courseNumber": "CMSC-4123",
  "courseName": "Software Engineering IV",
  "sectionNumber": "01",
  "semesterName": "Fall 2026",
  "daysOfWeek": "MWF",
  "startTime": "09:00",
  "endTime": "09:50",
  "instructorName": "Ada Lovelace"
}
```

`daysOfWeek`, `startTime`, and `endTime` are just the values already saved on the section. No extra format check in this feature.

### Course List Errors

| Condition | Routes | Status | Message |
|---|---|---:|---|
| Admin requests the list | `GET` | `403` | `Student role required.` |
| No valid session | `GET` | `401` | `Unauthorized.` |

---

## Screen Requirements

### My Courses Page

**Route:** `/my-courses`  
**Route name:** `my-courses`  
**View:** `frontend/src/views/MyCourses.vue`

This page is for a signed-in student. If nobody is signed in, send them to Login. If an admin opens it, send them Home.

The page MUST:

- Load `GET /course-t6/my-courses`.
- Show `courseNumber`, `courseName`, `sectionNumber`, `semesterName`, `daysOfWeek`, `startTime`, `endTime`, and `instructorName` for each enrolled section.
- Show a loading state while the list loads.
- Show `No enrolled sections.` when the list is empty.
- Display the API `message` when the request fails.
- Show `Request failed.` when the request fails without an API message.
- NOT show **Enroll**, **Drop**, or **Change section**.

### MenuBar

Show **My courses** in the menu only for a student, and point it at `/my-courses`. An admin should not see that link.

---

## Data Model Requirements

No new table and no new columns. Read the signed-in student's enrollments and the course, section, semester, and instructor fields that are already there.

### Associations

- This feature adds no associations.

---

## Acceptance Criteria (Gherkin)

### US-7.1 — View my enrolled sections

#### Scenario: Student views an enrolled section

* **Given** I am signed in as a student
* **And** I am enrolled in section `01` of `CMSC-4123` `Software Engineering IV` for `Fall 2026`
* **And** that section meets `MWF` from `09:00` to `09:50` with instructor `Ada Lovelace`
* **When** I request my course list
* **Then** the API returns `200`
* **And** the list includes `courseNumber` `CMSC-4123`, `courseName` `Software Engineering IV`, `sectionNumber` `01`, `semesterName` `Fall 2026`, `daysOfWeek` `MWF`, `startTime` `09:00`, `endTime` `09:50`, and `instructorName` `Ada Lovelace`

#### Scenario: Student views more than one enrolled section

* **Given** I am signed in as a student
* **And** I am enrolled in two sections
* **When** I request my course list
* **Then** the API returns `200`
* **And** the list includes both sections

#### Scenario: Student views an empty course list

* **Given** I am signed in as a student
* **And** I have no enrollments
* **When** I request my course list
* **Then** the API returns `200`
* **And** the response is an empty list

#### Scenario: My courses page shows an enrolled section

* **Given** I am signed in as a student on the My courses page
* **And** I am enrolled in `Software Engineering IV`
* **When** the course list loads
* **Then** I see `Software Engineering IV`

#### Scenario: My courses page shows a loading state

* **Given** I am signed in as a student
* **And** the course list will not finish right away
* **When** I open the My courses page
* **Then** I see a loading state

#### Scenario: My courses page shows a message when the student has no enrollments

* **Given** I am signed in as a student
* **And** I have no enrollments
* **When** I open the My courses page
* **Then** I see `No enrolled sections.`

#### Scenario: My courses page shows the API error when the list fails

* **Given** I am signed in as a student
* **And** the course list request will fail with an error message
* **When** I open the My courses page
* **Then** I see the error message returned by the API

#### Scenario: My courses page shows a fallback error when the API gives no message

* **Given** I am signed in as a student
* **And** the course list request will fail without an error message
* **When** I open the My courses page
* **Then** I see `Request failed.`

#### Scenario: My courses page does not offer enrollment actions

* **Given** I am signed in as a student on the My courses page
* **When** the page is displayed
* **Then** I do not see **Enroll**, **Drop**, or **Change section**

---

### US-7.2 — Restrict the course list to the signed-in student

#### Scenario: Student does not see another student's section

* **Given** I am signed in as a student
* **And** another student is enrolled in `Software Engineering IV`
* **And** I am not enrolled in that section
* **When** I request my course list
* **Then** the API returns `200`
* **And** the list does not include that section

#### Scenario: Supplied student id does not change the list

* **Given** I am signed in as a student
* **And** another student has enrollments
* **When** I request my course list with that other student's id
* **Then** the API returns `200`
* **And** the list includes only my enrollments

#### Scenario: Admin cannot view the course list

* **Given** I am signed in as an admin
* **When** I request the course list
* **Then** the API returns `403`
* **And** the response is `{ "message": "Student role required." }`

#### Scenario: Unauthenticated user cannot view the course list

* **Given** I am not signed in
* **When** I request the course list
* **Then** the API returns `401`
* **And** the response is `{ "message": "Unauthorized." }`

#### Scenario: Student sees the My courses link

* **Given** I am signed in as a student
* **When** I view the menu
* **Then** I see a **My courses** link to the My courses page

#### Scenario: Admin does not see the My courses link

* **Given** I am signed in as an admin
* **When** I view the menu
* **Then** I do not see a **My courses** link

#### Scenario: Admin is sent to Home

* **Given** I am signed in as an admin
* **When** I open the My courses page
* **Then** I am sent to the Home page

#### Scenario: Signed-out user is sent to Login

* **Given** I am not signed in
* **When** I open the My courses page
* **Then** I am sent to the Login page

---

## Test Coverage Map

Each scenario MUST map to at least one automated test.

| Story | Scenario | Test File | Test Name |
|---|---|---|---|
| US-7.1 | Student views an enrolled section | `backend/tests/myCourses.test.js` | `Student views an enrolled section` |
| US-7.1 | Student views more than one enrolled section | `backend/tests/myCourses.test.js` | `Student views more than one enrolled section` |
| US-7.1 | Student views an empty course list | `backend/tests/myCourses.test.js` | `Student views an empty course list` |
| US-7.1 | My courses page shows an enrolled section | `frontend/tests/MyCourses.test.js` | `My courses page shows an enrolled section` |
| US-7.1 | My courses page shows a loading state | `frontend/tests/MyCourses.test.js` | `My courses page shows a loading state` |
| US-7.1 | My courses page shows a message when the student has no enrollments | `frontend/tests/MyCourses.test.js` | `My courses page shows a message when the student has no enrollments` |
| US-7.1 | My courses page shows the API error when the list fails | `frontend/tests/MyCourses.test.js` | `My courses page shows the API error when the list fails` |
| US-7.1 | My courses page shows a fallback error when the API gives no message | `frontend/tests/MyCourses.test.js` | `My courses page shows a fallback error when the API gives no message` |
| US-7.1 | My courses page does not offer enrollment actions | `frontend/tests/MyCourses.test.js` | `My courses page does not offer enrollment actions` |
| US-7.2 | Student does not see another student's section | `backend/tests/myCourses.test.js` | `Student does not see another student's section` |
| US-7.2 | Supplied student id does not change the list | `backend/tests/myCourses.test.js` | `Supplied student id does not change the list` |
| US-7.2 | Admin cannot view the course list | `backend/tests/myCourses.test.js` | `Admin cannot view the course list` |
| US-7.2 | Unauthenticated user cannot view the course list | `backend/tests/myCourses.test.js` | `Unauthenticated user cannot view the course list` |
| US-7.2 | Student sees the My courses link | `frontend/tests/MyCourses.test.js` | `Student sees the My courses link` |
| US-7.2 | Admin does not see the My courses link | `frontend/tests/MyCourses.test.js` | `Admin does not see the My courses link` |
| US-7.2 | Admin is sent to Home | `frontend/tests/MyCourses.test.js` | `Admin is sent to Home` |
| US-7.2 | Signed-out user is sent to Login | `frontend/tests/MyCourses.test.js` | `Signed-out user is sent to Login` |

---

## Agent Implementation Request

Application code for this feature is written by hand. The course does not allow AI to write the application code. The notes below are a checklist for the person coding the feature.

```text
Write Feature 7 by hand on branch feature/7-student-course-listing, using this spec.

Only build what this specification defines.

Follow the project's existing architecture, API conventions, security rules, coding conventions, and feature framework.

Follow the layer order in features/framework.md (models → routes → backend tests → frontend services → views → frontend tests → router).

Feature dependencies:
- Feature 1 provides authenticate.
- Feature 6 provides enrollments and the student-only check that returns 403 { "message": "Student role required." }.
- The enrolled section already has course number, course name, section number, semester name, meeting days, meeting times, and instructor name.

The only route is:
GET /course-t6/my-courses

It requires authenticate and the student-only check.
It returns only the authenticated student's enrollments.
An empty list returns 200 [].
Do not trust a studentId from the client.
Do not add create, update, or delete.
Do not add a table or columns.
Use the exact error messages defined in this specification.

The My courses page route is /my-courses with route name my-courses.
Signed-out users are sent to Login.
Admins are sent to Home.
Show a loading state while the list loads.
Show "No enrolled sections." when the list is empty.
Show course number, course name, section number, semester name, meeting days, meeting times, and instructor name.
Do not show Enroll, Drop, or Change section.
Show the API message when the request fails.
When the API gives no message, show "Request failed."
The MenuBar shows My courses only to a student and links it to /my-courses.
Do not call /course-t6/courses or /course-t6/faculty from this page.

Map every acceptance scenario in the Test Coverage Map to at least one automated test.

Use the exact test file paths and test names listed in the Test Coverage Map.

Do not add student account management, section editing, or enrollment changes.

Before finishing:
1. Run npm test from the project root (runs backend and frontend tests).
2. Confirm every acceptance scenario is covered by an automated test.
3. Confirm all tests pass.
4. Update the reference documentation listed below to match the shipped code.
5. Complete the Definition of Done and the merge checklist in features/framework.md.

Do not mark the feature complete if any requirement or acceptance scenario remains unimplemented or untested.
```

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`, `features/reference/README.md` (provenance)

---

## Definition of Done

- [ ] A student can list the sections they are enrolled in.
- [ ] Each item includes course number, course name, section number, semester name, meeting days, meeting times, and instructor name.
- [ ] An empty list returns `200` with `[]`.
- [ ] A student cannot see another student's enrolled sections.
- [ ] A supplied student id does not change whose list is returned.
- [ ] Admins receive `403` with `Student role required.`
- [ ] Signed-out API calls return `401`.
- [ ] Signed-out users who open `/my-courses` are sent to Login.
- [ ] Admins who open `/my-courses` are sent to Home.
- [ ] The My courses page shows a loading state, `No enrolled sections.` when empty, the API message on failure, and `Request failed.` when the API gives no message.
- [ ] The page does not show **Enroll**, **Drop**, or **Change section**.
- [ ] The MenuBar shows **My courses** only to a student.
- [ ] No table or columns are added.
- [ ] Backend and frontend are implemented per this spec (**FR-001**–**FR-016** satisfied).
- [ ] **Success Criteria (SC-001**–**SC-010)** are met.
- [ ] Test Coverage Map is complete.
- [ ] Every acceptance scenario has an automated test.
- [ ] All tests pass (`npm test`).
- [ ] `features/reference/api.md` is updated.
- [ ] `features/reference/data-model.md` is updated.
- [ ] `features/reference/behavior.md` is updated.
- [ ] `features/reference/README.md` lists Feature 7 in its provenance table.
- [ ] `features/README.md` links Feature 7 to this file.
- [ ] Nothing outside this specification is implemented.

---

## Out of Scope

- A student registering or an admin adding students → [Feature 1](feature-1-user-authentication-authorization.md) and Feature 9
- Semester records → [Feature 2](feature-2-semester-management.md)
- Course records → [Feature 3](feature-3-course-management.md)
- Faculty records → [Feature 4](feature-4-faculty-management.md)
- Creating or editing sections → Feature 5
- Enrolling, dropping, or changing a section → [Feature 6](feature-6-enrollment-management.md)
- An admin roster of one section → Feature 8
