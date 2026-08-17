# config

Django project package: settings, URL routing, WSGI/ASGI.

## Settings

| Module | Use |
|--------|-----|
| `settings.base` | Shared apps, middleware, JWT, DB via `DATABASE_URL` |
| `settings.local` | Local Postgres overrides (`manage.py` default) |
| `settings.production` | Render/PaaS: WhiteNoise, strict hosts, SSL proxy |

## URL confs

| Module | When |
|--------|------|
| `urls_public` | Public schema / platform host |
| `urls` | Tenant schema / tenant host |

Selected by `TenantMainMiddleware` from the HTTP `Host` header.

## Entrypoints

- `wsgi.py` / `asgi.py` → default `config.settings.production`
- `manage.py` → default `config.settings.local`

Override with `DJANGO_SETTINGS_MODULE` in the environment.
