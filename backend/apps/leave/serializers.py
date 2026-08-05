from rest_framework import serializers
from .models import LeaveType, LeaveRequest, LeaveApproval

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'

class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = '__all__'
        read_only_fields = ('status', 'applied_at', 'updated_at')

    def validate(self, data):
        if data['from_date'] > data['to_date']:
            raise serializers.ValidationError("From date must be before to date.")
        return data

class LeaveApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveApproval
        fields = '__all__'