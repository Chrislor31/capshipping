
#####  send email update packages



from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


def send_shipping_email(package):

    if package.status == "received":
        title = "📦 Package Received"
        message = "Your package has been received at our warehouse."
        image = "https://collection.cloudinary.com/dplskdeel/df713d2902b281c7224e8b752d637755"

    elif package.status == "in_transit":
        title = "🚚 In Transit"
        message = "Your package is on the way to its destination."
        image = "https://res.cloudinary.com/dplskdeel/image/upload/v1776028618/truck_in_transit_qsshty.png"

    elif package.status == "ready_pickup":
        title = "Ready for Pickup"
        message = "Your package is ready for pickup. Please use your code below."
        image = "https://res.cloudinary.com/dplskdeel/image/upload/v1776028618/ready_for__pickup_box_ibf9cg.png"

    elif package.status == "delivered":
        title = "Delivered"
        message = "Your package has been successfully delivered."
        image = "https://res.cloudinary.com/dplskdeel/image/upload/v1776030211/Acer_Juara_Success_Page_spupqr.gif"

    html = render_to_string("emails/shippment_status_update.html", {
        "title": title,
        "message": message,
        "tracking": package.tracking_number,
        "location": package.destination_warehouse,
        "pickup_code": package.pickup_code,
        "image_url": image
    })

    email = EmailMultiAlternatives(
        subject=title,
        body="",
        from_email="info@capshippingdistribution.com",
        to=[package.receiver.email],
    )

    email.attach_alternative(html, "text/html")
    email.send()








#===========sms status



from twilio.rest import Client
from django.conf import settings


def send_shipping_sms(package):

    # ❗ verifye si gen phone
    if not package.receiver or not package.receiver.phone:
        return

    phone = package.receiver.phone.strip()

    # 🔥 NORMALIZE PHONE (SMART)
    if not phone.startswith("+"):

        # Haiti
        if phone.startswith("509"):
            phone = "+" + phone

        # RD (809, 829, 849)
        elif phone.startswith(("809", "829", "849")):
            phone = "+1" + phone

        # USA (10 digits)
        elif len(phone) == 10:
            phone = "+1" + phone

        else:
            print("Invalid phone format:", phone)
            return

    # 🎯 MESSAGE SELON STATUS
    if package.status == "received":
        message = f"📦 Your package {package.tracking_number} has been received."

    elif package.status == "in_transit":
        message = f"🚚 Your package {package.tracking_number} is in transit."

    elif package.status == "ready_pickup":
        message = f"📍 Package ready for pickup.\nCode: {package.pickup_code}"

    elif package.status == "delivered":
        message = f"✅ Package {package.tracking_number} delivered."

    else:
        return

    # 🔥 TWILIO CLIENT
    client = Client(
        settings.TWILIO_ACCOUNT_SID,
        settings.TWILIO_AUTH_TOKEN
    )

    try:
        message = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE,
            to=phone
        )

        print("SMS SENT:", message.sid)

    except Exception as e:
        print("SMS ERROR:", e)




from twilio.rest import Client
from django.conf import settings
def send_whatsapp(package):

    if not package.receiver or not package.receiver.phone:
        return

    phone = package.receiver.phone.strip()

    # 🔥 FORMAT
    if not phone.startswith("+"):
        return  # pa voye si pa bon

    # 🎯 MESSAGE SELON STATUS
    if package.status == "received":
        message = f"""
📦 CAP SHIPPING

Your package has been received.

🔢 Tracking: {package.tracking_number}
📍 Location: {package.origin_warehouse}
"""

    elif package.status == "in_transit":
        message = f"""
🚚 CAP SHIPPING

Your package is in transit.

🔢 Tracking: {package.tracking_number}
📍 Destination: {package.destination_warehouse}
"""

    elif package.status == "ready_pickup":
        message = f"""
📍 CAP SHIPPING

Your package is ready for pickup!

🔢 Tracking: {package.tracking_number}
🔑 Code: {package.pickup_code}

📍 Location: {package.destination_warehouse}
"""

    elif package.status == "delivered":
        message = f"""
✅ CAP SHIPPING

Your package has been delivered.

🔢 Tracking: {package.tracking_number}
"""

    else:
        return

    from twilio.rest import Client
    from django.conf import settings

    client = Client(
        settings.TWILIO_ACCOUNT_SID,
        settings.TWILIO_AUTH_TOKEN
    )

    try:
        msg = client.messages.create(
            body=message,
            from_='whatsapp:+14155238886',
            to=f'whatsapp:{phone}'
        )

        print("WHATSAPP SENT:", msg.sid)

    except Exception as e:
        print("WHATSAPP ERROR:", e)