# saas_manager

Platform **control plane**: plans, tenant provisioning, subscriptions, audit, announcements.

## Schema

**Public** (`SHARED_APPS`)

## API (`/api/platform/` — public host only)

| Resource | Path | Notes |
|----------|------|--------|
| Plans | `/plans/` | Quotas + feature JSON |
| Subscriptions | `/subscriptions/` | Trial / active / suspended |
| Tenants | `/tenants/` | **POST = full provision** (schema + seed + owner user) |
| Tenants alias | `/tenants/create_tenant/` | Same as POST `/tenants/` |
| Actions | `/tenants/{id}/suspend\|activate\|reset_password/` | Lifecycle |
| Audit | `/audit-events/` | Operator actions |
| Announcements | `/announcements/` | System messages |
| Dashboard | `/dashboard/` | High-level metrics |

## Provisioning flow

1. Ensure an active plan exists (`ensure_starter_plan` on deploy, or POST `/plans/`).
2. `POST /tenants/` with `name`, `schema_name`, `domain`, `plan_id`.
3. Response includes `support_email` + `support_password` (once).

Implementation: `services/tenant_provisioning_service.py`.

## Management commands

| Command | Purpose |
|---------|---------|
| `ensure_starter_plan` | Idempotent STARTER plan for demos |

## Permissions

Mostly `SUPER_ADMIN`. Tenant list/provision also allows platform support role where configured.
