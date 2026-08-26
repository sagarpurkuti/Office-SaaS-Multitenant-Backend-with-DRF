# Tenant workspace

The tenant is taken from the **browser hostname**, the same way django-tenants uses `Host`.

## Local

| Who | Open |
|-----|------|
| Platform | http://localhost:3000/login |
| Tenant `demo` | http://demo.localhost:3000/login |
| Tenant `demo2` | http://demo2.localhost:3000/login |

Login is only email + password. Next.js sends `X-Tenant-Host: demo.localhost` to Django.

`tenants.Domain.domain` must be `demo.localhost` (not `http://…` and not `:8000`).

## Auth

- Cookies are host-only (`demo.localhost` ≠ `localhost`)
- Platform `SUPER_ADMIN` is rejected on tenant hosts

## Screens

| Path | Requires | Shows |
|------|----------|-------|
| `/` | — | Dashboard, assembled from the widgets your role can see |
| `/profile` | `profile.view` | Account, employment record, effective access |
| `/employees` | `employee.view` | Directory, narrowed to your scope; add employee with `employee.create` |
| `/organization` | `organization.view`, `branch.view` or `department.view` | Profile, branches, departments, designations |
| `/attendance` | `attendance.view` | Check in/out plus records in scope |
| `/leave` | `leave.view` or `leave.apply` | Apply, own history, approvals queue |
| `/payroll` | `payroll.view`, `salary.view` or `salary_statement.view` | Runs, totals, payslips |
| `/reports` | `reports.view` | Report catalogue and payroll export |
| `/settings/roles` | `role.view` | Permission matrix per role |

What each role sees is decided by permissions, not by the route. See
[RBAC.md](./RBAC.md).

## Employee link

Self-service (check-in, applying for leave, own payslips) needs
`accounts.User.employee` to exist. `/api/auth/me/` does not return it, so the
workspace matches the record out of `/api/employees/`
(`employees/use-employees.ts`). Users without a linked employee record get an
explicit message rather than a silent empty state.

`GET /api/attendance/today/` returns 404 and leave creation returns 400 when the
link is missing, rather than raising `RelatedObjectDoesNotExist`.

## Adding an employee

`POST /api/employees/` (owners and HR) takes the employment fields plus a nested
`profile`, and resolves `organization` from the tenant schema. The login is
handled in the same call, three ways:

| Payload | Result |
|---------|--------|
| `account: { email, password, role }` | A new tenant user is created and linked |
| `user: "<id>"` | An existing tenant login is linked |
| neither | Record without a login; self-service stays unavailable |

`GET /api/employees/linkable-users/` lists active tenant logins that are not
attached to an employee yet — that is how an owner links their own account.

## Known backend gaps

The workspace already models permissions and scopes; Django does not yet.

- No permission endpoint — the workspace falls back to role presets
- Only `/api/employees/` scopes its queryset by role; attendance, leave and
  payroll lists are still narrowed client-side
- Several tenant endpoints (shifts, leave types, payroll CRUD, `payroll/generate`)
  are open to any authenticated tenant user
