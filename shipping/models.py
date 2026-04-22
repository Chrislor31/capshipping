from django.conf import settings
from random import random
from django.utils.html import mark_safe
from django.db import models
from .services.pricing import calculate_price
from accounts.models import Warehouse
import uuid

import os

import barcode
from barcode.writer import ImageWriter


import random
import string

def generate_tracking_number():
    letters = string.ascii_uppercase
    digits = string.digits

    return (
        random.choice(letters) +
        random.choice(digits) +
        random.choice(letters) +
        ''.join(random.choices(digits, k=6))
    )


# 👤 CONTACT (Sender & Receiver)
class Contact(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField()

    def __str__(self):
        return self.name


# 🏷️ CATEGORY
class Category(models.Model):
    name = models.CharField(max_length=50)
    surcharge = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    def __str__(self):
        return self.name


#===========price auto
class RoutePricing(models.Model):

    TYPE_CHOICES = [
        ("USA", "USA"),
        ("HT", "Haiti"),
        ("RD","Dominican Republic"),
    ]

    origin_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    destination_type = models.CharField(max_length=10, choices=TYPE_CHOICES)

    SHIPPING_TYPE_CHOICES = [
        ('air', 'Air'),
        ('sea', 'Sea'),
    ]

    shipping_type = models.CharField(max_length=10, choices=SHIPPING_TYPE_CHOICES)

    price_per_lb = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.origin_type} → {self.destination_type} ({self.shipping_type})"



class PricingRule(models.Model):

    SHIPPING_TYPE_CHOICES = [
        ('air', 'Air'),
        ('sea', 'Sea'),
    ]

    shipping_type = models.CharField(max_length=10, choices=SHIPPING_TYPE_CHOICES)

    price_per_lb = models.DecimalField(max_digits=6, decimal_places=2)

    volumetric_divisor = models.IntegerField(default=139)

    minimum_charge = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.shipping_type} - ${self.price_per_lb}/lb"




# 📦 PACKAGE (CORE SYSTEM)
class Package(models.Model):

    STATUS_CHOICES = [
        ('received', 'Received'),
        ('in_transit', 'In Transit'),
        ('ready_pickup', 'Ready for Pickup'),
        ('delivered', 'Delivered'),
    ]

    SHIPPING_TYPE_CHOICES = [
        ('air', 'Air'),
        ('sea', 'Sea'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    sender = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="sent_packages")
    receiver = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="received_packages")

    origin_warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, related_name="origin_packages")
    destination_warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, related_name="destination_packages")

    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    shipping_type = models.CharField(max_length=10, choices=SHIPPING_TYPE_CHOICES)

    # 📦 Details
    weight = models.FloatField()
    length = models.FloatField()
    width = models.FloatField()
    height = models.FloatField()
    quantity = models.IntegerField(default=1)
    description = models.TextField(default="Shipping")

    # 💰 Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2,default=0)

    extra_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # 🔥 System
    tracking_number = models.CharField(max_length=100, unique=True, editable=False)
    barcode = models.CharField(max_length=100, unique=True, editable=False)
    barcode_image = models.ImageField(upload_to='barcodes/', blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='received')

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_packages"
    )
    # 🔥 AUTO PRICE


    def save(self, *args, **kwargs):
        # 🔥 AUTO PRICE
        self.price = calculate_price(self)

        # 🔥 Generate tracking number
        if not self.tracking_number:
            while True:
                code = generate_tracking_number()
                if not Package.objects.filter(tracking_number=code).exists():
                    self.tracking_number = code
                    break

        # 🔥 Generate barcode string
        if not self.barcode:
            self.barcode = uuid.uuid4().hex[:12].upper()

        super().save(*args, **kwargs)

        # 🔥 Generate barcode IMAGE
        if not self.barcode_image:
            CODE128 = barcode.get_barcode_class('code128')

            writer = ImageWriter()

            options = {
                "module_width": 0.2,  # balans pafè
                "module_height": 12.0,
                "quiet_zone": 1.3,
                "font_size": 0,  # ❌ retire text anba barcode
                "text_distance": 0,  # ❌ pa kite espas pou text
                "dpi": 300,
                "write_text": False  # 🔥 pi enpòtan an (pa ekri text ditou)
            }

            code = CODE128(self.barcode, writer=writer)

            file_path = os.path.join('media/barcodes/', self.barcode)

            filename = code.save(file_path, options=options)

            self.barcode_image = f'barcodes/{self.barcode}.png'

            super().save(update_fields=['barcode_image'])

    pickup_code = models.CharField(max_length=6, blank=True, null=True)

    def generate_pickup_code(self):
        if not self.pickup_code:
            self.pickup_code = str(random.randint(100000, 999999))


# 📜 TRACKING HISTORY
class TrackingUpdate(models.Model):
    package = models.ForeignKey(Package, on_delete=models.CASCADE, related_name="updates")

    status = models.CharField(max_length=50)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True)

    # NOUVO FIELD (TRÈ ENPÒTAN)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    note = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.package.tracking_number} - {self.status}"



def barcode_preview(self):
    if self.barcode_image:
        return mark_safe(f'<img src="{self.barcode_image.url}" width="150"/>')
    return "No barcode"