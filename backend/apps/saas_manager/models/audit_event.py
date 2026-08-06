from django.db import models
from apps.accounts.models import User

class AuditEvent(models.Model):
    class Action(models.TextChoices):
        CREATE_TENANT = 'CREATE_TENANT', 'Create Tenant'
        UPDATE_TENANT = 'UPDATE_TENANT', 'Update Tenant'
        SUSPEND_TENANT = 'SUSPEND_TENANT', 'Suspend Tenant'
        ACTIVATE_TENANT = 'ACTIVATE_TENANT', 'Activate Tenant'
        DELETE_TENANT = 'DELETE_TENANT', 'Delete Tenant'
        CHANGE_PLAN = 'CHANGE_PLAN', 'Change Plan'
        RESET_PASSWORD = 'RESET_PASSWORD', 'Reset Password'
        LOGIN = 'LOGIN', 'Login'
        LOGOUT = 'LOGOUT', 'Logout'
        # add more

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_events')
    action = models.CharField(max_length=50, choices=Action.choices)
    target = models.CharField(max_length=200, blank=True, null=True)  # e.g., tenant name, user email
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=200, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action} at {self.timestamp}"