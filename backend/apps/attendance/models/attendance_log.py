from django.db import models
from apps.employees.models import Employee

class AttendanceLog(models.Model):
    class Method(models.TextChoices):
        WEB = 'WEB', 'Web'
        MOBILE = 'MOBILE', 'Mobile'
        BIOMETRIC = 'BIOMETRIC', 'Biometric'
        API = 'API', 'API'
        ADMIN = 'ADMIN', 'Admin'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='logs')
    timestamp = models.DateTimeField()
    device = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.WEB)

    def __str__(self):
        return f"{self.employee.employee_id} - {self.timestamp}"