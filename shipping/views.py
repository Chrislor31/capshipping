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

def send_notifications_async(package,language):
    try:
        send_shipping_email(package,language)
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
        if (
                package.status == "ready_pickup"
                and
                staff_warehouse ==
                package.destination_warehouse
        ):
            return JsonResponse({

                "success": True,

                "trx":
                    package.tracking_number,

                "tracking_number":
                    package.tracking_number,

                "status":
                    package.status,

                "destination":
                    (
                        package.destination_warehouse.name
                        if package.destination_warehouse
                        else "N/A"
                    ),

                "code":
                    package.code,

                "receiver":
                    package.receiver.name,

                "phone":
                    package.receiver.phone,

                "payment_status":
                    package.payment_status

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

        language = request.COOKIES.get('django_language', 'en')

        threading.Thread(
            target=send_notifications_async,
            args=(package, language)
        ).start()

        # 🔥 TRACK HISTORY
        TrackingUpdate.objects.create(
            package=package,
            status=new_status,
            warehouse=staff_warehouse,
            updated_by=user
        )

        print(package.receiver.name)
        print(package.receiver.phone)
        print(package.code)
        print(package.payment_status)
        return JsonResponse({

            "success": True,

            "trx":
                package.tracking_number,

            "tracking_number":
                package.tracking_number,

            "status":
                new_status,

            "destination":
                (
                    package.destination_warehouse.name
                    if package.destination_warehouse
                    else "N/A"
                ),

            # 🔥 PACKAGE INFO
            "code":
                package.code,

            "receiver":
                package.receiver.name,

            "phone":
                package.receiver.phone,

            "payment_status":
                package.payment_status

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

    signed = data.get("signed", False)

    try:

        package = Package.objects.get(
            tracking_number=trx
        )

        # 🔥 UPDATE STATUS
        package.status = "delivered"

        # 🔥 AUTO PAYMENT
        package.payment_status = "paid"

        package.save()

        # 🔥 CREATE TRACKING UPDATE
        TrackingUpdate.objects.create(

            package=package,

            status="delivered",

            warehouse=request.user.staff_warehouse,

            updated_by=request.user,

            note=(
                f"Delivered successfully | "
                f"Signed: {signed}"
            )

        )

        # 🔥 NOTIFICATIONS
        send_shipping_email(package, "fr")

        send_shipping_sms(package)

        send_whatsapp(package)

        return JsonResponse({
            "success": True
        })

    except Package.DoesNotExist:

        return JsonResponse({

            "success": False,

            "error": "Package not found"

        })





#### track




def short_city(city):
    if city.lower() == "port-au-prince":
        return "P-au-P"
    return city

def track_package(request):

    tracking_number = request.GET.get("tracking_number")

    try:

        package = Package.objects.get(
            tracking_number__iexact=tracking_number
        )

        updates = package.updates.all().order_by("created_at")

        origin = package.origin_warehouse
        destination = package.destination_warehouse

        # 🔥 STEP TITLES
        # 🔥 SHIPPING LABEL
        shipping_label = "Air Freight"

        if package.shipping_type == "sea":
            shipping_label = "Sea Freight"

        # 🔥 DESTINATION COUNTRY
        destination_country = "Destination"

        if destination and destination.type:
            destination_country = destination.type

        # 🔥 STEP TITLES
        status_titles = {
            "received": "Received at Warehouse",

            "in_transit":
                f"In Transit to {destination_country} "
                f"({shipping_label})",

            "ready_pickup": "Ready for Pickup",

            "delivered": "Delivered",

            "canceled": "Canceled"
        }

        # 🔥 STEP NOTES
        status_notes = {
            "received": "Votre colis a été reçu et traité dans notre entrepôt.",

            "in_transit": "Votre colis est actuellement en transit vers le pays de destination.",

            "ready_pickup": "Votre colis est prêt pour le retrait au bureau local.",

            "delivered": "Livré avec succès au destinataire.",

            "canceled": "Cette expédition a été annulée."
        }

        # 🔥 STEP ORDER
        steps_order = [
            "received",
            "in_transit",
            "ready_pickup",
            "delivered"
        ]

        # 🔥 CURRENT STEP INDEX
        current_index = steps_order.index(package.status)

        # 🔥 TIMELINE
        timeline = []

        # =========================
        # 📦 RECEIVED STEP
        # =========================
        received_location = ""

        if origin:

            zip_part = (
                f" {origin.zip_code}"
                if origin.zip_code
                else ""
            )

            received_location = (
                f"{origin.city}, "
                f"{origin.state}{zip_part}, "
                f"{origin.address}"
            )

        timeline.append({

            "status": "received",

            "title": status_titles["received"],

            "note": status_notes["received"],

            "location": received_location,

            "date": package.created_at.strftime(
                "%d/%m/%Y %I:%M %p"
            ),

            "active": current_index >= 0

        })



        # =========================
        # 🔄 OTHER STEPS
        # =========================
        for step in steps_order[1:]:

            update = updates.filter(
                status=step
            ).first()

            # 🔥 step active?
            is_active = (
                    steps_order.index(step)
                    <= current_index
            )

            location = ""
            date = ""

            # 🔥 ONLY SHOW DATA IF STEP ACTIVE
            if is_active and update:

                date = update.created_at.strftime(
                    "%d/%m/%Y %I:%M %p"
                )

                # 🚚 IN TRANSIT
                if (
                        step == "in_transit"
                        and destination
                ):

                    short = short_city(
                        destination.city
                    )

                    location = (
                        f"To {destination.state} "
                        f"({short})"
                    )

                # 📍 READY PICKUP
                elif (
                        step == "ready_pickup"
                        and destination
                ):

                    short = short_city(
                        destination.city
                    )

                    location = (
                        f"{short}, "
                        f"{destination.area}, "
                        f"{destination.address}"
                    )

                # 📦 DELIVERED
                elif (
                        step == "delivered"
                        and destination
                ):

                    short = short_city(
                        destination.city
                    )

                    location = (
                        f"{short}, "
                        f"{destination.area}, "
                        f"{destination.address}"
                    )

            timeline.append({

                "status": step,

                "title": status_titles.get(
                    step,
                    step
                ),

                "note": status_notes.get(
                    step,
                    ""
                ),

                "location": location,

                "date": date,

                "active": is_active

            })



        # 🔥 DELIVERED MESSAGE
        delivered_message = ""

        if package.status == "delivered":

            delivered_message = (
                "Delivered. "
                "Received by recipient. "
                "For assistance contact "
                "Customer Service: "
                "Support@capshippingdistribution.com"
            )



        # 🔥 TOTAL DAYS
        total_days = ""

        if updates.exists():

            last_update = updates.last()

            days = (
                last_update.created_at.date()
                - package.created_at.date()
            ).days

            total_days = f"{days} Days"



        # 🔥 RESPONSE
        return JsonResponse({

            "success": True,

            "tracking_number":
                package.tracking_number,

            "current_status":
                package.status,

            "delivered_message":
                delivered_message,

            "shipment_date":
                package.created_at.strftime(
                    "%d/%m/%Y"
                ),

            "total_transit_time":
                total_days,

            "timeline":
                timeline

        })



    except Package.DoesNotExist:

        return JsonResponse({

            "success": False,

            "error":
                "Tracking number not found"

        })
def tracking_page(request):
    return render(request, "tracking.html")





