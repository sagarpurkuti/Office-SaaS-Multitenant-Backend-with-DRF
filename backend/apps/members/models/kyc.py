from django.db import models
from .member import Member
from apps.accounts.models import User

class MemberKYC(models.Model):
    member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='kyc')
    citizenship = models.FileField(upload_to='members/kyc/citizenship/', blank=True, null=True)
    pan = models.FileField(upload_to='members/kyc/pan/', blank=True, null=True)
    photo = models.ImageField(upload_to='members/kyc/photo/', blank=True, null=True)
    signature = models.ImageField(upload_to='members/kyc/signature/', blank=True, null=True)
    fingerprint = models.TextField(blank=True, null=True)  # store hash
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='kyc_verified')
    verified_at = models.DateTimeField(null=True, blank=True)