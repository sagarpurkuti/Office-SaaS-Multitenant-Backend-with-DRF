from django.db import models
from .payroll import Payroll
from .salary_component import SalaryComponent

class PayrollItem(models.Model):
    payroll = models.ForeignKey(Payroll, on_delete=models.CASCADE, related_name='items')
    component = models.ForeignKey(SalaryComponent, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # positive for allowance, negative for deduction
    description = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return f"{self.payroll} - {self.component.name}: {self.amount}"