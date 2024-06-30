from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
import datetime, math, random


def getuidb64(user_id):
    return urlsafe_base64_encode(force_bytes(user_id))


def getUid(uidb64):
    return force_str(urlsafe_base64_decode(uidb64))


def generateOTP():
    digits = "0123456789"
    OTP = ""
    for i in range(6):
        OTP += digits[math.floor(random.random() * 10)]
    return OTP


def generatePasswordResetToken(user):
    token_generator = PasswordResetTokenGenerator()
    token = token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    return uid, token


def getPasswordResetUrl(protocol_domain, uid, token):
    return f"{protocol_domain}/create-password/{uid}/{token}"


class AppTokenGenerator(PasswordResetTokenGenerator):
    def make_hash_value(self, user):
        return super()._make_hash_value(user, datetime.datetime.now())

tokenGenerator = AppTokenGenerator()