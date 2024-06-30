from rest_framework_simplejwt import views as jwt_views
from django.urls import path

from .views.userViews import login, register, activate, resetPassword, forgotPassword
from .views.loggingViews import loggingApi, loggingDownload,download_logs

urlpatterns = [
    path('api/token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('api/login/', login, name='login'),
    path('api/register/', register, name='register'),
    path('api/activate/', activate, name='activate'),
    path('api/resetPassword/', resetPassword, name='resetPassword'),
    path('api/forgotPassword/', forgotPassword, name='forgotPassword'),
    path('api/logging/', loggingApi, name='loggingApi'),
    path('api/loggingDownload/', loggingDownload, name='loggingDownload'),
    path('api/download_logs/', download_logs, name='download_logs')
    # path('api/addUser/', addUser, name='addUser'),
]
