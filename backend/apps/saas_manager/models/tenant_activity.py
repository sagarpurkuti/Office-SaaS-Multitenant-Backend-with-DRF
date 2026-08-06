from django.db import models
from apps.tenants.models import Client

class TenantActivity(models.Model):
    class ActivityType(models.TextChoices):
        USER_LOGIN = 'USER_LOGIN', 'User Login'
        USER_LOGOUT = 'USER_LOGOUT', 'User Logout'
        EMPLOYEE_CREATED = 'EMPLOYEE_CREATED', 'Employee Created'
        PAYROLL_GENERATED = 'PAYROLL_GENERATED', 'Payroll Generated'
        LEAVE_APPROVED = 'LEAVE_APPROVED', 'Leave Approved'
        # add more as needed

    tenant = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='activities')
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    activity_type = models.CharField(max_length=50, choices=ActivityType.choices)
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tenant.name} - {self.activity_type} at {self.timestamp}"