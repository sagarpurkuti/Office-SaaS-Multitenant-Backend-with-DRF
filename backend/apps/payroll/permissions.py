from rest_framework import permissions

class IsOwnerOrHR(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_super_admin():
            return True
        return request.user.is_owner() or request.user.is_hr()

class IsOwnerOrFinance(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_super_admin():
            return True
        return request.user.is_owner() or request.user.role == 'ACCOUNTANT'