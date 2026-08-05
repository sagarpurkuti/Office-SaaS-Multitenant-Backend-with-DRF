from django.db import models
from django_tenants.models import TenantMixin, DomainMixin

class Client(TenantMixin):
    """
    Tenant model – each client is a separate schema.
    """
    name = models.CharField(max_length=100, unique=True)
    paid_until = models.DateField(blank=True, null=True)
    on_trial = models.BooleanField(default=True)
    created_on = models.DateField(auto_now_add=True)

    # default true, schema will be automatically created and synced when saved
    auto_create_schema = True

    def __str__(self):
        return self.name

class Domain(DomainMixin):
    """
    Domain model – maps a domain/subdomain to a tenant.
    """
    pass