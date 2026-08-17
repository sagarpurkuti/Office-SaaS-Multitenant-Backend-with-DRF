from datetime import time

from django.core.management import call_command
from django.utils import timezone
from django_tenants.utils import tenant_context

from apps.tenants.models import Client, Domain
from apps.accounts.models import User
from apps.organizations.models import Organization, Branch, Department, CompanySetting
from apps.leave.models import LeaveType
from apps.attendance.models import Shift, WeekendPolicy
from ..models import AuditEvent, TenantSubscription
from .password_service import PasswordService
from .audit_service import AuditService
from .email_service import EmailService


class TenantProvisioningService:
    @staticmethod
    def create_tenant(tenant_data, domain_data, plan, created_by, company_email='', company_phone=''):
        """
        Provision Client + Domain + subscription + schema seed + support user.

        Returns (client, support_email, support_password).
        """
        # 1. Create Tenant (Client) — auto_create_schema creates the PG schema
        client = Client.objects.create(
            name=tenant_data['name'],
            schema_name=tenant_data['schema_name'],
            paid_until=tenant_data.get('paid_until'),
            on_trial=True,
        )

        # 2. Create Domain
        domain = Domain.objects.create(
            domain=domain_data['domain'],
            tenant=client,
            is_primary=domain_data.get('is_primary', True),
        )

        # 3. Create subscription
        TenantSubscription.objects.create(
            tenant=client,
            plan=plan,
            start_date=tenant_data.get('start_date', timezone.now().date()),
            status=TenantSubscription.Status.TRIAL,
        )

        # 4. Ensure tenant apps are migrated (safe if auto_create_schema already synced)
        call_command('migrate_schemas', schema_name=client.schema_name, verbosity=0)

        # 5. Seed default data for the tenant
        TenantProvisioningService._seed_tenant_data(
            client,
            company_email=company_email or '',
            company_phone=company_phone or '',
        )

        # 6. Support/owner user lives in the public (shared) schema
        support_email = company_email or f"support@{client.schema_name}.local"
        support_password = PasswordService.generate_strong_password()
        if User.objects.filter(email__iexact=support_email).exists():
            support_email = f"support+{client.schema_name}@example.com"

        user = User.objects.create_user(
            email=support_email,
            password=support_password,
            first_name='Support',
            last_name='Admin',
            role=User.Role.OWNER,
            tenant=client,
            is_staff=True,
            is_active=True,
        )

        # 7. Welcome email (console stub when SMTP unset)
        EmailService.send_welcome_email(client, domain, support_email, support_password)

        # 8. Audit log
        AuditService.log_action(created_by, AuditEvent.Action.CREATE_TENANT, target=client.name)

        return client, support_email, support_password

    @staticmethod
    def _seed_tenant_data(tenant, company_email='', company_phone=''):
        """Seed default org structure inside the tenant schema."""
        with tenant_context(tenant):
            org = Organization.objects.create(
                name=tenant.name,
                short_name=(tenant.schema_name[:50] or tenant.name[:50]),
                phone=company_phone or '0000000000',
                email=company_email or None,
                timezone='Asia/Kathmandu',
                currency='NPR',
            )

            branch = Branch.objects.create(
                organization=org,
                name='Head Office',
                code='HO',
                is_head_office=True,
                is_active=True,
            )

            departments = [
                ('Human Resources', 'HR'),
                ('Finance', 'FIN'),
                ('IT', 'IT'),
                ('Administration', 'ADM'),
                ('Operations', 'OPS'),
            ]
            for name, code in departments:
                Department.objects.create(
                    organization=org,
                    name=name,
                    code=code,
                    is_active=True,
                )

            leave_types = [
                {'name': 'Annual Leave', 'days_per_year': 15, 'requires_approval': True},
                {'name': 'Casual Leave', 'days_per_year': 5, 'requires_approval': True},
                {'name': 'Sick Leave', 'days_per_year': 7, 'requires_approval': True},
                {'name': 'Public Holiday', 'days_per_year': 0, 'requires_approval': False},
            ]
            for lt in leave_types:
                LeaveType.objects.create(organization=org, **lt)

            Shift.objects.create(
                organization=org,
                name='Default Shift',
                start_time=time(9, 0),
                end_time=time(17, 0),
                grace_minutes=10,
                minimum_work_hours=8,
            )

            WeekendPolicy.objects.create(
                organization=org,
                branch=branch,
                weekday=WeekendPolicy.Weekday.SATURDAY,
                is_weekend=True,
            )

            CompanySetting.objects.create(
                organization=org,
                timezone='Asia/Kathmandu',
                currency='NPR',
                language='en',
                attendance_method='manual',
                default_leave_days=0,
            )
