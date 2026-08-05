from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.accounts.permissions import IsTenantUser
from .models import LeaveType, LeaveRequest, LeaveApproval
from .serializers import LeaveTypeSerializer, LeaveRequestSerializer, LeaveApprovalSerializer
from .services.leave_service import LeaveService

class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser]  # Owner/HR can manage

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser]

    def perform_create(self, serializer):
        # Automatically set employee from request user
        employee = self.request.user.employee
        if not employee:
            raise ValueError("No employee profile for user.")
        serializer.save(employee=employee)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsTenantUser])
    def approve(self, request, pk=None):
        leave_request = self.get_object()
        # Check permission: Only HR/Manager/Owner can approve
        if not (request.user.is_owner() or request.user.is_hr() or request.user.is_manager()):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            leave = LeaveService.approve_leave(leave_request, request.user, request.data.get('comment'))
            return Response(LeaveRequestSerializer(leave).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsTenantUser])
    def reject(self, request, pk=None):
        leave_request = self.get_object()
        if not (request.user.is_owner() or request.user.is_hr() or request.user.is_manager()):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            leave = LeaveService.reject_leave(leave_request, request.user, request.data.get('comment'))
            return Response(LeaveRequestSerializer(leave).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LeaveApprovalViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LeaveApproval.objects.all()
    serializer_class = LeaveApprovalSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser]