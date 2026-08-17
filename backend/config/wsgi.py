"""
WSGI config for config project.

Defaults to production settings. Local development uses manage.py → local settings.
Override with DJANGO_SETTINGS_MODULE when needed.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')

application = get_wsgi_application()
