from rest_framework import serializers
from .models import Member, MemberKYC, Nominee, MemberDocument

class MemberKYCSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberKYC
        fields = '__all__'

class NomineeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nominee
        fields = '__all__'

class MemberDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberDocument
        fields = '__all__'

class MemberSerializer(serializers.ModelSerializer):
    kyc = MemberKYCSerializer(required=False)
    nominees = NomineeSerializer(many=True, required=False)
    documents = MemberDocumentSerializer(many=True, required=False)

    class Meta:
        model = Member
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

    def create(self, validated_data):
        kyc_data = validated_data.pop('kyc', None)
        nominees_data = validated_data.pop('nominees', [])
        documents_data = validated_data.pop('documents', [])
        member = Member.objects.create(**validated_data)
        if kyc_data:
            MemberKYC.objects.create(member=member, **kyc_data)
        for nominee in nominees_data:
            Nominee.objects.create(member=member, **nominee)
        for doc in documents_data:
            MemberDocument.objects.create(member=member, **doc)
        return member

    def update(self, instance, validated_data):
        # Simplified update – handle nested similarly
        kyc_data = validated_data.pop('kyc', None)
        if kyc_data:
            if hasattr(instance, 'kyc'):
                for attr, value in kyc_data.items():
                    setattr(instance.kyc, attr, value)
                instance.kyc.save()
            else:
                MemberKYC.objects.create(member=instance, **kyc_data)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance