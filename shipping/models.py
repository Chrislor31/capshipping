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
    return "CSD" + ''.join(random.choices(string.digits, k=7))



from django.conf import settings
from django.db import models

class Contact(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="contacts"
    )

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)

    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    is_guest = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.phone})"


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
        ('air', 'Air Freight'),
        ('sea', 'Sea Freight'),
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
        ('in_transit', 'In_Transit'),
        ('ready_pickup', 'Ready_Pickup'),
        ('delivered', 'Delivered'),
        ('canceled','canceled')
    ]

    SHIPPING_TYPE_CHOICES = [
        ('air', 'Air'),
        ('sea', 'Sea'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("paid", "Paid"),
        ("unpaid", "Unpaid"),
    ]

    Shipment_TYPE_CHOICES = [
        ("standard", "Standard"),
        ("express", "Express"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    sender = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="sent_packages")
    receiver = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="received_packages")

    origin_warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, related_name="origin_packages")
    destination_warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, related_name="destination_packages")

    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    shipping_type = models.CharField(max_length=10, choices=SHIPPING_TYPE_CHOICES)
    code = models.CharField(max_length=20, blank=True, null=True)
    #  Details
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
    payment_status = models.CharField(
        max_length=10,
        choices=PAYMENT_STATUS_CHOICES,
        default="unpaid"
    )

    shipment_type = models.CharField(
        max_length=10,
        choices=Shipment_TYPE_CHOICES,
        default="standard"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_packages"
    )
    pickup_code = models.CharField(max_length=10, blank=True, null=True)

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

        # 👉 premye save pou jwenn ID
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # 🔥 GENERATE PKG CODE (APRE ID GENERE)
        if is_new and not self.code:
            self.code = f"PKG-{str(self.id).zfill(4)}"
            super().save(update_fields=['code'])

        # 🔥 Generate barcode IMAGE
        if not self.barcode_image:
            CODE128 = barcode.get_barcode_class('code128')

            writer = ImageWriter()

            options = {
                "module_width": 0.2,
                "module_height": 12.0,
                "quiet_zone": 1.3,
                "font_size": 0,
                "text_distance": 0,
                "dpi": 300,
                "write_text": False
            }

            code = CODE128(self.barcode, writer=writer)

            file_path = os.path.join('media/barcodes/', self.barcode)

            filename = code.save(file_path, options=options)

            self.barcode_image = f'barcodes/{self.barcode}.png'

            super().save(update_fields=['barcode_image'])



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



class PackageImage(models.Model):

    package = models.ForeignKey(
        Package,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to="package_images/"
    )

    def __str__(self):
        return self.package.tracking_number