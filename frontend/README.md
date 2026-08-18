# SaaS Manager + Tenant workspace (Next.js)

Hostname chooses the portal. Users never type a tenant URL.

| Portal | Local URL |
|--------|-----------|
| SaaS Manager | http://localhost:3000/login |
| Tenant A | http://demo.localhost:3000/login |
| Tenant B | http://demo2.localhost:3000/login |

Django stays on port **8000**. Next.js (this UI) is port **3000**.  
`Domain.domain` must match the hostname without a port: `demo.localhost`.

## Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

On Windows, `*.localhost` usually resolves to `127.0.0.1` already.

## Env

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Django origin for SaaS Manager |
| `DJANGO_API_BASE_URL` | Django origin for the tenant BFF |
| `NEXT_PUBLIC_PLATFORM_ORIGIN` | Link back to SaaS Manager |
| `NEXT_PUBLIC_PLATFORM_HOSTS` | Hostnames treated as platform (not tenants) |

Docs: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/TENANT.md](docs/TENANT.md)
