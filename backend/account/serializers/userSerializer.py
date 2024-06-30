from rest_framework import serializers
from account.models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'phone_number', 'is_owner_admin', 'is_staff', 'is_active',
                  'date_joined']
        # List of all the fields that can only be read by the user
        read_only_field = ['email', 'is_active']

    def update(self, instance, data):
        instance.first_name = data.get('first_name', instance.last_name)
        instance.last_name = data.get('last_name', instance.last_name)
        instance.phone_number = data.get('phone_number', instance.phone_number)
        instance.save()
        return instance