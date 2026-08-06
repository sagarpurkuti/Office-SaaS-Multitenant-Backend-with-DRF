from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from apps.tenants.models import Client, Domain
from .models import TenantPlan, TenantSubscription, AuditEvent, SystemAnnouncement


class TenantPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantPlan
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'name': {'help_text': 'Human-readable plan name, for example Starter or Enterprise.'},
            'code': {'help_text': 'Stable machine code such as STARTER, PRO, or ENTERPRISE.'},
            'monthly_price': {'help_text': 'Recurring monthly price in the platform currency.'},
            'yearly_price': {'help_text': 'Recurring yearly price in the platform currency.'},
            'max_users': {'help_text': 'Maximum users allowed for tenants on this plan. 0 means unlimited.'},
            'max_storage_mb': {'help_text': 'Storage quota in megabytes. 0 means unlimited.'},
            'max_api_calls': {'help_text': 'Monthly API call quota. 0 means unlimited.'},
            'features': {
                'help_text': 'Feature flags JSON, for example {"attendance": true, "payroll": false}.'
            },
            'is_active': {'help_text': 'Inactive plans cannot be assigned to new tenants.'},
        }


class TenantSubscriptionSerializer(serializers.ModelSerializer):
    plan = TenantPlanSerializer(read_only=True)
    plan_id = serializers.PrimaryKeyRelatedField(
        queryset=TenantPlan.objects.all(),
        source='plan',
        write_only=True,
        help_text='Primary key of the plan to attach to this subscription.',
    )

    class Meta:
        model = TenantSubscription
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'tenant': {'help_text': 'Tenant (Client) that owns this subscription.'},
            'start_date': {'help_text': 'Subscription start date (YYYY-MM-DD).'},
            'end_date': {'help_text': 'Optional subscription end date.'},
            'status': {'help_text': 'Lifecycle status: TRIAL, ACTIVE, EXPIRED, SUSPENDED, or CANCELLED.'},
            'renewal_date': {'help_text': 'Next renewal date when billing is enabled.'},
        }


class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = '__all__'
        extra_kwargs = {
            'domain': {'help_text': 'Hostname that routes to the tenant, for example demo.localhost.'},
            'is_primary': {'help_text': 'Whether this is the primary domain for the tenant.'},
        }


class TenantSerializer(serializers.ModelSerializer):
    domain = serializers.SerializerMethodField(
        help_text='Primary domain record for this tenant, when present.'
    )
    subscription = TenantSubscriptionSerializer(
        read_only=True,
        help_text='Current subscription and plan for this tenant.',
    )

    class Meta:
        model = Client
        fields = [
            'id',
            'schema_name',
            'name',
            'paid_until',
            'on_trial',
            'created_on',
            'domain',
            'subscription',
        ]
        read_only_fields = ('id', 'created_on', 'domain', 'subscription')

    @extend_schema_field(DomainSerializer)
    def get_domain(self, obj):
        domain = Domain.objects.filter(tenant=obj, is_primary=True).first()
        if domain:
            return DomainSerializer(domain).data
        return None


class TenantCreateSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=100,
        help_text='Display name of the tenant organization.',
    )
    schema_name = serializers.CharField(
        max_length=63,
        help_text='PostgreSQL schema name. Must be unique and DNS-safe.',
    )
    domain = serializers.CharField(
        max_length=100,
        help_text='Primary hostname for the tenant, for example acme.localhost.',
    )
    plan_id = serializers.IntegerField(
        help_text='Plan primary key to attach as the initial subscription.',
    )
    company_email = serializers.EmailField(
        required=False,
        help_text='Optional company contact email used during provisioning.',
    )
    company_phone = serializers.CharField(
        max_length=20,
        required=False,
        help_text='Optional company phone used during provisioning.',
    )

    def validate_schema_name(self, value):
        if Client.objects.filter(schema_name=value).exists():
            raise serializers.ValidationError('Schema name already exists.')
        return value

    def validate_domain(self, value):
        if Domain.objects.filter(domain=value).exists():
            raise serializers.ValidationError('Domain already exists.')
        return value


class AuditEventSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(
        source='user.email',
        read_only=True,
        help_text='Email of the operator who performed the action.',
    )

    class Meta:
        model = AuditEvent
        fields = '__all__'
        read_only_fields = ('timestamp',)


class SystemAnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemAnnouncement
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'title': {'help_text': 'Short announcement headline.'},
            'message': {'help_text': 'Full announcement body shown to recipients.'},
            'priority': {'help_text': 'LOW, MEDIUM, HIGH, or URGENT.'},
            'is_active': {'help_text': 'Only active announcements should be displayed.'},
        }


class PlatformErrorSerializer(serializers.Serializer):
    error = serializers.CharField(help_text='Human-readable error message.')


class TenantStatusSerializer(serializers.Serializer):
    status = serializers.CharField(help_text='Resulting tenant status, for example suspended or activated.')


class ResetPasswordResponseSerializer(serializers.Serializer):
    new_password = serializers.CharField(
        help_text='Generated temporary password for the tenant support user. Deliver securely in production.',
    )


class DashboardSerializer(serializers.Serializer):
    total_tenants = serializers.IntegerField(help_text='Total tenants registered on the platform.')
    active_subscriptions = serializers.IntegerField(help_text='Subscriptions currently in ACTIVE status.')
    total_revenue = serializers.CharField(help_text='Aggregated revenue figure as a decimal string.')
    recent_audit_events = AuditEventSerializer(
        many=True,
        help_text='Most recent platform audit events.',
    )
