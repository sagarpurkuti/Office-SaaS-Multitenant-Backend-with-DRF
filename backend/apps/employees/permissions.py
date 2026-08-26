from rest_framework import permissions
from apps.accounts.permissions import IsTenantUser


def can_manage_employees(user):
    """Owners and HR own the employee directory; everyone else reads it."""
    return bool(
        user
        and user.is_authenticated
        and (user.is_super_admin() or user.is_owner() or user.is_hr())
    )


def _record_owner(obj):
    """
    The login a record belongs to.

    This permission is reused for employee-owned rows (attendance, leave), which
    reach their user through `employee` rather than holding it directly.
    """
    user = getattr(obj, 'user', None)
    if user is not None:
        return user
    return getattr(getattr(obj, 'employee', None), 'user', None)


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
        # Reads are open to the tenant; the queryset narrows them to the rows
        # the role is allowed to see. Writes are restricted.
        if request.method in permissions.SAFE_METHODS:
            return True
        return can_manage_employees(request.user)

    def has_object_permission(self, request, view, obj):
        if can_manage_employees(request.user):
            return True
        if request.method not in permissions.SAFE_METHODS:
            return False
        if request.user.is_manager():
            return True
        return _record_owner(obj) == request.user
