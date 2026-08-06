from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

PLATFORM_SPECTACULAR_SETTINGS = {
    'TITLE': 'Office SaaS Platform API',
    'DESCRIPTION': (
        '## Platform administration API\n\n'
        'Operate the public (non-tenant) control plane used by SaaS operators.\n\n'
        '### Host\n'
        'Call these endpoints on the **public** domain (for example `http://localhost:8000`).\n\n'
        '### Authentication\n'
        '1. `POST /api/auth/login/` with a platform admin or support account.\n'
        '2. Send `Authorization: Bearer <access_token>` on subsequent requests.\n'
        '3. Refresh with `POST /api/auth/refresh/` when the access token expires.\n\n'
        '### Authorization\n'
        '- **Platform admin** (`SUPER_ADMIN`): full access to plans, tenants, subscriptions, audits, and announcements.\n'
        '- **Platform support** (`SUPPORT`): limited tenant operations such as listing and password reset.\n\n'
        '### Tenant provisioning\n'
        'Creating a tenant provisions a PostgreSQL schema, primary domain, trial subscription, '
        'default organization records, and a support user inside the tenant schema.'
    ),
    'VERSION': '1.0.0',
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': r'/api',
    'TAGS': [
        {'name': 'Authentication', 'description': 'JWT login, logout, refresh, and account profile for platform operators.'},
        {'name': 'Platform dashboard', 'description': 'High-level platform health and activity metrics.'},
        {'name': 'Tenant plans', 'description': 'Commercial plans that define limits and feature flags.'},
        {'name': 'Tenant subscriptions', 'description': 'Lifecycle state of each tenant subscription.'},
        {'name': 'Tenants', 'description': 'Provision, inspect, suspend, activate, and support tenants.'},
        {'name': 'Audit events', 'description': 'Immutable platform audit trail for operator actions.'},
        {'name': 'System announcements', 'description': 'Global announcements shown to operators or tenants.'},
    ],
}

urlpatterns = [
    path('admin/', admin.site.urls),
    path(
        'api/schema/',
        SpectacularAPIView.as_view(
            custom_settings=PLATFORM_SPECTACULAR_SETTINGS,
            urlconf='config.urls_public',
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
    path('api/platform/', include('apps.saas_manager.urls')),
]
