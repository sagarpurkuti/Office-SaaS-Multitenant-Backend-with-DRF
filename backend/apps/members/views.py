from rest_framework import viewsets, permissions
from .models import Member
from .serializers import MemberSerializer
from apps.accounts.permissions import IsTenantUser

class MemberAccessPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_super_admin():
            return True
        if not IsTenantUser().has_permission(request, view):
            return False
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.is_super_admin():
            return True
        if request.user.is_owner() or request.user.role in ['MANAGER', 'HR']:  # cooperative manager
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        return False

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser, MemberAccessPermission]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)