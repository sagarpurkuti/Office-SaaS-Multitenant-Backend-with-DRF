from django.db import transaction, connection
from django.core.management import call_command
from django_tenants.utils import tenant_context
from apps.tenants.models import Client, Domain
from apps.accounts.models import User
from apps.organizations.models import Organization, Branch, Department, Designation, FiscalYear, CompanySetting
from apps.leave.models import LeaveType
from apps.attendance.models import Shift, WeekendPolicy
from .password_service import PasswordService
from .audit_service import AuditService
from .email_service import EmailService

class TenantProvisioningService:
    @staticmethod
    def create_tenant(tenant_data, domain_data, plan, created_by):
        """
        tenant_data: dict with name, schema_name, etc. (for Client)
        domain_data: dict with domain, is_primary (for Domain)
        plan: TenantPlan instance
        created_by: User instance (platform admin)
        """
        # 1. Create Tenant (Client)
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
            is_primary=domain_data.get('is_primary', True)
        )

        # 3. Create subscription
        from ..models import TenantSubscription
        subscription = TenantSubscription.objects.create(
            tenant=client,
            plan=plan,
            start_date=tenant_data.get('start_date', timezone.now().date()),
            status=TenantSubscription.Status.TRIAL,
        )

        # 4. Run tenant migrations (create schema and apply all tenant apps)
        # We'll use the management command
        call_command('migrate_schemas', schema_name=client.schema_name)

        # 5. Seed default data for the tenant
        TenantProvisioningService._seed_tenant_data(client, created_by)

        # 6. Create super admin user (support)
        username = 'support'
        password = PasswordService.generate_strong_password()
        with tenant_context(client):
            user = User.objects.create_superuser(
                email='support@example.com',  # placeholder, will be updated later
                password=password,
                first_name='Support',
                last_name='Admin',
                tenant=client,
            )
            # Assign role: OWNER
            user.role = User.Role.OWNER
            user.save()

        # 7. Send welcome email
        # We'll need the email address; we can store it in tenant data or use a default.
        # We'll send to a default email for now.
        EmailService.send_welcome_email(client, domain, username, password)

        # 8. Audit log
        AuditService.log_action(created_by, AuditEvent.Action.CREATE_TENANT, target=client.name)

        return client

    @staticmethod
    def _seed_tenant_data(tenant, created_by):
        """Seed default roles, departments, leave types, shifts, etc."""
        with tenant_context(tenant):
            # 1. Organization (will be created later; we assume we have an Organization model)
            # For now, we'll create a default organization using the tenant name
            org = Organization.objects.create(
                name=tenant.name,
                short_name=tenant.name[:10],
                phone='',
                email='',
                timezone='Asia/Kathmandu',
                currency='NPR',
            )

            # 2. Branches - default head office
            branch = Branch.objects.create(
                organization=org,
                name='Head Office',
                code='HO',
                is_head_office=True,
                is_active=True,
            )

            # 3. Departments
            dept_names = ['Human Resources', 'Finance', 'IT', 'Administration', 'Operations']
            for idx, name in enumerate(dept_names):
                Department.objects.create(
                    organization=org,
                    name=name,
                    code=name[:3].upper(),
                    is_active=True,
                )

            # 4. Designations (optional)
            # 5. Leave Types
            leave_types = [
                {'name': 'Annual Leave', 'days_per_year': 15, 'requires_approval': True},
                {'name': 'Casual Leave', 'days_per_year': 5, 'requires_approval': True},
                {'name': 'Sick Leave', 'days_per_year': 7, 'requires_approval': True},
                {'name': 'Public Holiday', 'days_per_year': 0, 'requires_approval': False},
            ]
            for lt in leave_types:
                LeaveType.objects.create(organization=org, **lt)

            # 6. Shift
            shift = Shift.objects.create(
                organization=org,
                name='Default Shift',
                start_time='09:00:00',
                end_time='17:00:00',
                grace_minutes=10,
                minimum_work_hours=8,
            )

            # 7. Weekend policy (Saturday off)
            WeekendPolicy.objects.create(
                organization=org,
                branch=branch,
                weekday=5,  # Saturday
                is_weekend=True,
            )

            # 8. Fiscal Year (default current)
            # We'll skip for simplicity; can be added later.

            # 9. Company Settings
            CompanySetting.objects.create(
                organization=org,
                timezone='Asia/Kathmandu',
                currency='NPR',
                language='en',
                attendance_method='manual',
                default_leave_days=0,
            )

            # 10. Create default roles? Already handled by User model roles.

            # 11. Create default permissions? Not needed yet.