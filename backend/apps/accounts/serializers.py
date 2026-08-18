from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'phone',
            'role',
            'is_active',
            'tenant',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'tenant', 'created_at', 'updated_at')

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        user = authenticate(email=email, password=password)
        if user is None:
            raise serializers.ValidationError('Invalid email or password')
        if not user.is_active:
            raise serializers.ValidationError('User is inactive')
        # Ensure user belongs to the current tenant (from request)
        request = self.context.get('request')
        if request and hasattr(request, 'tenant'):
            tenant = request.tenant
            if user.tenant and user.tenant != tenant:
                # User belongs to a different tenant; deny access
                raise serializers.ValidationError('User does not belong to this tenant')
            # Super admins can belong to no tenant and access any
            if not user.is_super_admin() and not user.tenant:
                # Non-superadmins must have a tenant
                raise serializers.ValidationError('User is not assigned to a tenant')
        data['user'] = user
        return data

class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(
        write_only=True,
        help_text='Refresh token to revoke.',
    )

class DetailSerializer(serializers.Serializer):
    detail = serializers.CharField()

class ErrorSerializer(serializers.Serializer):
    error = serializers.CharField()

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect')
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user