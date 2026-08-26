from django.db.models import Q
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from apps.accounts.models import User
from apps.accounts.permissions import IsTenantUser
from apps.accounts.serializers import UserSerializer
from .models import Employee
from .serializers import EmployeeSerializer
from .permissions import EmployeeAccessPermission, can_manage_employees
from .utils import get_employee_for_user


@extend_schema(tags=['Employees'])
class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser, EmployeeAccessPermission]

    def get_queryset(self):
        queryset = (
            Employee.objects.select_related(
                'profile', 'user', 'branch', 'department', 'designation'
            )
            .order_by('employee_id')
        )
        return self._filter(self._scope(queryset))

    def _scope(self, queryset):
        """
        Rows the caller may see.

        Mirrors the scopes the workspace assigns to each role: owners, HR and
        finance read the whole organization, a manager reads their own record
        plus direct reports, everyone else reads only themselves.
        """
        user = self.request.user
        if can_manage_employees(user) or user.role == User.Role.ACCOUNTANT:
            return queryset
        if user.is_manager():
            employee = get_employee_for_user(user)
            if employee is None:
                return queryset.none()
            return queryset.filter(Q(pk=employee.pk) | Q(reporting_manager=employee))
        return queryset.filter(user=user)

    def _filter(self, queryset):
        params = self.request.query_params
        for field in ('status', 'employment_type', 'department', 'branch', 'designation'):
            value = params.get(field)
            if value:
                queryset = queryset.filter(**{field: value})

        search = (params.get('search') or '').strip()
        if search:
            queryset = queryset.filter(
                Q(employee_id__icontains=search)
                | Q(official_email__icontains=search)
                | Q(profile__first_name__icontains=search)
                | Q(profile__last_name__icontains=search)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @extend_schema(
        tags=['Employees'],
        summary='List accounts available for linking',
        description=(
            'Active logins in this tenant that are not yet attached to an '
            'employee record. Restricted to owners and HR.'
        ),
        parameters=[
            OpenApiParameter(
                name='search',
                description='Match against email, first name or last name.',
                required=False,
                type=str,
            )
        ],
        responses={
            200: UserSerializer(many=True),
            403: OpenApiResponse(description='Only owners and HR can manage employees.'),
        },
    )
    @action(detail=False, methods=['get'], url_path='linkable-users')
    def linkable_users(self, request):
        if not can_manage_employees(request.user):
            return Response(
                {'detail': 'Only owners and HR can manage employees.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        linked = Employee.objects.exclude(user=None).values_list('user_id', flat=True)
        users = (
            User.objects.filter(is_active=True)
            .exclude(id__in=list(linked))
            .exclude(role=User.Role.SUPER_ADMIN)
            .order_by('email')
        )
        tenant = getattr(request, 'tenant', None)
        if tenant is not None:
            users = users.filter(tenant=tenant)

        search = (request.query_params.get('search') or '').strip()
        if search:
            users = users.filter(
                Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )
        return Response(UserSerializer(users, many=True).data)
