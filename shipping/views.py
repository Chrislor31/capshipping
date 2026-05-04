import string

import random as rand
import threading

from django.shortcuts import render

import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Package, TrackingUpdate


from .utils import send_shipping_email, send_shipping_sms, send_whatsapp


@login_required
def scan_page(request):
    return render(request, "shipping/scan.html")

def send_notifications_async(package):
    try:
        send_shipping_email(package)
        send_whatsapp(package)
        send_shipping_sms(package)
    except Exception as e:
        print("Notification error:", e)


@login_required
def scan_package(request):

    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    data = json.loads(request.body)
    barcode = data.get("barcode")

    try:
        package = Package.objects.get(barcode=barcode)
        # 👇 METE LI ISIT
        if package.status == "delivered":
            return JsonResponse({
                "success": False,
                "error": "Package already delivered"
            })

        user = request.user
        staff_warehouse = user.staff_warehouse

        if not staff_warehouse:
            return JsonResponse({"error": "No warehouse assigned"}, status=403)

        # 🔥 LOGIC SAFE (PA DOUBLE UPDATE)

        # 🚫 SI LI DEJA DELIVERED
        if package.status == "delivered":
            return JsonResponse({
                "success": False,
                "error": "Package already delivered"
            })

        # 🚫 SI LI DEJA READY → PA RE-FÈ LI
        if package.status == "ready_pickup" and staff_warehouse == package.destination_warehouse:
            return JsonResponse({
                "success": True,
                "trx": package.tracking_number,
                "status": package.status,
                "destination": package.destination_warehouse.name if package.destination_warehouse else "N/A"
            })

        # 🔥 NORMAL FLOW
        if staff_warehouse == package.destination_warehouse:
            new_status = "ready_pickup"
        else:
            new_status = "in_transit"

        if new_status == "ready_pickup" and not package.pickup_code:
            package.pickup_code = str(rand.randint(100000, 999999))
            package.save(update_fields=["pickup_code"])

        package.status = new_status
        package.save()

        threading.Thread(
            target=send_notifications_async,
            args=(package,)
        ).start()

        # 🔥 TRACK HISTORY
        TrackingUpdate.objects.create(
            package=package,
            status=new_status,
            warehouse=staff_warehouse,
            updated_by=user
        )

        return JsonResponse({
            "success": True,
            "trx": package.tracking_number,
            "status": new_status,
            "destination": package.destination_warehouse.name if package.destination_warehouse else "N/A"
        })

    except Package.DoesNotExist:
        return JsonResponse({
            "success": False,
            "error": "Package not found"
        })



@login_required
def mark_as_delivered(request, pk):

    try:
        package = Package.objects.get(id=pk)

        if package.status != "ready_pickup":
            return JsonResponse({"error": "Not ready for pickup"})

        package.status = "delivered"
        package.save()

        TrackingUpdate.objects.create(
            package=package,
            status="delivered",
            warehouse=request.user.staff_warehouse,
            updated_by=request.user
        )

        return JsonResponse({"success": True})

    except Package.DoesNotExist:
        return JsonResponse({"error": "Package not found"})








@login_required
def confirm_delivery(request):

    data = json.loads(request.body)
    trx = data.get("trx")

    try:
        package = Package.objects.get(tracking_number=trx)


        package.status = "delivered"
        package.save()
        send_shipping_email(package)
        send_shipping_sms(package)
        send_whatsapp(package)

        TrackingUpdate.objects.create(
            package=package,
            status="delivered",
            warehouse=request.user.staff_warehouse,
            updated_by=request.user
        )

        return JsonResponse({"success": True})

    except Package.DoesNotExist:
        return JsonResponse({"error": "Package not found"})






#### track



# views.py
from django.http import JsonResponse
from .models import Package

from django.http import JsonResponse
from .models import Package


def short_city(city):
    if city.lower() == "port-au-prince":
        return "P-au-P"
    return city


def track_package(request):
    tracking_number = request.GET.get("tracking_number")

    try:
        package = Package.objects.get(tracking_number__iexact=tracking_number)

        updates = package.updates.all().order_by("created_at")

        # 📅 DATES
        dates = {
            "received": package.created_at.strftime("%d/%m/%Y %H:%M") if package.created_at else "",
            "in_transit": "",
            "ready_pickup": "",
            "delivered": ""
        }

        for update in updates:
            key = update.status.lower().replace(" ", "_")
            if key in dates:
                dates[key] = update.created_at.strftime("%d/%m/%Y %H:%M")

        # 📍 LOCATIONS
        locations = {
            "received": "",
            "in_transit": "",
            "ready_pickup": "",
            "delivered": ""
        }

        origin = package.origin_warehouse
        destination = package.destination_warehouse

        # 📦 RECEIVED (USA FULL FORMAT)
        if origin:
            zip_part = f" {origin.zip_code}" if origin.zip_code else ""
            locations["received"] = f"{origin.type}, {origin.city}, {origin.state}{zip_part}, {origin.address}"

        # 🚚 IN TRANSIT
        if destination:
            short = short_city(destination.city)
            locations["in_transit"] = f"To {destination.type}, {destination.state} ({short})"

        # 📍 READY FOR PICKUP
        if destination:
            short = short_city(destination.city)
            locations["ready_pickup"] = f"{short}, {destination.area}, {destination.address}"

        # 📦 DELIVERED
        if destination:
            short = short_city(destination.city)
            locations["delivered"] = f"{short}, {destination.area}, {destination.address}"

        return JsonResponse({
            "success": True,
            "status": package.status,
            "dates": dates,
            "locations": locations
        })

    except Package.DoesNotExist:
        return JsonResponse({
            "success": False,
            "error": "Tracking number not found"
        })

def tracking_page(request):
    return render(request, "tracking.html")





