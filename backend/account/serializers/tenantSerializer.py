from rest_framework import serializers
from django.contrib.auth.models import User
from ..models import Tenant, user_directory_path
from django.conf import settings


class TenantSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tenant
        fields = ['name', 'website', 'logo', 'timezone']
        # List of all the fields that can only be read by the user
        read_only_field = []

    def update(self, instance, data):
        user_directory_path(instance=instance, filename='logo.png')
        instance.name = data.get('name', instance.name)
        instance.website = data.get('website', instance.website)
        instance.timezone = data.get('timezone', instance.timezone)
        instance.logo = data.get('logo', instance.logo)
        instance.save()
        return instance