# Behavior & Rules Reference

**Living snapshot** of Feature 1 and Feature 2 product rules.

These files answer: *"What rules does the app enforce right now?"*  
They do **not** authorize new scope — implement only from `features/feature-*.md`.

| File | Role |
|------|------|
| [api.md](./api.md) | Routes / payloads |
| [data-model.md](./data-model.md) | Tables / columns |
| **This file** | Ownership, sort, validation, UI rules |

## Authentication and authorization

| Rule | Enforcement | Provenance |
|---|---|---|
| Registration creates a student, ignores a supplied role, and does not start a session | `auth.controller.js#register`, `Register.vue` | Feature 1 FR-001–FR-003 |
| Required fields, password length, and `userName`/`email` uniqueness return specified `400` messages | `auth.controller.js#register`, `Register.vue` | Feature 1 FR-025–FR-031 |
| Login with a missing or whitespace-only `userName` or `password` returns `400` with the required message | `auth.controller.js#login` | Feature 1 FR-032 |
| Usernames are stored lowercase and login is case-insensitive | `auth.controller.js` | Feature 1 FR-005–FR-006 |
| Login reuses a valid server-side session; JWT and row expire after 24 hours | `auth.controller.js#getOrCreateSession` | Feature 1 FR-015–FR-018, FR-035 |
| Expired, invalid, or revoked tokens cannot authenticate; the JWT secret comes only from `AUTH_SECRET` | `authorization.js#authenticate`, `auth.config.js` | Feature 1 FR-012, FR-018, FR-038 |
| Logout clears the current session's token | `auth.controller.js#logout` | Feature 1 FR-019–FR-020 |
| Only `admin` passes the reusable admin check; students receive the required `403` message | `authorization.js#requireAdmin` | Feature 1 FR-011–FR-014, FR-036–FR-037 |
| Only the seed process creates the first admin, using all six `ADMIN_*` environment variables (empty counts as missing) | `app/scripts/seed.mjs` | Feature 1 FR-021–FR-024 |
| The frontend stores the login response and protects Home; `401` clears it and redirects to Login | `router.js`, `services.js`, auth views | Feature 1 FR-017–FR-018 |

## Semesters

| Rule | Enforcement | Provenance |
|---|---|---|
| Admins create, update, and delete semesters. Any signed-in user can list them | `semester.routes.js`, `semester.controller.js` | Feature 2 FR-001, FR-002, FR-010, FR-015, FR-018 |
| `semsterName`, `startDate`, and `endDate` are required. A whitespace-only name is rejected as missing. Dates must be real `YYYY-MM-DD` values | `semester.controller.js` | Feature 2 FR-004–FR-006, FR-008 |
| The list is ordered by `startDate`, then `semsterName`. An empty list returns `200` with `[]` | `semester.controller.js#findAll` | Feature 2 FR-011, FR-012 |
| A non-numeric id returns `Semester id must be a number.` An unknown id returns `Semester with id=<id> not found.` Delete returns `Semester deleted successfully.` | `semester.controller.js` | Feature 2 FR-013, FR-014, FR-019 |
| Students receive `403` on create, update, and delete. A missing session returns `401` | `semester.routes.js` | Feature 2 FR-020–FR-022 |
| `/semesters` is signed-in only. The menu shows **Semesters** to every signed-in user | `router.js`, `MenuBar.vue` | Feature 2 FR-025, FR-026 |
| Admins see **Add semester**, **Edit**, and **Delete**. Students see the list without those actions | `Semesters.vue` | Feature 2 FR-023, FR-024 |
| The form is a dialog titled **Add semester** or **Edit semester**, with **Save** and **Cancel**. It closes after a successful save. **Save** shows a loading state | `Semesters.vue` | Feature 2 screen requirements, FR-033 |
| The form checks required fields before submit and does not send the request when one is empty | `Semesters.vue` | Feature 2 FR-031 |
| The page shows a loading state, `No semesters found.` when empty, the API message on failure, and `Semesters could not be loaded.`, `Semester could not be saved.`, or `Semester could not be deleted.` when the API gives no message | `Semesters.vue` | Feature 2 FR-027–FR-030 |
| The list refreshes after a successful save or delete. Edit uses the semester already on the list | `Semesters.vue` | Feature 2 FR-032 |

## Courses

| Rule | Enforcement | Provenance |
|---|---|---|
| Only admins can list, create, update, and delete courses | `course.routes.js`, `course.controller.js` | Feature 3 |
| All seven course fields are required. Whitespace-only counts as missing. Saved text is not trimmed | `course.controller.js` | Feature 3 |
| An empty list returns `200` with `[]`. There is no get-by-id route | `course.controller.js` | Feature 3 |
| A non-numeric id returns `Course id must be a number.` An unknown id returns `Course with id=<id> not found.` Delete returns `Course deleted successfully.` | `course.controller.js` | Feature 3 |
| Students receive `403`. A missing session returns `401` | `course.routes.js` | Feature 3 |
| `/courses` is admin only. Students are sent Home. Signed-out users are sent to Login. The menu shows **Courses** only to admins | `router.js`, `MenuBar.vue` | Feature 3 |
| The form is a dialog titled **Add course** or **Edit course**, with **Save** and **Cancel**. It closes after a successful save. **Save** shows a loading state | `Courses.vue` | Feature 3 |
| The page shows `Loading courses...`, `No courses found.`, the API message on failure, and `Request failed.` when the API gives no message | `Courses.vue` | Feature 3 |

## Students

| Rule | Enforcement | Provenance |
|---|---|---|
| Only admins can list, create, update, and delete students. Students are rows in `users` with role `student` | `student.routes.js`, `student.controller.js` | Feature 9 |
| Create requires the six profile fields and a password of at least 8 characters. Role in the body is ignored and saved as `student`. `userName` is stored lowercase | `student.controller.js` | Feature 9 |
| The list includes only students and never includes `password`. An empty list returns `200` with `[]` | `student.controller.js#findAll` | Feature 9 |
| Update changes name, email, university ID, and username. It does not change password or role | `student.controller.js#update` | Feature 9 |
| A non-numeric id returns `Student id must be a number.` An unknown id or an admin id returns `Student with id=<id> not found.` Delete returns `Student deleted successfully.` | `student.controller.js` | Feature 9 |
| `/students` is admin only. Students are sent Home. Signed-out users are sent to Login. The menu shows **Students** only to admins | `router.js`, `MenuBar.vue` | Feature 9 |
| The form is a dialog titled **Add student** or **Edit student**. Add asks for a password. Edit does not | `Students.vue` | Feature 9 |
| The page shows `Loading students...`, `No students found.`, the API message on failure, and `Request failed.` when the API gives no message | `Students.vue` | Feature 9 |
