#!/usr/bin/env bash
# Render start command (Root Directory = backend)
set -o errexit

python manage.py migrate_schemas --shared
python manage.py migrate_schemas

# Idempotent platform admin for free tier (no Shell). Controlled by env vars.
python manage.py ensure_platform_superuser
python manage.py ensure_starter_plan

gunicorn config.wsgi:application --bind 0.0.0.0:"${PORT:-8000}" --workers 2 --timeout 120
