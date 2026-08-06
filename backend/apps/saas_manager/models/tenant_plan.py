from django.db import models
from django.core.validators import MinValueValidator

class TenantPlan(models.Model):
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=20, unique=True)  # e.g., STARTER, PRO, ENTERPRISE
    monthly_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    yearly_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_users = models.PositiveIntegerField(default=0)
    max_storage_mb = models.PositiveIntegerField(default=0)
    max_api_calls = models.PositiveIntegerField(default=0)
    features = models.JSONField(default=dict, blank=True)  # e.g., {"attendance": True, "payroll": False}
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name