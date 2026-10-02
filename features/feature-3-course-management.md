# Feature: Course Management

**Feature ID:** 3  
**Branch pattern:** `feature/3-course-management`  
**Status:** Ready  
**Created:** 2026-10-01  
**Input:** Admins create, update, and delete courses, and only admins can view the course list.  
**Depends on:** [Feature 1 — User Authentication & Authorization](feature-1-user-authentication-authorization.md)

---

## User Stories

Every story is P1: each one must ship for the assignment's course management feature.

### US-3.1: Create a course

**As a** signed-in admin  
**I want to** create a course with its number, name, description, semesters, frequency, hours, and department  
**So that** the class can be offered to students

**Priority:** P1  
**Independent test:** Submit a valid course as an admin and receive the created course  
**Acceptance scenarios:** see ### US-3.1 under Acceptance Criteria

### US-3.2: View courses

**As a** signed-in admin  
**I want to** see the list of courses  
**So that** I can find the class I need to change

**Priority:** P1  
**Independent test:** Create a course, then open the course list and confirm it is there  
**Acceptance scenarios:** see ### US-3.2 under Acceptance Criteria

### US-3.3: Update a course

**As a** signed-in admin  
**I want to** change a course's number, name, description, semesters, frequency, hours, or department  
**So that** students see the correct class information

**Priority:** P1  
**Independent test:** Update a course as an admin and confirm the response has the new values  
**Acceptance scenarios:** see ### US-3.3 under Acceptance Criteria

### US-3.4: Delete a course

**As a** signed-in admin  
**I want to** delete a course  
**So that** students are not shown a class that is no longer offered

**Priority:** P1  
**Independent test:** Delete a course as an admin and confirm the list no longer includes it  
**Acceptance scenarios:** see ### US-3.4 under Acceptance Criteria

### US-3.5: Restrict course management to admins

**As the** application  
**I want to** allow only admins to create, view, update, or delete courses  
**So that** students cannot change the course catalog

**Priority:** P1  
**Independent test:** Call each course endpoint as a student and as a signed-out user, and open `/courses` as each  
**Acceptance scenarios:** see ### US-3.5 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: Course management MUST use the authenticated user and role from Feature 1.
- **FR-002**: An admin MUST be able to create a course.
- **FR-003**: A course MUST store `courseNumber`, `courseName`, `courseDescription`, `courseSemesters`, `courseFrequency`, `courseHours`, and `courseDept`.
- **FR-004**: `courseNumber`, `courseName`, `courseDescription`, `courseSemesters`, `courseFrequency`, `courseHours`, and `courseDept` MUST be required.
- **FR-005**: A whitespace-only value in any required course field MUST be rejected as missing.
- **FR-006**: Invalid course information MUST return `400` with `{ "message": "..." }`.
- **FR-007**: Invalid course information MUST NOT create or change a course.
- **FR-008**: An admin MUST be able to list courses.
- **FR-009**: When no courses exist, the list MUST return `200` with `[]`.
- **FR-010**: A missing course on update or delete MUST return `404` with `{ "message": "Course with id=<id> not found." }`.
- **FR-011**: A non-numeric course id on update or delete MUST return `400` with `{ "message": "Course id must be a number." }`.
- **FR-012**: An admin MUST be able to update `courseNumber`, `courseName`, `courseDescription`, `courseSemesters`, `courseFrequency`, `courseHours`, and `courseDept`.
- **FR-013**: Update validation MUST use the same rules as creation.
- **FR-014**: A successful update MUST return `200` and the updated course.
- **FR-015**: An admin MUST be able to delete a course.
- **FR-016**: A successful delete MUST return `200` with `{ "message": "Course deleted successfully." }`.
- **FR-017**: A student MUST NOT create, list, update, or delete a course.
- **FR-018**: A student attempt to create, list, update, or delete a course MUST return `403` with `{ "message": "Admin role required." }`.
- **FR-019**: A request with no valid session MUST return `401` with `{ "message": "Unauthorized." }`.
- **FR-020**: The Courses page MUST show **Add course**, **Edit**, and **Delete** to an admin.
- **FR-021**: An authenticated student who opens the Courses page MUST be sent to the Home page.
- **FR-022**: An unauthenticated visit to the Courses page MUST send the user to the Login page.
- **FR-023**: The MenuBar MUST show a **Courses** link to `/courses` for admins only.
- **FR-024**: The Courses page MUST show a loading state while the course list loads.
- **FR-025**: When no courses exist, the Courses page MUST show `No courses found.`
- **FR-026**: When a Courses page request fails, the page MUST display the error message returned by the API.
- **FR-027**: When a Courses page request fails without an API message, the page MUST show `Request failed.`
- **FR-028**: The course form MUST check required fields before submitting, using the API's required messages.
- **FR-029**: The course form MUST NOT send the request when validation fails.
- **FR-030**: After a successful save or delete, the Courses page MUST show the updated list.
- **FR-031**: The **Save** button MUST show a loading state while the save request runs.
- **FR-032**: The course dialog MUST close after a successful save.

---

## Assumptions

- Feature 1 authentication is available, including `authenticate` and the admin-only check `requireAdmin` that returns `{ "message": "Admin role required." }`.
- The slide field names are kept: `courseNumber`, `courseName`, `courseDescription`, `courseSemesters`, `courseFrequency`, `courseHours`, and `courseDept`.
- `courseSemesters`, `courseFrequency`, `courseHours`, and `courseDept` are text. This feature does not require a format for them.
- `courseSemesters` is text on the course. It is not a link to the semesters table. Connecting a course to a semester belongs to Feature 5.
- Only admins manage courses. A student does not get a course catalog from this feature.
- No section records exist in this feature, so delete does not check for sections.

---

## Edge Cases

- Missing course number, name, description, semesters, frequency, hours, or department on create or update → `400` with that field's required message.
- Whitespace-only required course field → `400` with that field's required message.
- Unknown course id on `PUT` or `DELETE` → `404`.
- Non-numeric course id on `PUT` or `DELETE` → `400` with `Course id must be a number.`
- Student create, list, update, or delete → `403`.
- Unauthenticated request → `401`.
- No courses exist → `GET /course-t6/courses` returns `200` with `[]`, and the page shows `No courses found.`
- A Courses page request fails with an API message → the page shows that message.
- A Courses page request fails without an API message → the page shows `Request failed.`
- Student opens `/courses` → Home page.
- Signed-out user opens `/courses` → Login page.

---

## Success Criteria

- **SC-001**: An admin can create, view, update, and delete a course.
- **SC-002**: A student cannot list, create, update, or delete a course.
- **SC-003**: A signed-out user cannot use the course API and is sent to Login from the Courses page.
- **SC-004**: A student who opens the Courses page is sent to Home.
- **SC-005**: Invalid course information is rejected and does not change stored data.
- **SC-006**: Every acceptance scenario has an automated test before merge.
- **SC-007**: All automated tests pass before merge.
- **SC-008**: Nothing outside this specification is implemented.
- **SC-009**: The Courses page shows a loading state, `No courses found.` when the list is empty, the API error message when a request fails, and `Request failed.` when the API gives no message.

---

## Data Ownership & Isolation

Courses are shared catalog records. They are not owned by the admin who created them.

- Create, list, update, and delete MUST require an authenticated user whose role is `admin`.
- The client MUST NOT be trusted for the role. The server MUST read the role from the session.
- A student MUST NOT gain admin access by changing the page or the request body.
- The Courses page and the **Courses** menu link MUST be shown only to an admin.

---

## Key Entities

### Course

A class the school can offer. It stores a number, name, description, the semesters text, how often it is offered, hours, and department. Later features attach sections to a course. This feature does not create those links.

---

## API Requirements

All paths are under the API mount `/course-t6`.

| Method | Path | Authentication | Success |
|---|---|---|---|
| `POST` | `/course-t6/courses` | Admin | `201` course |
| `GET` | `/course-t6/courses` | Admin | `200` array |
| `PUT` | `/course-t6/courses/:id` | Admin | `200` course |
| `DELETE` | `/course-t6/courses/:id` | Admin | `200` message |

There is no `GET /course-t6/courses/:id` route.

When no courses exist, `GET /course-t6/courses` returns `200` with `[]`.

A course response uses these fields:

```json
{
  "id": 1,
  "courseNumber": "CMSC-4123",
  "courseName": "Software Engineering IV",
  "courseDescription": "Team project course",
  "courseSemesters": "Fall",
  "courseFrequency": "Every year",
  "courseHours": "3",
  "courseDept": "CMSC",
  "createdAt": "2026-10-01T20:15:00.000Z",
  "updatedAt": "2026-10-01T20:15:00.000Z"
}
```

Create and update accept this body:

```json
{
  "courseNumber": "CMSC-4123",
  "courseName": "Software Engineering IV",
  "courseDescription": "Team project course",
  "courseSemesters": "Fall",
  "courseFrequency": "Every year",
  "courseHours": "3",
  "courseDept": "CMSC"
}
```

### Delete Course

**Endpoint:** `DELETE /course-t6/courses/:id`

**Authentication:** Required, admin only

**Success:** `200 OK`

```json
{
  "message": "Course deleted successfully."
}
```

### Course Errors

| Condition | Routes | Status | Message |
|---|---|---:|---|
| Missing course number | `POST`, `PUT` | `400` | `Course number is required.` |
| Missing course name | `POST`, `PUT` | `400` | `Course name is required.` |
| Missing course description | `POST`, `PUT` | `400` | `Course description is required.` |
| Missing course semesters | `POST`, `PUT` | `400` | `Course semesters is required.` |
| Missing course frequency | `POST`, `PUT` | `400` | `Course frequency is required.` |
| Missing course hours | `POST`, `PUT` | `400` | `Course hours is required.` |
| Missing course department | `POST`, `PUT` | `400` | `Course department is required.` |
| Whitespace-only required field | `POST`, `PUT` | `400` | That field's required message |
| Non-numeric id | `PUT`, `DELETE` | `400` | `Course id must be a number.` |
| Unknown id | `PUT`, `DELETE` | `404` | `Course with id=<id> not found.` |
| Student create, list, update, or delete | All | `403` | `Admin role required.` |
| No valid session | All | `401` | `Unauthorized.` |

---

## Screen Requirements

### Courses Page

**Route:** `/courses`  
**Route name:** `courses`  
**View:** `frontend/src/views/Courses.vue`

The page MUST be available to signed-in admins. A signed-out user is sent to the Login page. A signed-in student is sent to the Home page.

The page MUST:

- Load `GET /course-t6/courses` and show `courseNumber`, `courseName`, `courseDescription`, `courseSemesters`, `courseFrequency`, `courseHours`, and `courseDept` for each course.
- Show a loading state while the list loads.
- Show `No courses found.` when the list is empty.
- Show **Add course** to an admin. This opens a dialog titled **Add course**.
- Show **Edit** and **Delete** to an admin for each course. **Edit** opens a dialog titled **Edit course**. These actions use those text labels, so they are not icon-only.
- Let an admin enter Course number, Course name, Course description, Course semesters, Course frequency, Course hours, and Course department. Course department is stored as `courseDept`.
- Check required fields before submit, using the required messages from the API, and do not send the request when a required field is empty.
- Provide **Save** and **Cancel** in the dialog.
- Show a loading state on **Save** while the request runs.
- Show the updated list after a successful save or delete.
- Close the dialog after a successful save.
- Display the API `message` when a request fails.
- Show `Request failed.` when a list, save, or delete fails without an API message.
- Close the dialog without saving when **Cancel** is selected.

### MenuBar

The MenuBar MUST show **Courses** to an admin and link it to `/courses`. The MenuBar MUST NOT show **Courses** to a student.

---

## Data Model Requirements

### `courses` table

| Field | Type/Requirement | Rules |
|---|---|---|
| `id` | Primary key | Auto-generated |
| `courseNumber` | String | Required |
| `courseName` | String | Required |
| `courseDescription` | String | Required |
| `courseSemesters` | String | Required text, not a semester foreign key |
| `courseFrequency` | String | Required |
| `courseHours` | String | Required |
| `courseDept` | String | Required |
| `createdAt` | Timestamp | Automatically generated |
| `updatedAt` | Timestamp | Automatically generated |

### Associations

- Courses have no associations in this feature.
- The Course model MUST be registered in `backend/app/models/index.js`.

---

## Acceptance Criteria (Gherkin)

### US-3.1 — Create a course

#### Scenario: Admin creates a course with valid information

* **Given** I am signed in as an admin
* **When** I submit course number `CMSC-4123`, course name `Software Engineering IV`, course description `Team project course`, course semesters `Fall`, course frequency `Every year`, course hours `3`, and course department `CMSC`
* **Then** the API returns `201`
* **And** the response contains `courseNumber` `CMSC-4123`, `courseName` `Software Engineering IV`, `courseDescription` `Team project course`, `courseSemesters` `Fall`, `courseFrequency` `Every year`, `courseHours` `3`, and `courseDept` `CMSC`

#### Scenario: Admin creates a course without a required field

* **Given** I am signed in as an admin
* **When** I submit a course with a required field empty
* **Then** the API returns `400`
* **And** the response contains that field's required message
* **And** no course is created

#### Scenario: Admin submits a whitespace-only course name

* **Given** I am signed in as an admin
* **When** I submit a course name of only spaces and valid values for the other fields
* **Then** the API returns `400`
* **And** the response is `{ "message": "Course name is required." }`
* **And** no course is created

#### Scenario: Admin creates a course from the Courses page

* **Given** I am signed in as an admin on the Courses page
* **When** I click **Add course**
* **And** I enter course number `CMSC-4123`, course name `Software Engineering IV`, course description `Team project course`, course semesters `Fall`, course frequency `Every year`, course hours `3`, and course department `CMSC`
* **And** I click **Save**
* **Then** the dialog closes
* **And** the list shows `Software Engineering IV`

#### Scenario: Course form blocks submit when a required field is empty

* **Given** I am signed in as an admin with the course dialog open
* **When** I click **Save** without a course name
* **Then** I see `Course name is required.`
* **And** no save request is sent

#### Scenario: Save shows a loading state while saving

* **Given** I am signed in as an admin with a valid course form
* **And** the save request will not finish right away
* **When** I click **Save**
* **Then** the **Save** button shows a loading state

#### Scenario: Courses page shows the API error when a save fails

* **Given** I am signed in as an admin with a valid course form
* **And** the save request will fail with an error message
* **When** I click **Save**
* **Then** I see the error message returned by the API

#### Scenario: Courses page shows a fallback error when a save fails without a message

* **Given** I am signed in as an admin with a valid course form
* **And** the save request will fail without an error message
* **When** I click **Save**
* **Then** I see `Request failed.`

---

### US-3.2 — View courses

#### Scenario: Signed-in admin views the course list

* **Given** I am signed in as an admin
* **And** a course named `Software Engineering IV` exists
* **When** I request the course list
* **Then** the API returns `200`
* **And** the list includes that course

#### Scenario: Courses page shows a loading state

* **Given** I am signed in as an admin
* **And** the course list will not finish right away
* **When** I open the Courses page
* **Then** I see a loading state

#### Scenario: Courses page shows a message when no courses exist

* **Given** I am signed in as an admin
* **And** no courses exist
* **When** I open the Courses page
* **Then** I see `No courses found.`

#### Scenario: Signed-in admin views an empty course list

* **Given** I am signed in as an admin
* **And** no courses exist
* **When** I request the course list
* **Then** the API returns `200`
* **And** the response is an empty list

#### Scenario: Courses page shows the API error when the list fails

* **Given** I am signed in as an admin
* **And** the course list request will fail with an error message
* **When** I open the Courses page
* **Then** I see the error message returned by the API

#### Scenario: Courses page shows a fallback error when the API gives no message

* **Given** I am signed in as an admin
* **And** the course list request will fail without an error message
* **When** I open the Courses page
* **Then** I see `Request failed.`

---

### US-3.3 — Update a course

#### Scenario: Admin updates a course

* **Given** I am signed in as an admin
* **And** a course exists
* **When** I update that course to course number `CMSC-3123`, course name `Software Engineering III`, course description `Updated description`, course semesters `Spring`, course frequency `Every year`, course hours `3`, and course department `CMSC`
* **Then** the API returns `200`
* **And** the response contains those new values

#### Scenario: Admin updates a course without a required field

* **Given** I am signed in as an admin
* **And** a course named `Software Engineering IV` exists
* **When** I update that course with an empty course name
* **Then** the API returns `400`
* **And** the response is `{ "message": "Course name is required." }`
* **And** the course list still shows `Software Engineering IV`

#### Scenario: Admin updates a course that does not exist

* **Given** I am signed in as an admin
* **When** I update course id `99999` with valid information
* **Then** the API returns `404`
* **And** the response is `{ "message": "Course with id=99999 not found." }`

#### Scenario: Admin updates a course using a non-numeric id

* **Given** I am signed in as an admin
* **When** I update course id `abc` with valid information
* **Then** the API returns `400`
* **And** the response is `{ "message": "Course id must be a number." }`

#### Scenario: Admin edits a course from the Courses page

* **Given** I am signed in as an admin on the Courses page
* **And** a course named `Software Engineering IV` is listed
* **When** I click **Edit** for that course
* **And** I change the name to `Software Engineering III` and click **Save**
* **Then** the dialog closes
* **And** the list shows `Software Engineering III`

---

### US-3.4 — Delete a course

#### Scenario: Admin deletes a course

* **Given** I am signed in as an admin
* **And** a course exists
* **When** I delete that course
* **Then** the API returns `200`
* **And** the response is `{ "message": "Course deleted successfully." }`

#### Scenario: Deleted course is no longer in the list

* **Given** I am signed in as an admin
* **And** I have deleted a course
* **When** I request the course list
* **Then** the API returns `200`
* **And** the list does not include that course

#### Scenario: Admin deletes a course that does not exist

* **Given** I am signed in as an admin
* **When** I delete course id `99999`
* **Then** the API returns `404`
* **And** the response is `{ "message": "Course with id=99999 not found." }`

#### Scenario: Admin deletes a course using a non-numeric id

* **Given** I am signed in as an admin
* **When** I delete course id `abc`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Course id must be a number." }`

#### Scenario: Admin deletes a course from the Courses page

* **Given** I am signed in as an admin on the Courses page
* **And** a course named `Software Engineering IV` is listed
* **When** I click **Delete** for that course
* **Then** the list no longer shows `Software Engineering IV`

#### Scenario: Courses page shows the API error when a delete fails

* **Given** I am signed in as an admin on the Courses page
* **And** a course is listed
* **And** the delete request will fail with an error message
* **When** I click **Delete** for that course
* **Then** I see the error message returned by the API
* **And** the course is still listed

#### Scenario: Courses page shows a fallback error when a delete fails without a message

* **Given** I am signed in as an admin on the Courses page
* **And** a course is listed
* **And** the delete request will fail without an error message
* **When** I click **Delete** for that course
* **Then** I see `Request failed.`
* **And** the course is still listed

---

### US-3.5 — Restrict course management to admins

#### Scenario: Student cannot create a course

* **Given** I am signed in as a student
* **When** I submit a valid course
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`
* **And** no course is created

#### Scenario: Student cannot update a course

* **Given** I am signed in as a student
* **And** a course named `Software Engineering IV` exists
* **When** I update that course with valid information
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`
* **And** the course list still shows `Software Engineering IV` for an admin

#### Scenario: Student cannot delete a course

* **Given** I am signed in as a student
* **And** a course named `Software Engineering IV` exists
* **When** I delete that course
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`
* **And** an admin still sees `Software Engineering IV` in the course list

#### Scenario: Student cannot list courses

* **Given** I am signed in as a student
* **When** I request the course list
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`

#### Scenario: Unauthenticated user cannot use course endpoints

* **Given** I am not signed in
* **When** I request the course list, create a course, update a course, or delete a course
* **Then** each request returns `401`
* **And** the response is `{ "message": "Unauthorized." }`

#### Scenario: Admin sees course change actions

* **Given** I am signed in as an admin
* **When** I open the Courses page
* **Then** I see **Add course**, **Edit**, and **Delete**

#### Scenario: Admin sees the Courses link

* **Given** I am signed in as an admin
* **When** I view the menu
* **Then** I see a **Courses** link to the Courses page

#### Scenario: Student does not see the Courses link

* **Given** I am signed in as a student
* **When** I view the menu
* **Then** I do not see a **Courses** link

#### Scenario: Student is sent to Home

* **Given** I am signed in as a student
* **When** I open the Courses page
* **Then** I am sent to the Home page

#### Scenario: Signed-out user is sent to Login

* **Given** I am not signed in
* **When** I open the Courses page
* **Then** I am sent to the Login page

---

## Test Coverage Map

Each scenario MUST map to at least one automated test.

| Story | Scenario | Test File | Test Name |
|---|---|---|---|
| US-3.1 | Admin creates a course with valid information | `backend/tests/course.test.js` | `Admin creates a course with valid information` |
| US-3.1 | Admin creates a course without a required field | `backend/tests/course.test.js` | `Admin creates a course without a required field` |
| US-3.1 | Admin submits a whitespace-only course name | `backend/tests/course.test.js` | `Admin submits a whitespace-only course name` |
| US-3.1 | Admin creates a course from the Courses page | `frontend/tests/Courses.test.js` | `Admin creates a course from the Courses page` |
| US-3.1 | Course form blocks submit when a required field is empty | `frontend/tests/Courses.test.js` | `Course form blocks submit when a required field is empty` |
| US-3.1 | Save shows a loading state while saving | `frontend/tests/Courses.test.js` | `Save shows a loading state while saving` |
| US-3.1 | Courses page shows the API error when a save fails | `frontend/tests/Courses.test.js` | `Courses page shows the API error when a save fails` |
| US-3.1 | Courses page shows a fallback error when a save fails without a message | `frontend/tests/Courses.test.js` | `Courses page shows a fallback error when a save fails without a message` |
| US-3.2 | Signed-in admin views the course list | `backend/tests/course.test.js` | `Signed-in admin views the course list` |
| US-3.2 | Courses page shows a loading state | `frontend/tests/Courses.test.js` | `Courses page shows a loading state` |
| US-3.2 | Courses page shows a message when no courses exist | `frontend/tests/Courses.test.js` | `Courses page shows a message when no courses exist` |
| US-3.2 | Signed-in admin views an empty course list | `backend/tests/course.test.js` | `Signed-in admin views an empty course list` |
| US-3.2 | Courses page shows the API error when the list fails | `frontend/tests/Courses.test.js` | `Courses page shows the API error when the list fails` |
| US-3.2 | Courses page shows a fallback error when the API gives no message | `frontend/tests/Courses.test.js` | `Courses page shows a fallback error when the API gives no message` |
| US-3.3 | Admin updates a course | `backend/tests/course.test.js` | `Admin updates a course` |
| US-3.3 | Admin updates a course without a required field | `backend/tests/course.test.js` | `Admin updates a course without a required field` |
| US-3.3 | Admin updates a course that does not exist | `backend/tests/course.test.js` | `Admin updates a course that does not exist` |
| US-3.3 | Admin updates a course using a non-numeric id | `backend/tests/course.test.js` | `Admin updates a course using a non-numeric id` |
| US-3.3 | Admin edits a course from the Courses page | `frontend/tests/Courses.test.js` | `Admin edits a course from the Courses page` |
| US-3.4 | Admin deletes a course | `backend/tests/course.test.js` | `Admin deletes a course` |
| US-3.4 | Deleted course is no longer in the list | `backend/tests/course.test.js` | `Deleted course is no longer in the list` |
| US-3.4 | Admin deletes a course that does not exist | `backend/tests/course.test.js` | `Admin deletes a course that does not exist` |
| US-3.4 | Admin deletes a course using a non-numeric id | `backend/tests/course.test.js` | `Admin deletes a course using a non-numeric id` |
| US-3.4 | Admin deletes a course from the Courses page | `frontend/tests/Courses.test.js` | `Admin deletes a course from the Courses page` |
| US-3.4 | Courses page shows the API error when a delete fails | `frontend/tests/Courses.test.js` | `Courses page shows the API error when a delete fails` |
| US-3.4 | Courses page shows a fallback error when a delete fails without a message | `frontend/tests/Courses.test.js` | `Courses page shows a fallback error when a delete fails without a message` |
| US-3.5 | Student cannot create a course | `backend/tests/course.test.js` | `Student cannot create a course` |
| US-3.5 | Student cannot update a course | `backend/tests/course.test.js` | `Student cannot update a course` |
| US-3.5 | Student cannot delete a course | `backend/tests/course.test.js` | `Student cannot delete a course` |
| US-3.5 | Student cannot list courses | `backend/tests/course.test.js` | `Student cannot list courses` |
| US-3.5 | Unauthenticated user cannot use course endpoints | `backend/tests/course.test.js` | `Unauthenticated user cannot use course endpoints` |
| US-3.5 | Admin sees course change actions | `frontend/tests/Courses.test.js` | `Admin sees course change actions` |
| US-3.5 | Admin sees the Courses link | `frontend/tests/Courses.test.js` | `Admin sees the Courses link` |
| US-3.5 | Student does not see the Courses link | `frontend/tests/Courses.test.js` | `Student does not see the Courses link` |
| US-3.5 | Student is sent to Home | `frontend/tests/Courses.test.js` | `Student is sent to Home` |
| US-3.5 | Signed-out user is sent to Login | `frontend/tests/Courses.test.js` | `Signed-out user is sent to Login` |

---

## Agent Implementation Request

Application code for this feature is written by hand. AI may be used only to build the automated tests, as required by the course slides.

### Handwritten application code

The following checklist is for the person coding this feature:

```text
Write Feature 3 by hand from @features/feature-3-course-management.md on branch feature/3-course-management.

Only implement what is defined in this specification.

Follow the project's existing architecture, API conventions, security rules, coding conventions, and feature framework.

Follow the layer order in @features/framework.md (models → routes → backend tests → frontend services → views → frontend tests → router).

Feature dependencies:
- Feature 1 provides authenticate and requireAdmin.

Course routes must be:
POST /course-t6/courses
GET /course-t6/courses
PUT /course-t6/courses/:id
DELETE /course-t6/courses/:id

There is no GET /course-t6/courses/:id route.

Use the field names courseNumber, courseName, courseDescription, courseSemesters, courseFrequency, courseHours, and courseDept.
courseSemesters is text. Do not add a foreign key to semesters.

Every course route requires authenticate and requireAdmin.
requireAdmin returns 403 { "message": "Admin role required." }.
A missing session returns 401 { "message": "Unauthorized." }.

Register the Course model in backend/app/models/index.js.
This feature adds no associations.

Use the exact error messages defined in this specification.

The Courses page route is /courses with route name courses.
Signed-out users are sent to Login.
Students are sent to Home.
Show a loading state while the list loads.
Show "No courses found." when the list is empty.
Show Add course, Edit, and Delete to an admin.
The form is a dialog titled Add course or Edit course, with Save and Cancel.
The dialog closes after a successful save.
Save shows a loading state while the request runs.
Check required fields before submit and do not send the request when one is empty.
After a successful save or delete, show the updated list.
Show the API message when a request fails.
When the API gives no message, show "Request failed."
The MenuBar shows Courses only to an admin and links it to /courses.

Map every acceptance scenario in the Test Coverage Map to at least one automated test.

Use the exact test file paths and test names listed in the Test Coverage Map.

Do not add semesters, faculty, sections, enrollment, or student management.

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
- Report any application-code failure for the developer to fix by hand; do not change the specification or weaken a test to make it pass.

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`, `features/reference/README.md` (provenance)

---

## Definition of Done

- [ ] Admins can create a course with number, name, description, semesters, frequency, hours, and department.
- [ ] Admins can list courses.
- [ ] An empty list returns `200` with `[]`.
- [ ] Admins can update a course, and the response contains the new values.
- [ ] Admins can delete a course, and the list no longer includes it.
- [ ] Students receive `403` with `Admin role required.` on create, list, update, and delete.
- [ ] Signed-out API calls return `401`.
- [ ] Signed-out users who open `/courses` are sent to Login.
- [ ] Students who open `/courses` are sent to Home.
- [ ] Required fields and whitespace-only values return the specified `400` messages.
- [ ] A non-numeric id on update or delete returns `Course id must be a number.`
- [ ] An unknown id on update or delete returns `Course with id=<id> not found.`
- [ ] The Courses page shows **Add course**, **Edit**, and **Delete** to an admin.
- [ ] The course dialog is titled **Add course** or **Edit course**, has **Save** and **Cancel**, and closes after a successful save.
- [ ] **Save** shows a loading state while the request runs.
- [ ] The form blocks submit when a required field is empty.
- [ ] The list updates after a successful save or delete.
- [ ] The page shows a loading state, `No courses found.` when empty, the API message on failure, and `Request failed.` when the API gives no message.
- [ ] The MenuBar shows **Courses** only to an admin.
- [ ] The database fields match the slide names, including `courseDept`.
- [ ] `courseSemesters` is text and is not a foreign key to semesters.
- [ ] The Course model is registered in `backend/app/models/index.js`.
- [ ] Backend and frontend are implemented per this spec (**FR-001**–**FR-032** satisfied).
- [ ] **Success Criteria (SC-001**–**SC-009)** are met.
- [ ] Test Coverage Map is complete.
- [ ] Every acceptance scenario has an automated test.
- [ ] All tests pass (`npm test`).
- [ ] `features/reference/api.md` is updated.
- [ ] `features/reference/data-model.md` is updated.
- [ ] `features/reference/behavior.md` is updated.
- [ ] `features/reference/README.md` lists Feature 3 in its provenance table.
- [ ] `features/README.md` links Feature 3 to this file.
- [ ] Nothing outside this specification is implemented.

---

## Out of Scope

- Semester records → Feature 2
- Faculty records → [Feature 4](feature-4-faculty-management.md)
- Sections, including connecting a course to a semester → Feature 5
- A student enrolling in a section → [Feature 6](feature-6-enrollment-management.md)
- Student course listing → Feature 7
- Adding or editing student accounts → Feature 9
