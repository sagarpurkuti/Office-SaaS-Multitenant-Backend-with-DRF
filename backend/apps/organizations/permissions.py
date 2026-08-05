from rest_framework import permissions
from apps.accounts.permissions import IsSuperAdmin, IsOwner, IsHR, IsManager  # reuse

# We can compose or create specific permissions.
# For simplicity, we'll allow full access to Owner and HR, read-only to others.

class IsOwnerOrHR(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Allow superadmin always
        if request.user.is_super_admin():
            return True
        # Allow if user is owner or HR
        return request.user.is_owner() or request.user.is_hr()

class IsOwnerOrHROrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_super_admin():
            return True
        return request.user.is_owner() or request.user.is_hr() or request.user.is_manager()