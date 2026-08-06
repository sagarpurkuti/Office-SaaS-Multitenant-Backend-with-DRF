from decimal import Decimal
from ..models import Loan

class LoanService:
    @staticmethod
    def get_active_loans(employee):
        return Loan.objects.filter(employee=employee, status=Loan.Status.ACTIVE)

    @staticmethod
    def calculate_total_loan_deduction(employee):
        total = Decimal('0.00')
        for loan in LoanService.get_active_loans(employee):
            total += loan.monthly_installment
        return total