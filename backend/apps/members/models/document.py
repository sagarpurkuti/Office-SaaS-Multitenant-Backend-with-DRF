from django.db import models
from .member import Member

class MemberDocument(models.Model):
    class DocumentType(models.TextChoices):
        CITIZENSHIP = 'CITIZENSHIP', 'Citizenship'
        PAN = 'PAN', 'PAN'
        PASSPORT = 'PASSPORT', 'Passport'
        OTHER = 'OTHER', 'Other'

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DocumentType.choices)
    title = models.CharField(max_length=100)
    file = models.FileField(upload_to='members/documents/')
    expiry_date = models.DateField(null=True, blank=True)
    verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)