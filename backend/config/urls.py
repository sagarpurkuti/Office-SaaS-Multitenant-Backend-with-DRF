from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from apps.tenants.views import tenant_info

TENANT_SPECTACULAR_SETTINGS = {
    'TITLE': 'Office SaaS Tenant API',
    'DESCRIPTION': (
        '## Tenant-scoped API\n\n'
        'Operate data inside a single tenant schema (organization, HR, attendance, leave, payroll).\n\n'
        '### Host\n'
        'Call these endpoints on a **tenant domain** (for example `http://demo.localhost:8000`).\n\n'
        '### Authentication\n'
        'Send access tokens as `Authorization: Bearer <token>`. '
        'Users must belong to the tenant resolved from the request host.'
    ),
    'VERSION': '1.0.0',
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': r'/api',
    'TAGS': [
        {'name': 'Authentication', 'description': 'JWT sessions and account security for tenant users.'},
        {'name': 'Organizations', 'description': 'Organization profile management.'},
        {'name': 'Branches', 'description': 'Organization branch management.'},
        {'name': 'Departments', 'description': 'Department management.'},
        {'name': 'Designations', 'description': 'Job designation management.'},
        {'name': 'Fiscal years', 'description': 'Fiscal year management.'},
        {'name': 'Holidays', 'description': 'Organization and branch holiday management.'},
        {'name': 'Company settings', 'description': 'Tenant company preferences.'},
    ],
}

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tenant-info/', tenant_info),
    path(
        'api/schema/',
        SpectacularAPIView.as_view(
            custom_settings=TENANT_SPECTACULAR_SETTINGS,
            urlconf='config.urls',
        ),
        name='api-schema',
    ),
    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(url_name='api-schema'),
        name='swagger-ui',
    ),
    path(
        'api/redoc/',
        SpectacularRedocView.as_view(url_name='api-schema'),
        name='redoc',
    ),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.organizations.urls')),
    path('api/', include('apps.employees.urls')),
    path('api/', include('apps.members.urls')),
    path('api/', include('apps.attendance.urls')),
    path('api/', include('apps.leave.urls')),
    path('api/', include('apps.payroll.urls')),
]
