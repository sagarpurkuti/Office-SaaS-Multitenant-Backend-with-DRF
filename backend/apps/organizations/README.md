# organizations

Tenant company profile and org structure (branches, departments, holidays, settings).

## Schema

**Tenant** (`TENANT_APPS`)

## Main models

Organization · Branch · Department · Designation · FiscalYear · Holiday · CompanySetting

Defaults (Nepal-oriented): timezone `Asia/Kathmandu`, currency `NPR` — also seeded on tenant provision.

## API (`/api/` — tenant host)

| Prefix | Resource |
|--------|----------|
| `organization/` | Company profile |
| `branches/` | Branches |
| `departments/` | Departments |
| `designations/` | Job titles |
| `fiscal-years/` | Fiscal years |
| `holidays/` | Holidays |
| `settings/` | Company settings |

## Notes

Other tenant apps (employees, leave, payroll, …) typically FK to `Organization` / `Branch`.
