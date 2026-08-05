from django.db import models
from apps.organizations.models import Organization

class LeaveType(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='leave_types')
    name = models.CharField(max_length=100)
    days_per_year = models.PositiveIntegerField(default=0)
    requires_approval = models.BooleanField(default=True)
    carry_forward = models.BooleanField(default=False)
    encashable = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name