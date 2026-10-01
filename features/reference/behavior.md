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
