from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaveTypeViewSet, LeaveRequestViewSet, LeaveApprovalViewSet

router = DefaultRouter()
router.register(r'leave-types', LeaveTypeViewSet, basename='leavetype')
router.register(r'leave-requests', LeaveRequestViewSet, basename='leaverequest')
router.register(r'leave-approvals', LeaveApprovalViewSet, basename='leaveapproval')

urlpatterns = [
    path('', include(router.urls)),
]