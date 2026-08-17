# leave

Leave types, employee requests, and approvals.

## Schema

**Tenant** (`TENANT_APPS`)

## Main models

LeaveType · LeaveRequest · LeaveApproval

## API (`/api/` — tenant host)

| Prefix | Resource |
|--------|----------|
| `leave-types/` | Catalog (annual, sick, …) |
| `leave-requests/` | Employee requests |
| `leave-approvals/` | Approval workflow |

## Services

`services/leave_service.py` — request/approval helpers.

## Notes

Default leave types are seeded when a tenant is provisioned (annual, casual, sick, public holiday).
