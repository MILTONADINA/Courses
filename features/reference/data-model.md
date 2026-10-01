# Data Model Reference

**Status:** Feature 1 schema implemented.

## Tables

### `users`

| Field | Rule |
|---|---|
| `id` | Auto-generated primary key |
| `firstName`, `lastName` | Required strings |
| `email`, `universityId` | Required unique strings |
| `userName` | Required unique string, stored lowercase |
| `password` | Required bcrypt hash, excluded from default queries |
| `role` | Required `admin` or `student` |

### `sessions`

| Field | Rule |
|---|---|
| `id` | Auto-generated primary key |
| `token` | Required JWT string |
| `email` | Required user email |
| `expirationDate` | Required date, 24 hours after creation |
| `userId` | Required foreign key to `users.id` |

## Associations

One user has many sessions. Each session belongs to one user through `userId`.
