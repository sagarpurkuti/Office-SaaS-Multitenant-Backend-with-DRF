from django.contrib import admin
from django.urls import path, include
from apps.tenants.views import tenant_info

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tenant-info/', tenant_info),
    path('api/auth/', include('apps.accounts.urls')),
]