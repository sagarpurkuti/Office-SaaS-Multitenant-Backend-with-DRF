from decimal import Decimal
from ..models import AdvanceSalary

class AdvanceService:
    @staticmethod
    def get_active_advances(employee):
        return AdvanceSalary.objects.filter(
            employee=employee,
            status__in=[AdvanceSalary.Status.APPROVED, AdvanceSalary.Status.PAID]
        )

    @staticmethod
    def calculate_total_advance_deduction(employee):
        total = Decimal('0.00')
        for adv in AdvanceService.get_active_advances(employee):
            total += adv.monthly_deduction
        return total