from django.http import JsonResponse
from django_tenants.utils import get_public_schema_name, get_tenant_model

from .host import normalize_tenant_host


class TenantHostHeaderMiddleware:
    """
    Let the Next.js BFF select a django-tenants Domain by sending X-Tenant-Host.

    Node fetch() overwrites the Host header with the upstream URL host, so the
    BFF also sends X-Tenant-Host. This middleware copies it onto HTTP_HOST
    before TenantMainMiddleware runs.

    When X-Tenant-Host is present but does not match a Domain, reject with JSON
    404 instead of falling through to the public URLConf (which would make
    tenant APIs look "missing" and let login skip tenant membership checks).
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        forwarded = request.META.get("HTTP_X_TENANT_HOST")
        if forwarded:
            try:
                host = normalize_tenant_host(forwarded.split(",")[0])
            except ValueError:
                return JsonResponse(
                    {"error": "Invalid tenant host."},
                    status=400,
                )

            request.META["HTTP_HOST"] = host

            TenantModel = get_tenant_model()
            try:
                tenant = TenantModel.objects.get(domains__domain=host)
            except TenantModel.DoesNotExist:
                return JsonResponse(
                    {
                        "error": (
                            f"Unknown tenant host '{host}'. "
                            "Use the Domain registered for this tenant "
                            "(for example demo.localhost or tenant3.localhost)."
                        )
                    },
                    status=404,
                )

            # Public schema must never be selected via X-Tenant-Host.
            if tenant.schema_name == get_public_schema_name():
                return JsonResponse(
                    {"error": "Unknown tenant host."},
                    status=404,
                )

        return self.get_response(request)
