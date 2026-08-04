from .base import *

DEBUG = True

# Local Postgres (pgAdmin) — not Docker
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "office_saas",
        "USER": "sagar",
        "PASSWORD": "sagar",
        "HOST": "localhost",
        "PORT": "5432",
    }
}
