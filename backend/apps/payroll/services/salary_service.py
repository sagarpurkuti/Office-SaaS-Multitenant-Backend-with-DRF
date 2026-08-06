from decimal import Decimal
from ..models import EmployeeSalary, SalaryStructureComponent

class SalaryService:
    @staticmethod
    def get_employee_salary(employee, effective_date):
        assignment = EmployeeSalary.objects.filter(
            employee=employee,
            effective_from__lte=effective_date,
            is_active=True
        ).order_by('-effective_from').first()
        if not assignment:
            return None
        structure = assignment.salary_structure
        gross = assignment.gross_salary
        basic_component = None
        basic_amount = Decimal('0.00')
        components = SalaryStructureComponent.objects.filter(
            salary_structure=structure,
            component__code='BASIC'
        )
        if components.exists():
            basic_comp = components.first()
            basic_component = basic_comp.component
            if basic_comp.calculation_type == 'FIXED':
                basic_amount = basic_comp.amount
            else:
                basic_amount = (basic_comp.amount / 100) * gross
        return {
            'salary_structure': structure,
            'gross_salary': gross,
            'basic_component': basic_component,
            'basic_amount': basic_amount,
        }

    @staticmethod
    def get_structure_components(structure, basic_amount):
        comps = []
        for sc in SalaryStructureComponent.objects.filter(salary_structure=structure).select_related('component'):
            if sc.calculation_type == 'FIXED':
                amount = sc.amount
            else:
                amount = (sc.amount / 100) * basic_amount
            comps.append({
                'component': sc.component,
                'type': sc.component.type,
                'amount': amount,
            })
        return comps