from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from datetime import date
from django.db import models
from apps.employees.models import Employee
from apps.attendance.models import Attendance
from .salary_service import SalaryService
from .tax_service import TaxService
from .overtime_service import OvertimeService
from .loan_service import LoanService
from .advance_service import AdvanceService
from .bonus_service import BonusService
from ..models import Payroll, PayrollItem, SalaryComponent, Loan, AdvanceSalary

class PayrollService:
    @staticmethod
    def generate_payroll_for_employee(employee, year, month, generated_by):
        # 1. Get salary structure and basic salary
        salary_data = SalaryService.get_employee_salary(employee, date(year, month, 1))
        if not salary_data:
            raise ValueError("No active salary assignment for this employee.")

        salary_structure = salary_data['salary_structure']
        gross_salary = salary_data['gross_salary']
        basic_amount = salary_data['basic_amount']

        # 2. Get attendance for the month
        attendances = Attendance.objects.filter(
            employee=employee,
            date__year=year,
            date__month=month
        )

        # Calculate overtime minutes
        overtime_minutes = attendances.aggregate(total_ot=models.Sum('overtime_minutes'))['total_ot'] or 0
        working_days_in_month = 26  # rough, can be computed based on weekends/holidays
        hourly_rate = basic_amount / Decimal(str(working_days_in_month * 8))
        overtime_amount = OvertimeService.calculate_overtime_amount(overtime_minutes, hourly_rate)

        # Unpaid leave deduction (simplified: count ABSENT days)
        absent_days = attendances.filter(status=Attendance.Status.ABSENT).count()
        daily_rate = basic_amount / Decimal(str(working_days_in_month))
        unpaid_deduction = absent_days * daily_rate

        # 3. Loan deductions
        loan_deduction = LoanService.calculate_total_loan_deduction(employee)

        # 4. Advance deductions
        advance_deduction = AdvanceService.calculate_total_advance_deduction(employee)

        # 5. Bonuses
        bonuses = BonusService.get_bonuses_for_month(employee, month, year)
        total_bonus = sum(b.amount for b in bonuses) if bonuses else Decimal('0.00')

        # 6. Allowances and deductions from salary structure
        components = SalaryService.get_structure_components(salary_structure, basic_amount)
        allowance_total = Decimal('0.00')
        deduction_total = Decimal('0.00')
        for comp in components:
            if comp['type'] == 'ALLOWANCE':
                allowance_total += comp['amount']
            else:
                deduction_total += comp['amount']

        allowance_total += overtime_amount + total_bonus

        # 7. Tax calculation (using annual gross)
        annual_income = gross_salary * 12
        tax = TaxService.calculate_monthly_tax(annual_income, '2082/83', employee.organization)

        # 8. Net salary
        total_deduction = deduction_total + loan_deduction + advance_deduction + unpaid_deduction + tax
        net_salary = gross_salary + allowance_total - total_deduction

        # 9. Create Payroll
        with transaction.atomic():
            payroll = Payroll.objects.create(
                employee=employee,
                year=year,
                month=month,
                gross_salary=gross_salary,
                total_allowance=allowance_total,
                total_deduction=deduction_total,  # excluding tax? We'll separate
                tax=tax,
                net_salary=net_salary,
                status=Payroll.Status.DRAFT,
                generated_by=generated_by
            )

            # Create payroll items for structure components
            for comp in components:
                if comp['type'] == 'ALLOWANCE':
                    PayrollItem.objects.create(
                        payroll=payroll,
                        component=comp['component'],
                        amount=comp['amount'],
                        description=f"{comp['component'].name} (from structure)"
                    )
                else:
                    PayrollItem.objects.create(
                        payroll=payroll,
                        component=comp['component'],
                        amount=-comp['amount'],
                        description=f"{comp['component'].name} (from structure)"
                    )

            # Overtime item
            if overtime_amount > 0:
                ot_component, _ = SalaryComponent.objects.get_or_create(
                    organization=employee.organization,
                    code='OVERTIME',
                    defaults={'name': 'Overtime', 'type': 'ALLOWANCE', 'is_taxable': True}
                )
                PayrollItem.objects.create(
                    payroll=payroll,
                    component=ot_component,
                    amount=overtime_amount,
                    description=f"Overtime ({overtime_minutes} mins)"
                )

            # Bonuses
            for bonus in bonuses:
                bonus_component, _ = SalaryComponent.objects.get_or_create(
                    organization=employee.organization,
                    code='BONUS',
                    defaults={'name': 'Bonus', 'type': 'ALLOWANCE', 'is_taxable': True}
                )
                PayrollItem.objects.create(
                    payroll=payroll,
                    component=bonus_component,
                    amount=bonus.amount,
                    description=f"Bonus: {bonus.reason}"
                )
                bonus.is_paid = True
                bonus.save()

            # Loan deductions
            for loan in LoanService.get_active_loans(employee):
                loan_component, _ = SalaryComponent.objects.get_or_create(
                    organization=employee.organization,
                    code='LOAN',
                    defaults={'name': 'Loan Deduction', 'type': 'DEDUCTION', 'is_taxable': False}
                )
                PayrollItem.objects.create(
                    payroll=payroll,
                    component=loan_component,
                    amount=-loan.monthly_installment,
                    description=f"Loan repayment (ID {loan.id})"
                )
                loan.remaining_balance -= loan.monthly_installment
                if loan.remaining_balance <= 0:
                    loan.status = Loan.Status.COMPLETED
                loan.save()

            # Advance deductions
            for adv in AdvanceService.get_active_advances(employee):
                adv_component, _ = SalaryComponent.objects.get_or_create(
                    organization=employee.organization,
                    code='ADVANCE',
                    defaults={'name': 'Advance Deduction', 'type': 'DEDUCTION', 'is_taxable': False}
                )
                PayrollItem.objects.create(
                    payroll=payroll,
                    component=adv_component,
                    amount=-adv.monthly_deduction,
                    description=f"Advance repayment (ID {adv.id})"
                )
                adv.remaining_balance -= adv.monthly_deduction
                if adv.remaining_balance <= 0:
                    adv.status = AdvanceSalary.Status.COMPLETED
                adv.save()

            # Unpaid leave deduction
            if unpaid_deduction > 0:
                leave_comp, _ = SalaryComponent.objects.get_or_create(
                    organization=employee.organization,
                    code='UNPAID_LEAVE',
                    defaults={'name': 'Unpaid Leave Deduction', 'type': 'DEDUCTION', 'is_taxable': False}
                )
                PayrollItem.objects.create(
                    payroll=payroll,
                    component=leave_comp,
                    amount=-unpaid_deduction,
                    description=f"Unpaid leave deduction for {absent_days} days"
                )

            # Tax item
            if tax > 0:
                tax_comp, _ = SalaryComponent.objects.get_or_create(
                    organization=employee.organization,
                    code='TAX',
                    defaults={'name': 'Income Tax', 'type': 'DEDUCTION', 'is_taxable': False}
                )
                PayrollItem.objects.create(
                    payroll=payroll,
                    component=tax_comp,
                    amount=-tax,
                    description="Monthly income tax"
                )

        return payroll

    @staticmethod
    def generate_payroll_for_month(year, month, organization, generated_by):
        employees = Employee.objects.filter(
            organization=organization,
            status=Employee.Status.ACTIVE
        )
        payrolls = []
        for emp in employees:
            try:
                payroll = PayrollService.generate_payroll_for_employee(emp, year, month, generated_by)
                payrolls.append(payroll)
            except Exception as e:
                # Log error and continue
                print(f"Error generating payroll for {emp.employee_id}: {e}")
        return payrolls