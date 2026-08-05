from django.db import models
from .employee import Employee

class EmployeeDocument(models.Model):
    class DocumentType(models.TextChoices):
        CITIZENSHIP = 'CITIZENSHIP', 'Citizenship'
        PAN = 'PAN', 'PAN'
        DRIVING_LICENSE = 'DRIVING_LICENSE', 'Driving License'
        PASSPORT = 'PASSPORT', 'Passport'
        DEGREE = 'DEGREE', 'Degree'
        CONTRACT = 'CONTRACT', 'Contract'
        APPOINTMENT = 'APPOINTMENT', 'Appointment Letter'
        CV = 'CV', 'CV'
        OTHER = 'OTHER', 'Other'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DocumentType.choices)
    title = models.CharField(max_length=100)
    file = models.FileField(upload_to='employees/documents/')
    expiry_date = models.DateField(null=True, blank=True)
    verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)