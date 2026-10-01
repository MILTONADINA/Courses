# API Reference

**Status:** Feature 1 authentication endpoints implemented. The API is mounted at `/course-t6`.

## Endpoints

| Method | Path | Authentication | Success |
|---|---|---|---|
| `POST` | `/course-t6/register` | Public | `201` with the created user (no password, no token) |
| `POST` | `/course-t6/login` | Public | `200` with user and session token |
| `POST` | `/course-t6/logout` | Bearer token | `200` with `{ "message": "Signed out successfully." }` |

Registration requires `firstName`, `lastName`, `email`, `universityId`, `userName`, and `password`. It creates a `student` (a `role` in the body is ignored) and does not sign the user in. It returns `id`, `firstName`, `lastName`, `email`, `universityId`, `userName`, and `role`. Missing or whitespace-only fields, a password under 8 characters, or a duplicate `userName` or `email` return `400` with `{ "message": "..." }`.

Login accepts `userName` and `password`. A missing or whitespace-only value returns `400` with `{ "message": "Username is required." }` or `{ "message": "Password is required." }`. Invalid credentials return `401` with `{ "message": "Invalid username or password." }`. Login reuses an existing valid session and returns `userId`, `firstName`, `lastName`, `email`, `userName`, `role`, and `token`.

Protected routes, including logout, return `401` with `{ "message": "Unauthorized." }` without a valid session. An unexpected server error returns `500` with `{ "message": "Registration failed." }`, `{ "message": "Login failed." }`, or `{ "message": "Logout failed." }`. Routes using the reusable admin check return `403` with `{ "message": "Admin role required." }` for authenticated students. Feature 1 adds no product admin-only route.

## Conventions

- Flat JSON responses (no `{ success, data }` envelope).
- Errors: `{ "message": "..." }`.
- Authenticated routes: `Authorization: Bearer <token>`.
