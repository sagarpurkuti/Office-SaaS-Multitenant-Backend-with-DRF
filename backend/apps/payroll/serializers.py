from rest_framework import serializers
from .models import (
    SalaryComponent, SalaryStructure, SalaryStructureComponent,
    EmployeeSalary, Payroll, PayrollItem, Bonus, Loan,
    AdvanceSalary, TaxSlab
)

class SalaryComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryComponent
        fields = '__all__'

class SalaryStructureComponentSerializer(serializers.ModelSerializer):
    component = SalaryComponentSerializer(read_only=True)
    component_id = serializers.PrimaryKeyRelatedField(
        queryset=SalaryComponent.objects.all(), source='component', write_only=True
    )

    class Meta:
        model = SalaryStructureComponent
        fields = ['id', 'component', 'component_id', 'amount', 'calculation_type', 'order']

class SalaryStructureSerializer(serializers.ModelSerializer):
    components = SalaryStructureComponentSerializer(many=True, read_only=True)
    component_ids = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=SalaryComponent.objects.all()),
        write_only=True, required=False
    )

    class Meta:
        model = SalaryStructure
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def create(self, validated_data):
        component_ids = validated_data.pop('component_ids', [])
        structure = SalaryStructure.objects.create(**validated_data)
        for idx, comp in enumerate(component_ids):
            SalaryStructureComponent.objects.create(
                salary_structure=structure,
                component=comp,
                amount=0,
                calculation_type='FIXED',
                order=idx
            )
        return structure

class EmployeeSalarySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeSalary
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class PayrollItemSerializer(serializers.ModelSerializer):
    component = SalaryComponentSerializer(read_only=True)

    class Meta:
        model = PayrollItem
        fields = ['id', 'component', 'amount', 'description']

class PayrollSerializer(serializers.ModelSerializer):
    items = PayrollItemSerializer(many=True, read_only=True)
    employee_name = serializers.CharField(source='employee.user.full_name', read_only=True)

    class Meta:
        model = Payroll
        fields = '__all__'
        read_only_fields = ('generated_at', 'updated_at')

class BonusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bonus
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class LoanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class AdvanceSalarySerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvanceSalary
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class TaxSlabSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxSlab
        fields = '__all__'