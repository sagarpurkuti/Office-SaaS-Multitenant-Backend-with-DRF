# Frontend architecture

Two products share this Next.js app. **Hostname** selects the portal:

| Portal | Local host | Public path |
|--------|------------|-------------|
| SaaS Manager | `localhost:3000` | `/login`, `/` |
| Tenant workspace | `demo.localhost:3000` | `/login`, `/` |

Internal tenant pages still live under `app/(tenant)/app/*`. Middleware rewrites tenant-host `/login` → `/app/login` and `/employees` → `/app/employees`.

Do not mix the two sessions or API clients.

## Layout

```
frontend/src/
  app/
    (platform)/          SaaS Manager pages
    (tenant)/app/        Tenant pages (thin routes only)
    api/tenant/          Tenant BFF
    login/               Platform login
    middleware.ts        Host routing + tenant session guard
  modules/tenant/        Tenant feature modules
    rbac/                Permissions, scopes, grants, guards
    navigation/          Nav registry (permission-driven)
    dashboard/           Widget registry + widgets
    employees/ attendance/ leave/ payroll/
    organization/ reports/ profile/ settings/
    api/                 Typed BFF clients + query keys
    lib/                 Formatting, status tones, host helpers
    server/              Cookies + Django fetch (server only)
  shared/                Cross-portal helpers
  components/ui/         Primitives (button, card, input, select, table…)
  lib/                   Legacy SaaS Manager API client
```

Each feature module owns its API client, hooks and page component. Routes under
`app/(tenant)/app/(workspace)/` are thin: they set metadata and render the
module's page.

## Tenant request path

```
Browser  →  Next /api/tenant/proxy/api/employees/
         →  Django GET /api/employees/  +  X-Tenant-Host: demo.localhost
         →  TenantMainMiddleware sets search_path
         →  JSON
```

`apps.tenants.middleware.TenantHostHeaderMiddleware` copies `X-Tenant-Host` onto `HTTP_HOST` because Node `fetch()` overwrites the `Host` header.

Access and refresh tokens stay in httpOnly cookies; the browser never holds a
tenant JWT. `api/client.ts` retries once through `/api/tenant/auth/refresh/` on
a 401.

## Authorization

Permission + scope, described in [RBAC.md](./RBAC.md). Components never branch
on `user.role`; they ask `can("leave.approve")` or render inside `<Can>`.

## Adding a tenant feature

1. Add the permission to `rbac/permissions.ts` and to the role presets
2. Put API + UI in `modules/tenant/<feature>/`
3. Add a thin route under `app/(tenant)/app/(workspace)/`
4. Register navigation in `navigation/nav.ts`, and a dashboard widget if useful
5. Call Django only through `tenantBff.django(...)` so Host + cookies stay correct
6. Gate the UI with `can(...)` — and enforce the same rule in the API
