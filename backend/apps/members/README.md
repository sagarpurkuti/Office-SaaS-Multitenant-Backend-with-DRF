# members

Cooperative **member** records (distinct from employees), including KYC and nominees.

## Schema

**Tenant** (`TENANT_APPS`)

## Main models

Member · MemberKYC · Nominee · MemberDocument

## API (`/api/` — tenant host)

| Prefix | Resource |
|--------|----------|
| `members/` | Member CRUD |

## Example create

```http
POST /api/members/
```

```json
{
  "member_no": "M001",
  "organization": 1,
  "joined_date": "2025-01-01",
  "first_name": "Jane",
  "last_name": "Smith",
  "gender": "FEMALE",
  "dob": "1992-05-10",
  "phone": "9876543210"
}
```

## Notes

Use tenant Swagger for nested KYC/document endpoints exposed on the viewset.
