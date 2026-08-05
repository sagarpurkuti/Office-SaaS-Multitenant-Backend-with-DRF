from django.db import models
from apps.accounts.models import User
from .leave_request import LeaveRequest

class LeaveApproval(models.Model):
    class Action(models.TextChoices):
        APPROVE = 'APPROVE', 'Approve'
        REJECT = 'REJECT', 'Reject'
        FORWARD = 'FORWARD', 'Forward'

    leave_request = models.ForeignKey(LeaveRequest, on_delete=models.CASCADE, related_name='approvals')
    approver = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=Action.choices)
    comment = models.TextField(blank=True, null=True)
    action_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.leave_request} - {self.action} by {self.approver.email}"