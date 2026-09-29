# API Reference

**Status:** Feature 1 authentication endpoints implemented. The API is mounted at `/course-t6`.

## Endpoints

| Method | Path | Authentication | Success |
|---|---|---|---|
| `POST` | `/course-t6/register` | Public | `201` with user and session token |
| `POST` | `/course-t6/login` | Public | `200` with user and session token |
| `POST` | `/course-t6/logout` | Bearer token | `200` with `{ "message": "Signed out successfully." }` |

Registration requires `firstName`, `lastName`, `email`, `universityId`, `userName`, `password`, and `confirmPassword`. It creates a `student` and immediately authenticates that user. Validation or duplicate values return `400` with `{ "message": "..." }`.

Login accepts `userName` and `password`. Invalid credentials return `401` with `{ "message": "Invalid username or password." }`. Login reuses an existing valid session.

Registration and login return the same flat fields: `userId`, `firstName`, `lastName`, `email`, `universityId`, `userName`, `role`, and `token`.

Protected routes return `401` without a valid session. Routes using the reusable admin check return `403` with `{ "message": "Admin role required." }` for authenticated students. Feature 1 adds no product admin-only route.

## Conventions

- Flat JSON responses (no `{ success, data }` envelope).
- Errors: `{ "message": "..." }`.
- Authenticated routes: `Authorization: Bearer <token>`.
