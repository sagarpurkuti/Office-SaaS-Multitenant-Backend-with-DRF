from django.db import models
from apps.employees.models import Employee

class Payroll(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        APPROVED = 'APPROVED', 'Approved'
        LOCKED = 'LOCKED', 'Locked'
        PAID = 'PAID', 'Paid'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payrolls')
    year = models.PositiveIntegerField()
    month = models.PositiveIntegerField()  # 1-12
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    generated_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='generated_payrolls')
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('employee', 'year', 'month')

    def __str__(self):
        return f"{self.employee.employee_id} - {self.month}/{self.year}"