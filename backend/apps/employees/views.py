from rest_framework import viewsets, permissions
from .models import Employee
from .serializers import EmployeeSerializer
from .permissions import EmployeeAccessPermission
from apps.accounts.permissions import IsTenantUser

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser, EmployeeAccessPermission]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    # Optionally override get_queryset to filter by organization? Not needed as schema isolates, but we can filter by organization if needed.