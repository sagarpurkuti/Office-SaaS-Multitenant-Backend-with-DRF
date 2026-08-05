from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone
from apps.accounts.models import User  # for audit fields (optional)

class BaseModel(models.Model):
    """Abstract base model with audit fields."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='%(class)s_created'
    )
    updated_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='%(class)s_updated'
    )

    class Meta:
        abstract = True

class Organization(BaseModel):
    """Company/Cooperative profile."""
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50, unique=True)
    registration_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    pan_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    province = models.CharField(max_length=50, blank=True, null=True)
    district = models.CharField(max_length=50, blank=True, null=True)
    municipality = models.CharField(max_length=50, blank=True, null=True)
    ward = models.CharField(max_length=10, blank=True, null=True)
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    favicon = models.ImageField(upload_to='favicons/', blank=True, null=True)
    timezone = models.CharField(max_length=50, default='Asia/Kathmandu')
    currency = models.CharField(max_length=10, default='NPR')
    date_format = models.CharField(max_length=20, default='YYYY-MM-DD')
    language = models.CharField(max_length=10, default='en')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Branch(BaseModel):
    """Branch/office of the organization."""
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='branches')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    is_head_office = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('organization', 'code')
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Ensure only one head office per organization
        if self.is_head_office:
            Branch.objects.filter(organization=self.organization, is_head_office=True).exclude(pk=self.pk).update(is_head_office=False)
        super().save(*args, **kwargs)

class Department(BaseModel):
    """Department within the organization."""
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('organization', 'code')
        ordering = ['name']

    def __str__(self):
        return self.name

class Designation(BaseModel):
    """Job title/designation."""
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='designations')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('organization', 'code')
        ordering = ['name']

    def __str__(self):
        return self.name

class FiscalYear(BaseModel):
    """Fiscal year (BS and AD)."""
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='fiscal_years')
    name = models.CharField(max_length=20, unique=True)  # e.g., "2082/83"
    start_date_bs = models.CharField(max_length=10)      # e.g., "2082-04-01"
    end_date_bs = models.CharField(max_length=10)
    start_date_ad = models.DateField()
    end_date_ad = models.DateField()
    is_current = models.BooleanField(default=False)
    is_closed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-start_date_ad']

    def save(self, *args, **kwargs):
        if self.is_current:
            FiscalYear.objects.filter(organization=self.organization, is_current=True).exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Holiday(BaseModel):
    """Holiday/leave day."""
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='holidays')
    title = models.CharField(max_length=100)
    date = models.DateField()
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='holidays', null=True, blank=True)
    is_optional = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('organization', 'date', 'branch')
        ordering = ['date']

    def __str__(self):
        return f"{self.title} ({self.date})"

class CompanySetting(BaseModel):
    """Company-wide settings."""
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name='settings')
    timezone = models.CharField(max_length=50, default='Asia/Kathmandu')
    currency = models.CharField(max_length=10, default='NPR')
    language = models.CharField(max_length=10, default='en')
    theme = models.CharField(max_length=20, default='light')
    allow_overtime = models.BooleanField(default=False)
    attendance_method = models.CharField(max_length=20, choices=[('manual', 'Manual'), ('biometric', 'Biometric'), ('app', 'App')], default='manual')
    default_leave_days = models.PositiveIntegerField(default=0)
    office_start_time = models.TimeField(null=True, blank=True)
    office_end_time = models.TimeField(null=True, blank=True)
    # Add more settings as needed

    def __str__(self):
        return f"Settings for {self.organization.name}"