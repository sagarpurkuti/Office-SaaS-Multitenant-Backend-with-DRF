# Frontend architecture

Two products share this Next.js app. **Hostname** selects the portal:

| Portal | Local host | Public path |
|--------|------------|-------------|
| SaaS Manager | `localhost:3000` | `/login`, `/` |
| Tenant workspace | `demo.localhost:3000` | `/login`, `/` |

Internal tenant pages still live under `app/(tenant)/app/*`. Middleware rewrites tenant-host `/login` → `/app/login`.

Do not mix the two sessions or API clients.

## Layout

```
frontend/src/
  app/
    (platform)/          SaaS Manager pages
    (tenant)/app/        Tenant pages
    api/tenant/          Tenant BFF
    login/               Platform login
    middleware.ts        Guards /app
  modules/tenant/        Tenant feature module
  shared/                Cross-portal helpers
  lib/                   Legacy SaaS Manager API client
```

## Tenant request path

```
Browser  →  Next /api/tenant/proxy/api/workspace/
         →  Django GET /api/workspace/  +  X-Tenant-Host: demo.localhost
         →  TenantMainMiddleware sets search_path
         →  JSON dashboard snapshot
```

`apps.tenants.middleware.TenantHostHeaderMiddleware` copies `X-Tenant-Host` onto `HTTP_HOST` because Node `fetch()` overwrites the `Host` header.

## Adding a tenant feature later

1. Put API + UI in `modules/tenant/<feature>/`
2. Add a thin route under `app/(tenant)/app/(workspace)/`
3. Call Django only through `tenantBff.django(...)` so Host + cookies stay correct
4. Gate UI with `user.role` (`OWNER` / `HR` / …)
