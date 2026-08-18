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
