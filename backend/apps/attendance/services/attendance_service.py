from django.utils import timezone
from django.db import models, transaction
from datetime import datetime, timedelta, date
from ..models import Attendance, AttendanceLog, Shift, EmployeeShift, WeekendPolicy
from apps.organizations.models import Holiday
from apps.employees.models import Employee

class AttendanceService:
    @staticmethod
    def check_in(employee, timestamp=None, method='WEB', **extra):
        if timestamp is None:
            timestamp = timezone.now()
        # Check if already checked in today without check-out
        today = timestamp.date()
        existing = Attendance.objects.filter(employee=employee, date=today).first()
        if existing and existing.check_in and not existing.check_out:
            raise ValueError("Employee already checked in today without check-out.")
        # Create log
        log = AttendanceLog.objects.create(
            employee=employee,
            timestamp=timestamp,
            method=method,
            **extra
        )
        # Create or update attendance record
        attendance, created = Attendance.objects.get_or_create(
            employee=employee,
            date=today,
            defaults={'check_in': timestamp}
        )
        if not created and not attendance.check_in:
            attendance.check_in = timestamp
            attendance.save()
        return attendance, log

    @staticmethod
    def check_out(employee, timestamp=None, method='WEB', **extra):
        if timestamp is None:
            timestamp = timezone.now()
        today = timestamp.date()
        attendance = Attendance.objects.filter(employee=employee, date=today).first()
        if not attendance or not attendance.check_in:
            raise ValueError("No check-in found for today.")
        if attendance.check_out:
            raise ValueError("Already checked out today.")
        # Create log
        log = AttendanceLog.objects.create(
            employee=employee,
            timestamp=timestamp,
            method=method,
            **extra
        )
        # Update attendance
        attendance.check_out = timestamp
        attendance.save()
        # Recalculate
        AttendanceService.calculate_attendance(attendance)
        return attendance, log

    @staticmethod
    def calculate_attendance(attendance):
        """Calculate worked minutes, late, early leave, overtime, status."""
        if not attendance.check_in or not attendance.check_out:
            return

        # Get employee's shift for that date
        shift = AttendanceService.get_shift_for_date(attendance.employee, attendance.date)
        if not shift:
            # No shift assigned – use default or mark as error
            attendance.status = Attendance.Status.ABSENT
            attendance.worked_minutes = 0
            attendance.save()
            return

        # Calculate worked minutes
        worked = (attendance.check_out - attendance.check_in).total_seconds() / 60
        attendance.worked_minutes = int(worked)

        # Shift start/end as datetime for comparison
        shift_start = datetime.combine(attendance.date, shift.start_time)
        shift_end = datetime.combine(attendance.date, shift.end_time)
        # If night shift, end may be next day
        if shift.is_night_shift and shift_end < shift_start:
            shift_end += timedelta(days=1)

        # Late minutes
        grace = shift.grace_minutes
        if attendance.check_in > shift_start:
            late = (attendance.check_in - shift_start).total_seconds() / 60
            attendance.late_minutes = int(max(0, late - grace))
        else:
            attendance.late_minutes = 0

        # Early leave
        if attendance.check_out < shift_end:
            early = (shift_end - attendance.check_out).total_seconds() / 60
            attendance.early_leave_minutes = int(early)
        else:
            attendance.early_leave_minutes = 0

        # Overtime
        if attendance.check_out > shift_end:
            ot = (attendance.check_out - shift_end).total_seconds() / 60
            attendance.overtime_minutes = int(ot)
        else:
            attendance.overtime_minutes = 0

        # Determine status
        # Check holiday/weekend first
        if AttendanceService.is_holiday(attendance.employee, attendance.date):
            attendance.status = Attendance.Status.HOLIDAY
        elif AttendanceService.is_weekend(attendance.employee, attendance.date):
            attendance.status = Attendance.Status.WEEKEND
        elif attendance.late_minutes > 0 and attendance.worked_minutes < shift.minimum_work_hours * 60:
            attendance.status = Attendance.Status.LATE
        elif attendance.worked_minutes < shift.minimum_work_hours * 60:
            attendance.status = Attendance.Status.HALF_DAY
        else:
            attendance.status = Attendance.Status.PRESENT

        attendance.save()

    @staticmethod
    def get_shift_for_date(employee, date):
        # Get the shift that was effective on that date
        employee_shift = EmployeeShift.objects.filter(
            employee=employee,
            effective_from__lte=date
        ).order_by('-effective_from').first()
        if employee_shift:
            return employee_shift.shift
        # Fallback: get default shift for organization (if any)
        return Shift.objects.filter(organization=employee.organization, is_active=True).first()

    @staticmethod
    def is_holiday(employee, date):
        # Check if date is in holidays for organization or branch
        organization = employee.organization
        branch = employee.branch
        # Public holidays
        qs = Holiday.objects.filter(organization=organization, date=date)
        if branch:
            qs = qs.filter(models.Q(branch=branch) | models.Q(branch__isnull=True))
        else:
            qs = qs.filter(branch__isnull=True)
        return qs.exists()

    @staticmethod
    def is_weekend(employee, date):
        # Check weekend policy
        weekday = date.weekday()  # Monday=0, Sunday=6
        organization = employee.organization
        branch = employee.branch
        qs = WeekendPolicy.objects.filter(organization=organization, weekday=weekday, is_weekend=True)
        if branch:
            qs = qs.filter(models.Q(branch=branch) | models.Q(branch__isnull=True))
        else:
            qs = qs.filter(branch__isnull=True)
        return qs.exists()