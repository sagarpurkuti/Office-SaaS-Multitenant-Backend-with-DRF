from django.db import models
from apps.employees.models import Employee

class Bonus(models.Model):
    class BonusType(models.TextChoices):
        FESTIVAL = 'FESTIVAL', 'Festival'
        PERFORMANCE = 'PERFORMANCE', 'Performance'
        PROJECT = 'PROJECT', 'Project'
        OTHER = 'OTHER', 'Other'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='bonuses')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    bonus_type = models.CharField(max_length=20, choices=BonusType.choices, default=BonusType.OTHER)
    reason = models.CharField(max_length=200, blank=True, null=True)
    month = models.PositiveIntegerField(null=True, blank=True)  # optional month to apply
    year = models.PositiveIntegerField(null=True, blank=True)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee.employee_id} - {self.amount} ({self.reason})"