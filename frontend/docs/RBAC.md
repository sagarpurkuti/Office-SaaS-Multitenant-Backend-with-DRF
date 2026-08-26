# Tenant RBAC

Authorization in the tenant workspace is **permission + scope**, never a role
check scattered through components.

```
User → Role → Permission → Scope → Allowed action
```

| Layer | Question | Where |
|-------|----------|-------|
| Authentication | Who is this? | `auth/tenant-auth-provider.tsx` |
| Authorization | What may they do? | `rbac/permissions.ts`, `rbac/grants.ts` |
| Data scope | Which records? | `rbac/scopes.ts`, `employees/scope.ts` |

## Permissions

A permission is `<resource>.<action>`, declared once in
`rbac/permissions.ts`. `PermissionKey` is derived from that catalogue, so a typo
is a type error and the roles screen renders straight from it.

## Scopes

Scopes are ordered; a wider grant satisfies a narrower requirement.

```
own < team < department < branch < organization
```

`employee.view` at `team` and at `organization` is the same capability over
different rows — which is exactly the manager/HR distinction.

```ts
can("employee.view")                 // any employees at all
can("employee.view", "organization") // the whole company
scopeOf("leave.approve")             // "team" | "organization" | null
```

## Roles

| Stored value | Product name |
|--------------|--------------|
| `OWNER` | CEO / Organization admin |
| `HR` | HR |
| `MANAGER` | Manager |
| `ACCOUNTANT` | Accounts / Finance |
| `EMPLOYEE` | Employee |
| `INTERN` | Intern / Trainee — defined in the workspace, not yet a Django choice |

Defaults live in `rbac/role-presets.ts` and are authored with wildcards:

```ts
const ACCOUNTANT_SPEC = { "payroll.*": "organization", "salary.*": "organization" };
```

## Resolution order

`rbac/resolve.ts` builds the grant map:

1. `user.permissions` from the API, when present — authoritative, and reflects
   any custom role a tenant admin configured.
2. Otherwise the role preset.

`source` is exposed so the roles screen states which one is in effect.

## Using it

```tsx
const { can, scopeOf } = useRbac();

<Can permission="payroll.process">
  <Button>Generate payroll</Button>
</Can>

<RequirePermission permission="employee.view">
  <EmployeeDirectory />
</RequirePermission>
```

Navigation and dashboard widgets are registries, not conditionals:

- `navigation/nav.ts` — one entry per destination, filtered by `anyOf` + `scope`
- `dashboard/widget-registry.ts` — one entry per widget, same filtering

Adding a feature is: permission in the catalogue → preset entry → nav entry →
route.

## Scoped data

The workspace narrows lists itself: `employees/scope.ts` resolves the visible
employee set, and `filterByEmployeeScope` applies it to attendance, leave and
payroll.

`/api/employees/` now scopes server-side too — owners, HR and finance read the
organization, a manager reads their own record plus direct reports, everyone
else reads only themselves. The client pass over that endpoint is redundant, and
deliberately kept: the other endpoints still return everything.

## This is not the security boundary

Everything here is presentation. Hidden buttons and filtered tables do not stop
a crafted request. Each endpoint must independently check authentication,
tenant, permission and scope, and audit sensitive writes. Django enforces tenant
isolation everywhere, and role + scope on `/api/employees/`; several tenant
endpoints (shifts, leave types, payroll CRUD, `payroll/generate`) are still open
to any authenticated tenant user, and closing that gap is backend work.
