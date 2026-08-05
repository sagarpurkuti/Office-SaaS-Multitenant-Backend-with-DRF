from django.db import models
from .employee import Employee

class EmployeeAddress(models.Model):
    class AddressType(models.TextChoices):
        PERMANENT = 'PERMANENT', 'Permanent'
        TEMPORARY = 'TEMPORARY', 'Temporary'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='addresses')
    type = models.CharField(max_length=20, choices=AddressType.choices)
    province = models.CharField(max_length=50, blank=True, null=True)
    district = models.CharField(max_length=50, blank=True, null=True)
    municipality = models.CharField(max_length=50, blank=True, null=True)
    ward = models.CharField(max_length=10, blank=True, null=True)
    street = models.CharField(max_length=200, blank=True, null=True)
    country = models.CharField(max_length=50, default='Nepal')