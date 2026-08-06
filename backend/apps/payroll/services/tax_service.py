from decimal import Decimal
from ..models import TaxSlab

class TaxService:
    @staticmethod
    def calculate_monthly_tax(annual_income, fiscal_year, organization):
        annual = annual_income
        slabs = TaxSlab.objects.filter(
            organization=organization,
            fiscal_year=fiscal_year,
            is_active=True
        ).order_by('from_amount')
        tax = Decimal('0.00')
        remaining = annual
        for slab in slabs:
            if remaining <= 0:
                break
            if slab.to_amount:
                slab_income = min(remaining, slab.to_amount - slab.from_amount)
            else:
                slab_income = remaining
            tax += slab_income * (slab.percentage / 100)
            remaining -= slab_income
        return tax / 12  # monthly tax