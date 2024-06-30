from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from django.contrib.auth.models import update_last_login
from .userSerializer import UserSerializer

class LoginSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = self.get_token(self.user)
        try:
            data['user'] = UserSerializer(self.user).data
            data['refresh'] = str(refresh)
            data['access'] = str(refresh.access_token)
        except Exception as e: 
            print(f'the error as :- {e}')
        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)

        return data