"""
Ensure a default STARTER plan exists (needed before Swagger tenant provisioning).
"""
from django.core.management.base import BaseCommand
from django.db import connection

from apps.saas_manager.models import TenantPlan


class Command(BaseCommand):
    help = 'Create default STARTER TenantPlan if missing'

    def handle(self, *args, **options):
        connection.set_schema_to_public()
        plan, created = TenantPlan.objects.get_or_create(
            code='STARTER',
            defaults={
                'name': 'Starter',
                'monthly_price': 0,
                'yearly_price': 0,
                'max_users': 50,
                'max_storage_mb': 500,
                'max_api_calls': 100000,
                'features': {'attendance': True, 'payroll': True, 'leave': True},
                'is_active': True,
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created plan STARTER id={plan.id}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Plan STARTER already exists id={plan.id}'))
