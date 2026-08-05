from django.db import models
from .employee import Employee

class EmployeeProfile(models.Model):
    class Gender(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'
        OTHER = 'OTHER', 'Other'

    class BloodGroup(models.TextChoices):
        A_POS = 'A+', 'A+'
        A_NEG = 'A-', 'A-'
        B_POS = 'B+', 'B+'
        B_NEG = 'B-', 'B-'
        AB_POS = 'AB+', 'AB+'
        AB_NEG = 'AB-', 'AB-'
        O_POS = 'O+', 'O+'
        O_NEG = 'O-', 'O-'

    class MaritalStatus(models.TextChoices):
        SINGLE = 'SINGLE', 'Single'
        MARRIED = 'MARRIED', 'Married'
        DIVORCED = 'DIVORCED', 'Divorced'
        WIDOWED = 'WIDOWED', 'Widowed'

    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10, choices=Gender.choices)
    dob = models.DateField()
    blood_group = models.CharField(max_length=5, choices=BloodGroup.choices, blank=True, null=True)
    marital_status = models.CharField(max_length=20, choices=MaritalStatus.choices, default=MaritalStatus.SINGLE)
    nationality = models.CharField(max_length=50, default='Nepali')
    citizenship_number = models.CharField(max_length=50, blank=True, null=True)
    citizenship_issue_date = models.DateField(blank=True, null=True)
    citizenship_issue_district = models.CharField(max_length=50, blank=True, null=True)
    pan_number = models.CharField(max_length=20, blank=True, null=True)
    passport_number = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.employee.employee_id} - {self.full_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.middle_name or ''} {self.last_name}".strip()