import uuid
from django.db import models
from apps.organizations.models import Organization, Branch, Department, Designation
from apps.accounts.models import User

class Employee(models.Model):
    class EmploymentType(models.TextChoices):
        PERMANENT = 'PERMANENT', 'Permanent'
        CONTRACT = 'CONTRACT', 'Contract'
        INTERN = 'INTERN', 'Intern'
        PART_TIME = 'PART_TIME', 'Part-Time'
        TEMPORARY = 'TEMPORARY', 'Temporary'
        CONSULTANT = 'CONSULTANT', 'Consultant'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        ON_LEAVE = 'ON_LEAVE', 'On Leave'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        TRANSFERRED = 'TRANSFERRED', 'Transferred'
        RESIGNED = 'RESIGNED', 'Resigned'
        RETIRED = 'RETIRED', 'Retired'
        TERMINATED = 'TERMINATED', 'Terminated'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='employees')
    employee_id = models.CharField(max_length=50, unique=True)  # per tenant, unique
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='employee')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, related_name='employees')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, related_name='employees')
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices, default=EmploymentType.PERMANENT)
    joining_date = models.DateField()
    probation_end = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    official_email = models.EmailField(unique=True, blank=True, null=True)
    official_phone = models.CharField(max_length=20, blank=True, null=True)
    reporting_manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates')
    photo = models.ImageField(upload_to='employees/photos/', blank=True, null=True)
    signature = models.ImageField(upload_to='employees/signatures/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='employee_created')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='employee_updated')

    def __str__(self):
        return f"{self.employee_id} - {self.user.full_name if self.user else 'No User'}"