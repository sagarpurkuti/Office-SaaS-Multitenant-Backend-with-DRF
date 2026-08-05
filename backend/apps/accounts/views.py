from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import OpenApiResponse, extend_schema
from .serializers import (
    ChangePasswordSerializer,
    DetailSerializer,
    ErrorSerializer,
    LoginSerializer,
    LogoutSerializer,
    TokenResponseSerializer,
    UserSerializer,
)

@extend_schema(
    tags=['Authentication'],
    summary='Log in',
    description=(
        'Authenticate an active user in the current tenant and return a JWT '
        'access/refresh pair together with the user profile.'
    ),
    request=LoginSerializer,
    responses={
        200: TokenResponseSerializer,
        400: OpenApiResponse(description='Invalid credentials, inactive user, or tenant mismatch.'),
    },
)
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        user_serializer = UserSerializer(user)
        response_data = {
            'access': access_token,
            'refresh': refresh_token,
            'user': user_serializer.data
        }
        return Response(response_data, status=status.HTTP_200_OK)

@extend_schema(
    tags=['Authentication'],
    summary='Log out',
    description='Revoke a refresh token by adding it to the token blacklist.',
    request=LogoutSerializer,
    responses={
        200: DetailSerializer,
        400: ErrorSerializer,
        401: OpenApiResponse(description='Authentication credentials were not provided or are invalid.'),
    },
)
class LogoutView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    tags=['Authentication'],
    summary='Get current user',
    description='Return the profile associated with the authenticated access token.',
    responses={
        200: UserSerializer,
        401: OpenApiResponse(description='Authentication credentials were not provided or are invalid.'),
    },
)
class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

@extend_schema(
    tags=['Authentication'],
    summary='Change password',
    description='Validate the current password and replace it with a policy-compliant new password.',
    request=ChangePasswordSerializer,
    responses={
        200: DetailSerializer,
        400: OpenApiResponse(description='The current password is wrong or the new password is invalid.'),
        401: OpenApiResponse(description='Authentication credentials were not provided or are invalid.'),
    },
)
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password changed successfully'}, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Authentication'],
    summary='Refresh access token',
    description=(
        'Exchange a valid refresh token for a new access token. Token rotation '
        'may also return a replacement refresh token.'
    ),
)
class DocumentedTokenRefreshView(TokenRefreshView):
    pass