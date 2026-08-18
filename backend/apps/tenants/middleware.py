class TenantHostHeaderMiddleware:
    """
    Let the Next.js BFF select a django-tenants Domain by sending X-Tenant-Host.

    Node fetch() overwrites the Host header with the upstream URL host, so the
    BFF also sends X-Tenant-Host. This middleware copies it onto HTTP_HOST
    before TenantMainMiddleware runs.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        forwarded = request.META.get('HTTP_X_TENANT_HOST')
        if forwarded:
            host = forwarded.split(',')[0].strip().lower()
            if host:
                request.META['HTTP_HOST'] = host
        return self.get_response(request)
