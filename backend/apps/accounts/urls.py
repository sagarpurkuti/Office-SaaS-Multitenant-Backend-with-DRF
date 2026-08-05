from django.urls import path
from .views import (
    ChangePasswordView,
    DocumentedTokenRefreshView,
    LoginView,
    LogoutView,
    MeView,
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', DocumentedTokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]