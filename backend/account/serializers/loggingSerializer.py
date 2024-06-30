from rest_framework import serializers
from ..models import Logging

class LoggingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Logging
        fields = ('LoggingID', 'LogLevel',
                  'LogActivity', 'LogData', 'LogDetails')
        
