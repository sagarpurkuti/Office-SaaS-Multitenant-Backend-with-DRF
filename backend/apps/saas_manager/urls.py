from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TenantPlanViewSet, TenantSubscriptionViewSet, TenantViewSet,
    AuditEventViewSet, SystemAnnouncementViewSet, DashboardView
)

router = DefaultRouter()
router.register(r'plans', TenantPlanViewSet, basename='plan')
router.register(r'subscriptions', TenantSubscriptionViewSet, basename='subscription')
router.register(r'tenants', TenantViewSet, basename='tenant')
router.register(r'audit-events', AuditEventViewSet, basename='audit')
router.register(r'announcements', SystemAnnouncementViewSet, basename='announcement')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]