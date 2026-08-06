from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

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
        message = render_to_string('saas_manager/emails/welcome.txt', context)
        html_message = render_to_string('saas_manager/emails/welcome.html', context)
        # We'll send to the support user's email, but we need to get the user's email.
        # For now, we'll send to a placeholder or use tenant email from organization.
        # We'll implement later.
        # For now, we'll print to console.
        print(f"Welcome email sent to support@example.com with password {password}")
        # In production, use send_mail