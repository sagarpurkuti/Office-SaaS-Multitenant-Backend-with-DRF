import uuid
from django.db import models
from apps.employees.models import Employee

class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'PRESENT', 'Present'
        ABSENT = 'ABSENT', 'Absent'
        LATE = 'LATE', 'Late'
        HALF_DAY = 'HALF_DAY', 'Half Day'
        LEAVE = 'LEAVE', 'Leave'
        HOLIDAY = 'HOLIDAY', 'Holiday'
        WEEKEND = 'WEEKEND', 'Weekend'
        WORK_FROM_HOME = 'WORK_FROM_HOME', 'Work From Home'
        ON_DUTY = 'ON_DUTY', 'On Duty'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    worked_minutes = models.PositiveIntegerField(default=0)
    late_minutes = models.PositiveIntegerField(default=0)
    early_leave_minutes = models.PositiveIntegerField(default=0)
    overtime_minutes = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('employee', 'date')

    def __str__(self):
        return f"{self.employee.employee_id} - {self.date}"