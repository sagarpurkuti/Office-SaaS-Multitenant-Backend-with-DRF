from decimal import Decimal

class OvertimeService:
    @staticmethod
    def calculate_overtime_amount(overtime_minutes, hourly_rate):
        hours = overtime_minutes / 60
        return Decimal(str(hours)) * hourly_rate