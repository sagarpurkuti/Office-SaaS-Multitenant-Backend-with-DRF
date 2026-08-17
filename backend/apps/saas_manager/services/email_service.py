from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string


class EmailService:
    @staticmethod
    def send_welcome_email(tenant, domain, username, password):
        subject = f"Welcome to {settings.PLATFORM_NAME} - Your account is ready"
        context = {
            'organization': tenant.name,
            'domain': domain.domain,
            'username': username,
            'password': password,
            'platform_name': settings.PLATFORM_NAME,
        }
        try:
            message = render_to_string('saas_manager/emails/welcome.txt', context)
            html_message = render_to_string('saas_manager/emails/welcome.html', context)
        except Exception:
            message = (
                f"Welcome to {settings.PLATFORM_NAME}.\n"
                f"Organization: {tenant.name}\n"
                f"Domain: {domain.domain}\n"
                f"Username: {username}\n"
                f"Password: {password}\n"
            )
            html_message = None

        recipient = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or 'support@example.com'
        # Prefer console/log until SMTP is configured
        if not getattr(settings, 'EMAIL_HOST', None):
            print(f"[EmailService] Welcome email (no SMTP): to={recipient}\n{message}")
            return

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            html_message=html_message,
            fail_silently=True,
        )
