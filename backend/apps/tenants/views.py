from django.http import HttpResponse
from django_tenants.utils import get_tenant

def tenant_info(request):
    tenant = get_tenant(request)
    return HttpResponse(f"Current tenant: {tenant.schema_name} - {tenant.name}")