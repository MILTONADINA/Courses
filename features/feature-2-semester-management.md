# Feature: Semester Management

**Feature ID:** 2  
**Branch pattern:** `feature/2-semester-management`  
**Status:** Ready  
**Created:** 2026-09-29  
**Input:** Admins create, update, and delete semesters, and signed-in users can view the semester list.  
**Depends on:** [Feature 1 — User Authentication & Authorization](feature-1-user-authentication-authorization.md)

---

## User Stories

Every story is P1: each one must ship for the assignment's semester management feature.

### US-2.1: Create a semester

**As a** signed-in admin  
**I want to** create a semester with a name, start date, and end date  
**So that** students can see which term is being offered

**Priority:** P1  
**Independent test:** Submit a valid semester as an admin and receive the created semester  
**Acceptance scenarios:** see ### US-2.1 under Acceptance Criteria

### US-2.2: View semesters

**As a** signed-in user  
**I want to** see the list of semesters  
**So that** I can find the term I need

**Priority:** P1  
**Independent test:** Create semesters, then open the semester list and confirm the names, dates, and order  
**Acceptance scenarios:** see ### US-2.2 under Acceptance Criteria

### US-2.3: Update a semester

**As a** signed-in admin  
**I want to** change a semester's name, start date, or end date  
**So that** students see the correct term

**Priority:** P1  
**Independent test:** Update a semester as an admin and confirm the response has the new values  
**Acceptance scenarios:** see ### US-2.3 under Acceptance Criteria

### US-2.4: Delete a semester

**As a** signed-in admin  
**I want to** delete a semester  
**So that** students are not shown a term that is no longer offered

**Priority:** P1  
**Independent test:** Delete a semester as an admin and confirm the list no longer includes it  
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
- **FR-003**: A semester MUST store `semsterName`, `startDate`, and `endDate`.
- **FR-004**: `semsterName`, `startDate`, and `endDate` MUST be required.
- **FR-005**: A whitespace-only `semsterName` MUST be rejected as missing.
- **FR-006**: `startDate` and `endDate` MUST be calendar dates in `YYYY-MM-DD` form.
- **FR-007**: Successful creation MUST return `201` and the created semester.
- **FR-008**: Invalid semester information MUST return `400` with `{ "message": "..." }`.
- **FR-009**: Invalid semester information MUST NOT create or change a semester.
- **FR-010**: A signed-in admin or student MUST be able to list semesters.
- **FR-011**: The semester list MUST be ordered by `startDate` ascending, then by `semsterName` ascending.
- **FR-012**: When no semesters exist, the list MUST return `200` with `[]`.
- **FR-013**: A missing semester on update or delete MUST return `404` with `{ "message": "Semester with id=<id> not found." }`.
- **FR-014**: A non-numeric semester id on update or delete MUST return `400` with `{ "message": "Semester id must be a number." }`.
- **FR-015**: An admin MUST be able to update `semsterName`, `startDate`, and `endDate`.
- **FR-016**: Update validation MUST use the same rules as creation.
- **FR-017**: A successful update MUST return `200` and the updated semester.
- **FR-018**: An admin MUST be able to delete a semester.
- **FR-019**: A successful delete MUST return `200` with `{ "message": "Semester deleted successfully." }`.
- **FR-020**: A student MUST NOT create, update, or delete a semester.
- **FR-021**: A student attempt to create, update, or delete a semester MUST return `403` with `{ "message": "Admin role required." }`.
- **FR-022**: A request with no valid session MUST return `401` with `{ "message": "Unauthorized." }`.
- **FR-023**: The Semesters page MUST show **Add semester**, **Edit**, and **Delete** to an admin.
- **FR-024**: The Semesters page MUST NOT show **Add semester**, **Edit**, or **Delete** to a student.
- **FR-025**: An unauthenticated visit to the Semesters page MUST send the user to the Login page.
- **FR-026**: The MenuBar MUST show a **Semesters** link to `/semesters` for every signed-in user.
- **FR-027**: The Semesters page MUST show a loading state while the semester list loads.
- **FR-028**: When no semesters exist, the Semesters page MUST show `No semesters found.`
- **FR-029**: When a Semesters page request fails, the page MUST display the error message returned by the API.
- **FR-030**: When a Semesters page request fails without an API message, the page MUST show `Semesters could not be loaded.` for a failed list, `Semester could not be saved.` for a failed save, and `Semester could not be deleted.` for a failed delete.
- **FR-031**: The semester form MUST check required fields before submitting, using the API's required messages, and MUST NOT send the request when validation fails.
- **FR-032**: After a successful save or delete, the Semesters page MUST show the updated list.
- **FR-033**: The **Save** button MUST show a loading state while the save request runs.

---

## Assumptions

- Feature 1 authentication is available, including `authenticate` and the admin-only check `requireAdmin` that returns `{ "message": "Admin role required." }`.
- The semester name field is `semsterName`, matching the spelling on the project slide.
- Students may list semesters. Choosing a semester and enrolling belongs to Feature 6.
- No section records exist in this feature, so delete does not check for sections.

---

## Edge Cases

- Missing semester name, start date, or end date on create or update → `400`.
- Whitespace-only semester name → `400` with `Semester name is required.`
- Start date that is not a real `YYYY-MM-DD` date → `400` with `Enter a valid start date.`
- End date that is not a real `YYYY-MM-DD` date → `400` with `Enter a valid end date.`
- Unknown semester id on `PUT` or `DELETE` → `404`.
- Non-numeric semester id on `PUT` or `DELETE` → `400` with `Semester id must be a number.`
- Student create, update, or delete → `403`.
- Unauthenticated request → `401`.
- No semesters exist → `GET /course-t6/semesters` returns `200` with `[]`, and the page shows `No semesters found.`
- A Semesters page request fails with an API message → the page shows that message.
- A Semesters page request fails without an API message → the page shows the fallback message for that action.

---

## Success Criteria

- **SC-001**: An admin can create, view, update, and delete a semester.
- **SC-002**: A signed-in student can list semesters.
- **SC-003**: A student cannot create, update, or delete a semester.
- **SC-004**: A signed-out user cannot use the semester API and is sent to Login from the Semesters page.
- **SC-005**: Invalid semester information is rejected and does not change stored data.
- **SC-006**: Every acceptance scenario has an automated test before merge.
- **SC-007**: All automated tests pass before merge.
- **SC-008**: Nothing outside this specification is implemented.
- **SC-009**: The Semesters page shows a loading state, `No semesters found.` when the list is empty, the API error message when a request fails, and the fallback message when the API gives no message.

---

## Data Ownership & Isolation

Semesters are shared catalog records. They are not owned by the admin who created them.

- Create, update, and delete MUST require an authenticated user whose role is `admin`.
- List MUST require an authenticated user of either role.
- The client MUST NOT be trusted for the role. The server MUST read the role from the session.
- A student MUST NOT gain admin access by changing the page or the request body.
- The Semesters page MUST show **Add semester**, **Edit**, and **Delete** only to an admin. A student MUST still see the semester list.

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
| `GET` | `/course-t6/semesters` | Signed-in user | `200` array, ordered by `startDate` then `semsterName` |
| `PUT` | `/course-t6/semesters/:id` | Admin | `200` semester |
| `DELETE` | `/course-t6/semesters/:id` | Admin | `200` message |

When no semesters exist, `GET /course-t6/semesters` returns `200` with `[]`.

A semester response uses these fields:

```json
{
  "id": 1,
  "semsterName": "Fall 2026",
  "startDate": "2026-08-17",
  "endDate": "2026-12-11",
  "createdAt": "2026-09-30T20:15:00.000Z",
  "updatedAt": "2026-09-30T20:15:00.000Z"
}
```

Create and update accept this body:

```json
{
  "semsterName": "Fall 2026",
  "startDate": "2026-08-17",
  "endDate": "2026-12-11"
}
```

### Delete Semester

**Endpoint:** `DELETE /course-t6/semesters/:id`

**Authentication:** Required, admin only

**Success:** `200 OK`

```json
{
  "message": "Semester deleted successfully."
}
```

### Semester Errors

| Condition | Routes | Status | Message |
|---|---|---:|---|
| Missing semester name | `POST`, `PUT` | `400` | `Semester name is required.` |
| Whitespace-only semester name | `POST`, `PUT` | `400` | `Semester name is required.` |
| Missing start date | `POST`, `PUT` | `400` | `Start date is required.` |
| Missing end date | `POST`, `PUT` | `400` | `End date is required.` |
| Invalid start date | `POST`, `PUT` | `400` | `Enter a valid start date.` |
| Invalid end date | `POST`, `PUT` | `400` | `Enter a valid end date.` |
| Non-numeric id | `PUT`, `DELETE` | `400` | `Semester id must be a number.` |
| Unknown id | `PUT`, `DELETE` | `404` | `Semester with id=<id> not found.` |
| Student create, update, or delete | `POST`, `PUT`, `DELETE` | `403` | `Admin role required.` |
| No valid session | All | `401` | `Unauthorized.` |

---

## Screen Requirements

### Semesters Page

**Route:** `/semesters`  
**Route name:** `semesters`  
**View:** `frontend/src/views/Semesters.vue`

The page MUST be available to signed-in users. A signed-out user is sent to the Login page.

The page MUST:

- Load `GET /course-t6/semesters` and show `semsterName`, `startDate`, and `endDate` for each semester.
- Show a loading state while the list loads.
- Show `No semesters found.` when the list is empty.
- Show **Add semester** to an admin. This opens a dialog titled **Add semester**.
- Show **Edit** and **Delete** to an admin for each semester. **Edit** opens a dialog titled **Edit semester**. These actions use those text labels, so they are not icon-only.
- Hide **Add semester**, **Edit**, and **Delete** from a student, and still show the list.
- Let an admin enter Semester name, Start date, and End date.
- Check required fields before submit, using `Semester name is required.`, `Start date is required.`, and `End date is required.`, and do not send the request when a required field is empty.
- Provide **Save** and **Cancel** in the dialog.
- Show a loading state on **Save** while the request runs.
- Show the updated list after a successful save or delete.
- Close the dialog after a successful save.
- Display the API `message` when a request fails.
- Show `Semesters could not be loaded.` when the list fails without an API message, `Semester could not be saved.` when a save fails without an API message, and `Semester could not be deleted.` when a delete fails without an API message.
- Close the dialog without saving when **Cancel** is selected.

### MenuBar

The MenuBar MUST show **Semesters** to every signed-in user and link it to `/semesters`.

---

## Data Model Requirements

### `semesters` table

| Field | Type/Requirement | Rules |
|---|---|---|
| `id` | Primary key | Auto-generated |
| `semsterName` | String | Required |
| `startDate` | Date only | Required, `YYYY-MM-DD` |
| `endDate` | Date only | Required, `YYYY-MM-DD` |
| `createdAt` | Timestamp | Automatically generated |
| `updatedAt` | Timestamp | Automatically generated |

The column name is `semsterName`.

### Associations

- Semesters have no associations in this feature.
- The Semester model MUST be registered in `backend/app/models/index.js`.

---

## Acceptance Criteria (Gherkin)

### US-2.1 — Create a semester

#### Scenario: Admin creates a semester with valid information

* **Given** I am signed in as an admin
* **When** I submit semester name `Fall 2026`, start date `2026-08-17`, and end date `2026-12-11`
* **Then** the API returns `201`
* **And** the response contains `semsterName` `Fall 2026`, `startDate` `2026-08-17`, and `endDate` `2026-12-11`

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

#### Scenario: Admin submits an invalid start date

* **Given** I am signed in as an admin
* **When** I submit start date `August 17, 2026` and a valid end date
* **Then** the API returns `400`
* **And** the response is `{ "message": "Enter a valid start date." }`
* **And** no semester is created

#### Scenario: Admin submits an invalid end date

* **Given** I am signed in as an admin
* **When** I submit a valid start date and end date `December 11, 2026`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Enter a valid end date." }`
* **And** no semester is created

#### Scenario: Admin creates a semester from the Semesters page

* **Given** I am signed in as an admin on the Semesters page
* **When** I click **Add semester**
* **And** I enter semester name `Fall 2026`, start date `2026-08-17`, and end date `2026-12-11`
* **And** I click **Save**
* **Then** the dialog closes
* **And** the list shows `Fall 2026`

#### Scenario: Semester form blocks submit when a required field is empty

* **Given** I am signed in as an admin with the semester dialog open
* **When** I click **Save** without a semester name
* **Then** I see `Semester name is required.`
* **And** no save request is sent

#### Scenario: Save shows a loading state while saving

* **Given** I am signed in as an admin with a valid semester form
* **And** the save request will not finish right away
* **When** I click **Save**
* **Then** the **Save** button shows a loading state

#### Scenario: Semesters page shows the API error when a save fails

* **Given** I am signed in as an admin with a valid semester form
* **And** the save request will fail with an error message
* **When** I click **Save**
* **Then** I see the error message returned by the API

#### Scenario: Semesters page shows a fallback error when a save fails without a message

* **Given** I am signed in as an admin with a valid semester form
* **And** the save request will fail without an error message
* **When** I click **Save**
* **Then** I see `Semester could not be saved.`

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

#### Scenario: Semesters page shows a loading state

* **Given** I am signed in
* **And** the semester list will not finish right away
* **When** I open the Semesters page
* **Then** I see a loading state

#### Scenario: Semesters page shows a message when no semesters exist

* **Given** I am signed in
* **And** no semesters exist
* **When** I open the Semesters page
* **Then** I see `No semesters found.`

#### Scenario: Signed-in user views an empty semester list

* **Given** I am signed in
* **And** no semesters exist
* **When** I request the semester list
* **Then** the API returns `200`
* **And** the response is an empty list

#### Scenario: Semesters page shows the API error when the list fails

* **Given** I am signed in
* **And** the semester list request will fail with an error message
* **When** I open the Semesters page
* **Then** I see the error message returned by the API

#### Scenario: Semesters page shows a fallback error when the API gives no message

* **Given** I am signed in
* **And** the semester list request will fail without an error message
* **When** I open the Semesters page
* **Then** I see `Semesters could not be loaded.`

#### Scenario: Student can view semesters

* **Given** I am signed in as a student
* **And** a semester exists
* **When** I request the semester list
* **Then** the API returns `200`
* **And** the list includes that semester

#### Scenario: Signed-in user sees the Semesters link

* **Given** I am signed in
* **When** I view the menu
* **Then** I see a **Semesters** link to the Semesters page

#### Scenario: Signed-out user is sent to Login

* **Given** I am not signed in
* **When** I open the Semesters page
* **Then** I am sent to the Login page

---

### US-2.3 — Update a semester

#### Scenario: Admin updates a semester

* **Given** I am signed in as an admin
* **And** a semester exists
* **When** I update that semester to name `Spring 2027`, start date `2027-01-11`, and end date `2027-05-07`
* **Then** the API returns `200`
* **And** the response contains those new values

#### Scenario: Admin updates a semester without a required field

* **Given** I am signed in as an admin
* **And** a semester named `Fall 2026` exists
* **When** I update that semester with an empty semester name
* **Then** the API returns `400`
* **And** the response is `{ "message": "Semester name is required." }`
* **And** the semester list still shows `Fall 2026`

#### Scenario: Admin updates a semester that does not exist

* **Given** I am signed in as an admin
* **When** I update semester id `99999` with valid information
* **Then** the API returns `404`
* **And** the response is `{ "message": "Semester with id=99999 not found." }`

#### Scenario: Admin updates a semester using a non-numeric id

* **Given** I am signed in as an admin
* **When** I update semester id `abc` with valid information
* **Then** the API returns `400`
* **And** the response is `{ "message": "Semester id must be a number." }`

#### Scenario: Admin edits a semester from the Semesters page

* **Given** I am signed in as an admin on the Semesters page
* **And** a semester named `Fall 2026` is listed
* **When** I click **Edit** for that semester
* **And** I change the name to `Spring 2027` and click **Save**
* **Then** the dialog closes
* **And** the list shows `Spring 2027`

---

### US-2.4 — Delete a semester

#### Scenario: Admin deletes a semester

* **Given** I am signed in as an admin
* **And** a semester exists
* **When** I delete that semester
* **Then** the API returns `200`
* **And** the response is `{ "message": "Semester deleted successfully." }`

#### Scenario: Deleted semester is no longer in the list

* **Given** I am signed in as an admin
* **And** I have deleted a semester
* **When** I request the semester list
* **Then** the API returns `200`
* **And** the list does not include that semester

#### Scenario: Admin deletes a semester that does not exist

* **Given** I am signed in as an admin
* **When** I delete semester id `99999`
* **Then** the API returns `404`
* **And** the response is `{ "message": "Semester with id=99999 not found." }`

#### Scenario: Admin deletes a semester using a non-numeric id

* **Given** I am signed in as an admin
* **When** I delete semester id `abc`
* **Then** the API returns `400`
* **And** the response is `{ "message": "Semester id must be a number." }`

#### Scenario: Admin deletes a semester from the Semesters page

* **Given** I am signed in as an admin on the Semesters page
* **And** a semester named `Fall 2026` is listed
* **When** I click **Delete** for that semester
* **Then** the list no longer shows `Fall 2026`

#### Scenario: Semesters page shows the API error when a delete fails

* **Given** I am signed in as an admin on the Semesters page
* **And** a semester is listed
* **And** the delete request will fail with an error message
* **When** I click **Delete** for that semester
* **Then** I see the error message returned by the API
* **And** the semester is still listed

#### Scenario: Semesters page shows a fallback error when a delete fails without a message

* **Given** I am signed in as an admin on the Semesters page
* **And** a semester is listed
* **And** the delete request will fail without an error message
* **When** I click **Delete** for that semester
* **Then** I see `Semester could not be deleted.`
* **And** the semester is still listed

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
* **And** a semester named `Fall 2026` exists
* **When** I update that semester with valid information
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`
* **And** the semester list still shows `Fall 2026`

#### Scenario: Student cannot delete a semester

* **Given** I am signed in as a student
* **And** a semester named `Fall 2026` exists
* **When** I delete that semester
* **Then** the API returns `403`
* **And** the response is `{ "message": "Admin role required." }`
* **And** the semester list still shows `Fall 2026`

#### Scenario: Unauthenticated user cannot use semester endpoints

* **Given** I am not signed in
* **When** I request the semester list, create a semester, update a semester, or delete a semester
* **Then** each request returns `401`
* **And** the response is `{ "message": "Unauthorized." }`

#### Scenario: Admin sees semester change actions

* **Given** I am signed in as an admin
* **When** I open the Semesters page
* **Then** I see **Add semester**, **Edit**, and **Delete**

#### Scenario: Student does not see semester change actions

* **Given** I am signed in as a student
* **When** I open the Semesters page
* **Then** I see the semester list
* **And** I do not see **Add semester**, **Edit**, or **Delete**

---

## Test Coverage Map

Each scenario MUST map to at least one automated test.

| Story | Scenario | Test File | Test Name |
|---|---|---|---|
| US-2.1 | Admin creates a semester with valid information | `backend/tests/semester.test.js` | `Admin creates a semester with valid information` |
| US-2.1 | Admin creates a semester without a required field | `backend/tests/semester.test.js` | `Admin creates a semester without a required field` |
| US-2.1 | Admin submits a whitespace-only semester name | `backend/tests/semester.test.js` | `Admin submits a whitespace-only semester name` |
| US-2.1 | Admin submits an invalid start date | `backend/tests/semester.test.js` | `Admin submits an invalid start date` |
| US-2.1 | Admin submits an invalid end date | `backend/tests/semester.test.js` | `Admin submits an invalid end date` |
| US-2.1 | Admin creates a semester from the Semesters page | `frontend/tests/Semesters.test.js` | `Admin creates a semester from the Semesters page` |
| US-2.1 | Semester form blocks submit when a required field is empty | `frontend/tests/Semesters.test.js` | `Semester form blocks submit when a required field is empty` |
| US-2.1 | Save shows a loading state while saving | `frontend/tests/Semesters.test.js` | `Save shows a loading state while saving` |
| US-2.1 | Semesters page shows the API error when a save fails | `frontend/tests/Semesters.test.js` | `Semesters page shows the API error when a save fails` |
| US-2.1 | Semesters page shows a fallback error when a save fails without a message | `frontend/tests/Semesters.test.js` | `Semesters page shows a fallback error when a save fails without a message` |
| US-2.2 | Signed-in user views the semester list | `backend/tests/semester.test.js` | `Signed-in user views the semester list` |
| US-2.2 | Semesters page shows a loading state | `frontend/tests/Semesters.test.js` | `Semesters page shows a loading state` |
| US-2.2 | Semesters page shows a message when no semesters exist | `frontend/tests/Semesters.test.js` | `Semesters page shows a message when no semesters exist` |
| US-2.2 | Signed-in user views an empty semester list | `backend/tests/semester.test.js` | `Signed-in user views an empty semester list` |
| US-2.2 | Semesters page shows the API error when the list fails | `frontend/tests/Semesters.test.js` | `Semesters page shows the API error when the list fails` |
| US-2.2 | Semesters page shows a fallback error when the API gives no message | `frontend/tests/Semesters.test.js` | `Semesters page shows a fallback error when the API gives no message` |
| US-2.2 | Student can view semesters | `backend/tests/semester.test.js` | `Student can view semesters` |
| US-2.2 | Signed-in user sees the Semesters link | `frontend/tests/Semesters.test.js` | `Signed-in user sees the Semesters link` |
| US-2.2 | Signed-out user is sent to Login | `frontend/tests/Semesters.test.js` | `Signed-out user is sent to Login` |
| US-2.3 | Admin updates a semester | `backend/tests/semester.test.js` | `Admin updates a semester` |
| US-2.3 | Admin updates a semester without a required field | `backend/tests/semester.test.js` | `Admin updates a semester without a required field` |
| US-2.3 | Admin updates a semester that does not exist | `backend/tests/semester.test.js` | `Admin updates a semester that does not exist` |
| US-2.3 | Admin updates a semester using a non-numeric id | `backend/tests/semester.test.js` | `Admin updates a semester using a non-numeric id` |
| US-2.3 | Admin edits a semester from the Semesters page | `frontend/tests/Semesters.test.js` | `Admin edits a semester from the Semesters page` |
| US-2.4 | Admin deletes a semester | `backend/tests/semester.test.js` | `Admin deletes a semester` |
| US-2.4 | Deleted semester is no longer in the list | `backend/tests/semester.test.js` | `Deleted semester is no longer in the list` |
| US-2.4 | Admin deletes a semester that does not exist | `backend/tests/semester.test.js` | `Admin deletes a semester that does not exist` |
| US-2.4 | Admin deletes a semester using a non-numeric id | `backend/tests/semester.test.js` | `Admin deletes a semester using a non-numeric id` |
| US-2.4 | Admin deletes a semester from the Semesters page | `frontend/tests/Semesters.test.js` | `Admin deletes a semester from the Semesters page` |
| US-2.4 | Semesters page shows the API error when a delete fails | `frontend/tests/Semesters.test.js` | `Semesters page shows the API error when a delete fails` |
| US-2.4 | Semesters page shows a fallback error when a delete fails without a message | `frontend/tests/Semesters.test.js` | `Semesters page shows a fallback error when a delete fails without a message` |
| US-2.5 | Student cannot create a semester | `backend/tests/semester.test.js` | `Student cannot create a semester` |
| US-2.5 | Student cannot update a semester | `backend/tests/semester.test.js` | `Student cannot update a semester` |
| US-2.5 | Student cannot delete a semester | `backend/tests/semester.test.js` | `Student cannot delete a semester` |
| US-2.5 | Unauthenticated user cannot use semester endpoints | `backend/tests/semester.test.js` | `Unauthenticated user cannot use semester endpoints` |
| US-2.5 | Admin sees semester change actions | `frontend/tests/Semesters.test.js` | `Admin sees semester change actions` |
| US-2.5 | Student does not see semester change actions | `frontend/tests/Semesters.test.js` | `Student does not see semester change actions` |

---

## Agent Implementation Request

Application code for this feature is written by hand. AI may be used only to build the automated tests, as required by the course slides.

### Handwritten application code

The following checklist is for the person coding this feature:

```text
Write Feature 2 by hand from @features/feature-2-semester-management.md on branch feature/2-semester-management.

Only implement what is defined in this specification.

Follow the project's existing architecture, API conventions, security rules, coding conventions, and feature framework.

Follow the layer order in @features/framework.md (models → routes → backend tests → frontend services → views → frontend tests → router).

Feature dependencies:
- Feature 1 provides authenticate and requireAdmin.

Semester routes must be:
POST /course-t6/semesters
GET /course-t6/semesters
PUT /course-t6/semesters/:id
DELETE /course-t6/semesters/:id

There is no GET /course-t6/semesters/:id route.

Use the field name semsterName exactly as written on the project slide.

Create, update, and delete require authenticate and requireAdmin.
List requires authenticate for any signed-in user.
requireAdmin returns 403 { "message": "Admin role required." }.
A missing session returns 401 { "message": "Unauthorized." }.

Register the Semester model in backend/app/models/index.js.
This feature adds no associations.

Use the exact error messages defined in this specification.

The Semesters page route is /semesters with route name semesters.
Signed-out users are sent to Login.
Show a loading state while the list loads.
Show "No semesters found." when the list is empty.
Show Add semester, Edit, and Delete only to an admin.
The form is a dialog titled Add semester or Edit semester, with Save and Cancel.
The dialog closes after a successful save.
Save shows a loading state while the request runs.
Check required fields before submit and do not send the request when one is empty.
After a successful save or delete, show the updated list.
Show the API message when a request fails.
When the API gives no message, show "Semesters could not be loaded.", "Semester could not be saved.", or "Semester could not be deleted." for that action.
The MenuBar shows Semesters to every signed-in user and links it to /semesters.

Map every acceptance scenario in the Test Coverage Map to at least one automated test.

Use the exact test file paths and test names listed in the Test Coverage Map.

Do not add courses, faculty, sections, enrollment, or student management.

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

- [x] Admins can create a semester with name, start date, and end date.
- [x] Signed-in users can list semesters.
- [x] The list is ordered by start date, then by name.
- [x] An empty list returns `200` with `[]`.
- [x] Admins can update a semester, and the response contains the new values.
- [x] Admins can delete a semester, and the list no longer includes it.
- [x] Students receive `403` with `Admin role required.` on create, update, and delete.
- [x] Students can still list semesters.
- [x] Signed-out API calls return `401`.
- [x] Signed-out users who open `/semesters` are sent to Login.
- [x] Required fields, whitespace-only names, and invalid dates return the specified `400` messages.
- [x] A non-numeric id on update or delete returns `Semester id must be a number.`
- [x] An unknown id on update or delete returns `Semester with id=<id> not found.`
- [x] The Semesters page shows **Add semester**, **Edit**, and **Delete** only to an admin.
- [x] The semester dialog is titled **Add semester** or **Edit semester**, has **Save** and **Cancel**, and closes after a successful save.
- [x] **Save** shows a loading state while the request runs.
- [x] The form blocks submit when a required field is empty.
- [x] The list updates after a successful save or delete.
- [x] The page shows a loading state, `No semesters found.` when empty, the API message on failure, and the fallback message when the API gives no message.
- [x] The MenuBar links signed-in users to Semesters.
- [x] The database field is `semsterName`, matching the project slide.
- [x] The Semester model is registered in `backend/app/models/index.js`.
- [x] Backend and frontend are implemented per this spec (**FR-001**–**FR-033** satisfied).
- [x] **Success Criteria (SC-001**–**SC-009)** are met.
- [x] Test Coverage Map is complete.
- [x] Every acceptance scenario has an automated test.
- [x] All tests pass (`npm test`).
- [x] `features/reference/api.md` is updated.
- [x] `features/reference/data-model.md` is updated.
- [x] `features/reference/behavior.md` is updated.
- [x] `features/reference/README.md` lists Feature 2 in its provenance table.
- [x] `features/README.md` links Feature 2 to this file.
- [x] Nothing outside this specification is implemented.
- [x] Agility is synchronized with the amended semester field in Features 2, 5, 7, and 8 (owner: Landry).
- [x] The Feature 2 implementation in PR #17 is aligned with `semsterName` before that implementation is merged (owner: Landry).

---

## Out of Scope

- Course records → Feature 3
- Faculty records → [Feature 4](feature-4-faculty-management.md)
- Sections → Feature 5
- A student choosing a semester and enrolling → [Feature 6](feature-6-enrollment-management.md)
- Student course listing → Feature 7
- Adding or editing student accounts → Feature 9
