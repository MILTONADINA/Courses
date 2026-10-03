# API Reference

**Status:** Feature 1 authentication, Feature 2 semester endpoints, and Feature 9 student endpoints implemented. The API is mounted at `/course-t6`.

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
| `POST` | `/course-t6/students` | Admin | `201` student |
| `GET` | `/course-t6/students` | Admin | `200` array of students |
| `PUT` | `/course-t6/students/:id` | Admin | `200` student |
| `DELETE` | `/course-t6/students/:id` | Admin | `200` with `{ "message": "Student deleted successfully." }` |

Registration requires `firstName`, `lastName`, `email`, `universityId`, `userName`, and `password`. It creates a `student` (a `role` in the body is ignored) and does not sign the user in. It returns `id`, `firstName`, `lastName`, `email`, `universityId`, `userName`, and `role`. Missing or whitespace-only fields, a password under 8 characters, or a duplicate `userName` or `email` return `400` with `{ "message": "..." }`.

Login accepts `userName` and `password`. A missing or whitespace-only value returns `400` with `{ "message": "Username is required." }` or `{ "message": "Password is required." }`. Invalid credentials return `401` with `{ "message": "Invalid username or password." }`. Login reuses an existing valid session and returns `userId`, `firstName`, `lastName`, `email`, `userName`, `role`, and `token`.

Protected routes, including logout, return `401` with `{ "message": "Unauthorized." }` without a valid session. An unexpected server error returns `500` with `{ "message": "Registration failed." }`, `{ "message": "Login failed." }`, or `{ "message": "Logout failed." }`. Routes using the reusable admin check return `403` with `{ "message": "Admin role required." }` for authenticated students. Feature 1 adds no product admin-only route.

Create and update a semester with `semsterName`, `startDate`, and `endDate`. A semester response includes `id`, those three fields, `createdAt`, and `updatedAt`. There is no `GET /course-t6/semesters/:id` route. When no semesters exist, the list returns `200` with `[]`.

A missing semester name, or a whitespace-only semester name, returns `400` with `Semester name is required.` A missing start date or end date returns `400` with `Start date is required.` or `End date is required.` A whitespace-only date, or a date that is not a real `YYYY-MM-DD` value, returns `400` with `Enter a valid start date.` or `Enter a valid end date.` A non-numeric id on update or delete returns `400` with `Semester id must be a number.` An unknown id returns `404` with `Semester with id=<id> not found.` A student who creates, updates, or deletes a semester receives `403`. An unexpected semester error returns `500` with `Semester could not be created.`, `Semesters could not be loaded.`, `Semester could not be updated.`, or `Semester could not be deleted.`

Create a student with `firstName`, `lastName`, `email`, `universityId`, `userName`, and `password`. The account is always saved as `student`, even if the body sends another role. `userName` is stored lowercase. Update changes `firstName`, `lastName`, `email`, `universityId`, and `userName` only. A student response includes `id`, `firstName`, `lastName`, `email`, `universityId`, `userName`, `role`, `createdAt`, and `updatedAt`. It never includes `password`. There is no `GET /course-t6/students/:id` route. The list includes only students and returns `200` with `[]` when none exist. A missing or whitespace-only required field returns `400` with that field's required message. A password shorter than 8 characters returns `400` with `Password must be at least 8 characters.` A duplicate username returns `Username is already taken.` A duplicate email returns `Email is already registered.` A non-numeric id returns `400` with `Student id must be a number.` An unknown id, or an admin id, returns `404` with `Student with id=<id> not found.` Students and signed-out users cannot use any student route.

## Conventions

- Flat JSON responses (no `{ success, data }` envelope).
- Errors: `{ "message": "..." }`.
- Authenticated routes: `Authorization: Bearer <token>`.
