import random
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_email(user, code):
    subject = "Your OTP Code"

    html_content = render_to_string("emails/otp_email_reset.html", {
        "code": code,
        "user": user
    })

    email = EmailMultiAlternatives(
        subject,
        "",  # plain text optional
        "pchrislor66@gmail.com",
        [user.email],
    )

    email.attach_alternative(html_content, "text/html")
    email.send()





## send email welcome


from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

def send_welcome_email(user):
    subject = "Welcome to Cap Shipping 🎉"

    html_content = render_to_string("emails/welcome_email.html", {
        "user": user
    })

    email = EmailMultiAlternatives(
        subject,
        "",
        "pchrislor66@gmail.com",
        [user.email],
    )

    email.attach_alternative(html_content, "text/html")
    email.send()





def send_otp_email(user, code, title, message):

    try:
        html_content = render_to_string("emails/otp_email.html", {
            "code": code,
            "user": user,
            "title": title,
            "message": message
        })

        email = EmailMultiAlternatives(
            title,
            "",
            "pchrislor66@gmail.com",
            [user.email],
        )

        email.attach_alternative(html_content, "text/html")
        email.send()

    except Exception as e:
        print("EMAIL ERROR:", e)







#####  send email update packages



from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


def send_shipping_email(package):

    if package.status == "received":
        title = "📦 Package Received"
        message = "Your package has been received at our warehouse."
        image = "https://cdn-icons-png.flaticon.com/512/679/679720.png"

    elif package.status == "in_transit":
        title = "🚚 In Transit"
        message = "Your package is on the way to its destination."
        image = "https://cdn-icons-png.flaticon.com/512/744/744465.png"

    elif package.status == "ready_pickup":
        title = "📍 Ready for Pickup"
        message = "Your package is ready for pickup. Please use your code below."
        image = "https://cdn-icons-png.flaticon.com/512/1048/1048314.png"

    elif package.status == "delivered":
        title = "✅ Delivered"
        message = "Your package has been successfully delivered."
        image = "https://cdn-icons-png.flaticon.com/512/190/190411.png"

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