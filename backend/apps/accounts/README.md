# accounts

Authentication and the shared **User** model (email login + JWT).

## Schema

**Public** (`SHARED_APPS`) — all users live in `public`, with optional `tenant` FK.

## Roles

`SUPER_ADMIN` · `OWNER` · `HR` · `MANAGER` · `ACCOUNTANT` · `EMPLOYEE`

Platform operators: `SUPER_ADMIN` with `tenant=null`.  
Tenant users: must have `tenant` set and match the request host.

## API (`/api/auth/`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `login/` | Access + refresh + user profile |
| POST | `refresh/` | New access token |
| POST | `logout/` | Blacklist refresh token |
| GET | `me/` | Current user |
| POST | `change-password/` | Change password |

Mounted on **both** public and tenant URL confs.

## Management commands

| Command | Purpose |
|---------|---------|
| `ensure_platform_superuser` | Create/sync platform admin from `DJANGO_SUPERUSER_*` env (Render) |

## Notes

- JWT: 15m access, 7d refresh, rotation + blacklist.
- Login checks tenant membership when `request.tenant` is present.
