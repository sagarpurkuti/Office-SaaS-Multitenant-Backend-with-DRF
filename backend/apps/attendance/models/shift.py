from django.db import models
from apps.organizations.models import Organization

class Shift(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='shifts')
    name = models.CharField(max_length=100)
    start_time = models.TimeField()
    end_time = models.TimeField()
    grace_minutes = models.PositiveIntegerField(default=10)
    break_minutes = models.PositiveIntegerField(default=0)
    minimum_work_hours = models.DecimalField(max_digits=4, decimal_places=2, default=8.0)
    is_night_shift = models.BooleanField(default=False)
    is_flexible = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"