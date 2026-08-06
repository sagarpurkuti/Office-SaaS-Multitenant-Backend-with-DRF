from ..models import Bonus

class BonusService:
    @staticmethod
    def get_bonuses_for_month(employee, month, year):
        return Bonus.objects.filter(employee=employee, month=month, year=year, is_paid=False)