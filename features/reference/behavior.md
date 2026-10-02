# Behavior & Rules Reference

**Living snapshot** of Feature 1, Feature 2, and Feature 4 product rules.

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

## Faculty

| Rule | Enforcement | Provenance |
|---|---|---|
| Only admins list, add, edit, and delete faculty members. Students receive `403`; a missing session returns `401` | `faculty.routes.js` | Feature 4 FR-001, FR-009, FR-011, FR-013, FR-017–FR-020 |
| `firstName`, `lastName`, and `dept` are required and reject empty or whitespace-only values. `dept` is free text | `faculty.controller.js` | Feature 4 FR-002–FR-008, FR-012 |
| The list is ordered by `lastName`, then `firstName`. An empty list returns `200` with `[]` | `faculty.controller.js#findAll` | Feature 4 FR-010 |
| A non-numeric id returns `Faculty member id must be a number.` An unknown id returns `Faculty member with id=<id> not found.` Delete is permanent and returns `Faculty member deleted successfully.` | `faculty.controller.js` | Feature 4 FR-014–FR-016 |
| A faculty member is not a user account; no `faculty` role exists | `faculty.model.js` | Feature 4 FR-021 |
| `/faculty` is admin-only: students are sent to Home and signed-out users to Login. The menu shows **Faculty** to admins only | `router.js`, `MenuBar.vue` | Feature 4 FR-022, FR-023 |
| The Faculty page lists First name, Last name, and Department with text **Edit** and **Delete** actions, shows a loading state, `No faculty members yet.` when empty, and the API message or `Request failed.` on failure | `Faculty.vue` | Feature 4 FR-024, screen requirements |
| The **Add Faculty** / **Edit Faculty** dialog checks every field before submit with the API's messages, sends no request when a check fails, shows API errors, and closes and refreshes the list after a successful save | `Faculty.vue` | Feature 4 screen requirements |
