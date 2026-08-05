from django.db import transaction
from datetime import date, timedelta
from ..models import LeaveRequest, LeaveApproval
from apps.attendance.models import Attendance

class LeaveService:
    @staticmethod
    def apply_leave(employee, leave_type, from_date, to_date, reason, attachment=None):
        # Validate dates
        if from_date > to_date:
            raise ValueError("From date must be before to date.")
        # Check overlapping pending/approved leaves
        overlapping = LeaveRequest.objects.filter(
            employee=employee,
            status__in=[LeaveRequest.Status.PENDING, LeaveRequest.Status.APPROVED],
            from_date__lte=to_date,
            to_date__gte=from_date
        ).exists()
        if overlapping:
            raise ValueError("Leave request overlaps with existing pending or approved leave.")
        # Create leave request
        leave = LeaveRequest.objects.create(
            employee=employee,
            leave_type=leave_type,
            from_date=from_date,
            to_date=to_date,
            reason=reason,
            attachment=attachment,
            status=LeaveRequest.Status.PENDING
        )
        return leave

    @staticmethod
    def approve_leave(leave_request, approver, comment=None):
        if leave_request.status != LeaveRequest.Status.PENDING:
            raise ValueError("Only pending requests can be approved.")
        leave_request.status = LeaveRequest.Status.APPROVED
        leave_request.save()
        # Create approval record
        LeaveApproval.objects.create(
            leave_request=leave_request,
            approver=approver,
            action=LeaveApproval.Action.APPROVE,
            comment=comment
        )
        # Update attendance for those days: mark as LEAVE
        current_date = leave_request.from_date
        while current_date <= leave_request.to_date:
            attendance, _ = Attendance.objects.get_or_create(
                employee=leave_request.employee,
                date=current_date,
                defaults={'status': Attendance.Status.LEAVE}
            )
            if attendance.status not in [Attendance.Status.HOLIDAY, Attendance.Status.WEEKEND]:
                attendance.status = Attendance.Status.LEAVE
                attendance.save()
            current_date += timedelta(days=1)
        return leave_request

    @staticmethod
    def reject_leave(leave_request, approver, comment=None):
        if leave_request.status != LeaveRequest.Status.PENDING:
            raise ValueError("Only pending requests can be rejected.")
        leave_request.status = LeaveRequest.Status.REJECTED
        leave_request.save()
        LeaveApproval.objects.create(
            leave_request=leave_request,
            approver=approver,
            action=LeaveApproval.Action.REJECT,
            comment=comment
        )
        return leave_request