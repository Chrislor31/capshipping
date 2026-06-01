from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.db import models
import random
import string


# 🔹 Warehouse
class Warehouse(models.Model):
    TYPE_CHOICES = [
        ("USA", "USA"),
        ("HT", "Haiti"),
        ("RD", "Dominican Republic"),
    ]

    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state=models.CharField(max_length=100,default='')
    area = models.CharField(max_length=100,default='_',help_text='Ex: Delmas 32, Petion-Ville')
    zip_code = models.CharField(max_length=20, blank=True, null=True)# 🔥 pi bon pase zone
    address = models.TextField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    label_code=models.CharField(max_length=3,default="")

    def __str__(self):
        return f"{self.type}, {self.city}, {self.area}"


# 🔹 Suite Code Generator
def generate_suite_code():
    return "CSD-" + ''.join(random.choices(string.digits, k=4))


# 🔹 Custom Manager
class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = email.lower()  # 🔥 FIX (no normalize_email bug)

        user = self.model(email=email, **extra_fields)

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)


# 🔹 User Model
class Accounts(AbstractUser):
    username = None

    # 🔐 AUTH
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    can_create_shipments = models.BooleanField(default=False)
    can_view_customer_phone = models.BooleanField(default=False)
    can_view_customer_email = models.BooleanField(default=False)
    can_manage_staff = models.BooleanField(default=False)
    can_delete_users = models.BooleanField(default=False)
    can_access_settings = models.BooleanField(default=False)


    # 👤 ROLE
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("staff", "Staff"),
        ("customer", "Customer"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="customer")

    # 📍 USER ADDRESS
    country = models.CharField(max_length=100, default="")
    state = models.CharField(max_length=100, default="")
    city = models.CharField(max_length=100, default="")
    full_address = models.TextField(default="")

    # 📦 PICKUP LOCATION
    default_pickup_warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="customers"
    )

    staff_warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="staff_members"
    )

    # 🏷 SUITE CODE
    suite_code = models.CharField(max_length=20, unique=True, blank=True, null=True)

    # ⚙️ AUTH CONFIG
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    # 🔁 AUTO GENERATE SUITE CODE
    def save(self, *args, **kwargs):
        if not self.suite_code:
            self.suite_code = generate_suite_code()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email




# reset password and OTP

from django.db import models
from django.conf import settings
from django.utils import timezone

class PasswordResetOTP(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return (timezone.now() - self.created_at).seconds < 600  # 10 min








class KYC(models.Model):

    STATUS = (
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    DOCUMENT_TYPES = (
    ("passport", "Passport"),
    ("driver_license", "Driver License"),
    ("national_id", "National ID"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    document_type = models.CharField(
        max_length=20,
        choices=DOCUMENT_TYPES,
        default="national_id"
    )
    approved_by = models.ForeignKey(

        settings.AUTH_USER_MODEL,

        on_delete=models.SET_NULL,

        null=True,

        blank=True,

        related_name="approved_kycs"

    )

    front_image = models.ImageField(
        upload_to="kyc/front/"
    )

    back_image = models.ImageField(
        upload_to="kyc/back/",
        blank=True,
        null=True
    )

    selfie_image = models.ImageField(
        upload_to="kyc/selfie/",
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="pending"
    )

    submitted_at = models.DateTimeField(
        auto_now_add=True
    )

    reviewed_at = models.DateTimeField(
        blank=True,
        null=True
    )

    admin_note = models.TextField(
        blank=True,
        null=True
    )

    def __str__(self):
        return self.user.email




## dashboard settings


class DashboardSetting(models.Model):

    company_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    support_email = models.EmailField(
        blank=True,
        null=True
    )

    support_phone = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    default_language = models.CharField(
        max_length=10,
        default="en"
    )

    maintenance_mode = models.BooleanField(
        default=False
    )

    kyc_email = models.BooleanField(
        default=True
    )

    shipment_email = models.BooleanField(
        default=True
    )