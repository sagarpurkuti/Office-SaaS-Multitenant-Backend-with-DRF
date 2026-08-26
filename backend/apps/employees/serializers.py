from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers
from apps.accounts.models import User
from apps.organizations.models import Organization
from .models import (
    Employee, EmployeeProfile, EmployeeAddress, EmployeeEducation,
    EmployeeExperience, EmployeeDocument, EmployeeEmergencyContact
)


class EmployeeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeProfile
        fields = '__all__'
        # Written through the parent serializer, which owns the relation.
        read_only_fields = ('employee',)

class EmployeeAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeAddress
        fields = '__all__'
        read_only_fields = ('employee',)

class EmployeeEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeEducation
        fields = '__all__'
        read_only_fields = ('employee',)

class EmployeeExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeExperience
        fields = '__all__'
        read_only_fields = ('employee',)

class EmployeeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeDocument
        fields = '__all__'
        read_only_fields = ('employee',)

class EmployeeEmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeEmergencyContact
        fields = '__all__'
        read_only_fields = ('employee',)


class EmployeeAccountSerializer(serializers.Serializer):
    """
    Login provisioned together with a new employee.

    Users live in the shared schema, so the tenant is taken from the request
    rather than the payload — a tenant can never create a user for another one.
    """

    ASSIGNABLE_ROLES = [
        (value, label)
        for value, label in User.Role.choices
        if value != User.Role.SUPER_ADMIN
    ]

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    role = serializers.ChoiceField(choices=ASSIGNABLE_ROLES, default=User.Role.EMPLOYEE)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value


class EmployeeSerializer(serializers.ModelSerializer):
    profile = EmployeeProfileSerializer(required=False)
    addresses = EmployeeAddressSerializer(many=True, required=False)
    educations = EmployeeEducationSerializer(many=True, required=False)
    experiences = EmployeeExperienceSerializer(many=True, required=False)
    documents = EmployeeDocumentSerializer(many=True, required=False)
    emergency_contacts = EmployeeEmergencyContactSerializer(many=True, required=False)

    # Either link an existing login (`user`) or provision a new one (`account`).
    account = EmployeeAccountSerializer(write_only=True, required=False)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')
        extra_kwargs = {
            # Defaults to the tenant's organization, see `_organization()`.
            'organization': {'required': False},
        }

    def get_full_name(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.full_name if profile else ''

    def validate_user(self, value):
        if value is None:
            return value
        tenant = getattr(self.context.get('request'), 'tenant', None)
        if tenant is not None and value.tenant_id != tenant.id:
            raise serializers.ValidationError('That account belongs to another tenant.')
        linked = Employee.objects.filter(user=value)
        if self.instance:
            linked = linked.exclude(pk=self.instance.pk)
        if linked.exists():
            raise serializers.ValidationError('That account is already linked to an employee.')
        return value

    def validate(self, attrs):
        if attrs.get('user') and attrs.get('account'):
            raise serializers.ValidationError(
                'Link an existing account or create a new one, not both.'
            )
        if self.instance is None and not attrs.get('profile'):
            raise serializers.ValidationError(
                {'profile': 'Personal details are required to create an employee.'}
            )
        return attrs

    def _organization(self, validated_data):
        """A tenant schema holds exactly one organization, so it need not be sent."""
        organization = validated_data.pop('organization', None)
        if organization:
            return organization
        organization = Organization.objects.order_by('id').first()
        if organization is None:
            raise serializers.ValidationError(
                {'organization': 'Set up the organization profile before adding employees.'}
            )
        return organization

    def _create_account(self, account_data, profile_data):
        request = self.context.get('request')
        tenant = getattr(request, 'tenant', None)
        names = profile_data or {}
        return User.objects.create_user(
            email=account_data['email'],
            password=account_data['password'],
            role=account_data.get('role', User.Role.EMPLOYEE),
            first_name=names.get('first_name', ''),
            last_name=names.get('last_name', ''),
            tenant=tenant,
        )

    @transaction.atomic
    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        account_data = validated_data.pop('account', None)
        addresses_data = validated_data.pop('addresses', [])
        educations_data = validated_data.pop('educations', [])
        experiences_data = validated_data.pop('experiences', [])
        documents_data = validated_data.pop('documents', [])
        emergency_contacts_data = validated_data.pop('emergency_contacts', [])

        validated_data['organization'] = self._organization(validated_data)
        if account_data:
            validated_data['user'] = self._create_account(account_data, profile_data)

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

    @transaction.atomic
    def update(self, instance, validated_data):
        # Nested lists are managed through their own endpoints; only the
        # one-to-one profile is written here.
        validated_data.pop('account', None)
        validated_data.pop('addresses', None)
        validated_data.pop('educations', None)
        validated_data.pop('experiences', None)
        validated_data.pop('documents', None)
        validated_data.pop('emergency_contacts', None)
        profile_data = validated_data.pop('profile', None)

        if profile_data:
            profile = getattr(instance, 'profile', None)
            if profile:
                for attr, value in profile_data.items():
                    setattr(profile, attr, value)
                profile.save()
            else:
                EmployeeProfile.objects.create(employee=instance, **profile_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
