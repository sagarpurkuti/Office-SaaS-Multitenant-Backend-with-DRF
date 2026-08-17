# Backend

Django multi-tenant API for **Office SaaS / Saas HRM**.

## Quick orientation

| Host | Settings / URLconf | Purpose |
|------|--------------------|---------|
| Public (e.g. `localhost:8000`) | `config.urls_public` | Platform admin: plans, tenants, audit |
| Tenant (e.g. `demo.localhost:8000`) | `config.urls` | Org, HR, attendance, leave, payroll |

Swagger: `/api/docs/` on either host (schema differs by host).

## Layout

```
backend/
├── config/          # Django project (settings, urls, wsgi)
├── apps/            # Domain apps (see READMEs below)
├── manage.py        # Defaults to config.settings.local
├── requirements/    # Pip dependencies
├── build.sh         # Render: install + collectstatic
└── start.sh         # Render: migrate + bootstrap + gunicorn
```

## Apps

| App | Schema | README |
|-----|--------|--------|
| [tenants](apps/tenants/README.md) | public | `Client` / `Domain` |
| [accounts](apps/accounts/README.md) | public | Users + JWT |
| [saas_manager](apps/saas_manager/README.md) | public | Platform control plane |
| [common](apps/common/README.md) | tenant | Shared utilities (stub) |
| [organizations](apps/organizations/README.md) | tenant | Company structure |
| [employees](apps/employees/README.md) | tenant | Employee records |
| [members](apps/members/README.md) | tenant | Cooperative members |
| [attendance](apps/attendance/README.md) | tenant | Shifts & attendance |
| [leave](apps/leave/README.md) | tenant | Leave types & requests |
| [payroll](apps/payroll/README.md) | tenant | Salary & payroll runs |

## Deeper docs

- [Architecture & flows](../docs/ARCHITECTURE.md)
- [Render deploy](../docs/RENDER_DEPLOY.md)
- [Root README](../README.MD)
