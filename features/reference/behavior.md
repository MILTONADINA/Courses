# Behavior & Rules Reference

**Living snapshot** of Feature 1 product rules.

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
| Registration creates a student and immediately starts a session | `auth.controller.js#register` | Feature 1 FR-001–FR-004 |
| Required fields, email format, password length, confirmation, and uniqueness return specified `400` messages | `auth.controller.js#register`, `Register.vue` | Feature 1 FR-026–FR-034 |
| Usernames are stored lowercase and login is case-insensitive | `auth.controller.js` | Feature 1 FR-006–FR-007 |
| Login reuses a valid server-side session; JWT and row expire after 24 hours | `auth.controller.js#getOrCreateSession` | Feature 1 FR-017–FR-020, FR-037 |
| Expired, invalid, or revoked tokens cannot authenticate | `authorization.js#authenticate` | Feature 1 FR-020 |
| Logout clears the current session's token | `auth.controller.js#logout` | Feature 1 FR-021–FR-022 |
| Only `admin` passes the reusable admin check; students receive the required `403` message | `authorization.js#requireAdmin` | Feature 1 FR-012–FR-016, FR-039 |
| Only the seed process creates the first admin, using all six `ADMIN_*` environment variables | `scripts/seed.mjs` | Feature 1 FR-023–FR-025 |
| The frontend stores the user response and protects Home; `401` clears it and redirects to Login | `router.js`, `services.js`, auth views | Feature 1 FR-019–FR-020 |
