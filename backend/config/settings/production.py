"""Production settings for Render (and similar PaaS) deploys."""
import os

from .base import *  # noqa: F403

DEBUG = False

SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError('SECRET_KEY environment variable is required in production')

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv('ALLOWED_HOSTS', '').split(',')
    if host.strip()
]
# Render sets RENDER=true; allow *.onrender.com until custom domains are configured
if not ALLOWED_HOSTS:
    if os.getenv('RENDER'):
        ALLOWED_HOSTS = ['.onrender.com']
    else:
        raise ValueError('ALLOWED_HOSTS environment variable is required in production')

# Database from DATABASE_URL (Render Internal Database URL)
DATABASES = {
    'default': dj_database_url.config(  # noqa: F405
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
        engine='django_tenants.postgresql_backend',
        ssl_require=os.getenv('DATABASE_SSL_REQUIRE', 'True') == 'True',
    )
}
if not DATABASES['default'].get('NAME'):
    raise ValueError('DATABASE_URL environment variable is required in production')

# CORS — for API-only demos you can set CORS_ALLOW_ALL_ORIGINS=True
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'False') == 'True'
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
    if origin.strip()
]

CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',')
    if origin.strip()
]

# Render terminates TLS; trust X-Forwarded-Proto
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
# Keep False on Render: TLS is terminated at the proxy; HTTP health checks must not 301
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False') == 'True'

# Static files via WhiteNoise (no nginx / Docker)
STATIC_ROOT = BASE_DIR / 'staticfiles'  # noqa: F405
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage',
    },
}

_middleware = list(MIDDLEWARE)  # noqa: F405
_security = 'django.middleware.security.SecurityMiddleware'
if 'whitenoise.middleware.WhiteNoiseMiddleware' not in _middleware:
    if _security in _middleware:
        _middleware.insert(
            _middleware.index(_security) + 1,
            'whitenoise.middleware.WhiteNoiseMiddleware',
        )
    else:
        _middleware.insert(0, 'whitenoise.middleware.WhiteNoiseMiddleware')
MIDDLEWARE = _middleware
