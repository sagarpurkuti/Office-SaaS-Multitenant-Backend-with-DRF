from django.db import models
from apps.organizations.models import Organization

class TaxSlab(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='tax_slabs')
    fiscal_year = models.CharField(max_length=10)  # e.g., "2082/83"
    from_amount = models.DecimalField(max_digits=12, decimal_places=2)
    to_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.fiscal_year}: {self.from_amount} - {self.to_amount} @ {self.percentage}%"