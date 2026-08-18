# SaaS Manager (Next.js)

Platform operator console for **Office SaaS / Saas HRM**. Talks to the Django **public** API only (`/api/auth/*`, `/api/platform/*`).

Tenant HR UI is out of scope for this app (next sprint).

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4
- TanStack Query
- JWT stored in `localStorage` (demo-friendly; tighten for production)

## Setup

```bash
cd frontend
cp .env.local.example .env.local
# set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Backend must be running on the API URL. CORS is open in local Django settings.

## Login

Use a platform `SUPER_ADMIN` account (e.g. bootstrap `admin@gmail.com` / `admin` on Render).

## Pages

| Route | Purpose |
|-------|---------|
| `/login` | Platform login |
| `/` | Dashboard metrics + recent audit |
| `/tenants` | List tenants |
| `/tenants/new` | Provision tenant |
| `/tenants/[id]` | Detail, suspend / activate / reset password |
| `/plans` | List + create plans |
| `/subscriptions` | Subscription list |
| `/audit` | Audit events |
| `/announcements` | List + create announcements |

## Env

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` or `https://office-saas-api.onrender.com` |
