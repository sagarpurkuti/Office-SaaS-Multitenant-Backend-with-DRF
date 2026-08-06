from ..models import AuditEvent

class AuditService:
    @staticmethod
    def log_action(user, action, target=None, request=None):
        ip = request.META.get('REMOTE_ADDR') if request else None
        user_agent = request.META.get('HTTP_USER_AGENT') if request else None
        AuditEvent.objects.create(
            user=user,
            action=action,
            target=target,
            ip_address=ip,
            user_agent=user_agent
        )