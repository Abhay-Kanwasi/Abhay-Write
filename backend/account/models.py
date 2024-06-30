import os
from django.conf import settings
from django.db import models, transaction, DatabaseError
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
import uuid


def user_directory_path(instance, filename):
    # File will be uploaded to MEDIA_ROOT/<tenant_id>/logo/<filename>
    return '{0}/logo/{1}'.format(instance.id, 'logo.png')


class Tenant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, null=False)
    website = models.CharField(max_length=100, null=True, blank=True)
    logo = models.ImageField(max_length=300, null=True, blank=True, upload_to=user_directory_path)
    timezone = models.CharField(max_length=50, default='UTC')
    mobile = models.CharField(max_length=15, null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    pan = models.CharField(max_length=10, null=True, blank=True)
    gstn = models.CharField(max_length=15, null=True, blank=True)
    billing_contact_name = models.CharField(max_length=100, null=True, blank=True)
    billing_contact_phone = models.CharField(max_length=15, null=True, blank=True)
    contact_name = models.CharField(max_length=100, null=True, blank=True)
    contact_phone = models.CharField(max_length=15, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(max_length=25, null=False)
    modified = models.DateTimeField(auto_now=True)
    modified_by = models.CharField(max_length=25, null=False)

    class Meta:
        indexes = [
            models.Index(fields=['name'], name='idx_tenant_name'),
        ]
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        # Get the current logo file path
        if self.pk:
            try:
                old_logo = Tenant.objects.get(pk=self.pk).logo
            except Tenant.DoesNotExist:
                old_logo = None

            if old_logo and self.logo != old_logo:
                old_logo_path = os.path.join(settings.MEDIA_ROOT, old_logo.path)
                if os.path.isfile(old_logo_path):
                    os.remove(old_logo_path)
        super(Tenant, self).save(*args, **kwargs)


class CustomUserManager(BaseUserManager):
    def _create_user(self, email, tenantname, password=None, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        if not tenantname:
            raise ValueError('Tenantname must be set')
        try:
            with transaction.atomic():
                email = self.normalize_email(email)
                tenant = Tenant(name=tenantname)
                user = self.model(email=email, tenant=tenant, **extra_fields)
                user.set_password(password)
                tenant.save(using=self._db)
                user.save(using=self._db)
                return user
        except DatabaseError:
            print('Error saving tenant and user')

        raise Exception("Could not create user")

    def create_user(self, email, accountname, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, accountname, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_owner_admin', True)

        return self._create_user(email, 'harmony', password, **extra_fields)


class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    email = models.EmailField(_('Email Address'), unique=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.RESTRICT)
    first_name = models.CharField(max_length=150, null=True, blank=True)
    last_name = models.CharField(max_length=150, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    is_owner_admin = models.BooleanField(default=False)
    otp = models.CharField(max_length=20, null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

class Logging(models.Model):
    LoggingID = models.AutoField(primary_key=True)
    LogLevel = models.CharField(max_length=500, default="INFO")
    LogActivity = models.CharField(max_length=500, default="Log Activity")
    LogData = models.CharField(max_length=500, default="Log Data")
    LogDetails = models.CharField(max_length=500, default="Log Details")