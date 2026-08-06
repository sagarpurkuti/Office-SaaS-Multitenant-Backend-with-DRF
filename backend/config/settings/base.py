import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend/

# Load environment variables from backend/.env (or root .env)
# We'll load from both locations; adjust as needed.
env_path = BASE_DIR / '.env'
if not env_path.exists():
    env_path = BASE_DIR.parent / '.env'  # fallback to project root
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG') == 'True'

# Allow any host for subdomain routing in development.
# In production, restrict to your domain(s).
ALLOWED_HOSTS = ['*'] if DEBUG else os.getenv('ALLOWED_HOSTS', '').split(',')

# ========== Multi-Tenancy Settings ==========
# Shared apps (public schema)
SHARED_APPS = [
    'django_tenants',                 # mandatory
    'apps.tenants',                   # our tenant management app
    'apps.accounts',                  # authentication (will be shared)
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'rest_framework_simplejwt.token_blacklist',
    'drf_spectacular',
]

CORS_ALLOW_ALL_ORIGINS = True  # only for dev

# Tenant apps (each tenant gets its own schema)
TENANT_APPS = [
    'apps.common',  
    'apps.organizations',               # shared utilities (can be tenant-specific)
    'apps.employees',
    'apps.members',
    'apps.attendance',
    'apps.leave',
    'apps.payroll',
    # future apps: hr, cooperative, etc.
]

# Combine for INSTALLED_APPS
INSTALLED_APPS = list(SHARED_APPS) + [app for app in TENANT_APPS if app not in SHARED_APPS]

# Middleware – TenantMainMiddleware must be near the top
MIDDLEWARE = [
    'django_tenants.middleware.TenantMainMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database – use django_tenants postgresql backend
# We use dj_database_url for flexibility, but we need to set ENGINE explicitly.
# We'll override in local.py to use the correct engine.
import dj_database_url

DATABASES = {
    "default": dj_database_url.config(
        default=os.getenv("DATABASE_URL"),
        conn_max_age=600,
        engine='django_tenants.postgresql_backend',  # force the right engine
    )
}

# Tenant configuration
DATABASE_ROUTERS = ('django_tenants.routers.TenantSyncRouter',)
TENANT_MODEL = "tenants.Client"           # app.Model
TENANT_DOMAIN_MODEL = "tenants.Domain"    # app.Model
PUBLIC_SCHEMA_NAME = 'public'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


AUTH_USER_MODEL = 'accounts.User'


LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'static'

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Office SaaS API',
    'DESCRIPTION': (
        'REST API for tenant-scoped authentication and organization management. '
        'Send access tokens as `Authorization: Bearer <token>`. API requests must '
        'use the tenant domain so django-tenants selects the correct schema.'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SERVE_PERMISSIONS': ['rest_framework.permissions.AllowAny'],
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': r'/api',
    'TAGS': [
        {'name': 'Authentication', 'description': 'JWT sessions and account security.'},
        {'name': 'Organizations', 'description': 'Organization profile management.'},
        {'name': 'Branches', 'description': 'Organization branch management.'},
        {'name': 'Departments', 'description': 'Department management.'},
        {'name': 'Designations', 'description': 'Job designation management.'},
        {'name': 'Fiscal years', 'description': 'Fiscal year management.'},
        {'name': 'Holidays', 'description': 'Organization and branch holiday management.'},
        {'name': 'Company settings', 'description': 'Tenant company preferences.'},
    ],
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}