from .base import *

DEBUG = True

# Local PostgreSQL (non-Docker) with django_tenants engine
DATABASES = {
    "default": {
        "ENGINE": "django_tenants.postgresql_backend",   # critical!
        "NAME": "office_saas",
        "USER": "sagar",
        "PASSWORD": "sagar",
        "HOST": "localhost",
        "PORT": "5432",
    }
}

# Allow any host for subdomain testing (optional)
ALLOWED_HOSTS = ['*']