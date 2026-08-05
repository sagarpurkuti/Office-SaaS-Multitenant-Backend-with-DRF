from django.db import models
from apps.employees.models import Employee
from .shift import Shift

class EmployeeShift(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='shifts')
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.employee_id} - {self.shift.name} (from {self.effective_from})"