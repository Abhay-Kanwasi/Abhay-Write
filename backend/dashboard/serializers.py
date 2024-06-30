from rest_framework import serializers
from .models import Gallery

class GallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gallery
        fields = ['title', 'description', 'image', 'genere', 'language', 'year', 'created_by', 'uploaded_time']
