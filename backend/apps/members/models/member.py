import uuid
from django.db import models
from apps.organizations.models import Organization, Branch
from apps.accounts.models import User

class Member(models.Model):
    class MemberType(models.TextChoices):
        REGULAR = 'REGULAR', 'Regular'
        INSTITUTIONAL = 'INSTITUTIONAL', 'Institutional'
        CORPORATE = 'CORPORATE', 'Corporate'
        SENIOR = 'SENIOR', 'Senior Citizen'
        STUDENT = 'STUDENT', 'Student'
        STAFF = 'STAFF', 'Staff'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        CLOSED = 'CLOSED', 'Closed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='members')
    member_no = models.CharField(max_length=50, unique=True)  # per tenant
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='member')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, related_name='members')
    member_type = models.CharField(max_length=20, choices=MemberType.choices, default=MemberType.REGULAR)
    joined_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    kyc_verified = models.BooleanField(default=False)
    photo = models.ImageField(upload_to='members/photos/', blank=True, null=True)
    # Personal details (simplified; we can have a profile model later)
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10, choices=[('MALE', 'Male'), ('FEMALE', 'Female'), ('OTHER', 'Other')])
    dob = models.DateField()
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='member_created')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='member_updated')

    def __str__(self):
        return f"{self.member_no} - {self.full_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.middle_name or ''} {self.last_name}".strip()