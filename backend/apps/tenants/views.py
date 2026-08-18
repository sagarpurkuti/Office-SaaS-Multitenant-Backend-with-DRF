from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django_tenants.utils import get_tenant


@api_view(['GET'])
@permission_classes([AllowAny])
def tenant_info(request):
    """Return the tenant resolved from the request Host header."""
    tenant = get_tenant(request)
    return Response({
        'id': getattr(tenant, 'id', None),
        'schema_name': tenant.schema_name,
        'name': getattr(tenant, 'name', tenant.schema_name),
        'on_trial': getattr(tenant, 'on_trial', None),
        'paid_until': getattr(tenant, 'paid_until', None),
        'created_on': getattr(tenant, 'created_on', None),
    })
