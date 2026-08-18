from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from .models import (
    Organization, Branch, Department, Designation,
    FiscalYear, Holiday, CompanySetting
)
from .serializers import (
    OrganizationSerializer, BranchSerializer, DepartmentSerializer,
    DesignationSerializer, FiscalYearSerializer, HolidaySerializer,
    CompanySettingSerializer, WorkspaceDashboardSerializer,
)
from .permissions import IsOwnerOrHR, IsOwnerOrHROrManager
from apps.accounts.permissions import IsTenantUser  # ensure user belongs to tenant


def document_crud(tag, resource, serializer, write_roles='owners and HR users'):
    """Apply consistent OpenAPI documentation to a model viewset."""
    authentication_errors = {
        401: OpenApiResponse(description='Authentication credentials were not provided or are invalid.'),
        403: OpenApiResponse(
            description=f'The user does not belong to this tenant or is not one of the permitted {write_roles}.'
        ),
    }
    return extend_schema_view(
        list=extend_schema(
            tags=[tag],
            summary=f'List {resource}s',
            description=f'Return all {resource}s in the current tenant schema.',
            responses={200: serializer(many=True), **authentication_errors},
        ),
        retrieve=extend_schema(
            tags=[tag],
            summary=f'Get a {resource}',
            description=f'Return one {resource} from the current tenant schema.',
            responses={
                200: serializer,
                404: OpenApiResponse(description=f'{resource.capitalize()} not found.'),
                **authentication_errors,
            },
        ),
        create=extend_schema(
            tags=[tag],
            summary=f'Create a {resource}',
            description=(
                f'Create a {resource} in the current tenant. Audit fields are '
                'populated from the authenticated user.'
            ),
            request=serializer,
            responses={201: serializer, 400: OpenApiResponse(description='Validation failed.'), **authentication_errors},
        ),
        update=extend_schema(
            tags=[tag],
            summary=f'Replace a {resource}',
            description=f'Replace all writable fields of a {resource}.',
            request=serializer,
            responses={
                200: serializer,
                400: OpenApiResponse(description='Validation failed.'),
                404: OpenApiResponse(description=f'{resource.capitalize()} not found.'),
                **authentication_errors,
            },
        ),
        partial_update=extend_schema(
            tags=[tag],
            summary=f'Update a {resource}',
            description=f'Update selected writable fields of a {resource}.',
            request=serializer,
            responses={
                200: serializer,
                400: OpenApiResponse(description='Validation failed.'),
                404: OpenApiResponse(description=f'{resource.capitalize()} not found.'),
                **authentication_errors,
            },
        ),
        destroy=extend_schema(
            tags=[tag],
            summary=f'Delete a {resource}',
            description=f'Permanently delete a {resource} from the current tenant.',
            responses={
                204: None,
                404: OpenApiResponse(description=f'{resource.capitalize()} not found.'),
                **authentication_errors,
            },
        ),
    )


@document_crud('Organizations', 'organization', OrganizationSerializer)
class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated, IsTenantUser, IsOwnerOrHR]

    def perform_create(self, serializer):
        # Set audit fields automatically
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

@document_crud('Branches', 'branch', BranchSerializer)
class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes = [IsAuthenticated, IsTenantUser, IsOwnerOrHR]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

@document_crud('Departments', 'department', DepartmentSerializer)
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsTenantUser, IsOwnerOrHR]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

@document_crud('Designations', 'designation', DesignationSerializer)
class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer
    permission_classes = [IsAuthenticated, IsTenantUser, IsOwnerOrHR]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

@document_crud(
    'Fiscal years',
    'fiscal year',
    FiscalYearSerializer,
    write_roles='owners, HR users, and managers',
)
class FiscalYearViewSet(viewsets.ModelViewSet):
    queryset = FiscalYear.objects.all()
    serializer_class = FiscalYearSerializer
    permission_classes = [IsAuthenticated, IsTenantUser, IsOwnerOrHROrManager]  # finance can manage

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

@document_crud('Holidays', 'holiday', HolidaySerializer)
class HolidayViewSet(viewsets.ModelViewSet):
    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer
    permission_classes = [IsAuthenticated, IsTenantUser, IsOwnerOrHR]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

@document_crud('Company settings', 'company setting', CompanySettingSerializer)
class CompanySettingViewSet(viewsets.ModelViewSet):
    queryset = CompanySetting.objects.all()
    serializer_class = CompanySettingSerializer
    permission_classes = [IsAuthenticated, IsTenantUser, IsOwnerOrHR]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class WorkspaceDashboardView(APIView):
    """Single-round-trip snapshot for the tenant workspace home."""

    permission_classes = [IsAuthenticated, IsTenantUser]

    @extend_schema(
        tags=['Organizations'],
        summary='Tenant workspace dashboard',
        description=(
            'Return organization profile, company settings, and lightweight counts '
            'for the tenant resolved from the request host.'
        ),
        responses={200: WorkspaceDashboardSerializer},
    )
    def get(self, request):
        from apps.employees.models import Employee
        from apps.members.models import Member

        tenant = getattr(request, 'tenant', None)
        organization = Organization.objects.order_by('id').first()
        settings = None
        if organization:
            settings = CompanySetting.objects.filter(organization=organization).first()

        payload = {
            'tenant_name': getattr(tenant, 'name', ''),
            'schema_name': getattr(tenant, 'schema_name', ''),
            'on_trial': getattr(tenant, 'on_trial', None),
            'organization': OrganizationSerializer(organization).data if organization else None,
            'settings': CompanySettingSerializer(settings).data if settings else None,
            'counts': {
                'employees': Employee.objects.count(),
                'members': Member.objects.count(),
                'branches': Branch.objects.count(),
                'departments': Department.objects.count(),
            },
        }
        return Response(payload)