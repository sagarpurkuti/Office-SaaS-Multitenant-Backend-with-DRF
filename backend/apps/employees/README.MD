# employees

Employee master data and nested profile/documents for a tenant.

## Schema

**Tenant** (`TENANT_APPS`)

## Main models

Employee · EmployeeProfile · Address · Education · Experience · Document · EmergencyContact

## API (`/api/` — tenant host)

| Prefix | Resource |
|--------|----------|
| `employees/` | CRUD + nested profile payloads |

## Example create

```http
POST /api/employees/
```

```json
{
  "employee_id": "EMP001",
  "organization": 1,
  "joining_date": "2025-01-01",
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "gender": "MALE",
    "dob": "1990-01-01"
  }
}
```

## Notes

Requires tenant host + JWT for a user belonging to that tenant. Explore full schema in Swagger on a tenant domain.
