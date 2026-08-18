# Office SaaS (Saas HRM)

Multi-tenant HR / cooperative platform: **Django + DRF API** (django-tenants) and a **Next.js SaaS Manager** console for platform operators. Tenant app UI comes in a later sprint.

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture, tenancy, flows, API map, diagrams |
| [docs/RENDER_DEPLOY.md](docs/RENDER_DEPLOY.md) | Render **free plan** test deploy + 1–2 tenants |
| [backend/README.md](backend/README.md) | Backend layout + links to each app README |
| [frontend/README.md](frontend/README.md) | **SaaS Manager** Next.js console (platform) |
| [render.yaml](render.yaml) | Render Blueprint (Python web + Postgres, no Docker) |

**App READMEs:** `backend/apps/*/README.md` and `backend/config/README.md` — short per-component notes for contributors.

### Frontend

SaaS Manager: http://localhost:3000/login  
Tenant workspace: http://demo.localhost:3000/login  (another tenant: http://demo2.localhost:3000/login)  

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

See [frontend/README.md](frontend/README.md) and [frontend/docs/TENANT.md](frontend/docs/TENANT.md).

**Deploy:** push to GitHub → Render **Blueprint** (or manual web service with Root Directory `backend`, build `./build.sh`, start `./start.sh`).

Platform admin is created automatically on start when `DJANGO_SUPERUSER_EMAIL` / `DJANGO_SUPERUSER_PASSWORD` are set (see `render.yaml` demo defaults: `admin@gmail.com` / `admin`).

## Local quick start (migrations & tenants)

```bash
# From backend/ with venv active and Postgres DB ready
python manage.py makemigrations tenants
python manage.py makemigrations common
python manage.py makemigrations accounts
python manage.py makemigrations organizations
python manage.py makemigrations employees members
python manage.py makemigrations attendance leave
python manage.py makemigrations payroll
python manage.py makemigrations saas_manager

python manage.py migrate_schemas --shared
python manage.py migrate_schemas
```

### Create a superuser (public schema)

```bash
python manage.py shell
```

```python
from apps.accounts.models import User
User.objects.create_superuser(
    email='admin@gmail.com',
    password='admin',
    first_name='admin',
    last_name='admin',
)
```

Optional (if available in your django-tenants setup):

```bash
python manage.py create_tenant_superuser --email admin@example.com --password admin --first_name admin --last_name admin
```

### Create a tenant + domain

```python
from apps.tenants.models import Client, Domain

tenant = Client(
    schema_name='demo',
    name='Demo Tenant',
    paid_until=None,
    on_trial=True,
)
tenant.save()  # creates schema when auto_create_schema=True

domain = Domain(
    domain='demo.localhost',
    tenant=tenant,
    is_primary=True,
)
domain.save()
```

### Create a tenant user

```python
from apps.tenants.models import Client
from apps.accounts.models import User

tenant = Client.objects.get(schema_name='demo')
user = User.objects.create_user(
    email='owner@demo.com',
    password='owner123',
    first_name='Demo',
    last_name='Owner',
    role=User.Role.OWNER,
    tenant=tenant,
)
```

### Hosts

| URL | Role |
|-----|------|
| `http://localhost:8000/api/docs/` | Platform API |
| `http://demo.localhost:8000/api/docs/` | Tenant API |

Docker Compose (Postgres + runserver): `docker compose up` from the repo root.
