from rest_framework import serializers
from .models import (
    Employee, EmployeeProfile, EmployeeAddress, EmployeeEducation,
    EmployeeExperience, EmployeeDocument, EmployeeEmergencyContact
)

class EmployeeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeProfile
        fields = '__all__'

class EmployeeAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeAddress
        fields = '__all__'

class EmployeeEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeEducation
        fields = '__all__'

class EmployeeExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeExperience
        fields = '__all__'

class EmployeeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeDocument
        fields = '__all__'

class EmployeeEmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeEmergencyContact
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    profile = EmployeeProfileSerializer(required=False)
    addresses = EmployeeAddressSerializer(many=True, required=False)
    educations = EmployeeEducationSerializer(many=True, required=False)
    experiences = EmployeeExperienceSerializer(many=True, required=False)
    documents = EmployeeDocumentSerializer(many=True, required=False)
    emergency_contacts = EmployeeEmergencyContactSerializer(many=True, required=False)

    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        addresses_data = validated_data.pop('addresses', [])
        educations_data = validated_data.pop('educations', [])
        experiences_data = validated_data.pop('experiences', [])
        documents_data = validated_data.pop('documents', [])
        emergency_contacts_data = validated_data.pop('emergency_contacts', [])
        employee = Employee.objects.create(**validated_data)
        if profile_data:
            EmployeeProfile.objects.create(employee=employee, **profile_data)
        for addr in addresses_data:
            EmployeeAddress.objects.create(employee=employee, **addr)
        for edu in educations_data:
            EmployeeEducation.objects.create(employee=employee, **edu)
        for exp in experiences_data:
            EmployeeExperience.objects.create(employee=employee, **exp)
        for doc in documents_data:
            EmployeeDocument.objects.create(employee=employee, **doc)
        for ec in emergency_contacts_data:
            EmployeeEmergencyContact.objects.create(employee=employee, **ec)
        return employee

    def update(self, instance, validated_data):
        # Handle nested updates (simplified – for production, use proper nested serializers)
        profile_data = validated_data.pop('profile', None)
        if profile_data:
            if hasattr(instance, 'profile'):
                for attr, value in profile_data.items():
                    setattr(instance.profile, attr, value)
                instance.profile.save()
            else:
                EmployeeProfile.objects.create(employee=instance, **profile_data)
        # For lists, we'll just replace all (or ignore for brevity)
        # In production, use WritableNestedModelSerializer or DRF's built-in.
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance