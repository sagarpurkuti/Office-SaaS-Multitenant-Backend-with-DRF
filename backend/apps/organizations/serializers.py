from rest_framework import serializers
from .models import (
    Organization, Branch, Department, Designation,
    FiscalYear, Holiday, CompanySetting
)

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

class FiscalYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = FiscalYear
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

class CompanySettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySetting
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')


class WorkspaceCountsSerializer(serializers.Serializer):
    employees = serializers.IntegerField()
    members = serializers.IntegerField()
    branches = serializers.IntegerField()
    departments = serializers.IntegerField()


class WorkspaceDashboardSerializer(serializers.Serializer):
    tenant_name = serializers.CharField()
    schema_name = serializers.CharField()
    on_trial = serializers.BooleanField(allow_null=True)
    organization = OrganizationSerializer(allow_null=True)
    settings = CompanySettingSerializer(allow_null=True)
    counts = WorkspaceCountsSerializer()
