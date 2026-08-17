"""
ASGI config for config project.

Defaults to production settings. Local development uses manage.py → local settings.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')

application = get_asgi_application()
