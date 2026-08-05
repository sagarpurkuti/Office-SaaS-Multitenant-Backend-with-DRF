from rest_framework import permissions
from apps.accounts.permissions import IsTenantUser

class EmployeeAccessPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # SuperAdmin can do anything
        if request.user.is_super_admin():
            return True
        # Ensure tenant context
        if not IsTenantUser().has_permission(request, view):
            return False
        # For list/create: Owner/HR/Manager? 
        # We'll allow list for all, but filter later.
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.is_super_admin():
            return True
        if request.user.is_owner() or request.user.is_hr():
            return True
        if request.user.is_manager() and request.method in permissions.SAFE_METHODS:
            return True
        if request.user == obj.user:
            return True
        return False