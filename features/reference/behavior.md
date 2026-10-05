# Behavior & Rules Reference

**Living snapshot** of Features 1–9 product rules.

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

## Faculty

| Rule | Enforcement | Provenance |
|---|---|---|
| Only admins list, add, edit, and delete faculty members. Students receive `403`; a missing session returns `401` | `faculty.routes.js` | Feature 4 FR-001, FR-009, FR-011, FR-013, FR-017–FR-020 |
| `firstName`, `lastName`, and `dept` are required and reject empty or whitespace-only values. Saved text is not trimmed. `dept` is free text | `faculty.controller.js` | Feature 4 FR-002–FR-008, FR-012 |
| The list is ordered by `lastName`, then `firstName`. An empty list returns `200` with `[]` | `faculty.controller.js#findAll` | Feature 4 FR-010 |
| A non-numeric id returns `Faculty member id must be a number.` An unknown id, including a negative number, returns `Faculty member with id=<id> not found.` Delete is permanent and returns `Faculty member deleted successfully.` | `faculty.controller.js` | Feature 4 FR-014–FR-016 |
| A faculty member is not a user account; no `faculty` role exists | `faculty.model.js` | Feature 4 FR-021 |
| `/faculty` is admin-only: students are sent to Home and signed-out users to Login. The menu shows **Faculty** to admins only | `router.js`, `MenuBar.vue` | Feature 4 FR-022, FR-023 |
| The Faculty page lists First name, Last name, and Department with text **Edit** and **Delete** actions, shows a loading state, `No faculty members yet.` when empty, and the API message or `Request failed.` on failure | `Faculty.vue` | Feature 4 FR-024, screen requirements |
| The **Add Faculty** / **Edit Faculty** dialog checks every field before submit with the API's messages, sends no request when a check fails, shows API errors, and closes and refreshes the list after a successful save | `Faculty.vue` | Feature 4 screen requirements |

## Sections

| Rule | Enforcement | Provenance |
|---|---|---|
| Any signed-in user can list sections. Only admins add, edit, and delete them. Students receive `403`; a missing session returns `401` | `section.routes.js` | Feature 5 FR-001, FR-012, FR-017, FR-019, FR-023–FR-026 |
| All seven section fields are required. Whitespace-only `sectionNumber` or `daysOfWeek` counts as missing. Saved text is not trimmed | `section.controller.js` | Feature 5 FR-002–FR-006 |
| `semesterId`, `courseId`, and `facultyId` must be numbers and must exist. Times must be 24-hour `HH:MM` | `section.controller.js` | Feature 5 FR-007–FR-011, FR-018 |
| The list can be filtered by `?semesterId=` and is ordered by semester `startDate`, then `courseNumber`, then `sectionNumber`. Each section includes its semester name, course number and name, and instructor name | `section.controller.js#findAll` | Feature 5 FR-013–FR-016 |
| A non-numeric section id returns `Section id must be a number.` An unknown id, including a negative number, returns `Section with id=<id> not found.` Delete is permanent and returns `Section deleted successfully.` | `section.controller.js` | Feature 5 FR-020–FR-022 |
| A semester, course, or faculty member that a section uses cannot be deleted; the delete returns `400` and nothing is deleted | `semester.controller.js`, `course.controller.js`, `faculty.controller.js`, `models/index.js` | Feature 5 FR-027–FR-030 |
| `/sections` is admin-only: students are sent to Home and signed-out users to Login. The menu shows **Sections** to admins only | `router.js`, `MenuBar.vue` | Feature 5 FR-031, FR-032 |
| The Sections page lists Semester, Course, Section, Instructor, Days, and Time with text **Edit** and **Delete** actions, shows a loading state, `No sections yet.` when empty, and the API message or `Request failed.` on failure | `Sections.vue` | Feature 5 FR-033, screen requirements |
| The **Add Section** / **Edit Section** dialog picks the semester, course, and instructor from lists, checks every field and the time format before submit with the API's messages, sends no request when a check fails, stays open with the API error or `Request failed.` when a save fails, and closes and refreshes the list after a successful save | `Sections.vue` | Feature 5 FR-034–FR-036, screen requirements |

## Enrollments

| Rule | Enforcement | Provenance |
|---|---|---|
| Only authenticated students may list, create, change, or drop enrollments. Non-students receive `403`; invalid sessions receive `401` | `enrollment.routes.js`, `authorization.js#requireStudent` | Feature 6 FR-001–FR-003, FR-022–FR-023 |
| Creation derives the owner from the authenticated user and ignores supplied `studentId`. Listing, changes, and deletion are scoped to that owner. Changes update only `sectionId`. Missing and foreign enrollments both return `404` | `enrollment.controller.js` | Feature 6 FR-007–FR-009, FR-014–FR-021, FR-035–FR-037 |
| Section ids are required, numeric, and must reference an existing section. Duplicate enrollment is rejected on create and change; a unique index also protects concurrent requests | `enrollment.controller.js`, `enrollment.model.js` | Feature 6 FR-010–FR-013, FR-036, data model requirements |
| Deleting a section or student removes their enrollments through `ON DELETE CASCADE` | `models/index.js` | Feature 6 FR-029–FR-030 |
| `/enroll` (route name `enroll`) is student-only; signed-out users go to Login and admins go Home. The menu shows **Enroll** only to authenticated students | `router.js`, `MenuBar.vue` | Feature 6 FR-024–FR-028 |
| The page loads semesters and the student's enrollments before enabling selection. Selecting a semester loads its sections, preserves API order, and displays course number/name, section number, instructor, days, and times | `Enroll.vue` | Feature 6 FR-004–FR-006, screen requirements |
| Unenrolled sections show **Enroll**; enrolled sections show **Drop** and **Change section**. Successful actions update the displayed enrollment state immediately | `Enroll.vue` | Feature 6 FR-016, FR-033, FR-038, FR-040 |
| The page shows loading states, `No semesters available.`, or `No sections for this semester.` as appropriate. Errors display the API message or `Request failed.` | `Enroll.vue` | Feature 6 FR-031–FR-034, FR-041, screen requirements |
| **Change section** offers only other, unenrolled sections of the selected semester. No choices shows `No other sections available.`; no selection shows `Section id is required.` without a request | `Enroll.vue` | Feature 6 FR-038–FR-039, screen requirements |
| Dialog **Save** shows loading, closes on success, and retains the original enrollment on failure with the API error or fallback. **Cancel** closes without saving | `Enroll.vue` | Feature 6 FR-032, FR-040–FR-041, screen requirements |

## My courses

| Rule | Enforcement | Provenance |
|---|---|---|
| `GET /course-t6/my-courses` is student-only and returns only the authenticated student's enrollments. A supplied student id is ignored. An empty list returns `200` with `[]` | `myCourses.routes.js`, `myCourses.controller.js` | Feature 7 FR-001, FR-003, FR-005, FR-006 |
| Each item includes course number and name, section number, semester name, days, times, and the instructor's first and last name | `myCourses.controller.js` | Feature 7 FR-004 |
| An admin returns `403` with `Student role required.` | `myCourses.routes.js` | Feature 7 FR-002 |
| A missing session returns `401` with `Unauthorized.` | `myCourses.routes.js` | Feature 7 FR-007 |
| `/my-courses` (route name `my-courses`) is student-only. Signed-out users go to Login and admins go Home. The menu shows **My courses** only to authenticated students | `router.js`, `MenuBar.vue` | Feature 7 FR-008–FR-011 |
| The page shows a loading state while the list loads | `MyCourses.vue` | Feature 7 FR-012 |
| The page shows `No enrolled sections.` when the list is empty, the API message on failure, and `Request failed.` when the API gives no message. It does not show **Enroll**, **Drop**, or **Change section** | `MyCourses.vue` | Feature 7 FR-013–FR-016 |

## Section student listing

| Rule | Enforcement | Provenance |
|---|---|---|
| Every admin may list the students of every section. Students cannot list any section's students, including their own section. Missing or invalid sessions receive `401`; students receive `403` | `section.routes.js`, `authorization.js` | Feature 8 FR-001, FR-010–FR-012, data ownership |
| The response includes the section number, course number and name, and semester name, plus only the enrolled students' id, first name, last name, university ID, and email. Passwords are excluded. Students are sorted by last name, then first name | `section.controller.js#findStudents` | Feature 8 FR-002–FR-006 |
| An empty roster returns `200` with `students: []`. A non-numeric section id returns `400`; an unknown section id returns `404`, with the specified messages | `section.controller.js#findStudents` | Feature 8 FR-007–FR-009 |
| Each Sections row has a text **Students** action opening `/sections/:id/students`, named `section-students`. Students go Home; signed-out users go to Login. No menu link is added | `Sections.vue`, `router.js` | Feature 8 FR-013–FR-016, screen requirements |
| The roster heading is `<courseNumber> <courseName> — Section <sectionNumber> (<semesterName>)`. The table shows Last name, First name, University ID, and Email in API order | `SectionStudents.vue` | Feature 8 screen requirements |
| The page shows loading, `No students enrolled.` for an empty roster, and the API message or `Request failed.` for errors. It offers no enrollment actions and does not change any data | `SectionStudents.vue`, `section.controller.js#findStudents` | Feature 8 FR-017–FR-021 |

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
