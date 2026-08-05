from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShiftViewSet, EmployeeShiftViewSet, AttendanceViewSet, AttendanceLogViewSet, WeekendPolicyViewSet

router = DefaultRouter()
router.register(r'shifts', ShiftViewSet, basename='shift')
router.register(r'employee-shifts', EmployeeShiftViewSet, basename='employeeshift')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'attendance-logs', AttendanceLogViewSet, basename='attendancelog')
router.register(r'weekend-policies', WeekendPolicyViewSet, basename='weekendpolicy')

urlpatterns = [
    path('', include(router.urls)),
]