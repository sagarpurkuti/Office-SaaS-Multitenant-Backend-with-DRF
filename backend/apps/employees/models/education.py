from django.db import models
from .employee import Employee

class EmployeeEducation(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='educations')
    level = models.CharField(max_length=50)  # e.g., "SEE", "+2", "Bachelor", "Master", "PhD"
    institution = models.CharField(max_length=200)
    board = models.CharField(max_length=100, blank=True, null=True)
    faculty = models.CharField(max_length=100, blank=True, null=True)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    passed_year = models.IntegerField()
    certificate = models.FileField(upload_to='employees/education/', blank=True, null=True)