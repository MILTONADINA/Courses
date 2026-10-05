# API Reference

**Status:** Feature 1 authentication, Feature 2 semester endpoints, Feature 3 course endpoints, Feature 4 faculty endpoints, Feature 5 section endpoints, Feature 6 enrollment endpoints, Feature 8 section student listing, and Feature 9 student endpoints implemented. The API is mounted at `/course-t6`.

## Endpoints

| Method | Path | Authentication | Success |
|---|---|---|---|
| `POST` | `/course-t6/register` | Public | `201` with the created user (no password, no token) |
| `POST` | `/course-t6/login` | Public | `200` with user and session token |
| `POST` | `/course-t6/logout` | Bearer token | `200` with `{ "message": "Signed out successfully." }` |
| `POST` | `/course-t6/semesters` | Admin | `201` semester |
| `GET` | `/course-t6/semesters` | Signed-in user | `200` array, ordered by `startDate` then `semsterName` |
| `PUT` | `/course-t6/semesters/:id` | Admin | `200` semester |
| `DELETE` | `/course-t6/semesters/:id` | Admin | `200` with `{ "message": "Semester deleted successfully." }` |
| `POST` | `/course-t6/courses` | Admin | `201` course |
| `GET` | `/course-t6/courses` | Admin | `200` array |
| `PUT` | `/course-t6/courses/:id` | Admin | `200` course |
| `DELETE` | `/course-t6/courses/:id` | Admin | `200` with `{ "message": "Course deleted successfully." }` |
| `GET` | `/course-t6/faculty` | Admin | `200` array, ordered by `lastName` then `firstName` |
| `POST` | `/course-t6/faculty` | Admin | `201` faculty member |
| `PUT` | `/course-t6/faculty/:id` | Admin | `200` faculty member |
| `DELETE` | `/course-t6/faculty/:id` | Admin | `200` with `{ "message": "Faculty member deleted successfully." }` |
| `GET` | `/course-t6/sections` | Signed-in user | `200` array, optional `?semesterId=`, ordered by semester `startDate`, then `courseNumber`, then `sectionNumber` |
| `GET` | `/course-t6/sections/:id/students` | Admin | `200` with `section` and `students`, ordered by student `lastName` then `firstName` |
| `POST` | `/course-t6/sections` | Admin | `201` section |
| `PUT` | `/course-t6/sections/:id` | Admin | `200` section |
| `DELETE` | `/course-t6/sections/:id` | Admin | `200` with `{ "message": "Section deleted successfully." }` |
| `POST` | `/course-t6/enrollments` | Student | `201` enrollment |
| `GET` | `/course-t6/enrollments` | Student | `200` array of the authenticated student's enrollments |
| `PUT` | `/course-t6/enrollments/:id` | Student, owner | `200` updated enrollment |
| `DELETE` | `/course-t6/enrollments/:id` | Student, owner | `200` with `{ "message": "Enrollment deleted successfully." }` |
| `POST` | `/course-t6/students` | Admin | `201` student |
| `GET` | `/course-t6/students` | Admin | `200` array of students |
| `PUT` | `/course-t6/students/:id` | Admin | `200` student |
| `DELETE` | `/course-t6/students/:id` | Admin | `200` with `{ "message": "Student deleted successfully." }` |

Registration requires `firstName`, `lastName`, `email`, `universityId`, `userName`, and `password`. It creates a `student` (a `role` in the body is ignored) and does not sign the user in. It returns `id`, `firstName`, `lastName`, `email`, `universityId`, `userName`, and `role`. Missing or whitespace-only fields, a password under 8 characters, or a duplicate `userName` or `email` return `400` with `{ "message": "..." }`.

Login accepts `userName` and `password`. A missing or whitespace-only value returns `400` with `{ "message": "Username is required." }` or `{ "message": "Password is required." }`. Invalid credentials return `401` with `{ "message": "Invalid username or password." }`. Login reuses an existing valid session and returns `userId`, `firstName`, `lastName`, `email`, `userName`, `role`, and `token`.

Protected routes, including logout, return `401` with `{ "message": "Unauthorized." }` without a valid session. An unexpected server error returns `500` with `{ "message": "Registration failed." }`, `{ "message": "Login failed." }`, or `{ "message": "Logout failed." }`. Routes using the reusable admin check return `403` with `{ "message": "Admin role required." }` for authenticated students. Feature 1 adds no product admin-only route.

Create and update a semester with `semsterName`, `startDate`, and `endDate`. A semester response includes `id`, those three fields, `createdAt`, and `updatedAt`. There is no `GET /course-t6/semesters/:id` route. When no semesters exist, the list returns `200` with `[]`.

A missing semester name, or a whitespace-only semester name, returns `400` with `Semester name is required.` A missing start date or end date returns `400` with `Start date is required.` or `End date is required.` A whitespace-only date, or a date that is not a real `YYYY-MM-DD` value, returns `400` with `Enter a valid start date.` or `Enter a valid end date.` A non-numeric id on update or delete returns `400` with `Semester id must be a number.` An unknown id returns `404` with `Semester with id=<id> not found.` A student who creates, updates, or deletes a semester receives `403`. An unexpected semester error returns `500` with `Semester could not be created.`, `Semesters could not be loaded.`, `Semester could not be updated.`, or `Semester could not be deleted.`

Create and update a course with `courseNumber`, `courseName`, `courseDescription`, `courseSemesters`, `courseFrequency`, `courseHours`, and `courseDept`. A course response includes `id`, those seven fields, `createdAt`, and `updatedAt`. There is no `GET /course-t6/courses/:id` route. When no courses exist, the list returns `200` with `[]`. A missing or whitespace-only required field returns `400` with that field's required message, such as `Course name is required.` A non-numeric id returns `400` with `Course id must be a number.` An unknown id, including a negative number, returns `404` with `Course with id=<id> not found.` Students and signed-out users cannot use any course route. An unexpected course error returns `500` with `Request failed.`

Create and update a faculty member with `firstName`, `lastName`, and `dept`. A faculty member response includes `id`, those three fields, `createdAt`, and `updatedAt`. There is no `GET /course-t6/faculty/:id` route. When no faculty members exist, the list returns `200` with `[]`. Every faculty route requires an admin: no session returns `401` with `Unauthorized.`, and an authenticated student receives `403` with `Admin role required.`

A missing or whitespace-only field returns `400` with `First name is required.`, `Last name is required.`, or `Department is required.`, checked in that order. Trimming is used only for this check; saved values are not trimmed. A non-numeric id on update or delete returns `400` with `Faculty member id must be a number.` An unknown id, including a negative number, returns `404` with `Faculty member with id=<id> not found.` An unexpected faculty error returns `500` with `Faculty member could not be created.`, `Faculty members could not be loaded.`, `Faculty member could not be updated.`, or `Faculty member could not be deleted.`

Create and update a section with `sectionNumber`, `semesterId`, `courseId`, `facultyId`, `daysOfWeek`, `startTime`, and `endTime`. A section response includes `id`, those seven fields, `semester` (`id`, `semsterName`), `course` (`id`, `courseNumber`, `courseName`), `faculty` (`id`, `firstName`, `lastName`), `createdAt`, and `updatedAt`. Times are returned as `HH:MM`. There is no `GET /course-t6/sections/:id` route. When no sections match, the list returns `200` with `[]`. Any signed-in user can list sections; only admins can create, update, or delete them.

Section fields are checked in this order: required fields, then ids, then times, then whether the semester, course, and faculty member exist. A missing field, or a whitespace-only `sectionNumber` or `daysOfWeek`, returns `400` with that field's required message, such as `Section number is required.` or `Faculty member id is required.` Saved values are not trimmed. A non-numeric `semesterId`, `courseId`, or `facultyId` returns `400` with `Semester id must be a number.`, `Course id must be a number.`, or `Faculty member id must be a number.` A time that is not 24-hour `HH:MM` returns `400` with `Start time must be in HH:MM format.` or `End time must be in HH:MM format.` An unknown semester, course, or faculty member returns `404` with `Semester with id=<id> not found.`, `Course with id=<id> not found.`, or `Faculty member with id=<id> not found.` A non-numeric `semesterId` query returns `400` with `Semester id must be a number.` A non-numeric section id returns `400` with `Section id must be a number.` An unknown section id, including a negative number, returns `404` with `Section with id=<id> not found.` An unexpected section error returns `500` with `Section could not be created.`, `Sections could not be loaded.`, `Section could not be updated.`, or `Section could not be deleted.`

Deleting a semester, course, or faculty member that a section uses returns `400` with `Semester has sections and cannot be deleted.`, `Course has sections and cannot be deleted.`, or `Faculty member has sections and cannot be deleted.`, and nothing is deleted.

A section's student list returns `{ section, students }`. The section includes only `id`, `sectionNumber`, `courseNumber`, `courseName`, and `semsterName`. Each student includes only `id`, `firstName`, `lastName`, `universityId`, and `email`; no password is returned. Only enrollments in the requested section are listed, ordered by `lastName` then `firstName`. An existing section with no enrollments returns `200` with `students: []`. A non-numeric section id returns `400` with `Section id must be a number.` An unknown id returns `404` with `Section with id=<id> not found.` Authenticated students receive `403` with `Admin role required.` Invalid or missing sessions receive `401` with `Unauthorized.` An unexpected error returns `500` with `Request failed.` The endpoint only reads data and adds no tables, columns, or associations.

Create a student with `firstName`, `lastName`, `email`, `universityId`, `userName`, and `password`. The account is always saved as `student`, even if the body sends another role. `userName` is stored lowercase. Update changes `firstName`, `lastName`, `email`, `universityId`, and `userName` only. A student response includes `id`, `firstName`, `lastName`, `email`, `universityId`, `userName`, `role`, `createdAt`, and `updatedAt`. It never includes `password`. There is no `GET /course-t6/students/:id` route. The list includes only students and returns `200` with `[]` when none exist. A missing or whitespace-only required field returns `400` with that field's required message. A password shorter than 8 characters returns `400` with `Password must be at least 8 characters.` A duplicate username returns `Username is already taken.` A duplicate email returns `Email is already registered.` A non-numeric id returns `400` with `Student id must be a number.` An unknown id, or an admin id, returns `404` with `Student with id=<id> not found.` Students and signed-out users cannot use any student route.

## Enrollment payloads and errors

Create or change an enrollment with `{ "sectionId": 3 }`. Responses contain `id`, `sectionId`, `studentId`, `createdAt`, and `updatedAt`. A supplied `studentId` is ignored: create uses the authenticated user's id and change preserves the owner. GET returns only that student's enrollments, or `[]`. There is no get-by-id enrollment route.

All enrollment routes use `authenticate` and `requireStudent`. An invalid or missing session returns `401` with `Unauthorized.`; authenticated non-students receive `403` with `Student role required.`. An update or delete of an absent or another student's enrollment returns the same `404`, without revealing ownership.

| Condition | Status | Message |
|---|---|---|
| Missing or blank `sectionId` on create/change | `400` | `Section id is required.` |
| Non-numeric `sectionId` on create/change | `400` | `Section id must be a number.` |
| Section not found | `404` | `Section with id=<id> not found.` |
| Student already enrolled in the target section | `400` | `You are already enrolled in this section.` |
| Non-numeric enrollment id on change/delete | `400` | `Enrollment id must be a number.` |
| Enrollment absent or owned by another student | `404` | `Enrollment with id=<id> not found.` |
| Unexpected enrollment error | `500` | `Request failed.` |

Deleting a section or student also deletes their enrollments through database foreign-key cascades.

## Conventions

- Flat JSON responses (no `{ success, data }` envelope).
- Errors: `{ "message": "..." }`.
- Authenticated routes: `Authorization: Bearer <token>`.
