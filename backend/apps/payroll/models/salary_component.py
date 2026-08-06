from django.db import models
from apps.organizations.models import Organization

class SalaryComponent(models.Model):
    class Type(models.TextChoices):
        ALLOWANCE = 'ALLOWANCE', 'Allowance'
        DEDUCTION = 'DEDUCTION', 'Deduction'
        BENEFIT = 'BENEFIT', 'Benefit'

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='salary_components')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)  # e.g., BASIC, HRA, MED, PF, TAX
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.ALLOWANCE)
    is_taxable = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} - {self.name}"