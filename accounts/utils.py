import random

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.translation import gettext as _
from django.utils.translation import activate

from django.utils.translation import activate, get_language

from capshipping import settings


## send email welcome

def send_welcome_email(user, language):

    # activate current language
    activate(language)

    # debug
    print("EMAIL LANGUAGE:", get_language())

    # translated subject
    subject = _("Welcome to Cap Shipping 🎉")

    html_content = render_to_string(
        "emails/welcome_email.html",
        {
            "user": user
        }
    )

    email = EmailMultiAlternatives(

        subject,

        "",

        settings.DEFAULT_FROM_EMAIL,

        [user.email],

    )

    email.attach_alternative(html_content, "text/html")
    email.send()



def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(user, code, language):

    # activate current language
    activate(language)

    # translated subject
    subject = _("Your CapShipping Verification Code")

    html_content = render_to_string(
        "emails/otp_email_reset.html",
        {
            "code": code,
            "user": user
        }
    )

    plain_message = f"""
    Your CapShipping verification code is: {code}

    This code expires in 10 minutes.

    If you did not request this email, please ignore it.
    """

    email = EmailMultiAlternatives(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
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
            settings.DEFAULT_FROM_EMAIL,

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
        from_email="support@capshippingdistribution.com",
        to=[package.receiver.email],
    )

    email.attach_alternative(html, "text/html")
    email.send()





#=====kyc message



# =========================
# KYC SUBMITTED EMAIL
# =========================

def send_kyc_submitted_email(
    user,
    language
):

    # activate language
    activate(language)

    # subject
    subject = _(
        "KYC Submitted Successfully 📄"
    )



    # html
    html_content = render_to_string(

        "emails/kyc/submitted.html",

        {

            "user": user

        }

    )



    # email
    email = EmailMultiAlternatives(

        subject,

        "",

        settings.DEFAULT_FROM_EMAIL,

        [user.email],
        )



    email.attach_alternative(
        html_content,
        "text/html"
    )

    email.send()





# =========================
# KYC APPROVED EMAIL
# =========================

def send_kyc_approved_email(
    user,
    language
):

    # activate language
    activate(language)

    # subject
    subject = _(
        "KYC Approved Successfully ✅"
    )



    # html
    html_content = render_to_string(

        "emails/kyc/approved.html",

        {

            "user": user

        }

    )



    # email
    email = EmailMultiAlternatives(

        subject,

        "",

        settings.DEFAULT_FROM_EMAIL,

        [user.email],
        )



    email.attach_alternative(
        html_content,
        "text/html"
    )

    email.send()




# =========================
# KYC REJECTED EMAIL
# =========================

def send_kyc_rejected_email(

    user,

    language,

    comment=None

):

    # activate language
    activate(language)

    # subject
    subject = _(
        "KYC Verification Rejected ❌"
    )



    # html
    html_content = render_to_string(

        "emails/kyc/rejected.html",

        {

            "user": user,

            "comment": comment

        }

    )



    # email
    email = EmailMultiAlternatives(

        subject,

        "",

        settings.DEFAULT_FROM_EMAIL,

        [user.email],
        )



    email.attach_alternative(
        html_content,
        "text/html"
    )

    email.send()