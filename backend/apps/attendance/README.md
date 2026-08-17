# attendance

Shifts, employee shift assignment, daily attendance, and weekend policy.

## Schema

**Tenant** (`TENANT_APPS`)

## Main models

Shift · EmployeeShift · Attendance · AttendanceLog · WeekendPolicy

## API (`/api/` — tenant host)

| Prefix | Resource |
|--------|----------|
| `shifts/` | Shift definitions |
| `employee-shifts/` | Assign shifts to employees |
| `attendance/` | Attendance records |
| `attendance-logs/` | Punch / event logs |
| `weekend-policies/` | Weekend weekdays |

## Services

Business logic lives under `services/attendance_service.py` where used by views.

## Notes

Provisioned tenants get a default 09:00–17:00 shift and Saturday weekend policy.
