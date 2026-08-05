from django.db import models
from .member import Member

class Nominee(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='nominees')
    name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=50)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)  # share percentage
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def clean(self):
        # Validate that total percentage does not exceed 100 for the member
        pass