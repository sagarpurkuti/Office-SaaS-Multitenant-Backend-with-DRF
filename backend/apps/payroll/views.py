from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.accounts.permissions import IsTenantUser
from .models import (
    SalaryComponent, SalaryStructure, EmployeeSalary, Payroll,
    Bonus, Loan, AdvanceSalary, TaxSlab
)
from .serializers import (
    SalaryComponentSerializer, SalaryStructureSerializer, EmployeeSalarySerializer,
    PayrollSerializer, BonusSerializer, LoanSerializer,
    AdvanceSalarySerializer, TaxSlabSerializer
)
from .services.payroll_service import PayrollService
from .services.payslip_service import PayslipService
from .permissions import IsOwnerOrHR, IsOwnerOrFinance

class SalaryComponentViewSet(viewsets.ModelViewSet):
    queryset = SalaryComponent.objects.all()
    serializer_class = SalaryComponentSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser, IsOwnerOrHR]

class SalaryStructureViewSet(viewsets.ModelViewSet):
    queryset = SalaryStructure.objects.all()
    serializer_class = SalaryStructureSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser, IsOwnerOrHR]

class EmployeeSalaryViewSet(viewsets.ModelViewSet):
    queryset = EmployeeSalary.objects.all()
    serializer_class = EmployeeSalarySerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser, IsOwnerOrHR]

class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee')
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month and year:
            queryset = queryset.filter(month=month, year=year)
        return queryset

    @action(detail=False, methods=['post'])
    def generate(self, request):
        month = request.data.get('month')
        year = request.data.get('year')
        employee_id = request.data.get('employee')
        if not month or not year:
            return Response({'error': 'month and year are required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            month = int(month)
            year = int(year)
        except ValueError:
            return Response({'error': 'Invalid month/year'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if employee_id:
            from apps.employees.models import Employee
            employee = get_object_or_404(Employee, id=employee_id)
            if employee.organization != request.tenant:
                return Response({'error': 'Employee not in this tenant'}, status=status.HTTP_403_FORBIDDEN)
            try:
                payroll = PayrollService.generate_payroll_for_employee(employee, year, month, user)
                serializer = PayrollSerializer(payroll)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            payrolls = PayrollService.generate_payroll_for_month(year, month, request.tenant, user)
            serializer = PayrollSerializer(payrolls, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        payroll = self.get_object()
        if payroll.status != Payroll.Status.DRAFT:
            return Response({'error': 'Only draft payroll can be approved'}, status=status.HTTP_400_BAD_REQUEST)
        # Only Owner or Finance (Accountant) can approve
        if not (request.user.is_owner() or request.user.role == 'ACCOUNTANT'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        payroll.status = Payroll.Status.APPROVED
        payroll.save()
        return Response(PayrollSerializer(payroll).data)

    @action(detail=True, methods=['post'])
    def lock(self, request, pk=None):
        payroll = self.get_object()
        if payroll.status != Payroll.Status.APPROVED:
            return Response({'error': 'Only approved payroll can be locked'}, status=status.HTTP_400_BAD_REQUEST)
        if not (request.user.is_owner() or request.user.is_hr()):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        payroll.status = Payroll.Status.LOCKED
        payroll.save()
        return Response(PayrollSerializer(payroll).data)

    @action(detail=True, methods=['get'])
    def payslip(self, request, pk=None):
        payroll = self.get_object()
        try:
            pdf = PayslipService.generate_payslip_pdf(payroll)
            response = Response(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="payslip_{payroll.employee.employee_id}_{payroll.month}_{payroll.year}.pdf"'
            return response
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def export(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        format = request.query_params.get('format', 'excel')
        if not month or not year:
            return Response({'error': 'month and year required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            month = int(month)
            year = int(year)
        except ValueError:
            return Response({'error': 'Invalid month/year'}, status=status.HTTP_400_BAD_REQUEST)
        payrolls = Payroll.objects.filter(month=month, year=year, employee__organization=request.tenant)
        if format == 'excel':
            file_data = PayslipService.export_payroll_excel(payrolls, month, year)
            response = Response(file_data, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="payroll_{month}_{year}.xlsx"'
            return response
        elif format == 'csv':
            file_data = PayslipService.export_payroll_csv(payrolls, month, year)
            response = Response(file_data, content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="payroll_{month}_{year}.csv"'
            return response
        else:
            return Response({'error': 'Format must be excel or csv'}, status=status.HTTP_400_BAD_REQUEST)

class BonusViewSet(viewsets.ModelViewSet):
    queryset = Bonus.objects.all()
    serializer_class = BonusSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser, IsOwnerOrHR]

class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser, IsOwnerOrHR]

class AdvanceSalaryViewSet(viewsets.ModelViewSet):
    queryset = AdvanceSalary.objects.all()
    serializer_class = AdvanceSalarySerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser, IsOwnerOrHR]

class TaxSlabViewSet(viewsets.ModelViewSet):
    queryset = TaxSlab.objects.all()
    serializer_class = TaxSlabSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser, IsOwnerOrHR]