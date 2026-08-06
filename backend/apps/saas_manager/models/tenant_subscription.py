from django.db import models
from apps.tenants.models import Client

class TenantSubscription(models.Model):
    class Status(models.TextChoices):
        TRIAL = 'TRIAL', 'Trial'
        ACTIVE = 'ACTIVE', 'Active'
        EXPIRED = 'EXPIRED', 'Expired'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        CANCELLED = 'CANCELLED', 'Cancelled'

    tenant = models.OneToOneField(Client, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey('TenantPlan', on_delete=models.SET_NULL, null=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TRIAL)
    renewal_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.tenant.name} - {self.status}"