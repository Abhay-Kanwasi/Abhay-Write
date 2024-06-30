from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework import viewsets, status
from rest_framework.response import Response

from django.http import FileResponse, JsonResponse
from django.contrib.auth.password_validation import get_default_password_validators, validate_password
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_exempt
from django.db import DatabaseError, transaction
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

import traceback, sys, os

# logger configuration
import logging
logger = logging.getLogger(__name__)


# user defined imports
from ..serializers.loginSerializer import LoginSerializer
from ..serializers.tenantSerializer import TenantSerializer
from ..serializers.userSerializer import UserSerializer
from ..models import Tenant, CustomUser
from ..dao.loggingservice import logging_service
from ..utils.WebUtil import *


@api_view(['POST'])
def login(request):
    try:
        user = CustomUser.objects.get(email=request.data['email'])
        if user is not None and user.is_active is False:
            logger.debug(f'the otp is :- {user}')
            data = {
                'active_status': 'inactive',
                'otp': user.otp
            }

            return JsonResponse(data, status=status.HTTP_412_PRECONDITION_FAILED)
        serializer = LoginSerializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        logging_service("LOGIN", "User Login", f"User login successfully!")
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
    except InvalidToken as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as error:
        print("error", error)
        return JsonResponse({'error': str(error)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@csrf_exempt
def register(request):
    tenant_name = request.data['tenant_name']
    if tenant_name is None or tenant_name == '':
        return JsonResponse({'error': [_('Tenant Name cannot be empty.')]}, status=status.HTTP_406_NOT_ACCEPTABLE)

    email = request.data['email']
    if email is None or email == '':
        return JsonResponse({'error': [_('Email cannot be empty.')]}, status=status.HTTP_406_NOT_ACCEPTABLE)

    password1 = request.data['password1']
    email = email.lower()
    tenant = Tenant.objects.filter(name=tenant_name).first()
    user = CustomUser(email=email, tenant=tenant)

    try:
        validate_password(password1, user=user, password_validators=get_default_password_validators())
    except ValidationError as ve:
        logger.error(ve)
        errors = f'Password not valid. Please try a strong password "{str(ve)}"'
        return JsonResponse({"error": [errors]}, status=status.HTTP_406_NOT_ACCEPTABLE)

    password2 = request.data['password2']
    if password1 != password2:
        logger.debug("Password mismatch")
        return JsonResponse({"error": [_('Passwords do not match.')]}, status=status.HTTP_406_NOT_ACCEPTABLE)

    # Check if the email already exists for the given tenant
    existing_user = CustomUser.objects.filter(email=email, tenant=tenant).first()
    if existing_user:
        logger.debug("User exists")
        return JsonResponse({"error": [_('You are already registered.')]}, status=status.HTTP_406_NOT_ACCEPTABLE)

    try:
        with transaction.atomic():
            tenant = Tenant(name=tenant_name)
            logger.debug('Adding tenant ' + tenant_name)
            logger.debug(tenant.id)
            user.set_password(password1)
            user.is_owner_admin = True
            user.is_active = False
            user.tenant = tenant
            user.otp = generateOTP()
            user.first_name = ''
            tenant.save()
            user.save()
            sendVerificationEmail(request, user)
            return JsonResponse({
                'success': [_(
                    'Registration successful; click the link sent to your email to activate the account.')]},
                status=status.HTTP_200_OK)
    except DatabaseError as dte:
        trace_back = traceback.format_exc()
        logger.error(
            'Error saving tenant ' + tenant_name + ' and user ' + email + ' ' + str(dte) + ' trace_back : ' + str(
                trace_back))
        return Response({'message': f'User creation failed: {str(dte)}'}, status=status.HTTP_400_BAD_REQUEST)


def sendVerificationEmail(request, user):
    from_email = settings.EMAIL_HOST_USER
    to_email = [user.email]
    uid_b64 = getuidb64(user.id)
    subject = _('Activate your Harmony account')
    email_template_name = "new_account_email.html"

    c = {
        "email": user.email,
        'protocol_domain': getHostUrl(request),
        'site_name': request.get_host(),
        "uid": uid_b64,
        "user": user,
        'otp': user.otp
    }

    email_body = render_to_string(email_template_name, c)

    email = EmailMessage(
        subject,
        email_body,
        from_email,
        to_email
    )

    try:
        email.send(fail_silently=False)
    except Exception as e:
        trace_back = traceback.format_exc()
        logger.exception('Could not send email to ' + user.email + ' ' + str(e) + ' trace_back : ' + str(trace_back))
        logger.exception(e)
        logger.exception(traceback.format_exc())
        logger.exception(sys.exc_info()[2])


def getProtocol(request):
    protocol = 'http'
    if 'Port' in request.headers and request.headers['Port'] == '443':
        protocol = 'https'
    return protocol


def getHostUrl(request):
    domain = request.get_host()
    protocol = getProtocol(request)
    protocol_domain = protocol + '://' + domain
    return protocol_domain


def getDomainUrl(request):
    protocol_domain = getHostUrl(request)
    if request.META is not None and 'HTTP_ORIGIN' in request.META:
        protocol_domain = request.META['HTTP_ORIGIN']
    return protocol_domain


@api_view(['POST'])
def activate(request):
    user = CustomUser.objects.get(email=request.data['email'])
    logger.info('activate -> Authenticate user ' + request.data['email'])
    print(user, request.data['otp'], user.check_password(request.data['password']))
    if user is not None and user.check_password(request.data['password']) and user.otp == request.data['otp']:
        user.is_active = True
        user.email_verification_token = None
        user.otp = None
        user.save()
        logger.debug('User ' + user.email + ' activated')
        return Response({"errormessage": "user activated"}, status=status.HTTP_200_OK)

    return Response({"errormessage": _(
                        "The OTP is invalid or already used.")}, status=status.HTTP_406_NOT_ACCEPTABLE)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listUsers(request):
    if request.user.is_owner_admin:
        users = CustomUser.objects.filter(tenant_id=request.user.tenant_id)
        columns = [{'name': 'email', 'label': _('Email')}
            , {'name': 'first_name', 'label': _('First Name')}
            , {'name': 'last_name', 'label': _('Last Name')}
            , {'name': 'last_login', 'label': _('Last Login')}
            , {'name': 'is_active', 'label': _('Active')}
            , {'name': 'is_owner_admin', 'label': _('Admin')}
            , {'name': 'date_joined', 'label': _('Joining Date')}]

        users_list = []
        for u in users:
            user_dict = {}
            user_dict['email'] = u.email
            user_dict['first_name'] = u.first_name
            user_dict['last_name'] = u.last_name
            user_dict['last_login'] = timezone.localtime(u.last_login).strftime("%d-%m-%Y %H:%M:%S")
            user_dict['is_active'] = str(u.is_active)
            user_dict['is_owner_admin'] = str(u.is_owner_admin)
            user_dict['date_joined'] = timezone.localtime(u.date_joined).strftime("%d-%m-%Y %H:%M:%S")
            users_list.append(user_dict)

        return JsonResponse({'columns': columns, 'data': users_list}, safe=False)
    return JsonResponse({'columns': [], 'data': []}, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserProfile(request):
    user = request.user
    serializer = UserSerializer(user)
    return JsonResponse(serializer.data, safe=False)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateUserProfile(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getTenantProfile(request):
    if request.user.is_owner_admin:
        tenant = Tenant.objects.get(id=request.user.tenant_id)
        serializer = TenantSerializer(tenant)
        return JsonResponse(serializer.data, safe=False)
    return JsonResponse([], safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def updateTenantProfile(request):
    if request.user.is_owner_admin:
        if 'logo' in request.data and request.data['logo'] == 'null':
            request.data['logo'] = None
        tenant = Tenant.objects.get(id=request.user.tenant_id)
        serializer = TenantSerializer(tenant, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response([], status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addUser(request):
    if request.user.is_owner_admin:
        email = request.data.get('email')
        tenant_id = request.user.tenant_id
        if not email:
            return JsonResponse({'error': [_('Email cannot be empty.')]}, status=400)
        if CustomUser.objects.filter(email=email).exists():
            return JsonResponse({'error': [_('User with this email already exists.')]}, status=400)

        try:
            with transaction.atomic():
                user = CustomUser(email=email)
                user.tenant = Tenant(id=tenant_id)
                user.is_owner_admin = False
                user.is_active = False
                user.first_name = ''
                user.save()
                subject = _('Activate your Harmony account')
                sendEmail(request, user, subject, "add_user_email.html")

        except Exception as e:
            trace_back = traceback.format_exc()
            logger.error(
                'Error adding user ' + email  + str(e) + ' trace_back : ' + str(
                    trace_back))
            return JsonResponse({'error': [_('Could not add user.')]}, status=400)

        return JsonResponse(list(CustomUser.objects.filter(tenant_id=tenant_id).values()), safe=False)
    return JsonResponse([], safe=False)


def sendEmail(request, user, subject, email_template_name):
    fromEmail = settings.EMAIL_HOST_USER
    toEmail = [user.email]
    uid, token = generatePasswordResetToken(user)
    reset_url = getPasswordResetUrl(getHostUrl(request), uid, token)
    context = {
        "email": user.email,
        "http_referer": request.META['HTTP_REFERER'],
        "uid": uid,
        "user": user,
        'token': token,
        'reset_url': reset_url
    }
    emailBody = render_to_string(email_template_name, context)
    email = EmailMessage(
        subject,
        emailBody,
        fromEmail,
        toEmail
    )
    email.content_subtype = "html"
    email.send(fail_silently=False)


@api_view(['POST'])
def resetPassword(request):
    password1 = request.data.get('password1')
    password2 = request.data.get('password2')
    uidb64 = request.data.get('uid')
    token = request.data.get('token')

    if not uidb64 or not token or not password1 or not password2:
        return JsonResponse({'error': [_('Insufficient information.')]}, status=400)

    if password1 != password2:
        return JsonResponse({'error': [_('Passwords do not match.')]}, status=400)

    try:
        uid = getUid(uidb64)
        user = CustomUser.objects.get(id=uid)
    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
        return Response({'error': 'Invalid user ID'}, status=status.HTTP_400_BAD_REQUEST)

    token_generator = PasswordResetTokenGenerator()
    if not token_generator.check_token(user, token):
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(password1)
    user.is_active = True
    user.save()
    return Response({'status': 'password set'}, status=status.HTTP_200_OK)


@api_view(['POST'])
def forgotPassword(request):
    email = request.data.get('email')
    if not email:
        return JsonResponse({'error': [_('Email cannot be empty.')]}, status=400)

    if not CustomUser.objects.filter(email=email).exists():
        return JsonResponse({'error': [_('Invalid credentials')]}, status=400)
    try:
        user = CustomUser.objects.get(email=email)
        subject = _('Reset your password')
        sendEmail(request, user, subject, "reset_password.html")
        return Response({'success': 'Email sent!'}, status=status.HTTP_200_OK)
    except Exception as e:
        trace_back = traceback.format_exc()
        logger.error(
            'Error forgot password ' + email + str(e) + ' trace_back : ' + str(
                trace_back))
        return JsonResponse({'error': [_('Could not send email')]}, status=400)

