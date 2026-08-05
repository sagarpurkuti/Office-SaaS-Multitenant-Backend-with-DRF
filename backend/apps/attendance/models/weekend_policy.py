from django.db import models
from apps.organizations.models import Organization, Branch

class WeekendPolicy(models.Model):
    class Weekday(models.IntegerChoices):
        MONDAY = 0, 'Monday'
        TUESDAY = 1, 'Tuesday'
        WEDNESDAY = 2, 'Wednesday'
        THURSDAY = 3, 'Thursday'
        FRIDAY = 4, 'Friday'
        SATURDAY = 5, 'Saturday'
        SUNDAY = 6, 'Sunday'

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='weekend_policies')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='weekend_policies', null=True, blank=True)
    weekday = models.IntegerField(choices=Weekday.choices)
    is_weekend = models.BooleanField(default=True)

    class Meta:
        unique_together = ('organization', 'branch', 'weekday')

    def __str__(self):
        return f"{self.get_weekday_display()} - {'Weekend' if self.is_weekend else 'Working'}"