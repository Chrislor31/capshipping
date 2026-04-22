from django.contrib import admin
from .models import Contact, Category, Package, TrackingUpdate
from .models import PricingRule,RoutePricing

from django.utils.html import format_html
from django.urls import reverse

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email']
    search_fields = ['name', 'phone', 'email']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id','name']



@admin.register(RoutePricing)
class RoutePricingAdmin(admin.ModelAdmin):
    list_display = ("origin_type", "destination_type", "shipping_type", "price_per_lb")



@admin.register(PricingRule)
class PricingRuleAdmin(admin.ModelAdmin):
    list_display = ("shipping_type", "price_per_lb", "volumetric_divisor", "minimum_charge")


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):

    list_display = [
        'tracking_number',
        'status',
        'origin_warehouse',
        'destination_warehouse',
        'price',
        'created_at'
    ]

    list_filter = ['status', 'origin_warehouse', 'destination_warehouse']

    search_fields = [
        'tracking_number',
        'barcode',
        'sender__name',
        'receiver__name'
    ]

    autocomplete_fields = ['sender', 'receiver']

    readonly_fields = ['tracking_number', 'barcode', 'created_at']



@admin.register(TrackingUpdate)
class TrackingUpdateAdmin(admin.ModelAdmin):
    list_display = ['package', 'status', 'warehouse', 'updated_by', 'created_at']
    list_filter = ['status', 'warehouse']
    search_fields = ['package__tracking_number']

search_fields = ['name']



readonly_fields = ['tracking_number', 'barcode', 'barcode_preview']

def view_label(self, obj):
    url = reverse('package_label', args=[obj.id])
    return format_html(f'<a href="{url}" target="_blank">Print Label</a>')
