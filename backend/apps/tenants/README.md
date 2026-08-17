# tenants

Defines **who** a tenant is and **which hostname** maps to it (`django-tenants`).

## Schema

**Public** (`SHARED_APPS`)

## Models

| Model | Role |
|-------|------|
| `Client` | One row per customer; `schema_name` = PostgreSQL schema |
| `Domain` | Hostname → `Client` (`is_primary` for the main domain) |

`Client.auto_create_schema = True` — saving a client creates/syncs its schema.

## Notes

- Prefer provisioning via `saas_manager` (`POST /api/platform/tenants/`) rather than creating `Client` alone in production flows.
- Local example domain: `demo.localhost`.

See [ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) for host routing.
