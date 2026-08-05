from rest_framework import serializers
from .models import Shift, EmployeeShift, Attendance, AttendanceLog, WeekendPolicy

class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = '__all__'

class EmployeeShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeShift
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ('worked_minutes', 'late_minutes', 'early_leave_minutes', 'overtime_minutes', 'status')

class AttendanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceLog
        fields = '__all__'

class WeekendPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = WeekendPolicy
        fields = '__all__'

class CheckInSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    device = serializers.CharField(required=False)

class CheckOutSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    device = serializers.CharField(required=False)