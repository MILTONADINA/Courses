# Feature: Student Management

**Feature ID:** 9  
**Branch pattern:** `feature/9-student-management`  
**Status:** Ready  
**Created:** 2026-10-01  
**Input:** Let an admin add a student, look students up, fix their info, and remove a student who should not have an account anymore.  
**Depends on:** [Feature 1 — User Authentication & Authorization](feature-1-user-authentication-authorization.md)

---

## User Stories

Every story is P1. The project write-up says the admin can add students and that users maintain students, so add, list, edit, delete, and the admin-only check all have to ship together.

### US-9.1: Add a student

**As a** signed-in admin  
**I want to** add a student account  
**So that** that student can log in even if they never used the register page

**Priority:** P1  
**Independent test:** Sign in as an admin, add Jane Doe with a password, and check that the new account comes back as a student  
**Acceptance scenarios:** see ### US-9.1 under Acceptance Criteria

### US-9.2: View students

**As a** signed-in admin  
**I want to** see the list of students  
**So that** I can find the account I need to change

**Priority:** P1  
**Independent test:** Add a student, open the list, and check that the student is there and the admin account is not  
**Acceptance scenarios:** see ### US-9.2 under Acceptance Criteria

### US-9.3: Update a student

**As a** signed-in admin  
**I want to** change a student's name, email, university ID, or username  
**So that** the account matches the right person

**Priority:** P1  
**Independent test:** Sign in as an admin, change a student's name and email, and check that those new values are saved and the old password still works  
**Acceptance scenarios:** see ### US-9.3 under Acceptance Criteria

### US-9.4: Delete a student

**As a** signed-in admin  
**I want to** delete a student account  
**So that** someone who should not be in the system cannot sign in

**Priority:** P1  
**Independent test:** Delete a student as an admin, then check that the list no longer has them and that their old password no longer signs in  
**Acceptance scenarios:** see ### US-9.4 under Acceptance Criteria

### US-9.5: Restrict student management to admins

**As the** application  
**I want to** allow only admins to add, view, update, or delete students  
**So that** a student cannot change someone else's account

**Priority:** P1  
**Independent test:** Try the student routes as a student and while signed out, and also open the Students page as each of them  
**Acceptance scenarios:** see ### US-9.5 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: Student management MUST use the authenticated user and role from Feature 1.
- **FR-002**: An admin MUST be able to create a student.
- **FR-003**: A student account MUST store `firstName`, `lastName`, `email`, `universityId`, `userName`, `password`, and `role`.
- **FR-004**: The created account's `role` MUST be `student`. A `role` in the request body MUST be ignored.
- **FR-005**: `firstName`, `lastName`, `email`, `universityId`, `userName`, and `password` MUST be required when creating a student.
- **FR-006**: A whitespace-only value in any required student field MUST be rejected as missing.
- **FR-007**: A password shorter than 8 characters MUST be rejected.
- **FR-008**: `userName` MUST be stored lowercase.
- **FR-009**: A duplicate `userName` or `email` MUST be rejected with the Feature 1 message for that field.
- **FR-010**: Invalid student information MUST return `400` with `{ "message": "..." }` and MUST NOT create or change a student.
- **FR-011**: An admin MUST be able to list students.
- **FR-012**: The student list MUST include only users whose role is `student`, and MUST NOT include `password`.
- **FR-013**: When no students exist, the list MUST return `200` with `[]`.
- **FR-014**: An admin MUST be able to update `firstName`, `lastName`, `email`, `universityId`, and `userName`.
- **FR-015**: An update MUST NOT change `password` or `role`.
- **FR-016**: Update validation MUST use the same rules as creation for the fields it accepts.
- **FR-017**: A successful update MUST return `200` and the updated student, without `password`.
- **FR-018**: A missing student on update or delete MUST return `404` with `{ "message": "Student with id=<id> not found." }`.
- **FR-019**: A non-numeric student id on update or delete MUST return `400` with `{ "message": "Student id must be a number." }`.
- **FR-020**: An id that is not a student, including an admin id, MUST be treated as not found on update or delete.
- **FR-021**: An admin MUST be able to delete a student.
- **FR-022**: A successful delete MUST return `200` with `{ "message": "Student deleted successfully." }`.
- **FR-023**: A student MUST NOT create, list, update, or delete student accounts.
- **FR-024**: A student attempt to create, list, update, or delete students MUST return `403` with `{ "message": "Admin role required." }`.
- **FR-025**: A request with no valid session MUST return `401` with `{ "message": "Unauthorized." }`.
- **FR-026**: The Students page MUST show **Add student**, **Edit**, and **Delete** to an admin.
- **FR-027**: An authenticated student who opens the Students page MUST be sent to the Home page.
- **FR-028**: An unauthenticated visit to the Students page MUST send the user to the Login page.
- **FR-029**: The MenuBar MUST show a **Students** link to `/students` for admins only.
- **FR-030**: The Students page MUST show a loading state while the student list loads.
- **FR-031**: When no students exist, the Students page MUST show `No students found.`
- **FR-032**: When a Students page request fails, the page MUST display the error message returned by the API.
- **FR-033**: When a Students page request fails without an API message, the page MUST show `Request failed.`
- **FR-034**: The student form MUST check required fields before submitting, using the API's required messages, and MUST NOT send the request when validation fails.
- **FR-035**: After a successful save or delete, the Students page MUST show the updated list.
- **FR-036**: The **Save** button MUST show a loading state while the save request runs.
- **FR-037**: The student dialog MUST close after a successful save.

---

## Assumptions

- Feature 1 is already on `dev`, so I can use `authenticate` and `requireAdmin`.
- A student is a user with role `student`. I am using the `users` table from Feature 1 and not adding a second table or new columns.
- The write-up says students add themselves, and it also says the admin can add students. Register stays in Feature 1. This page is only the admin adding them.
- Feature 1 does not give `universityId` a format, so I am not making one up here.
- Username and email are already unique in Feature 1. I am keeping those same messages: `Username is already taken.` and `Email is already registered.`
- If the create body sends `"role": "admin"`, ignore it and save `student`. This page should not be a way to make another admin.
- Edit does not ask for a password and does not change one. Feature 1 left password reset out, and I am not adding it here. Add still needs a password so the new student can sign in.
- Usernames are stored lowercase, same as Feature 1. `JDoe` comes back as `jdoe`.
- There is no get-one route. Edit uses the student already sitting in the list.
- Delete removes that user. Feature 6 already says it cleans up that student's enrollments, so I am not doing that in this feature.

---

## Edge Cases

- Missing first name, last name, email, university ID, username, or password on create → `400` with that field's required message.
- Missing first name, last name, email, university ID, or username on update → `400` with that field's required message.
- Whitespace-only required field → `400` with that field's required message.
- Password shorter than 8 characters on create → `400` with `Password must be at least 8 characters.`
- Duplicate username → `400` with `Username is already taken.`
- Duplicate email → `400` with `Email is already registered.`
- Request body includes `"role": "admin"` on create → the account is still created as `student`.
- Unknown student id, or an admin id, on `PUT` or `DELETE` → `404`.
- Non-numeric id on `PUT` or `DELETE` → `400` with `Student id must be a number.`
- Student create, list, update, or delete → `403`.
- Unauthenticated request → `401`.
- No students exist → `GET /course-t6/students` returns `200` with `[]`, and the page shows `No students found.`
- A Students page request fails with an API message → the page shows that message.
- A Students page request fails without an API message → the page shows `Request failed.`
- Student opens `/students` → Home page.
- Signed-out user opens `/students` → Login page.

---

## Success Criteria

- **SC-001**: An admin can add, view, update, and delete a student.
- **SC-002**: A created student has role `student` and can sign in with the username and password the admin set.
- **SC-003**: An update does not change the student's password or role.
- **SC-004**: The student list does not include passwords or admin accounts.
- **SC-005**: A student cannot list, create, update, or delete student accounts.
- **SC-006**: A signed-out user cannot use the student API and is sent to Login from the Students page.
- **SC-007**: A student who opens the Students page is sent to Home.
- **SC-008**: Invalid student information is rejected and does not change stored data.
- **SC-009**: Every acceptance scenario has an automated test before merge.
- **SC-010**: All automated tests pass before merge.
- **SC-011**: Nothing outside this specification is implemented.
- **SC-012**: The Students page shows a loading state, `No students found.` when the list is empty, the API error message when a request fails, and `Request failed.` when the API gives no message.

---

## Data Ownership & Isolation

Any admin can work with any student. The student does not "belong" to the admin who added them.

- Only a signed-in admin can create, list, update, or delete.
- Do not trust a role sent from the page. The server sets `role` to `student`.
- Hiding the Students link is not enough. The API still has to reject a student.
- The Students page and the **Students** menu link are for admins only.
- Do not send `password` back in any response.

---

## Key Entities

### Student

A student is a normal user whose role is `student`. Same fields as registration: first name, last name, email, university ID, username, and password. This feature is how an admin keeps those accounts up to date.

---

## API Requirements

All paths are under the API mount `/course-t6`.

| Method | Path | Authentication | Success |
|---|---|---|---|
| `POST` | `/course-t6/students` | Admin | `201` student |
| `GET` | `/course-t6/students` | Admin | `200` array |
| `PUT` | `/course-t6/students/:id` | Admin | `200` student |
| `DELETE` | `/course-t6/students/:id` | Admin | `200` message |

There is no `GET /course-t6/students/:id` route.

When no students exist, `GET /course-t6/students` returns `200` with `[]`.

A student response uses these fields:

```json
{
  "id": 4,
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "universityId": "123456",
  "userName": "jdoe",
  "role": "student",
  "createdAt": "2026-10-01T20:15:00.000Z",
  "updatedAt": "2026-10-01T20:15:00.000Z"
}
```

Create accepts this body:

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "universityId": "123456",
  "userName": "jdoe",
  "password": "password123"
}
```

Update accepts this body. It does not accept a new password.

```json
{
  "firstName": "Janet",
  "lastName": "Doe",
  "email": "janet@example.com",
  "universityId": "123456",
  "userName": "jdoe"
}
```

### Delete Student

**Endpoint:** `DELETE /course-t6/students/:id`

**Authentication:** Required, admin only

**Success:** `200 OK`

```json
{
  "message": "Student deleted successfully."
}
```

### Student Errors

| Condition | Routes | Status | Message |
|---|---|---:|---|
| Missing first name | `POST`, `PUT` | `400` | `First name is required.` |
| Missing last name | `POST`, `PUT` | `400` | `Last name is required.` |
| Missing email | `POST`, `PUT` | `400` | `Email is required.` |
| Missing university ID | `POST`, `PUT` | `400` | `University ID is required.` |
| Missing username | `POST`, `PUT` | `400` | `Username is required.` |
| Missing password | `POST` | `400` | `Password is required.` |
| Whitespace-only required field | `POST`, `PUT` | `400` | That field's required message |
| Password shorter than 8 characters | `POST` | `400` | `Password must be at least 8 characters.` |
| Duplicate username | `POST`, `PUT` | `400` | `Username is already taken.` |
| Duplicate email | `POST`, `PUT` | `400` | `Email is already registered.` |
| Non-numeric id | `PUT`, `DELETE` | `400` | `Student id must be a number.` |
| Unknown id, or an id that is not a student | `PUT`, `DELETE` | `404` | `Student with id=<id> not found.` |
| Student create, list, update, or delete | All | `403` | `Admin role required.` |
| No valid session | All | `401` | `Unauthorized.` |

---

## Screen Requirements

### Students Page

**Route:** `/students`  
**Route name:** `students`  
**View:** `frontend/src/views/Students.vue`

This page is for a signed-in admin. If nobody is signed in, send them to Login. If a student opens it, send them Home.

The page MUST:

- Load `GET /course-t6/students` and show `firstName`, `lastName`, `email`, `universityId`, and `userName` for each student.
- Show a loading state while the list loads.
- Show `No students found.` when the list is empty.
- Show **Add student** to an admin. This opens a dialog titled **Add student**.
- Show **Edit** and **Delete** to an admin for each student. **Edit** opens a dialog titled **Edit student**. These actions use those text labels, so they are not icon-only.
- Let an admin enter First name, Last name, Email, University ID, and Username. **Add student** also asks for Password. **Edit student** does not ask for Password.
- Check required fields before submit, using the required messages from the API, and do not send the request when a required field is empty.
- Provide **Save** and **Cancel** in the dialog.
- Show a loading state on **Save** while the request runs.
- Show the updated list after a successful save or delete.
- Close the dialog after a successful save.
- Display the API `message` when a request fails.
- Show `Request failed.` when a list, save, or delete fails without an API message.
- Close the dialog without saving when **Cancel** is selected.

### MenuBar

Show **Students** in the menu only for an admin, and point it at `/students`. A student should not see that link.

---

## Data Model Requirements

### `users` table

Same `users` table as Feature 1. No new columns.

| Field | Type/Requirement | Rules |
|---|---|---|
| `id` | Primary key | Auto-generated |
| `firstName` | String | Required |
| `lastName` | String | Required |
| `email` | String | Required, unique |
| `universityId` | String | Required, no format rule |
| `userName` | String | Required, unique, stored lowercase |
| `password` | String | Required bcrypt hash, never returned by this feature |
| `role` | String | `student` for every account this feature creates |
| `createdAt` | Timestamp | Automatically generated |
| `updatedAt` | Timestamp | Automatically generated |

### Associations

- This feature adds no associations.
- The User model is already registered in `backend/app/models/index.js`.

---

## Acceptance Criteria (Gherkin)

### US-9.1 — Add a student

#### Scenario: Admin adds a student with valid information

* **Given** I am signed in as an admin
* **When** I submit first name `Jane`, last name `Doe`, email `jane@example.com`, university ID `123456`, username `JDoe`, and password `password123`
* **Then** the API returns `201`
* **And** the response contains `firstName` `Jane`, `lastName` `Doe`, `email` `jane@example.com`, `universityId` `123456`, `userName` `jdoe`, and `role` `student`
* **And** the response does not contain `password`

#### Scenario: Admin adds a student without a required field

* **Given** I am signed in as an admin
* **When** I submit a student with a required field empty
* **Then** the API returns `400`
* **And** the response contains that field's required message
* **And** no student is created

#### Scenario: Admin submits a whitespace-only first name

* **Given** I am signed in as an admin
* **When** I submit a first name of only spaces and valid values for the other fields
* **Then** the API returns `400`
* **And** the response is `{ "message": "First name is required." }`
* **And** no student is created

#### Scenario: Admin submits a short password

* **Given** I am signed in as an admin
* **When** I submit a student with password `short`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Password must be at least 8 characters." }`
* **And** no student is created

#### Scenario: Admin submits a username that is already taken

* **Given** I am signed in as an admin
* **And** a user with username `jdoe` exists
* **When** I submit a student with username `jdoe`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Username is already taken." }`
* **And** no student is created

#### Scenario: Admin submits an email that is already registered

* **Given** I am signed in as an admin
* **And** a user with email `jane@example.com` exists
* **When** I submit a student with email `jane@example.com`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Email is already registered." }`
* **And** no student is created

#### Scenario: Supplied role does not create an admin

* **Given** I am signed in as an admin
* **When** I submit a valid student with `"role": "admin"`
* **Then** the API returns `201`
* **And** the created user's role is `student`

#### Scenario: Added student can sign in

* **Given** I am signed in as an admin
* **And** I have added a student with username `jdoe` and password `password123`
* **When** that student signs in with username `jdoe` and password `password123`
* **Then** the API returns `200`
* **And** the signed-in user's role is `student`

#### Scenario: Admin adds a student from the Students page

* **Given** I am signed in as an admin on the Students page
* **When** I click **Add student**
* **And** I enter first name `Jane`, last name `Doe`, email `jane@example.com`, university ID `123456`, username `jdoe`, and password `password123`
* **And** I click **Save**
* **Then** the dialog closes
* **And** the list shows `jdoe`

#### Scenario: Student form blocks submit when a required field is empty

* **Given** I am signed in as an admin with the add-student dialog open
* **When** I click **Save** without a first name
* **Then** I see `First name is required.`
* **And** no save request is sent

#### Scenario: Save shows a loading state while saving

* **Given** I am signed in as an admin with a valid student form
* **And** the save request will not finish right away
* **When** I click **Save**
* **Then** the **Save** button shows a loading state

#### Scenario: Students page shows the API error when a save fails

* **Given** I am signed in as an admin with a valid student form
* **And** the save request will fail with an error message
* **When** I click **Save**
* **Then** I see the error message returned by the API

#### Scenario: Students page shows a fallback error when a save fails without a message

* **Given** I am signed in as an admin with a valid student form
* **And** the save request will fail without an error message
* **When** I click **Save**
* **Then** I see `Request failed.`

---

### US-9.2 — View students

#### Scenario: Signed-in admin views the student list

* **Given** I am signed in as an admin
* **And** a student named `Jane` `Doe` exists
* **When** I request the student list
* **Then** the API returns `200`
* **And** the list includes that student
* **And** the list does not include `password`

#### Scenario: Student list does not include admins

* **Given** I am signed in as an admin
* **And** an admin account exists
* **When** I request the student list
* **Then** the API returns `200`
* **And** the list does not include that admin account

#### Scenario: Students page shows a loading state

* **Given** I am signed in as an admin
* **And** the student list will not finish right away
* **When** I open the Students page
* **Then** I see a loading state

#### Scenario: Students page shows a message when no students exist

* **Given** I am signed in as an admin
* **And** no students exist
* **When** I open the Students page
* **Then** I see `No students found.`

#### Scenario: Signed-in admin views an empty student list

* **Given** I am signed in as an admin
* **And** no students exist
* **When** I request the student list
* **Then** the API returns `200`
* **And** the response is an empty list

#### Scenario: Students page shows the API error when the list fails

* **Given** I am signed in as an admin
* **And** the student list request will fail with an error message
* **When** I open the Students page
* **Then** I see the error message returned by the API

#### Scenario: Students page shows a fallback error when the API gives no message

* **Given** I am signed in as an admin
* **And** the student list request will fail without an error message
* **When** I open the Students page
* **Then** I see `Request failed.`

---

### US-9.3 — Update a student

#### Scenario: Admin updates a student

* **Given** I am signed in as an admin
* **And** a student exists
* **When** I update that student to first name `Janet`, last name `Roe`, email `janet@example.com`, university ID `654321`, and username `jroe`
* **Then** the API returns `200`
* **And** the response contains those new values
* **And** the response role is `student`
* **And** the response does not contain `password`

#### Scenario: Admin updates a student without a required field

* **Given** I am signed in as an admin
* **And** a student named `Jane` exists
* **When** I update that student with an empty first name
* **Then** the API returns `400`
* **And** the response is `{ "message": "First name is required." }`
* **And** the student list still shows `Jane`

#### Scenario: Update does not change the password

* **Given** I am signed in as an admin
* **And** a student can sign in with username `jdoe` and password `password123`
* **When** I update that student's first name to `Janet`
* **Then** the API returns `200`
* **And** the student can still sign in with username `jdoe` and password `password123`

#### Scenario: Admin updates a student that does not exist

* **Given** I am signed in as an admin
* **When** I update student id `99999` with valid information
* **Then** the API returns `404`
* **And** the response is `{ "message": "Student with id=99999 not found." }`

#### Scenario: Admin updates a student using a non-numeric id

* **Given** I am signed in as an admin
* **When** I update student id `abc` with valid information
* **Then** the API returns `400`
* **And** the response is `{ "message": "Student id must be a number." }`

#### Scenario: Admin updates an admin account through the student route

* **Given** I am signed in as an admin
* **And** another admin account exists
* **When** I update that admin account's id with valid student information
* **Then** the API returns `404`
* **And** the response is `{ "message": "Student with id=<id> not found." }`
* **And** that admin account is unchanged

#### Scenario: Admin edits a student from the Students page

* **Given** I am signed in as an admin on the Students page
* **And** a student with username `jdoe` is listed
* **When** I click **Edit** for that student
* **And** I change the first name to `Janet` and click **Save**
* **Then** the dialog closes
* **And** the list shows `Janet`

---

### US-9.4 — Delete a student

#### Scenario: Admin deletes a student

* **Given** I am signed in as an admin
* **And** a student exists
* **When** I delete that student
* **Then** the API returns `200`
* **And** the response is `{ "message": "Student deleted successfully." }`

#### Scenario: Deleted student is no longer in the list

* **Given** I am signed in as an admin
* **And** I have deleted a student
* **When** I request the student list
* **Then** the API returns `200`
* **And** the list does not include that student

#### Scenario: Deleted student can no longer sign in

* **Given** a student could sign in with username `jdoe` and password `password123`
* **And** an admin has deleted that student
* **When** that student tries to sign in with username `jdoe` and password `password123`
* **Then** the API returns `401`

#### Scenario: Admin deletes a student that does not exist

* **Given** I am signed in as an admin
* **When** I delete student id `99999`
* **Then** the API returns `404`
* **And** the response is `{ "message": "Student with id=99999 not found." }`

#### Scenario: Admin deletes a student using a non-numeric id

* **Given** I am signed in as an admin
* **When** I delete student id `abc`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Student id must be a number." }`

#### Scenario: Admin deletes an admin account through the student route

* **Given** I am signed in as an admin
* **And** another admin account exists
* **When** I delete that admin account through the student route
* **Then** the API returns `404`
* **And** the response is `{ "message": "Student with id=<id> not found." }`
* **And** that admin account is unchanged

#### Scenario: Admin deletes a student from the Students page

* **Given** I am signed in as an admin on the Students page
* **And** a student with username `jdoe` is listed
* **When** I click **Delete** for that student
* **Then** the list no longer shows `jdoe`

#### Scenario: Students page shows the API error when a delete fails

* **Given** I am signed in as an admin on the Students page
* **And** a student is listed
* **And** the delete request will fail with an error message
* **When** I click **Delete** for that student
* **Then** I see the error message returned by the API
* **And** the student is still listed

#### Scenario: Students page shows a fallback error when a delete fails without a message

* **Given** I am signed in as an admin on the Students page
* **And** a student is listed
* **And** the delete request will fail without an error message
* **When** I click **Delete** for that student
* **Then** I see `Request failed.`
* **And** the student is still listed

---

### US-9.5 — Restrict student management to admins

#### Scenario: Student cannot create a student

* **Given** I am signed in as a student
* **When** I submit a valid student
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`
* **And** no student is created

#### Scenario: Student cannot update a student

* **Given** I am signed in as a student
* **And** a student named `Jane` exists
* **When** I update that student with valid information
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`
* **And** the student list still shows `Jane` for an admin

#### Scenario: Student cannot delete a student

* **Given** I am signed in as a student
* **And** a student with username `jdoe` exists
* **When** I delete that student
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`
* **And** an admin still sees `jdoe` in the student list

#### Scenario: Student cannot list students

* **Given** I am signed in as a student
* **When** I request the student list
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`

#### Scenario: Unauthenticated user cannot use student endpoints

* **Given** I am not signed in
* **When** I request the student list, create a student, update a student, or delete a student
* **Then** each request returns `401`
* **And** the response is `{ "message": "Unauthorized." }`

#### Scenario: Admin sees student change actions

* **Given** I am signed in as an admin
* **When** I open the Students page
* **Then** I see **Add student**, **Edit**, and **Delete**

#### Scenario: Admin sees the Students link

* **Given** I am signed in as an admin
* **When** I view the menu
* **Then** I see a **Students** link to the Students page

#### Scenario: Student does not see the Students link

* **Given** I am signed in as a student
* **When** I view the menu
* **Then** I do not see a **Students** link

#### Scenario: Student is sent to Home

* **Given** I am signed in as a student
* **When** I open the Students page
* **Then** I am sent to the Home page

#### Scenario: Signed-out user is sent to Login

* **Given** I am not signed in
* **When** I open the Students page
* **Then** I am sent to the Login page

---

## Test Coverage Map

Each scenario MUST map to at least one automated test.

| Story | Scenario | Test File | Test Name |
|---|---|---|---|
| US-9.1 | Admin adds a student with valid information | `backend/tests/student.test.js` | `Admin adds a student with valid information` |
| US-9.1 | Admin adds a student without a required field | `backend/tests/student.test.js` | `Admin adds a student without a required field` |
| US-9.1 | Admin submits a whitespace-only first name | `backend/tests/student.test.js` | `Admin submits a whitespace-only first name` |
| US-9.1 | Admin submits a short password | `backend/tests/student.test.js` | `Admin submits a short password` |
| US-9.1 | Admin submits a username that is already taken | `backend/tests/student.test.js` | `Admin submits a username that is already taken` |
| US-9.1 | Admin submits an email that is already registered | `backend/tests/student.test.js` | `Admin submits an email that is already registered` |
| US-9.1 | Supplied role does not create an admin | `backend/tests/student.test.js` | `Supplied role does not create an admin` |
| US-9.1 | Added student can sign in | `backend/tests/student.test.js` | `Added student can sign in` |
| US-9.1 | Admin adds a student from the Students page | `frontend/tests/Students.test.js` | `Admin adds a student from the Students page` |
| US-9.1 | Student form blocks submit when a required field is empty | `frontend/tests/Students.test.js` | `Student form blocks submit when a required field is empty` |
| US-9.1 | Save shows a loading state while saving | `frontend/tests/Students.test.js` | `Save shows a loading state while saving` |
| US-9.1 | Students page shows the API error when a save fails | `frontend/tests/Students.test.js` | `Students page shows the API error when a save fails` |
| US-9.1 | Students page shows a fallback error when a save fails without a message | `frontend/tests/Students.test.js` | `Students page shows a fallback error when a save fails without a message` |
| US-9.2 | Signed-in admin views the student list | `backend/tests/student.test.js` | `Signed-in admin views the student list` |
| US-9.2 | Student list does not include admins | `backend/tests/student.test.js` | `Student list does not include admins` |
| US-9.2 | Students page shows a loading state | `frontend/tests/Students.test.js` | `Students page shows a loading state` |
| US-9.2 | Students page shows a message when no students exist | `frontend/tests/Students.test.js` | `Students page shows a message when no students exist` |
| US-9.2 | Signed-in admin views an empty student list | `backend/tests/student.test.js` | `Signed-in admin views an empty student list` |
| US-9.2 | Students page shows the API error when the list fails | `frontend/tests/Students.test.js` | `Students page shows the API error when the list fails` |
| US-9.2 | Students page shows a fallback error when the API gives no message | `frontend/tests/Students.test.js` | `Students page shows a fallback error when the API gives no message` |
| US-9.3 | Admin updates a student | `backend/tests/student.test.js` | `Admin updates a student` |
| US-9.3 | Admin updates a student without a required field | `backend/tests/student.test.js` | `Admin updates a student without a required field` |
| US-9.3 | Update does not change the password | `backend/tests/student.test.js` | `Update does not change the password` |
| US-9.3 | Admin updates a student that does not exist | `backend/tests/student.test.js` | `Admin updates a student that does not exist` |
| US-9.3 | Admin updates a student using a non-numeric id | `backend/tests/student.test.js` | `Admin updates a student using a non-numeric id` |
| US-9.3 | Admin updates an admin account through the student route | `backend/tests/student.test.js` | `Admin updates an admin account through the student route` |
| US-9.3 | Admin edits a student from the Students page | `frontend/tests/Students.test.js` | `Admin edits a student from the Students page` |
| US-9.4 | Admin deletes a student | `backend/tests/student.test.js` | `Admin deletes a student` |
| US-9.4 | Deleted student is no longer in the list | `backend/tests/student.test.js` | `Deleted student is no longer in the list` |
| US-9.4 | Deleted student can no longer sign in | `backend/tests/student.test.js` | `Deleted student can no longer sign in` |
| US-9.4 | Admin deletes a student that does not exist | `backend/tests/student.test.js` | `Admin deletes a student that does not exist` |
| US-9.4 | Admin deletes a student using a non-numeric id | `backend/tests/student.test.js` | `Admin deletes a student using a non-numeric id` |
| US-9.4 | Admin deletes an admin account through the student route | `backend/tests/student.test.js` | `Admin deletes an admin account through the student route` |
| US-9.4 | Admin deletes a student from the Students page | `frontend/tests/Students.test.js` | `Admin deletes a student from the Students page` |
| US-9.4 | Students page shows the API error when a delete fails | `frontend/tests/Students.test.js` | `Students page shows the API error when a delete fails` |
| US-9.4 | Students page shows a fallback error when a delete fails without a message | `frontend/tests/Students.test.js` | `Students page shows a fallback error when a delete fails without a message` |
| US-9.5 | Student cannot create a student | `backend/tests/student.test.js` | `Student cannot create a student` |
| US-9.5 | Student cannot update a student | `backend/tests/student.test.js` | `Student cannot update a student` |
| US-9.5 | Student cannot delete a student | `backend/tests/student.test.js` | `Student cannot delete a student` |
| US-9.5 | Student cannot list students | `backend/tests/student.test.js` | `Student cannot list students` |
| US-9.5 | Unauthenticated user cannot use student endpoints | `backend/tests/student.test.js` | `Unauthenticated user cannot use student endpoints` |
| US-9.5 | Admin sees student change actions | `frontend/tests/Students.test.js` | `Admin sees student change actions` |
| US-9.5 | Admin sees the Students link | `frontend/tests/Students.test.js` | `Admin sees the Students link` |
| US-9.5 | Student does not see the Students link | `frontend/tests/Students.test.js` | `Student does not see the Students link` |
| US-9.5 | Student is sent to Home | `frontend/tests/Students.test.js` | `Student is sent to Home` |
| US-9.5 | Signed-out user is sent to Login | `frontend/tests/Students.test.js` | `Signed-out user is sent to Login` |

---

## Agent Implementation Request

Application code for this feature is written by hand. The course does not allow AI to write the application code. The notes below are a checklist for the person coding the feature.

```text
Write Feature 9 by hand on branch feature/9-student-management, using this spec.

Only build what this specification defines.

Follow the project's existing architecture, API conventions, security rules, coding conventions, and feature framework.

Follow the layer order in features/framework.md (models → routes → backend tests → frontend services → views → frontend tests → router).

Feature dependencies:
- Feature 1 provides the users table, authenticate, requireAdmin, password hashing, and the username and email rules.

Student routes must be:
POST /course-t6/students
GET /course-t6/students
PUT /course-t6/students/:id
DELETE /course-t6/students/:id

There is no GET /course-t6/students/:id route.

Use the existing users table. Do not add a second student table or new columns.
Every student route requires authenticate and requireAdmin.
Create sets role to student and ignores a role in the body.
Store userName lowercase.
Never return password.
The list includes only users whose role is student.
Update changes firstName, lastName, email, universityId, and userName. It does not change password or role.
An id that is not a student is not found.
Use the exact error messages defined in this specification.

The Students page route is /students with route name students.
Signed-out users are sent to Login.
Students are sent to Home.
Show a loading state while the list loads.
Show "No students found." when the list is empty.
Show Add student, Edit, and Delete to an admin.
The form is a dialog titled Add student or Edit student, with Save and Cancel.
Add student includes Password. Edit student does not.
The dialog closes after a successful save.
Save shows a loading state while the request runs.
Check required fields before submit and do not send the request when one is empty.
After a successful save or delete, show the updated list.
Show the API message when a request fails.
When the API gives no message, show "Request failed."
The MenuBar shows Students only to an admin and links it to /students.

Map every acceptance scenario in the Test Coverage Map to at least one automated test.

Use the exact test file paths and test names listed in the Test Coverage Map.

Do not add semesters, courses, faculty, sections, or enrollment.

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

- [ ] Admins can add a student with name, email, university ID, username, and password.
- [ ] The created account has role `student` and the username is stored lowercase.
- [ ] The added student can sign in with that username and password.
- [ ] A supplied role cannot create an admin.
- [ ] Admins can list students, and the list omits passwords and admin accounts.
- [ ] An empty list returns `200` with `[]`.
- [ ] Admins can update a student's name, email, university ID, and username without changing the password or role.
- [ ] Admins can delete a student, and that student can no longer sign in.
- [ ] Students receive `403` with `Admin role required.` on create, list, update, and delete.
- [ ] Signed-out API calls return `401`.
- [ ] Signed-out users who open `/students` are sent to Login.
- [ ] Students who open `/students` are sent to Home.
- [ ] Required fields, short passwords, and duplicate username or email return the specified `400` messages.
- [ ] A non-numeric id on update or delete returns `Student id must be a number.`
- [ ] An unknown id, or an admin id, on update or delete returns `Student with id=<id> not found.`
- [ ] The Students page shows **Add student**, **Edit**, and **Delete** to an admin.
- [ ] The student dialog is titled **Add student** or **Edit student**, has **Save** and **Cancel**, and closes after a successful save.
- [ ] **Add student** asks for a password. **Edit student** does not.
- [ ] **Save** shows a loading state while the request runs.
- [ ] The form blocks submit when a required field is empty.
- [ ] The list updates after a successful save or delete.
- [ ] The page shows a loading state, `No students found.` when empty, the API message on failure, and `Request failed.` when the API gives no message.
- [ ] The MenuBar shows **Students** only to an admin.
- [ ] No new table or columns are added.
- [ ] Responses do not include `password`.
- [ ] Backend and frontend are implemented per this spec (**FR-001**–**FR-037** satisfied).
- [ ] **Success Criteria (SC-001**–**SC-012)** are met.
- [ ] Test Coverage Map is complete.
- [ ] Every acceptance scenario has an automated test.
- [ ] All tests pass (`npm test`).
- [ ] `features/reference/api.md` is updated.
- [ ] `features/reference/data-model.md` is updated.
- [ ] `features/reference/behavior.md` is updated.
- [ ] `features/reference/README.md` lists Feature 9 in its provenance table.
- [ ] `features/README.md` links Feature 9 to this file.
- [ ] Nothing outside this specification is implemented.

---

## Out of Scope

- A student registering their own account → [Feature 1](feature-1-user-authentication-authorization.md)
- Semester records → [Feature 2](feature-2-semester-management.md)
- Course records → [Feature 3](feature-3-course-management.md)
- Faculty records → [Feature 4](feature-4-faculty-management.md)
- Sections → Feature 5
- A student enrolling in a section, and deleting that student's enrollments → [Feature 6](feature-6-enrollment-management.md)
- A student's own course list → Feature 7
- An admin roster of one section → Feature 8
- Password reset
