from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from apps.tenants.views import tenant_info

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tenant-info/', tenant_info),
    path('api/schema/', SpectacularAPIView.as_view(), name='api-schema'),
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
]