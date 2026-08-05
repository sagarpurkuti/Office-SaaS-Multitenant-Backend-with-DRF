from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OrganizationViewSet, BranchViewSet, DepartmentViewSet,
    DesignationViewSet, FiscalYearViewSet, HolidayViewSet,
    CompanySettingViewSet
)

router = DefaultRouter()
router.register(r'organization', OrganizationViewSet, basename='organization')
router.register(r'branches', BranchViewSet, basename='branch')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'designations', DesignationViewSet, basename='designation')
router.register(r'fiscal-years', FiscalYearViewSet, basename='fiscalyear')
router.register(r'holidays', HolidayViewSet, basename='holiday')
router.register(r'settings', CompanySettingViewSet, basename='companysetting')

urlpatterns = [
    path('', include(router.urls)),
]