from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema, extend_schema_view
from apps.accounts.models import User
from apps.tenants.models import Client
from .models import TenantPlan, TenantSubscription, AuditEvent, SystemAnnouncement
from .serializers import (
    TenantPlanSerializer,
    TenantSubscriptionSerializer,
    TenantSerializer,
    TenantCreateSerializer,
    TenantProvisionedSerializer,
    AuditEventSerializer,
    SystemAnnouncementSerializer,
    PlatformErrorSerializer,
    TenantStatusSerializer,
    ResetPasswordResponseSerializer,
    DashboardSerializer,
)
from .services.tenant_provisioning_service import TenantProvisioningService
from .services.audit_service import AuditService
from .services.password_service import PasswordService
from .permissions import IsPlatformAdmin, IsPlatformSupport


def _auth_errors(roles='platform administrators'):
    return {
        401: OpenApiResponse(description='Authentication credentials were not provided or are invalid.'),
        403: OpenApiResponse(description=f'Caller is authenticated but is not one of the permitted {roles}.'),
    }


@extend_schema_view(
    list=extend_schema(
        tags=['Tenant plans'],
        summary='List plans',
        description='Return every commercial plan available for tenant subscriptions.',
        responses={200: TenantPlanSerializer(many=True), **_auth_errors()},
    ),
    retrieve=extend_schema(
        tags=['Tenant plans'],
        summary='Get a plan',
        description='Return one plan by primary key, including limits and feature flags.',
        responses={
            200: TenantPlanSerializer,
            404: OpenApiResponse(description='Plan not found.'),
            **_auth_errors(),
        },
    ),
    create=extend_schema(
        tags=['Tenant plans'],
        summary='Create a plan',
        description='Create a new commercial plan that can be assigned during tenant provisioning.',
        request=TenantPlanSerializer,
        responses={
            201: TenantPlanSerializer,
            400: OpenApiResponse(description='Validation failed.'),
            **_auth_errors(),
        },
    ),
    update=extend_schema(
        tags=['Tenant plans'],
        summary='Replace a plan',
        description='Replace all writable fields of an existing plan.',
        request=TenantPlanSerializer,
        responses={
            200: TenantPlanSerializer,
            400: OpenApiResponse(description='Validation failed.'),
            404: OpenApiResponse(description='Plan not found.'),
            **_auth_errors(),
        },
    ),
    partial_update=extend_schema(
        tags=['Tenant plans'],
        summary='Update a plan',
        description='Partially update plan pricing, quotas, or feature flags.',
        request=TenantPlanSerializer,
        responses={
            200: TenantPlanSerializer,
            400: OpenApiResponse(description='Validation failed.'),
            404: OpenApiResponse(description='Plan not found.'),
            **_auth_errors(),
        },
    ),
    destroy=extend_schema(
        tags=['Tenant plans'],
        summary='Delete a plan',
        description='Permanently delete a plan. Prefer deactivating plans that are already in use.',
        responses={
            204: None,
            404: OpenApiResponse(description='Plan not found.'),
            **_auth_errors(),
        },
    ),
)
class TenantPlanViewSet(viewsets.ModelViewSet):
    queryset = TenantPlan.objects.all()
    serializer_class = TenantPlanSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]


@extend_schema_view(
    list=extend_schema(
        tags=['Tenant subscriptions'],
        summary='List subscriptions',
        description='Return every tenant subscription and its attached plan.',
        responses={200: TenantSubscriptionSerializer(many=True), **_auth_errors()},
    ),
    retrieve=extend_schema(
        tags=['Tenant subscriptions'],
        summary='Get a subscription',
        description='Return one subscription including nested plan details.',
        responses={
            200: TenantSubscriptionSerializer,
            404: OpenApiResponse(description='Subscription not found.'),
            **_auth_errors(),
        },
    ),
    create=extend_schema(
        tags=['Tenant subscriptions'],
        summary='Create a subscription',
        description='Attach a plan to a tenant and set lifecycle dates/status.',
        request=TenantSubscriptionSerializer,
        responses={
            201: TenantSubscriptionSerializer,
            400: OpenApiResponse(description='Validation failed.'),
            **_auth_errors(),
        },
    ),
    update=extend_schema(
        tags=['Tenant subscriptions'],
        summary='Replace a subscription',
        description='Replace all writable subscription fields.',
        request=TenantSubscriptionSerializer,
        responses={
            200: TenantSubscriptionSerializer,
            400: OpenApiResponse(description='Validation failed.'),
            404: OpenApiResponse(description='Subscription not found.'),
            **_auth_errors(),
        },
    ),
    partial_update=extend_schema(
        tags=['Tenant subscriptions'],
        summary='Update a subscription',
        description='Update status, renewal date, end date, or plan assignment.',
        request=TenantSubscriptionSerializer,
        responses={
            200: TenantSubscriptionSerializer,
            400: OpenApiResponse(description='Validation failed.'),
            404: OpenApiResponse(description='Subscription not found.'),
            **_auth_errors(),
        },
    ),
    destroy=extend_schema(
        tags=['Tenant subscriptions'],
        summary='Delete a subscription',
        description='Permanently delete a subscription record.',
        responses={
            204: None,
            404: OpenApiResponse(description='Subscription not found.'),
            **_auth_errors(),
        },
    ),
)
class TenantSubscriptionViewSet(viewsets.ModelViewSet):
    queryset = TenantSubscription.objects.all()
    serializer_class = TenantSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]


@extend_schema_view(
    list=extend_schema(
        tags=['Tenants'],
        summary='List tenants',
        description=(
            'Return all tenants with primary domain and subscription summary. '
            'Available to platform admins and support operators.'
        ),
        responses={200: TenantSerializer(many=True), **_auth_errors('platform administrators or support operators')},
    ),
    retrieve=extend_schema(
        tags=['Tenants'],
        summary='Get a tenant',
        description='Return one tenant including domain and subscription details.',
        responses={
            200: TenantSerializer,
            404: OpenApiResponse(description='Tenant not found.'),
            **_auth_errors('platform administrators or support operators'),
        },
    ),
    create=extend_schema(
        tags=['Tenants'],
        summary='Provision a tenant',
        description=(
            'Fully provision a tenant from Swagger or the API: create Client + primary Domain, '
            'PostgreSQL schema, trial subscription, seeded organization data, and a tenant owner user.\n\n'
            '**Prerequisites:** create an active plan via `POST /api/platform/plans/` and use its `id` as `plan_id`.\n\n'
            '**Auth:** Authorize with a platform `SUPER_ADMIN` Bearer token from `/api/auth/login/`.'
        ),
        request=TenantCreateSerializer,
        responses={
            201: TenantProvisionedSerializer,
            400: PlatformErrorSerializer,
            **_auth_errors('platform administrators or support operators'),
        },
        examples=[
            OpenApiExample(
                'Provision demo tenant (Render)',
                value={
                    'name': 'Demo Cooperative',
                    'schema_name': 'demo1',
                    'domain': 'office-saas-api.onrender.com',
                    'plan_id': 1,
                    'company_email': 'owner@demo1.example',
                    'company_phone': '+9779800000000',
                },
                request_only=True,
            )
        ],
    ),
    update=extend_schema(
        tags=['Tenants'],
        summary='Replace a tenant',
        description='Replace writable Client fields such as name and trial flags.',
        request=TenantSerializer,
        responses={
            200: TenantSerializer,
            400: OpenApiResponse(description='Validation failed.'),
            404: OpenApiResponse(description='Tenant not found.'),
            **_auth_errors('platform administrators or support operators'),
        },
    ),
    partial_update=extend_schema(
        tags=['Tenants'],
        summary='Update a tenant',
        description='Partially update tenant metadata such as name, paid_until, or on_trial.',
        request=TenantSerializer,
        responses={
            200: TenantSerializer,
            400: OpenApiResponse(description='Validation failed.'),
            404: OpenApiResponse(description='Tenant not found.'),
            **_auth_errors('platform administrators or support operators'),
        },
    ),
    destroy=extend_schema(
        tags=['Tenants'],
        summary='Delete a tenant',
        description=(
            'Delete the Client row. Schema teardown depends on django-tenants configuration '
            'and should be used carefully in production.'
        ),
        responses={
            204: None,
            404: OpenApiResponse(description='Tenant not found.'),
            **_auth_errors('platform administrators or support operators'),
        },
    ),
)
class TenantViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin | IsPlatformSupport]

    def get_queryset(self):
        return super().get_queryset()

    def get_serializer_class(self):
        if self.action in ('create', 'create_tenant'):
            return TenantCreateSerializer
        return TenantSerializer

    def _provision_tenant(self, data, created_by):
        plan = get_object_or_404(TenantPlan, id=data['plan_id'])
        tenant_data = {
            'name': data['name'],
            'schema_name': data['schema_name'],
            'paid_until': None,
            'start_date': timezone.now().date(),
        }
        domain_data = {
            'domain': data['domain'],
            'is_primary': True,
        }
        # Do not wrap migrate_schemas in transaction.atomic() — DDL cannot nest reliably.
        tenant, support_email, support_password = TenantProvisioningService.create_tenant(
            tenant_data=tenant_data,
            domain_data=domain_data,
            plan=plan,
            created_by=created_by,
            company_email=data.get('company_email') or '',
            company_phone=data.get('company_phone') or '',
        )
        payload = TenantSerializer(tenant).data
        payload['support_email'] = support_email
        payload['support_password'] = support_password
        return payload

    def create(self, request, *args, **kwargs):
        """POST /api/platform/tenants/ — full provisioning (Swagger Create)."""
        serializer = TenantCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            payload = self._provision_tenant(serializer.validated_data, request.user)
            return Response(payload, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        tags=['Tenants'],
        summary='Provision a tenant (alias)',
        description=(
            'Same as `POST /api/platform/tenants/`. Kept for older clients and bookmarks.'
        ),
        request=TenantCreateSerializer,
        responses={
            201: TenantProvisionedSerializer,
            400: PlatformErrorSerializer,
            **_auth_errors('platform administrators or support operators'),
        },
        examples=[
            OpenApiExample(
                'Provision demo tenant',
                value={
                    'name': 'Demo Cooperative',
                    'schema_name': 'demo1',
                    'domain': 'office-saas-api.onrender.com',
                    'plan_id': 1,
                    'company_email': 'owner@demo1.example',
                    'company_phone': '+9779800000000',
                },
                request_only=True,
            )
        ],
    )
    @action(detail=False, methods=['post'], url_path='create_tenant')
    def create_tenant(self, request):
        serializer = TenantCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            payload = self._provision_tenant(serializer.validated_data, request.user)
            return Response(payload, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        tags=['Tenants'],
        summary='Suspend a tenant',
        description=(
            'Mark the tenant subscription as SUSPENDED and clear the trial flag. '
            'Writes an audit event for the operator action.'
        ),
        request=None,
        responses={
            200: TenantStatusSerializer,
            404: OpenApiResponse(description='Tenant not found.'),
            **_auth_errors('platform administrators or support operators'),
        },
    )
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        tenant = self.get_object()
        sub = getattr(tenant, 'subscription', None)
        if sub:
            sub.status = TenantSubscription.Status.SUSPENDED
            sub.save()
        tenant.on_trial = False
        tenant.save()
        AuditService.log_action(request.user, AuditEvent.Action.SUSPEND_TENANT, target=tenant.name)
        return Response({'status': 'suspended'})

    @extend_schema(
        tags=['Tenants'],
        summary='Activate a tenant',
        description=(
            'Mark the tenant subscription as ACTIVE and clear the trial flag. '
            'Writes an audit event for the operator action.'
        ),
        request=None,
        responses={
            200: TenantStatusSerializer,
            404: OpenApiResponse(description='Tenant not found.'),
            **_auth_errors('platform administrators or support operators'),
        },
    )
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        tenant = self.get_object()
        sub = getattr(tenant, 'subscription', None)
        if sub:
            sub.status = TenantSubscription.Status.ACTIVE
            sub.save()
        tenant.on_trial = False
        tenant.save()
        AuditService.log_action(request.user, AuditEvent.Action.ACTIVATE_TENANT, target=tenant.name)
        return Response({'status': 'activated'})

    @extend_schema(
        tags=['Tenants'],
        summary='Reset tenant support password',
        description=(
            'Generate a strong temporary password for the tenant owner user linked to this tenant. '
            'In production deliver by email instead of returning in the API response.'
        ),
        request=None,
        responses={
            200: ResetPasswordResponseSerializer,
            404: PlatformErrorSerializer,
            **_auth_errors('platform administrators or support operators'),
        },
    )
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        tenant = self.get_object()
        new_password = PasswordService.generate_strong_password()
        user = User.objects.filter(tenant=tenant).order_by('created_at').first()
        if not user:
            return Response({'error': 'Tenant user not found'}, status=status.HTTP_404_NOT_FOUND)
        user.set_password(new_password)
        user.save(update_fields=['password'])
        AuditService.log_action(request.user, AuditEvent.Action.RESET_PASSWORD, target=tenant.name)
        return Response({'new_password': new_password, 'email': user.email})


@extend_schema_view(
    list=extend_schema(
        tags=['Audit events'],
        summary='List audit events',
        description='Return the immutable platform audit trail, newest first.',
        responses={200: AuditEventSerializer(many=True), **_auth_errors()},
    ),
    retrieve=extend_schema(
        tags=['Audit events'],
        summary='Get an audit event',
        description='Return one audit event including operator email and target.',
        responses={
            200: AuditEventSerializer,
            404: OpenApiResponse(description='Audit event not found.'),
            **_auth_errors(),
        },
    ),
)
class AuditEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditEvent.objects.all().order_by('-timestamp')
    serializer_class = AuditEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]


@extend_schema_view(
    list=extend_schema(
        tags=['System announcements'],
        summary='List announcements',
        description='Return all system announcements ordered by creation time.',
        responses={200: SystemAnnouncementSerializer(many=True), **_auth_errors()},
    ),
    retrieve=extend_schema(
        tags=['System announcements'],
        summary='Get an announcement',
        description='Return one system announcement.',
        responses={
            200: SystemAnnouncementSerializer,
            404: OpenApiResponse(description='Announcement not found.'),
            **_auth_errors(),
        },
    ),
    create=extend_schema(
        tags=['System announcements'],
        summary='Create an announcement',
        description='Publish a new platform-wide announcement.',
        request=SystemAnnouncementSerializer,
        responses={
            201: SystemAnnouncementSerializer,
            400: OpenApiResponse(description='Validation failed.'),
            **_auth_errors(),
        },
    ),
    update=extend_schema(
        tags=['System announcements'],
        summary='Replace an announcement',
        description='Replace all writable announcement fields.',
        request=SystemAnnouncementSerializer,
        responses={
            200: SystemAnnouncementSerializer,
            400: OpenApiResponse(description='Validation failed.'),
            404: OpenApiResponse(description='Announcement not found.'),
            **_auth_errors(),
        },
    ),
    partial_update=extend_schema(
        tags=['System announcements'],
        summary='Update an announcement',
        description='Partially update announcement content, priority, or active state.',
        request=SystemAnnouncementSerializer,
        responses={
            200: SystemAnnouncementSerializer,
            400: OpenApiResponse(description='Validation failed.'),
            404: OpenApiResponse(description='Announcement not found.'),
            **_auth_errors(),
        },
    ),
    destroy=extend_schema(
        tags=['System announcements'],
        summary='Delete an announcement',
        description='Permanently delete a system announcement.',
        responses={
            204: None,
            404: OpenApiResponse(description='Announcement not found.'),
            **_auth_errors(),
        },
    ),
)
class SystemAnnouncementViewSet(viewsets.ModelViewSet):
    queryset = SystemAnnouncement.objects.all()
    serializer_class = SystemAnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]

    @extend_schema(
        tags=['Platform dashboard'],
        summary='Platform dashboard metrics',
        description=(
            'Return high-level platform metrics used by the operator console: '
            'tenant count, active subscriptions, revenue placeholder, and recent audit events.'
        ),
        responses={
            200: DashboardSerializer,
            **_auth_errors(),
        },
    )
    def get(self, request):
        total_tenants = Client.objects.count()
        active_subscriptions = TenantSubscription.objects.filter(
            status=TenantSubscription.Status.ACTIVE
        ).count()
        data = {
            'total_tenants': total_tenants,
            'active_subscriptions': active_subscriptions,
            'total_revenue': '0.00',
            'recent_audit_events': AuditEventSerializer(
                AuditEvent.objects.all().order_by('-timestamp')[:10],
                many=True,
            ).data,
        }
        return Response(data)
