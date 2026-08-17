"""
Idempotent platform superuser bootstrap for deploys without Shell (e.g. Render free).

Reads:
  DJANGO_SUPERUSER_EMAIL (required to run)
  DJANGO_SUPERUSER_PASSWORD (required when creating)
  DJANGO_SUPERUSER_FIRST_NAME (default: Admin)
  DJANGO_SUPERUSER_LAST_NAME (default: Admin)
"""
from django.core.management.base import BaseCommand
from django.db import connection
from django_tenants.utils import get_public_schema_name

from apps.accounts.models import User


class Command(BaseCommand):
    help = 'Create platform SUPER_ADMIN if DJANGO_SUPERUSER_EMAIL is set and user is missing'

    def handle(self, *args, **options):
        import os

        email = (os.environ.get('DJANGO_SUPERUSER_EMAIL') or '').strip()
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD') or ''
        first_name = (os.environ.get('DJANGO_SUPERUSER_FIRST_NAME') or 'Admin').strip()
        last_name = (os.environ.get('DJANGO_SUPERUSER_LAST_NAME') or 'Admin').strip()

        if not email:
            self.stdout.write('DJANGO_SUPERUSER_EMAIL not set; skipping platform superuser bootstrap.')
            return

        # Ensure we run against the public schema (platform users live here)
        connection.set_schema_to_public()
        public = get_public_schema_name()
        self.stdout.write(f'Ensuring platform superuser on schema={public} email={email}')

        user = User.objects.filter(email__iexact=email).first()
        if user:
            self.stdout.write(self.style.SUCCESS(f'Platform superuser already exists: {email}'))
            return

        if not password:
            self.stderr.write(
                self.style.ERROR(
                    'DJANGO_SUPERUSER_PASSWORD is required to create the platform superuser.'
                )
            )
            return

        User.objects.create_superuser(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=User.Role.SUPER_ADMIN,
            tenant=None,
        )
        self.stdout.write(self.style.SUCCESS(f'Created platform superuser: {email}'))
