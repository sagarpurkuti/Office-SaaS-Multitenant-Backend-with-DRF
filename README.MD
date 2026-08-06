# makemigrations and migrate
python manage.py makemigrations tenants
python manage.py makemigrations common
python manage.py makemigrations accounts
python manage.py makemigrations organization
python manage.py makemigrations employees members
python manage.py makemigrations attendance leave
python manage.py makemigrations payroll


python manage.py migrate_schemas --shared
python manage.py migrate_schemas


# Create a superuser in public schema
python manage.py create_tenant_superuser --email admin@example.com --password admin --first_name admin --last_name admin

# python shell command
python manage.py shell

from apps.accounts.models import User
User.objects.create_superuser(email='admin@gmail.com', password='admin', first_name='admin', last_name='admin')

# Create a Tenant(Client) and domain

from apps.tenants.models import Client, Domain

# Create a tenant
tenant = Client(
    schema_name='demo',           # schema name in DB
    name='Demo Tenant',
    paid_until=None,
    on_trial=True,
)
tenant.save()  # this creates the schema and runs migrations for TENANT_APPS

# Create a domain for this tenant (subdomain)
domain = Domain(
    domain='demo.localhost',
    tenant=tenant,
    is_primary=True,
)
domain.save()

# Create Tenant Users(Optional)

from apps.tenants.models import Client
from apps.accounts.models import User

tenant = Client.objects.get(schema_name='demo')
user = User.objects.create_user(
    email='owner@demo.com',
    password='owner123',
    first_name='Demo',
    last_name='Owner',
    role=User.Role.OWNER,
    tenant=tenant
)