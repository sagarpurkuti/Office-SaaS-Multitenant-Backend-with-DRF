from django.db import models
from apps.organizations.models import Organization
from .salary_component import SalaryComponent

class SalaryStructure(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='salary_structures')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    effective_from = models.DateField()
    is_active = models.BooleanField(default=True)
    components = models.ManyToManyField(SalaryComponent, through='SalaryStructureComponent')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class SalaryStructureComponent(models.Model):
    class CalculationType(models.TextChoices):
        FIXED = 'FIXED', 'Fixed Amount'
        PERCENTAGE_OF_BASIC = 'PERCENTAGE_OF_BASIC', 'Percentage of Basic'

    salary_structure = models.ForeignKey(SalaryStructure, on_delete=models.CASCADE)
    component = models.ForeignKey(SalaryComponent, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # if FIXED, this is the amount; if percentage, this is the percentage
    calculation_type = models.CharField(max_length=20, choices=CalculationType.choices, default=CalculationType.FIXED)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.salary_structure.name} - {self.component.name}"