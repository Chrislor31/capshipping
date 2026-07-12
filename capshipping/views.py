from types import SimpleNamespace

from django.contrib.auth.decorators import login_required, user_passes_test

from django.shortcuts import render, redirect
from rest_framework import status
from rest_framework.views import APIView

from accounts.models import Warehouse, PasswordResetOTP, Accounts, KYC, DashboardSetting
from accounts.serializers import RegisterSerializer, LoginSerializer, KYCSerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.contrib.auth import login, update_session_auth_hash

from accounts.utils import generate_otp, send_otp_email, send_welcome_email, send_kyc_submitted_email, \
    send_kyc_approved_email, send_kyc_rejected_email
from django.http import JsonResponse
from django.contrib.auth import get_user_model

from shipping.models import Package, Contact, Category, TrackingUpdate, PricingRule, RoutePricing





from django.db.models.functions import ExtractMonth
from django.db.models import Count

import calendar

from shipping.services.pricing import calculate_price


#==== reset password
@api_view(["POST"])
def register_api(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        # ❗ pa aktive user la ankò
        user.is_active = False
        user.save()

        Contact.objects.create(

            user=user,

            name=f"{user.first_name} {user.last_name}",

            phone=user.phone_number,

            email=user.email,

            address=user.full_address,

            is_guest=False

        )

        # 🔥 generate OTP
        code = generate_otp()

        PasswordResetOTP.objects.create(user=user, code=code)

        # 🔥 voye email
        send_otp_email(
            user,
            code,
            "Verify your account",
            "Use the code below to verify your account and complete your registration."
        )

        return Response({
            "status": "success",
            "email": user.email
        })

    return Response(serializer.errors, status=400)


@api_view(["POST"])
def verify_register_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    if not email or not otp:
        return Response({
            "status": "error",
            "message": "Missing data"
        })

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({
            "status": "error",
            "message": "User not found"
        })

    otp_obj = PasswordResetOTP.objects.filter(user=user, code=otp).last()

    if not otp_obj:
        return Response({
            "status": "error",
            "message": "Invalid code ❌"
        })

    # 🔥 ACTIVATE USER
    user.is_active = True
    user.save()

    # 🔥 DELETE OTP
    otp_obj.delete()

    # 🔥 SEND WELCOME EMAIL
    send_welcome_email(
        user,
        request.COOKIES.get('django_language', 'en')
    )

    # 🔥 AUTO LOGIN
    login(request, user)

    return Response({
        "status": "success"
    })



# ==== resend OTP


@api_view(["POST"])
def resend_register_otp(request):
    email = request.data.get("email")

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({
            "status": "error",
            "message": "User not found"
        })

    # 🔥 delete old OTP
    PasswordResetOTP.objects.filter(user=user).delete()

    # 🔥 new OTP
    code = generate_otp()
    PasswordResetOTP.objects.create(user=user, code=code)

    # 🔥 send email
    send_otp_email(
        user,
        code,
        "Verify your account",
        "Here is your new verification code."
    )

    return Response({
        "status": "success",
        "message": "New code sent ✅"
    })

#==== end resend otp

@api_view(["POST"])
def login_api(request):
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.validated_data["user"]
        login(request, user)  # 🔥 Django session login

        return Response({
            "message": "Login successful"
        })

    return Response(serializer.errors, status=400)



def verify_otp(request):
    code = request.POST.get("otp")
    user_id = request.session.get("reset_user")

    otp = PasswordResetOTP.objects.filter(
        user_id=user_id, code=code
    ).last()

    if otp and otp.is_valid():
        request.session['otp_verified'] = True
        return JsonResponse({"status": "success"})

    return JsonResponse({"status": "error", "message": "Invalid code"})



def loginform(request):
    return render(request,'login.html')

def register(request):
    haiti_warehouses = Warehouse.objects.filter(type="HT")

    context = {
        "haiti_warehouses": haiti_warehouses
    }
    return render(request, "register.html", context)


@login_required
def dashboard_user(request):

    # =====================================
    # 🔥 CLIENT SHIPMENTS
    # =====================================

    packages = Package.objects.filter(

        user=request.user

    ).order_by(

        '-created_at'

    )




    # =====================================
    # 🔥 WAREHOUSES
    # =====================================

    warehouses = Warehouse.objects.all()




    # 🔥 USA WAREHOUSES
    usa_warehouses = Warehouse.objects.filter(
        type="USA"
    )




    # 🔥 FIRST = AIR
    air_warehouse = usa_warehouses.first()




    # 🔥 LAST = SEA
    sea_warehouse = usa_warehouses.last()




    # =====================================
    # 🔥 CATEGORIES
    # =====================================

    categories = Category.objects.all()




    # =====================================
    # 🔥 STATS
    # =====================================

    received_packages = packages.filter(
        status='received'
    ).count()




    transit_packages = packages.filter(
        status='in_transit'
    ).count()




    ready_pickup_packages = packages.filter(
        status='ready_pickup'
    ).count()




    delivered_packages = packages.filter(
        status='delivered'
    ).count()




    # =====================================
    # 🔥 MONTHLY CHART DATA
    # =====================================

    monthly_shipments = (

        packages

        .annotate(

            month=ExtractMonth(
                'created_at'
            )

        )

        .values(
            'month'
        )

        .annotate(

            total=Count(
                'id'
            )

        )

        .order_by(
            'month'
        )

    )




    # =====================================
    # 🔥 DEFAULT 12 MONTHS
    # =====================================

    shipment_data = [0] * 12




    # =====================================
    # 🔥 INSERT REAL DATA
    # =====================================

    for item in monthly_shipments:

        shipment_data[
            item['month'] - 1
        ] = item['total']




    # =====================================
    # 🔥 MONTH LABELS
    # =====================================

    month_labels = list(

        calendar.month_abbr

    )[1:]




    # =====================================
    # 🔥 CONTEXT
    # =====================================

    context = {

        # SHIPMENTS
        "packages":
        packages,



        # STATS
        "received_packages":
        received_packages,



        "transit_packages":
        transit_packages,



        "ready_pickup_packages":
        ready_pickup_packages,



        "delivered_packages":
        delivered_packages,



        # CHART
        "shipment_data":
        json.dumps(
            shipment_data
        ),



        "month_labels":
        json.dumps(
            month_labels
        ),



        # WAREHOUSES
        "warehouses":
        warehouses,



        "usa_warehouses":
        usa_warehouses,



        "air_warehouse":
        air_warehouse,



        "sea_warehouse":
        sea_warehouse,



        # CATEGORIES
        "categories":
        categories,

    }




    # =====================================
    # 🔥 RENDER
    # =====================================

    return render(

        request,

        'dashboard_user/dashboard.html',

        context

    )

@login_required
def change_password(request):
    if request.method == "POST":
        user = request.user

        current_password = request.POST.get("current_password")
        new_password = request.POST.get("new_password")
        confirm_password = request.POST.get("confirm_password")

        # Verify current password
        if not user.check_password(current_password):
            return JsonResponse({"status": "error", "message": "Current password is incorrect"})

        # Check new passwords match
        if new_password != confirm_password:
            return JsonResponse({"status": "error", "message": "Passwords do not match"})

        # Change password
        user.set_password(new_password)
        user.save()

        # Keep user logged in
        update_session_auth_hash(request, user)

        return JsonResponse({"status": "success", "message": "Password updated successfully"})

    return JsonResponse({"status": "error", "message": "Invalid request"})




@login_required
def update_profile(request):

    if request.method == "POST":

        user = request.user



        user.first_name = request.POST.get(
            "first_name"
        )



        user.last_name = request.POST.get(
            "last_name"
        )



        user.email = request.POST.get(
            "email"
        )



        user.phone_number = request.POST.get(
            "phone_number"
        )



        user.country = request.POST.get(
            "country"
        )



        user.state = request.POST.get(
            "state"
        )



        user.city = request.POST.get(
            "city"
        )



        # PICKUP
        pickup_id = request.POST.get(
            "default_pickup"
        )



        if pickup_id:

            warehouse = Warehouse.objects.filter(
                id=pickup_id
            ).first()



            user.default_pickup = warehouse



        user.save()



        return JsonResponse({

            "status": "success",

            "message":
            "Profile updated successfully"

        })



    return JsonResponse({

        "status": "error",

        "message":
        "Invalid request"

    })


from django.http import JsonResponse
from django.contrib.auth import logout


def logout_view(request):

    logout(request)

    return redirect('login')


def user_logout(request):

    logout(request)

    return redirect('/login/')


#======reset password

def reset_page(request):
    return render(request, "auth/reset_password.html")



User = get_user_model()

def send_otp(request):
    email = request.POST.get("email")
    user = User.objects.filter(email=email).first()

    if not user:
        return JsonResponse({"status": "error", "message": "Email not found"})

    # delete old OTP
    PasswordResetOTP.objects.filter(user=user).delete()

    code = generate_otp()

    PasswordResetOTP.objects.create(user=user, code=code)

    # 🔥 FIX ISIT LA
    send_otp_email(
        user,
        code,
        "Reset your password",
        "Use the code below to reset your password."
    )

    request.session['reset_user'] = user.id

    return JsonResponse({"status": "success"})



from django.contrib.auth.hashers import make_password

def reset_password(request):
    password = request.POST.get("password")
    user_id = request.session.get("reset_user")

    user = User.objects.get(id=user_id)
    user.password = make_password(password)
    user.save()

    return JsonResponse({"status": "success"})




#views regular

def index(request):
    return render(request,'index.html')

def about(request):
    return render(request,'about.html')

def contact(request):
    return render(request,'contact.html')






###====== shipping section
from django.shortcuts import render, get_object_or_404


def package_label(request, pk):
    package = get_object_or_404(Package, id=pk)

    labels = range(1, package.quantity + 1)

    return render(request, "shipping/label.html", {
        "package": package,
        "labels": labels
    })





## paje without relaod dashboard
## login dashboard


from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout




def logout_view(request):
    logout(request)
    return redirect('panel_login')


def login_view(request):

    if request.method == "POST":

        email = request.POST.get('email')
        password = request.POST.get('password')

        user = authenticate(request, username=email, password=password)

        if user is not None:

            if user.is_staff or user.is_superuser:
                login(request, user)

                return render(request, 'dashboard/login_admin.html', {
                    'success': "Login successful"
                })

            else:
                return render(request, 'dashboard/login_admin.html', {
                    'error': "Access denied (Admin only)"
                })

        else:
            return render(request, 'dashboard/login_admin.html', {
                'error': "Invalid email or password"
            })

    return render(request, 'dashboard/login_admin.html')



# dashboard part


@login_required
def dashboard_home(request):
    return redirect('/panel/dashboard/')

from django.db.models.functions import TruncMonth
from django.db.models import Sum, Count, F
from django.utils.timezone import now
from datetime import timedelta, timezone
from calendar import month_abbr

from accounts.models import Accounts

def is_admin(user):
    return user.is_staff or user.is_superuser


@login_required(login_url='/panel/login/')
@user_passes_test(is_admin, login_url='/panel/login/')
def dashboard(request):

    active_users = Accounts.objects.filter(is_active=True).count()

    total_shipments = Package.objects.count()

    delivered_shipments = Package.objects.filter(
        status='delivered'
    ).count()

    total_revenue = Package.objects.aggregate(
        total=Sum(F('price') + F('extra_fee'))
    )['total'] or 0

    today = now()
    last_month = today - timedelta(days=30)

    last_month_revenue = Package.objects.filter(
        created_at__gte=last_month
    ).aggregate(
        total=Sum(F('price') + F('extra_fee'))
    )['total'] or 0

    revenue_change = ((total_revenue - last_month_revenue) / last_month_revenue) * 100 if last_month_revenue > 0 else 0

    last_month_users = Accounts.objects.filter(
        is_active=True,
        date_joined__lt=last_month
    ).count()

    users_change = ((active_users - last_month_users) / last_month_users) * 100 if last_month_users > 0 else 0

    last_month_shipments = Package.objects.filter(
        created_at__lt=last_month
    ).count()

    shipments_change = ((total_shipments - last_month_shipments) / last_month_shipments) * 100 if last_month_shipments > 0 else 0

    last_month_delivered = Package.objects.filter(
        status='delivered',
        created_at__lt=last_month
    ).count()

    delivered_change = ((delivered_shipments - last_month_delivered) / last_month_delivered) * 100 if last_month_delivered > 0 else 0

    context = {
        'total_revenue': total_revenue,
        'active_users': active_users,
        'total_shipments': total_shipments,
        'delivered_shipments': delivered_shipments,
        'revenue_change': round(revenue_change, 1),
        'users_change': round(users_change, 1),
        'shipments_change': round(shipments_change, 1),
        'delivered_change': round(delivered_change, 1),
    }

    # ================== CHART DATA ==================
    monthly_data = (
        Package.objects
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(
            revenue=Sum(F('price') + F('extra_fee')),
            shipments=Count('id')
        )
        .order_by('month')
    )

    months = [month_abbr[i] for i in range(1, 13)]

    revenue_map = {
        item['month'].strftime('%b'): float(item['revenue'] or 0)
        for item in monthly_data
    }

    shipment_map = {
        item['month'].strftime('%b'): item['shipments']
        for item in monthly_data
    }

    context.update({
        'chart_labels': months,
        'chart_revenue': [revenue_map.get(m, 0) for m in months],
        'chart_shipments': [shipment_map.get(m, 0) for m in months],
    })

    # 🔥 AJAX
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'dashboard/partials/dashboard.html', context)

    # 🔥 NORMAL LOAD (FIXED)
    return render(request, 'dashboard/base.html', context)


from django.core.paginator import Paginator


from django.db.models import Q

from django.core.paginator import Paginator

@login_required
def users(request):

    query = request.GET.get('q', '')

    # 🔥 1. TOUT USERS (POU STATS)
    all_users = Accounts.objects.all()

    # 🔥 2. FILTERED USERS (POU TABLE)
    users_list = all_users

    if query:
        users_list = users_list.filter(
            Q(email__icontains=query) |
            Q(phone_number__icontains=query) |
            Q(suite_code__icontains=query)
        )

    users_list = users_list.order_by('-id')

    # pagination
    paginator = Paginator(users_list, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # 🔥 STATS SOU TOUT USERS
    total_users = all_users.count()
    active_users = all_users.filter(is_active=True).count()
    pending_users = all_users.filter(is_active=False).count()
    staff_users = all_users.filter(is_staff=True).count()

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'dashboard/partials/users.html', {
            'users': page_obj,
            'page_obj': page_obj,
            'query': query,
            'total_users': total_users,
            'active_users': active_users,
            'pending_users': pending_users,
            'staff_users': staff_users,
        })

    return render(request, 'dashboard/base.html')




@login_required
def add_users(request):

    # =====================
    # GET (FORM LOAD)
    # =====================
    if request.method == "GET":

        roles = [
            ("admin", "Admin"),
            ("staff", "Staff"),
            ("customer", "Customer"),
        ]

        warehouses = Warehouse.objects.all()

        context = {
            "roles": roles,
            "warehouses": warehouses
        }

        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return render(request, 'dashboard/partials/add_users.html', context)

        return render(request, 'dashboard/base.html', context)

    # =====================
    # POST (CREATE USER)
    # =====================
    if request.method == "POST":

        data = request.POST
        errors = {}

        # 🔹 BASIC
        email = data.get("email")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        phone = data.get("phone_number")
        role = data.get("role")

        # 🔹 ADDRESS
        country = data.get("country")
        state = data.get("state")
        city = data.get("city")
        address = data.get("full_address")

        # 🔹 PASSWORD
        password = data.get("password")
        confirm = data.get("confirm_password")

        # 🔹 WAREHOUSE
        default_wh_id = data.get("default_pickup_warehouse")
        staff_wh_id = data.get("staff_warehouse")

        # 🔹 CHECKBOX
        is_active = True if data.get("status") == "on" else False
        send_welcome = True if data.get("welcome_sms") == "on" else False

        # =====================
        # VALIDATIONS
        # =====================

        if not email:
            errors["email"] = "Email is required"
        elif Accounts.objects.filter(email=email).exists():
            errors["email"] = "Email already exists"

        if not role or role == "select role":
            errors["role"] = "Please select a role"

        if not password:
            errors["password"] = "Password is required"
        elif len(password) < 6:
            errors["password"] = "Password must be at least 6 characters"

        if password != confirm:
            errors["confirm_password"] = "Passwords do not match"

        # =====================
        # WAREHOUSE VALIDATION
        # =====================

        default_warehouse = None
        staff_warehouse = None

        if default_wh_id:
            try:
                default_warehouse = Warehouse.objects.get(id=default_wh_id)
            except Warehouse.DoesNotExist:
                errors["default_pickup_warehouse"] = "Invalid warehouse"

        if staff_wh_id:
            try:
                staff_warehouse = Warehouse.objects.get(id=staff_wh_id)
            except Warehouse.DoesNotExist:
                errors["staff_warehouse"] = "Invalid staff warehouse"

        # =====================
        # STOP IF ERRORS
        # =====================
        if errors:
            return JsonResponse({
                "success": False,
                "errors": errors
            })

        # =====================
        # 🔥 ROLE LOGIC (AJOUTE ISIT)
        # =====================

        is_staff_flag = False
        is_superuser_flag = False

        if role == "admin":
            is_staff_flag = True
            is_superuser_flag = True

        elif role == "staff":
            is_staff_flag = True

        elif role == "customer":
            is_staff_flag = False


        # =====================
        # CREATE USER
        # =====================

        user = Accounts.objects.create(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone,
            role=role,

            country=country,
            state=state,
            city=city,
            full_address=address,

            default_pickup_warehouse=default_warehouse,
            staff_warehouse=staff_warehouse,

            is_active=is_active,
            is_staff=is_staff_flag,
            is_superuser=is_superuser_flag,
            password=make_password(password),
        )

        # =====================
        # 🔥 SEND WELCOME EMAIL
        # =====================

        if send_welcome:
            send_welcome_email(user)  # ✅ ISIT

        # =====================
        # OPTIONAL ACTION
        # =====================
        if send_welcome:
            print(f"Send welcome email to {email}")

        return JsonResponse({
            "success": True,
            "message": "User created successfully"
        })


# === USER UPDATE


def update_user(request, id):

    user = get_object_or_404(Accounts, id=id)

    if request.method == "POST":

        data = request.POST
        errors = {}

        # 🔹 BASIC
        email = data.get("email")
        role = data.get("role")

        if not email:
            errors["email"] = "Email is required"

        # 🔹 STOP IF ERRORS
        if errors:
            return JsonResponse({
                "success": False,
                "errors": errors
            })

        # 🔹 UPDATE FIELDS
        user.email = email
        user.first_name = data.get("first_name")
        user.last_name = data.get("last_name")
        user.phone_number = data.get("phone_number")
        user.role = role

        user.country = data.get("country")
        user.state = data.get("state")
        user.city = data.get("city")
        user.full_address = data.get("full_address")

        user.is_active = True if data.get("status") == "on" else False

        # =====================
        # 🔥 ROLE LOGIC
        # =====================
        is_staff_flag = False
        is_superuser_flag = False

        if role == "admin":
            is_staff_flag = True
            is_superuser_flag = True

        elif role == "staff":
            is_staff_flag = True

        elif role == "customer":
            is_staff_flag = False

        user.is_staff = is_staff_flag
        user.is_superuser = is_superuser_flag

        # =====================
        # 🔥 PASSWORD (OPTIONAL)
        # =====================
        password = data.get("password")
        if password:
            user.set_password(password)
        # =====================
        # 🔥 WAREHOUSE FIX (IMPORTANT)
        # =====================
        pickup_id = data.get("default_pickup_warehouse")
        staff_id = data.get("staff_warehouse")

        user.default_pickup_warehouse = (
            Warehouse.objects.get(id=pickup_id)
            if pickup_id else None
        )

        user.staff_warehouse = (
            Warehouse.objects.get(id=staff_id)
            if staff_id else None
        )
        user.save()

        return JsonResponse({
            "success": True,
            "message": "User updated successfully"
        })

    return JsonResponse({
        "success": False,
        "error": "Invalid request method"
    })



from django.shortcuts import render, get_object_or_404

def edit_user(request, id):

    user = get_object_or_404(Accounts, id=id)

    roles = [
        ("admin", "Admin"),
        ("staff", "Staff"),
        ("customer", "Customer"),
    ]

    warehouses = Warehouse.objects.all()

    context = {
        "user": user,
        "roles": roles,
        "warehouses": warehouses,
        "mode": "edit",
        "selected_role": user.role,
    }

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'dashboard/partials/add_users.html', context)

    return render(request, 'dashboard/base.html', context)


#=====end user update




#========details user ======


from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required


@login_required
def user_details(request, id):

    user = get_object_or_404(Accounts, id=id)

    packages = Package.objects.filter(user=user)

    context = {
        "user": user,
        "total_shipments": packages.count(),
        "in_transit": packages.filter(status='in_transit').count(),
        "ready_pickup": packages.filter(status='ready_pickup').count(),
        "canceled": packages.filter(status='canceled').count(),  # si ou gen li
    }

    # 🔥 SPA PARTIAL
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, "dashboard/partials/user_details.html", context)

    # 🔥 FULL LOAD (fallback)
    return render(request, "dashboard/base.html", context)


#==== delete user tableau


import json
from django.http import JsonResponse

def delete_users(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user_ids = data.get("user_ids", [])

        Accounts.objects.filter(id__in=user_ids).delete()

        return JsonResponse({"success": True})

    return JsonResponse({"success": False})


#====end delete



from django.db.models import Q, Count
from django.core.paginator import Paginator

def shipment_list(request):

    # =====================================
    # 🔍 SEARCH QUERY
    # =====================================

    query = request.GET.get(
        "q",
        ""
    ).strip()
    status = request.GET.get(
        "status",
        ""
    ).strip()




    # =====================================
    # 📦 SHIPMENTS
    # =====================================

    packages = Package.objects.select_related(

        "origin_warehouse",

        "destination_warehouse",

        "created_by"

    ).order_by(

        "-created_at"

    )




    # =====================================
    # 🔥 SEARCH FILTER
    # =====================================

    if status and status.lower() != "all":
        packages = packages.filter(
            status=status
        )

    if(

        query

        and

        query.lower() != "none"

    ):

        packages = packages.filter(

            Q(
                tracking_number__icontains=query
            )

            |

            Q(
                code__icontains=query
            )

            |

            Q(
                pickup_code__icontains=query
            )

        )




    # =====================================
    # 📄 PAGINATION
    # =====================================

    paginator = Paginator(

        packages,

        10

    )



    page_number = request.GET.get(
        "page"
    )



    page_obj = paginator.get_page(
        page_number
    )




    # =====================================
    # 📊 STATS
    # =====================================

    stats = Package.objects.aggregate(

        total = Count(
            "id"
        ),



        in_transit = Count(

            "id",

            filter=Q(
                status="in_transit"
            )

        ),



        ready_pickup = Count(

            "id",

            filter=Q(
                status="ready_pickup"
            )

        ),



        delivered = Count(

            "id",

            filter=Q(
                status="delivered"
            )

        ),

    )




    # =====================================
    # CONTEXT
    # =====================================

    context = {

        "packages":
        page_obj,



        "page_obj":
        page_obj,



        "query":
        query,



        "total_shipments":
        stats["total"],



        "in_transit":
        stats["in_transit"],



        "ready_pickup":
        stats["ready_pickup"],



        "delivered":
        stats["delivered"],

    }




    # =====================================
    # AJAX
    # =====================================

    if request.headers.get(
        "x-requested-with"
    ) == "XMLHttpRequest":

        return render(

            request,

            "dashboard/partials/shipment_table.html",

            context

        )




    # =====================================
    # NORMAL PAGE
    # =====================================

    return render(

        request,

        "dashboard/base.html",

        context

    )





#===== shipment CRUD add =============

def add_shipment(request):

    warehouses = Warehouse.objects.all()
    categories = Category.objects.all()

    context = {
        "warehouses": warehouses,
        "categories": categories,
        "shipping_types": Package.SHIPPING_TYPE_CHOICES
    }

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, "dashboard/partials/add_shipment.html", context)

    return render(request, "dashboard/base.html", context)


# 🔍 SEARCH USERS
@api_view(['GET'])
def search_users(request):
    q = request.GET.get('q', '')

    users = User.objects.filter(first_name__icontains=q) | User.objects.filter(email__icontains=q)

    data = [
        {
            "id": u.id,
            "name": f"{u.first_name} {u.last_name}",
            "email": u.email,
        }
        for u in users[:10]
    ]

    return Response(data)

@api_view(['GET'])
def user_contacts(request):

    q = request.GET.get('q', '')

    contacts = Contact.objects.all()

    if q:
        contacts = contacts.filter(name__icontains=q)

    data = [
        {
            "id": c.id,
            "name": c.name,
            "phone": c.phone,
        }
        for c in contacts[:10]
    ]

    return Response(data)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # 🔥 enpòtan
def create_shipment(request):

    data = request.data

    try:
        package = Package.objects.create(
            user_id=data.get("user") or None,
            sender_id=data.get("sender"),
            receiver_id=data.get("receiver"),

            origin_warehouse_id=data.get("origin_warehouse"),
            destination_warehouse_id=data.get("destination_warehouse"),
            category_id=data.get("category"),
            shipping_type=data.get("shipping_type"),

            # 🔥 IMPORTANT
            shipment_type=data.get("shipment_type") or "standard",
            payment_status=data.get("payment_status") or "unpaid",

            weight=float(data.get("weight") or 0),
            length=float(data.get("length") or 0),
            width=float(data.get("width") or 0),
            height=float(data.get("height") or 0),
            quantity=int(data.get("quantity") or 1),
            extra_fee=float(data.get("extra_fee") or 0),

            description=data.get("description") or "",

            # 🔥 SA A KI ENPÒTAN
            created_by=request.user
        )

        return Response({
            "tracking": package.tracking_number,
            "pkg": package.code,
            "price": package.price,
            "id": package.id,
        })

    except Exception as e:
        return Response({"error": str(e)}, status=400)



@api_view(['POST'])
def create_contact(request):

    data = request.data

    contact = Contact.objects.create(
        user_id=data.get("user"),
        name=data.get("name"),
        phone=data.get("phone"),
        email=data.get("email"),
        address=data.get("address"),
        is_guest=data.get("is_guest")
    )

    return Response({
        "id": contact.id,
        "name": contact.name,
        "phone": contact.phone
    })


@api_view(['POST'])
def create_contact(request):

    data = request.data

    raw_user = data.get("user")

    # 🔥 normalize boolean
    is_guest = data.get("is_guest") in ["true", "on", True, "1"]

    # 🔥 normalize user
    try:
        user_id = int(raw_user) if raw_user not in ["", None, "null"] else None
    except:
        user_id = None

    contact = Contact.objects.create(
        user_id=user_id if not is_guest else None,
        name=(data.get("name") or "").strip(),
        phone=(data.get("phone") or "").strip(),
        email=(data.get("email") or "").strip(),
        address=(data.get("address") or "").strip(),
        is_guest=is_guest
    )

    return Response({
        "success": True,
        "user_received": raw_user,   # 🔥 DEBUG
        "user_saved": user_id       # 🔥 DEBUG
    })





#======== detail shipments =====




def shipment_details(request, id):
    package = get_object_or_404(Package, id=id)

    # 🔥 pran tout updates
    updates = package.updates.all().order_by('created_at')

    # 🔥 kenbe sèlman dènye pa status
    seen = {}
    for u in updates:
        seen[u.status] = u  # overwrite → kenbe dènye a

    # 🔥 convert + re-order
    tracking = list(seen.values())
    tracking.sort(key=lambda x: x.created_at)

    # 🔥 LAST UPDATE LOGIC
    last_update = package.updates.order_by('-created_at').first()

    if not last_update:
        last_update_date = package.created_at
    else:
        last_update_date = last_update.created_at

    context = {
        "package": package,
        "tracking": tracking,
        "last_update": last_update_date,
    }

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, "dashboard/partials/shipment_details.html", context)

    return render(request, "dashboard/base.html", context)





#==== track admin panel
def admin_track_package(request):
    tracking_number = request.GET.get("tracking_number", "").strip()

    try:
        package = Package.objects.get(tracking_number__iexact=tracking_number)

        updates = package.updates.all().order_by("created_at")

        STATUS_ORDER = [
            "received",
            "in_transit",
            "ready_pickup",
            "delivered"
        ]

        timeline = []

        for status in STATUS_ORDER:

            # 🔥 SPECIAL CASE → RECEIVED
            if status == "received":
                timeline.append({
                    "status": "Received",
                    "warehouse": package.origin_warehouse.name if package.origin_warehouse else "N/A",
                    "date": package.created_at.strftime("%b %d, %Y") if package.created_at else "",
                    "time": package.created_at.strftime("%I:%M %p") if package.created_at else "",
                    "done": True  # 🔥 toujou premye step fèt
                })
                continue

            # 🔥 lòt status yo
            last = updates.filter(status=status).last()

            if last:
                timeline.append({
                    "status": status.replace("_", " ").title(),
                    "warehouse": last.warehouse.name if last.warehouse else "N/A",
                    "date": last.created_at.strftime("%b %d, %Y"),
                    "time": last.created_at.strftime("%I:%M %p"),
                    "done": True
                })
            else:
                timeline.append({
                    "status": status.replace("_", " ").title(),
                    "warehouse": "",
                    "date": "",
                    "time": "",
                    "done": False
                })

        return JsonResponse({
            "success": True,
            "timeline": timeline
        })

    except Package.DoesNotExist:
        return JsonResponse({
            "success": False,
            "error": "Tracking number not found"
        })







#==== update shipment

def edit_shipment(request, id):

    package = get_object_or_404(Package, id=id)

    context = {
        "package": package,
        "warehouses": Warehouse.objects.all(),
        "categories": Category.objects.all(),
        "shipping_types": Package.SHIPPING_TYPE_CHOICES
    }

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, "dashboard/partials/add_shipment.html", context)

    return render(request, "dashboard/base.html", context)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_shipment(request, id):

    package = get_object_or_404(Package, id=id)

    data = request.data

    try:
        # =====================
        # 🔹 BASIC RELATIONS
        # =====================
        package.user_id = data.get("user") or None
        package.sender_id = data.get("sender") or None
        package.receiver_id = data.get("receiver") or None

        package.origin_warehouse_id = data.get("origin_warehouse")
        package.destination_warehouse_id = data.get("destination_warehouse")
        package.category_id = data.get("category")
        package.shipping_type = data.get("shipping_type")

        # =====================
        # 🔹 DIMENSIONS
        # =====================
        # 🔥 IMPORTANT

        package.shipment_type = data.get("shipment_type") or "standard"
        package.payment_status = data.get("payment_status") or "unpaid"
        package.status = data.get("status") or "received"
        package.weight = float(data.get("weight") or 0)
        package.length = float(data.get("length") or 0)
        package.width = float(data.get("width") or 0)
        package.height = float(data.get("height") or 0)
        package.quantity = int(data.get("quantity") or 1)

        # =====================
        # 🔹 FEES
        # =====================
        package.extra_fee = float(data.get("extra_fee") or 0)

        # =====================
        # 🔹 DESCRIPTION
        # =====================
        package.description = data.get("description") or ""

        # 🔥 SI OU GEN AUTO PRICE LOGIC → li ap rekalkile otomatik
        package.save()

        return Response({
            "success": True,
            "message": "Shipment updated successfully",
            "tracking": package.tracking_number,
            "pkg": package.code,
            "price": package.price,
        })

    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=400)





##======= delete shipment ====

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_shipment(request, id):

    package = get_object_or_404(Package, id=id)
    package.delete()

    return Response({
        "success": True
    })





# =========================
# 📦 WAREHOUSE LIST
# =========================
def warehouses(request):

    q = request.GET.get("q", "")

    warehouses = Warehouse.objects.all().order_by("-id")

    # 🔍 SEARCH
    if q:
        warehouses = warehouses.filter(
            Q(name__icontains=q) |
            Q(city__icontains=q) |
            Q(state__icontains=q) |
            Q(area__icontains=q) |
            Q(type__icontains=q)
        )

    # 📄 PAGINATION
    paginator = Paginator(warehouses, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    context = {
        "warehouses": page_obj,
        "page_obj": page_obj,
        "q": q,
    }

    # 🔥 PARTIAL LOAD
    if request.headers.get("x-requested-with") == "XMLHttpRequest":
        return render(
            request,
            "dashboard/partials/warehouse_table.html",
            context
        )

    return render(
        request,
        "dashboard/base.html",
        context
    )




## add warehouses


from django.http import JsonResponse
from django.views.decorators.http import require_POST
@require_POST
def add_warehouse(request):

    warehouse_id =request.POST.get("warehouse_id")

    name =request.POST.get("name")

    city =request.POST.get("city")

    state =request.POST.get("state")

    area =request.POST.get("area")

    zip_code =request.POST.get("zip_code")

    address =request.POST.get("address")

    warehouse_type =request.POST.get("type")

    label_code =request.POST.get("label_code")

    errors = {}

    # VALIDATION
    if not name:
        errors["name"] ="Warehouse name is required"

    if not city:
        errors["city"] ="City is required"

    if not state:
        errors["state"] ="State is required"

    if not area:
        errors["area"] ="Area is required"

    if not address:
        errors["address"] ="Address is required"

    if not warehouse_type:
        errors["type"] ="Warehouse type is required"

    if not label_code:
        errors["label_code"] ="Label code is required"

    # ERRORS
    if errors:

        return JsonResponse({

            "success": False,
            "errors": errors

        })


    # ====================================
    # UPDATE
    # ====================================
    if warehouse_id:

        warehouse =Warehouse.objects.get(
            id=warehouse_id
        )

        warehouse.name = name
        warehouse.city = city
        warehouse.state = state
        warehouse.area = area
        warehouse.zip_code = zip_code
        warehouse.address = address
        warehouse.type = warehouse_type
        warehouse.label_code = (
            label_code.upper()
        )

        warehouse.save()

        return JsonResponse({

            "success": True,

            "message":
            "Warehouse updated successfully"

        })


    # ====================================
    # CREATE
    # ====================================
    warehouse =Warehouse.objects.create(

        name=name,
        city=city,
        state=state,
        area=area,
        zip_code=zip_code,
        address=address,
        type=warehouse_type,
        label_code=label_code.upper()

    )

    return JsonResponse({

        "success": True,

        "message":
        "Warehouse added successfully",

        "warehouse_id":
        warehouse.id

    })




def edit_warehouse(request, id):

    warehouse = get_object_or_404(
        Warehouse,
        id=id
    )

    data = {

        "id": warehouse.id,
        "name": warehouse.name,
        "type": warehouse.type,
        "city": warehouse.city,
        "state": warehouse.state,
        "area": warehouse.area,
        "zip_code": warehouse.zip_code,
        "label_code": warehouse.label_code,
        "address": warehouse.address,

    }

    return JsonResponse(data)



## delete warehouse

@require_POST
def delete_warehouse(request, id):

    try:

        warehouse =Warehouse.objects.get(id=id)

        warehouse.delete()

        return JsonResponse({

            "success": True,
            "message":
            "Warehouse deleted successfully"

        })

    except Warehouse.DoesNotExist:

        return JsonResponse({

            "success": False,
            "message":
            "Warehouse not found"

        })







## Tracking update

def tracking_updates(request):

    q =request.GET.get("q", "")

    tracking_updates =TrackingUpdate.objects.select_related(
        "package",
        "warehouse",
        "updated_by"
    ).order_by("-created_at")


    # SEARCH
    if q:

        tracking_updates =tracking_updates.filter(

            Q(
                package__tracking_number__icontains=q
            )

            |

            Q(
                package__code__icontains=q
            )

        )


    # PAGINATION
    paginator =Paginator(tracking_updates, 20)

    page_number =request.GET.get("page")

    page_obj =paginator.get_page(page_number)


    # STATS
    total_updates =tracking_updates.count()

    in_transit =tracking_updates.filter(
        status="in_transit"
    ).count()

    delivered =tracking_updates.filter(
        status="delivered"
    ).count()

    latest_update =tracking_updates.first()


    context = {

        "tracking_updates":
        page_obj,

        "page_obj":
        page_obj,

        "q":
        q,

        "total_updates":
        total_updates,

        "in_transit":
        in_transit,

        "delivered":
        delivered,

        "latest_update":
        latest_update,

    }


    # AJAX LOAD
    if request.headers.get(
        "x-requested-with"
    ) == "XMLHttpRequest":

        return render(

            request,

            "dashboard/partials/tracking_tableau.html",

            context

        )


    return render(

        request,

        "dashboard/base.html",

        context

    )



# =========================================
# DELETE TRACKING UPDATE
# =========================================

@require_POST
def delete_tracking_update(request, id):

    tracking =get_object_or_404(
        TrackingUpdate,
        id=id
    )

    tracking.delete()

    return JsonResponse({

        "success": True,

        "message":
        "Tracking update deleted"

    })






# =========================================
# CATEGORY LIST
# =========================================

def categories(request):

    q = request.GET.get("q", "")

    categories = (
        Category.objects
        .all()
        .order_by("-id")
    )



    # SEARCH
    if q:

        categories = (
            categories.filter(
                Q(name__icontains=q)
            )
        )



    # PAGINATION
    paginator = Paginator(
        categories,
        10
    )

    page_number =request.GET.get("page")

    page_obj =paginator.get_page(page_number)



    context = {

        "categories":
        page_obj,

        "page_obj":
        page_obj,

        "q":
        q,

    }



    # AJAX LOAD
    if request.headers.get(
        "x-requested-with"
    ) == "XMLHttpRequest":

        return render(

            request,

            "dashboard/partials/category_table.html",

            context

        )



    return render(

        request,

        "dashboard/base.html",

        context

    )





# =========================================
# ADD CATEGORY
# =========================================

@require_POST
def add_category(request):

    name =request.POST.get("name")

    surcharge =request.POST.get("surcharge")

    errors = {}



    # VALIDATION
    if not name:

        errors["name"] ="Category name required"



    if not surcharge:

        errors["surcharge"] ="Surcharge required"



    # RETURN ERRORS
    if errors:

        return JsonResponse({

            "success": False,

            "errors": errors

        })



    # CREATE
    category =Category.objects.create(

        name=name,

        surcharge=surcharge

    )



    return JsonResponse({

        "success": True,

        "message":
        "Category added successfully",

        "category_id":
        category.id

    })





# =========================================
# EDIT CATEGORY
# =========================================

def edit_category(request, id):

    category =get_object_or_404(
        Category,
        id=id
    )



    data = {

        "id":
        category.id,

        "name":
        category.name,

        "surcharge":
        str(category.surcharge),

    }



    return JsonResponse(data)





# =========================================
# UPDATE CATEGORY
# =========================================

@require_POST
def update_category(request):

    category_id =request.POST.get(
        "category_id"
    )



    category =get_object_or_404(
        Category,
        id=category_id
    )



    name =request.POST.get("name")

    surcharge =request.POST.get("surcharge")



    errors = {}



    # VALIDATION
    if not name:

        errors["name"] ="Category name required"



    if not surcharge:

        errors["surcharge"] ="Surcharge required"



    if errors:

        return JsonResponse({

            "success": False,

            "errors": errors

        })



    # UPDATE
    category.name = name

    category.surcharge = surcharge

    category.save()



    return JsonResponse({

        "success": True,

        "message":
        "Category updated successfully"

    })





# =========================================
# DELETE CATEGORY
# =========================================

@require_POST
def delete_category(request, id):

    category =get_object_or_404(
        Category,
        id=id
    )

    category.delete()



    return JsonResponse({

        "success": True,

        "message":
        "Category deleted successfully"

    })







# =========================================
# CONTACTS PAGE
# =========================================



def contacts(request):

    q = request.GET.get("q", "")

    contacts = (
        Contact.objects
        .select_related("user")
        .order_by("-created_at")
    )



    # SEARCH
    if q:

        contacts = (
            contacts.filter(

                Q(name__icontains=q)

                |

                Q(phone__icontains=q)

                |

                Q(email__icontains=q)

            )
        )



    # PAGINATION
    paginator = Paginator(
        contacts,
        10
    )

    page_number =request.GET.get("page")

    page_obj =paginator.get_page(page_number)



    # STATS
    total_contacts =contacts.count()

    guest_contacts =contacts.filter(
        is_guest=True
    ).count()

    registered_contacts =contacts.filter(
        is_guest=False
    ).count()

    latest_contact =contacts.first()



    # CONTEXT
    context = {

        "contacts":
        page_obj,

        "page_obj":
        page_obj,

        "q":
        q,

        "total_contacts":
        total_contacts,

        "guest_contacts":
        guest_contacts,

        "registered_contacts":
        registered_contacts,

        "latest_contact":
        latest_contact,

    }



    # AJAX LOAD
    if request.headers.get(
        "x-requested-with"
    ) == "XMLHttpRequest":

        return render(

            request,

            "dashboard/partials/contact_table.html",

            context

        )



    return render(

        request,

        "dashboard/base.html",

        context

    )





# =========================================
# EDIT CONTACT
# =========================================

def edit_contact(request, id):

    contact =get_object_or_404(
        Contact,
        id=id
    )



    data = {

        "id":
        contact.id,

        "name":
        contact.name,

        "phone":
        contact.phone,

        "email":
        contact.email,

        "address":
        contact.address,

        "is_guest":
        contact.is_guest,

        "user":
        contact.user.id
        if contact.user else None,

        "user_name":
        contact.user.username
        if contact.user else "",

    }



    return JsonResponse(data)




# =========================================
# UPDATE CONTACT
# =========================================

@require_POST
def update_contact(request):

    try:

        # CONTACT ID
        contact_id =request.POST.get(
            "contact_id"
        )



        contact =get_object_or_404(

            Contact,

            id=contact_id

        )




        # USER
        user_id =request.POST.get(
            "user"
        )



        user = None

        if user_id:

            user =User.objects.filter(
                id=user_id
            ).first()




        # UPDATE DATA
        contact.user = user

        contact.name =request.POST.get(
            "name"
        )

        contact.phone =request.POST.get(
            "phone"
        )

        contact.email =request.POST.get(
            "email"
        )

        contact.address =request.POST.get(
            "address"
        )



        # GUEST
        contact.is_guest = (
            True
            if request.POST.get(
                "is_guest"
            )
            else False
        )




        # SAVE
        contact.save()




        return JsonResponse({

            "success": True,

            "message":
            "Contact updated successfully"

        })




    except Exception as e:

        print(
            "UPDATE CONTACT ERROR:",
            e
        )



        return JsonResponse({

            "success": False,

            "message": str(e)

        })





# =========================================
# DELETE CONTACT
# =========================================

@require_POST
def delete_contact(request, id):

    try:

        contact =get_object_or_404(
            Contact,
            id=id
        )



        contact.delete()



        return JsonResponse({

            "success": True,

            "message":
            "Contact deleted successfully"

        })



    except Exception as e:

        return JsonResponse({

            "success": False,

            "message": str(e)

        })









# =========================================
# PRICING RULES PAGE
# =========================================

def pricing_rules(request):

    q = request.GET.get("q", "")



    pricing_rules =PricingRule.objects.all().order_by("-id")



    # SEARCH
    if q:

        pricing_rules =pricing_rules.filter(

            Q(
                shipping_type__icontains=q
            )

        )



    # PAGINATION
    paginator =Paginator(
        pricing_rules,
        10
    )



    page_number =request.GET.get("page")



    page_obj =paginator.get_page(page_number)




    # STATS
    total_rules =pricing_rules.count()




    air_rules =pricing_rules.filter(
        shipping_type="air"
    ).count()




    sea_rules =pricing_rules.filter(
        shipping_type="sea"
    ).count()




    latest_rule =pricing_rules.first()




    context = {

        "pricing_rules":
        page_obj,

        "page_obj":
        page_obj,

        "q":
        q,

        "total_rules":
        total_rules,

        "air_rules":
        air_rules,

        "sea_rules":
        sea_rules,

        "latest_rule":
        latest_rule,

    }




    # AJAX
    if request.headers.get(
        "x-requested-with"
    ) == "XMLHttpRequest":

        return render(

            request,

            "dashboard/partials/pricing_rule_table.html",

            context

        )




    return render(

        request,

        "dashboard/base.html",

        context

    )





# =========================================
# CREATE PRICING RULE
# =========================================

@require_POST
def create_pricing_rule(request):

    shipping_type = request.POST.get(
        "shipping_type"
    )

    price_per_lb = request.POST.get(
        "price_per_lb"
    )

    volumetric_divisor = request.POST.get(
        "volumetric_divisor"
    )

    minimum_charge = request.POST.get(
        "minimum_charge"
    )



    errors = {}



    # VALIDATION
    if not shipping_type:

        errors["shipping_type"] ="Shipping type required"



    if not price_per_lb:

        errors["price_per_lb"] ="Price required"



    if not volumetric_divisor:

        errors["volumetric_divisor"] ="Volumetric divisor required"



    if not minimum_charge:

        errors["minimum_charge"] ="Minimum charge required"




    # ERRORS
    if errors:

        return JsonResponse({

            "success": False,

            "errors": errors

        })




    # CREATE
    PricingRule.objects.create(

        shipping_type=
        shipping_type,

        price_per_lb=
        price_per_lb,

        volumetric_divisor=
        volumetric_divisor,

        minimum_charge=
        minimum_charge,

    )




    return JsonResponse({

        "success": True,

        "message":
        "Pricing rule created successfully"

    })





# =========================================
# EDIT PRICING RULE
# =========================================

def edit_pricing_rule(request, id):

    pricing =get_object_or_404(

        PricingRule,

        id=id

    )



    data = {

        "id":
        pricing.id,

        "shipping_type":
        pricing.shipping_type,

        "price_per_lb":
        str(
            pricing.price_per_lb
        ),

        "volumetric_divisor":
        pricing.volumetric_divisor,

        "minimum_charge":
        str(
            pricing.minimum_charge
        ),

    }



    return JsonResponse(data)





# =========================================
# UPDATE PRICING RULE
# =========================================

@require_POST
def update_pricing_rule(request):

    try:

        pricing_id =request.POST.get(
            "pricing_id"
        )



        pricing =get_object_or_404(

            PricingRule,

            id=pricing_id

        )



        pricing.shipping_type =request.POST.get(
            "shipping_type"
        )



        pricing.price_per_lb =request.POST.get(
            "price_per_lb"
        )



        pricing.volumetric_divisor =request.POST.get(
            "volumetric_divisor"
        )



        pricing.minimum_charge =request.POST.get(
            "minimum_charge"
        )



        pricing.save()




        return JsonResponse({

            "success": True,

            "message":
            "Pricing rule updated successfully"

        })



    except Exception as e:

        return JsonResponse({

            "success": False,

            "message": str(e)

        })





# =========================================
# DELETE PRICING RULE
# =========================================

@require_POST
def delete_pricing_rule(request, id):

    try:

        pricing =get_object_or_404(

            PricingRule,

            id=id

        )



        pricing.delete()




        return JsonResponse({

            "success": True,

            "message":
            "Pricing rule deleted successfully"

        })



    except Exception as e:

        return JsonResponse({

            "success": False,

            "message": str(e)

        })







# =========================================
# ROUTE PRICING PAGE
# =========================================

def route_pricings(request):

    q = request.GET.get("q", "")



    route_pricings =RoutePricing.objects.all().order_by("-id")



    # SEARCH
    if q:

        route_pricings =route_pricings.filter(

            Q(
                origin_type__icontains=q
            )

            |

            Q(
                destination_type__icontains=q
            )

            |

            Q(
                shipping_type__icontains=q
            )

        )



    # PAGINATION
    paginator =Paginator(
        route_pricings,
        10
    )



    page_number =request.GET.get("page")



    page_obj =paginator.get_page(page_number)




    # STATS
    total_routes =route_pricings.count()




    air_routes =route_pricings.filter(
        shipping_type="air"
    ).count()




    sea_routes =route_pricings.filter(
        shipping_type="sea"
    ).count()




    latest_route =route_pricings.first()




    context = {

        "route_pricings":
        page_obj,

        "page_obj":
        page_obj,

        "q":
        q,

        "total_routes":
        total_routes,

        "air_routes":
        air_routes,

        "sea_routes":
        sea_routes,

        "latest_route":
        latest_route,

    }




    # AJAX
    if request.headers.get(
        "x-requested-with"
    ) == "XMLHttpRequest":

        return render(

            request,

            "dashboard/partials/route_pricing_table.html",

            context

        )




    return render(

        request,

        "dashboard/base.html",

        context

    )





# =========================================
# CREATE ROUTE PRICING
# =========================================

@require_POST
def create_route_pricing(request):

    origin_type =request.POST.get(
        "origin_type"
    )



    destination_type =request.POST.get(
        "destination_type"
    )



    shipping_type =request.POST.get(
        "shipping_type"
    )



    price_per_lb =request.POST.get(
        "price_per_lb"
    )



    errors = {}



    if not origin_type:

        errors["origin_type"] ="Origin required"



    if not destination_type:

        errors["destination_type"] ="Destination required"



    if not shipping_type:

        errors["shipping_type"] ="Shipping type required"



    if not price_per_lb:

        errors["price_per_lb"] ="Price required"




    if errors:

        return JsonResponse({

            "success": False,

            "errors": errors

        })

    print("CREATE ROUTE PRICING CALLED")
    RoutePricing.objects.create(

        origin_type=
        origin_type,

        destination_type=
        destination_type,

        shipping_type=
        shipping_type,

        price_per_lb=
        price_per_lb,

    )




    return JsonResponse({

        "success": True,

        "message":
        "Route pricing created successfully"

    })





# =========================================
# EDIT ROUTE PRICING
# =========================================

def edit_route_pricing(request, id):

    route =get_object_or_404(

        RoutePricing,

        id=id

    )



    data = {

        "id":
        route.id,

        "origin_type":
        route.origin_type,

        "destination_type":
        route.destination_type,

        "shipping_type":
        route.shipping_type,

        "price_per_lb":
        str(
            route.price_per_lb
        ),

    }



    return JsonResponse(data)




# =========================================
# UPDATE ROUTE PRICING
# =========================================

@require_POST
def update_route_pricing(request):

    try:

        route_id =request.POST.get(
            "route_id"
        )



        route =get_object_or_404(

            RoutePricing,

            id=route_id

        )



        route.origin_type =request.POST.get(
            "origin_type"
        )



        route.destination_type =request.POST.get(
            "destination_type"
        )



        route.shipping_type =request.POST.get(
            "shipping_type"
        )



        route.price_per_lb =request.POST.get(
            "price_per_lb"
        )



        route.save()




        return JsonResponse({

            "success": True,

            "message":
            "Route pricing updated successfully"

        })



    except Exception as e:

        return JsonResponse({

            "success": False,

            "message": str(e)

        })




# =========================================
# DELETE ROUTE PRICING
# =========================================

@require_POST
def delete_route_pricing(request, id):

    try:

        route =get_object_or_404(

            RoutePricing,

            id=id

        )



        route.delete()




        return JsonResponse({

            "success": True,

            "message":
            "Route pricing deleted successfully"

        })



    except Exception as e:

        return JsonResponse({

            "success": False,

            "message": str(e)

        })



def calculator(request):

    # =========================================
    # AJAX CALCULATION
    # =========================================

    if request.method == "POST":

        try:

            # =========================================
            # FORM DATA
            # =========================================

            origin = request.POST.get(
                "origin"
            )



            destination = request.POST.get(
                "destination"
            )



            shipping_type = request.POST.get(
                "shipping_type"
            )



            category_id = request.POST.get(
                "category"
            )



            weight = float(
                request.POST.get(
                    "weight",
                    0
                )
            )



            length = float(
                request.POST.get(
                    "length",
                    0
                )
            )



            width = float(
                request.POST.get(
                    "width",
                    0
                )
            )



            height = float(
                request.POST.get(
                    "height",
                    0
                )
            )



            quantity = int(
                request.POST.get(
                    "quantity",
                    1
                )
            )



            insurance = request.POST.get(
                "insurance"
            )



            # =========================================
            # CATEGORY
            # =========================================

            category = None



            if category_id:

                category = \
                Category.objects.filter(
                    id=category_id
                ).first()



            # =========================================
            # WAREHOUSES
            # =========================================

            origin_warehouse = \
            Warehouse.objects.filter(
                type=origin
            ).first()



            destination_warehouse = \
            Warehouse.objects.filter(
                type=destination
            ).first()



            # =========================================
            # CHECK
            # =========================================

            if not origin_warehouse:

                return JsonResponse({

                    "success": False,

                    "error":
                    "Origin warehouse not found"

                })



            if not destination_warehouse:

                return JsonResponse({

                    "success": False,

                    "error":
                    "Destination warehouse not found"

                })



            # =========================================
            # TEMP PACKAGE
            # =========================================

            package =SimpleNamespace()



            package.origin_warehouse = \
            origin_warehouse



            package.destination_warehouse = \
            destination_warehouse



            package.shipping_type = \
            shipping_type



            package.weight = \
            weight



            package.length = \
            length



            package.width = \
            width



            package.height = \
            height



            package.quantity = \
            quantity



            package.category = \
            category



            package.extra_fee = 0



            # =========================================
            # MAIN PRICE
            # =========================================

            total = calculate_price(
                package
            )



            # =========================================
            # INSURANCE
            # =========================================

            insurance_fee = 0



            if insurance == "yes":

                insurance_fee = (
                    total * 0.02
                )



                total += insurance_fee



            # =========================================
            # DELIVERY TIME
            # =========================================

            delivery_time = \
            "3 - 5 Business Days"



            if shipping_type == "sea":

                delivery_time = \
                "10 - 20 Business Days"



            # =========================================
            # RESPONSE
            # =========================================

            return JsonResponse({

                "success": True,

                "base_price":
                    round(total, 2),

                "weight_price":
                    round(total, 2),

                "dimension_price":
                    0,

                "insurance_price":
                    round(
                        insurance_fee,
                        2
                    ),

                "fuel_price":
                    0,

                "total":
                    round(total, 2),

                "delivery_time":
                    delivery_time,

            })



        except Exception as e:

            return JsonResponse({

                "success": False,

                "error": str(e)

            })



    # =========================================
    # NORMAL PAGE LOAD
    # =========================================

    categories = \
    Category.objects.all()



    warehouses = \
    Warehouse.objects.all()




    context = {

        "categories":
        categories,

        "warehouses":
        warehouses

    }



    # =========================================
    # AJAX LOAD
    # =========================================

    if request.headers.get(
        "x-requested-with"
    ) == "XMLHttpRequest":

        return render(

            request,

            "dashboard/partials/calculator.html",

            context

        )



    return render(

        request,

        "dashboard/base.html",

        context

    )

def term_condition(request):
    return render(request,'term_and_condition.html')




class KYCAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        kyc = KYC.objects.filter(user=request.user).first()

        if not kyc:
            return Response({
                "kyc_submitted": False
            })

        serializer = KYCSerializer(kyc)

        return Response({
            "kyc_submitted": True,
            "data": serializer.data
        })

    def post(self, request):

        # verify si user deja gen kyc
        existing_kyc = KYC.objects.filter(
            user=request.user
        ).first()

        # pending oubyen approved
        if existing_kyc:

            if existing_kyc.status in [
                "pending",
                "approved"
            ]:
                return Response({

                    "error":
                        "KYC already submitted"

                }, status=400)

            # rejected -> update li
            if existing_kyc.status == "rejected":

                serializer = KYCSerializer(

                    existing_kyc,

                    data=request.data,

                    partial=True

                )

                if serializer.is_valid():
                    serializer.save(
                        status="pending"
                    )

                    return Response({

                        "message":
                            "KYC resubmitted successfully",

                        "data":
                            serializer.data

                    })

                return Response(
                    serializer.errors,
                    status=400
                )

        # nouvo KYC
        serializer = KYCSerializer(
            data=request.data
        )

        send_kyc_submitted_email(

            request.user,

            request.COOKIES.get(
                "django_language",
                "en"
            )

        )

        if serializer.is_valid():
            serializer.save(
                user=request.user
            )

            return Response({

                "message":
                    "KYC submitted successfully",

                "data":
                    serializer.data

            })

        return Response(
            serializer.errors,
            status=400
        )






# =========================
# VIEWS.PY
# =========================


# =========================
# KYC MANAGEMENT
# =========================

def kyc_management(request):

    # =========================================
    # DATA
    # =========================================

    kycs = KYC.objects.select_related(
        "user"
    ).order_by("-submitted_at")



    # =========================================
    # SEARCH
    # =========================================

    query = request.GET.get(
        "q",
        ""
    )

    if query:

        kycs = kycs.filter(

            user__email__icontains=query

        )



    # =========================================
    # STATISTICS
    # =========================================

    total_kyc = KYC.objects.count()

    pending_kyc = KYC.objects.filter(
        status="pending"
    ).count()

    approved_kyc = KYC.objects.filter(
        status="approved"
    ).count()

    rejected_kyc = KYC.objects.filter(
        status="rejected"
    ).count()



    # =========================================
    # PAGINATION
    # =========================================

    paginator = Paginator(
        kycs,
        10
    )

    page_number = request.GET.get(
        "page"
    )

    page_obj = paginator.get_page(
        page_number
    )



    # =========================================
    # CONTEXT
    # =========================================

    context = {

        "page_obj": page_obj,

        "query": query,

        "total_kyc": total_kyc,

        "pending_kyc": pending_kyc,

        "approved_kyc": approved_kyc,

        "rejected_kyc": rejected_kyc,

    }



    # =========================================
    # AJAX LOAD
    # =========================================

    if request.headers.get(
        "x-requested-with"
    ) == "XMLHttpRequest":

        return render(

            request,

            "dashboard/partials/kyc_management.html",

            context

        )



    # =========================================
    # NORMAL LOAD
    # =========================================

    return render(

        request,

        "dashboard/base.html",

        context

    )





# views.py

from django.shortcuts import (
    render,
    get_object_or_404
)




def kyc_details(request, id):

    kyc = get_object_or_404(
        KYC,
        id=id
    )


    context = {

        "kyc": kyc

    }


    # SPA AJAX LOAD
    if request.headers.get(
        "x-requested-with"
    ) == "XMLHttpRequest":

        return render(

            request,

            "dashboard/partials/kyc_details.html",

            context

        )


    return render(

        request,

        "dashboard/base.html",

        context

    )



# views.py



from django.contrib.admin.views.decorators import (
    staff_member_required
)

from django.views.decorators.http import (
    require_POST
)



from django.utils import timezone

@staff_member_required
@require_POST
def admin_kyc_decision(request, id):

    try:

        kyc = KYC.objects.get(
            id=id
        )

        data = json.loads(
            request.body
        )

        decision = data.get(
            "decision"
        )

        comment = data.get(
            "comment"
        )


        # verify
        if decision not in [
            "approved",
            "rejected"
        ]:

            return JsonResponse({

                "success": False,

                "error":
                "Invalid decision"

            })


        # update
        kyc.status = decision

        kyc.admin_note = comment

        kyc.reviewed_at = timezone.now()

        kyc.approved_by = request.user

        kyc.save()
        if decision == "approved":
            send_kyc_approved_email(

                kyc.user,

                request.COOKIES.get(
                    "django_language",
                    "en"
                )

            )

        if decision == "rejected":
            send_kyc_rejected_email(

                kyc.user,

                request.COOKIES.get(
                    "django_language",
                    "en"
                ),

                comment

            )


        return JsonResponse({

            "success": True,

            "message":
            "KYC updated successfully"

        })


    except Exception as e:

        return JsonResponse({

            "success": False,

            "error": str(e)

        })




## count nitification


# =========================
# KYC PENDING COUNT API
# =========================

from django.http import JsonResponse

def kyc_pending_count(request):

    pending = KYC.objects.filter(
        status="pending"
    )

    print(pending)
    print(pending.count())

    return JsonResponse({

        "count": pending.count()

    })





@login_required
def delete_kyc(request, kyc_id):

    if request.method == "POST":

        try:

            kyc =KYC.objects.get(
                id=kyc_id
            )

            kyc.delete()

            return JsonResponse({

                "success": True,

                "message":
                "KYC deleted successfully"

            })

        except KYC.DoesNotExist:

            return JsonResponse({

                "success": False,

                "message":
                "KYC not found"

            })

    return JsonResponse({

        "success": False

    })





## setting dashboard
@login_required
def settings_page(request):

    context = {

        "user_obj":
        request.user

    }



    # AJAX
    if request.headers.get(
        "x-requested-with"
    ) == "XMLHttpRequest":

        return render(

            request,

            "dashboard/partials/settings.html",

            context

        )



    return render(

        request,

        "dashboard/base.html",

        context

    )
@login_required
def save_settings(request):

    if request.method == "POST":

        user =request.user



        # BASIC INFO
        user.first_name = \
        request.POST.get(
            "first_name"
        )



        user.last_name = \
        request.POST.get(
            "last_name"
        )



        user.phone_number = \
        request.POST.get(
            "phone_number"
        )



        user.email = \
        request.POST.get(
            "email"
        )



        # ADDRESS
        user.country = \
        request.POST.get(
            "country"
        )



        user.state = \
        request.POST.get(
            "state"
        )



        user.city = \
        request.POST.get(
            "city"
        )



        user.full_address = \
        request.POST.get(
            "full_address"
        )



        # LANGUAGE
        user.language = \
        request.POST.get(
            "language"
        )



        # PASSWORD
        password =request.POST.get(
            "password"
        )



        confirm_password =request.POST.get(
            "confirm_password"
        )



        if password:

            if password != confirm_password:

                return JsonResponse({

                    "success": False,

                    "message":
                    "Passwords do not match"

                })



            user.set_password(
                password
            )



        # SAVE
        user.save()



        return JsonResponse({

            "success": True,

            "message":
            "Settings updated successfully"

        })



    return JsonResponse({

        "success": False

    })




@login_required
def save_settings(request):

    if request.method == "POST":

        user =request.user



        # BASIC INFO
        user.first_name = \
        request.POST.get(
            "first_name"
        )



        user.last_name = \
        request.POST.get(
            "last_name"
        )



        user.phone_number = \
        request.POST.get(
            "phone_number"
        )



        # ADDRESS
        user.country = \
        request.POST.get(
            "country"
        )



        user.state = \
        request.POST.get(
            "state"
        )



        user.city = \
        request.POST.get(
            "city"
        )



        user.full_address = \
        request.POST.get(
            "full_address"
        )



        # PASSWORD
        password =request.POST.get(
            "password"
        )



        confirm_password =request.POST.get(
            "confirm_password"
        )



        # CHANGE PASSWORD
        if password:

            if len(password) < 6:

                return JsonResponse({

                    "success": False,

                    "message":
                    "Password too short"

                })



            if password != confirm_password:

                return JsonResponse({

                    "success": False,

                    "message":
                    "Passwords do not match"

                })



            user.set_password(
                password
            )



        # SAVE
        user.save()



        return JsonResponse({

            "success": True,

            "message":
            "Settings updated successfully"

        })



    return JsonResponse({

        "success": False

    })



## calculator user

@login_required
def user_calculator(request):

    if request.method == "POST":

        try:

            data = json.loads(
                request.body
            )



            # =====================================
            # DATA
            # =====================================

            origin_id = data.get(
                "origin"
            )



            destination_id = data.get(
                "destination"
            )



            shipping_type = data.get(
                "shipping_type"
            )



            category_id = data.get(
                "category"
            )



            weight = float(
                data.get(
                    "weight",
                    0
                )
            )



            quantity = int(
                data.get(
                    "quantity",
                    1
                )
            )



            length = float(
                data.get(
                    "length",
                    0
                )
            )



            width = float(
                data.get(
                    "width",
                    0
                )
            )



            height = float(
                data.get(
                    "height",
                    0
                )
            )




            # =====================================
            # OBJECTS
            # =====================================

            origin_warehouse = \
            Warehouse.objects.get(
                id=origin_id
            )



            destination_warehouse = \
            Warehouse.objects.get(
                id=destination_id
            )



            category = \
            Category.objects.filter(
                id=category_id
            ).first()




            # =====================================
            # TEMP PACKAGE
            # =====================================

            package =SimpleNamespace()



            package.origin_warehouse = \
            origin_warehouse



            package.destination_warehouse = \
            destination_warehouse



            package.shipping_type = \
            shipping_type



            package.category = \
            category



            package.weight = \
            weight



            package.quantity = \
            quantity



            package.length = \
            length



            package.width = \
            width



            package.height = \
            height



            package.extra_fee = 0




            # =====================================
            # CALCULATE
            # =====================================

            total = calculate_price(
                package
            )




            # =====================================
            # DELIVERY
            # =====================================

            delivery_time = \
            "3 - 5 Business Days"



            if shipping_type == "sea":

                delivery_time = \
                "10 - 20 Business Days"




            # =====================================
            # RESPONSE
            # =====================================

            return JsonResponse({

                "success": True,

                "total":
                round(total, 2),

                "delivery":
                delivery_time,

            })



        except Exception as e:

            return JsonResponse({

                "success": False,

                "error": str(e)

            })



    return JsonResponse({

        "success": False,

        "error":
        "Invalid request"

    })



def custom_404(request, exception):

    return render(
        request,
        "404.html",
        status=404
    )


#==== maitenance page


def maintenance(request):

    return render(
        request,
        "maintenance.html"
    )





## staff permition



# =====================================

# STAFF PERMISSIONS
@login_required
def staff_permissions(request):

# =====================================
# SEARCH QUERY
# =====================================

    query = request.GET.get(

        "q",

        ""

    ).strip()




# =====================================
# STAFF USERS
# =====================================

    users = Accounts.objects.filter(

        role__in=[

            "admin",

            "staff"

        ]

    ).order_by(

        "-date_joined"

    )




# =====================================
# SEARCH FILTER
# =====================================

    if(

        query

        and

        query.lower() != "none"

    ):

        users = users.filter(

            Q(

                first_name__icontains=query

            )

            |

            Q(

                last_name__icontains=query

            )

            |

            Q(

                email__icontains=query

            )

        )




# =====================================
# STATS
# =====================================

    total_staff = users.count()



    active_staff = users.filter(

        is_active=True

    ).count()



    total_admin = users.filter(

        role="admin"

    ).count()



    inactive_staff = users.filter(

        is_active=False

    ).count()




    # =====================================
    # SELECTED USER
    # =====================================

    selected_user = users.first()




    # =====================================
    # CONTEXT
    # =====================================

    context = {

        "user_obj": request.user,



        "users": users,



        "selected_user": selected_user,



        "query": query,



        "total_staff": total_staff,



        "active_staff": active_staff,



        "total_admin": total_admin,



        "inactive_staff": inactive_staff,

    }




    # =====================================
    # AJAX
    # =====================================

    if request.headers.get(

        "x-requested-with"

    ) == "XMLHttpRequest":

        return render(

            request,

            "dashboard/partials/staff_permissions.html",

            context

        )




# =====================================
# NORMAL PAGE
# =====================================

    return render(

        request,

        "dashboard/base.html",

        context

    )




#==== json for slecet


@login_required
def staff_permission_data(request, user_id):

    user = Accounts.objects.get(

        id=user_id

    )



    data = {

        "id": user.id,



        "full_name":

        f"{user.first_name} {user.last_name}",



        "email":

        user.email,



        "role":

        user.role,



        "can_create_shipments":

        user.can_create_shipments,



        "can_view_customer_phone":

        user.can_view_customer_phone,



        "can_view_customer_email":

        user.can_view_customer_email,



        "can_manage_staff":

        user.can_manage_staff,



        "can_delete_users":

        user.can_delete_users,



        "can_access_settings":

        user.can_access_settings,

    }



    return JsonResponse(data)


## update staf


@login_required
def update_staff_permissions(
    request,
    user_id
):

    if request.method != "POST":

        return JsonResponse(
            {
                "success": False,
                "message": "Invalid request"
            },
            status=400
        )

    try:

        user = Accounts.objects.get(
            id=user_id
        )

        data = json.loads(
            request.body
        )

        user.can_create_shipments = data.get(
            "can_create_shipments",
            False
        )

        user.can_view_customer_phone = data.get(
            "can_view_customer_phone",
            False
        )

        user.can_view_customer_email = data.get(
            "can_view_customer_email",
            False
        )

        user.can_manage_staff = data.get(
            "can_manage_staff",
            False
        )

        user.can_delete_users = data.get(
            "can_delete_users",
            False
        )

        user.can_access_settings = data.get(
            "can_access_settings",
            False
        )
        user.can_manage_kyc=data.get(
            "can_manage_kyc",
            False
        )

        user.save()

        return JsonResponse({

            "success": True,

            "message":
            "Permissions updated successfully"

        })

    except Accounts.DoesNotExist:

        return JsonResponse({

            "success": False,

            "message":
            "User not found"

        })

    except Exception as e:

        return JsonResponse({

            "success": False,

            "message":
            str(e)

        })




# test voice call

from django.http import HttpResponse

from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def voice_menu(request):

    return HttpResponse("""
<Response>
<Say>
Welcome to CAP Shipping Distribution.
Press 1 now.
</Say>

<Gather numDigits="1"
action="https://ilana-deltoidal-raelene.ngrok-free.dev/twilio/handle-menu/"
method="POST"/>

</Response>
""", content_type="text/xml")




from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def handle_menu(request):

    digit = request.POST.get("Digits")

    if digit == "1":

        return HttpResponse("""
<Response>

<Say>
Please wait while we transfer your call.
</Say>

<Dial>
+15517953802
</Dial>

</Response>
""", content_type="text/xml")

    elif digit == "2":

        return HttpResponse("""
<Response>

<Say>
Tanpri rete tann pandan nap transfere apel ou.
</Say>

<Dial>
+16892172237
</Dial>

</Response>
""", content_type="text/xml")

    elif digit == "3":

        return HttpResponse("""
<Response>

<Say>
Veuillez patienter pendant le transfert.
</Say>

<Dial>
+16892172237
</Dial>

</Response>
""", content_type="text/xml")

    return HttpResponse("""
<Response>
<Redirect>/twilio/voice/</Redirect>
</Response>
""", content_type="text/xml")






@csrf_exempt
def handle_menu(request):

    print("========== HANDLE MENU ==========")
    print("METHOD:", request.method)
    print("POST:", request.POST)

    digit = request.POST.get("Digits")

    print("DIGIT =", digit)

    if digit == "1":

        return HttpResponse("""
<?xml version="1.0" encoding="UTF-8"?>
<Response>

    <Say voice="alice">
        Please wait while we transfer your call.
    </Say>

    <Dial>
        +15517953802
    </Dial>

</Response>
""", content_type="text/xml")

    elif digit == "2":

        return HttpResponse("""
<?xml version="1.0" encoding="UTF-8"?>
<Response>

    <Say voice="alice">
        Tanpri rete tann pandan nap transfere apel ou.
    </Say>

    <Dial>
        +16892172237
    </Dial>

</Response>
""", content_type="text/xml")

    elif digit == "3":

        return HttpResponse("""
<?xml version="1.0" encoding="UTF-8"?>
<Response>

    <Say voice="alice">
        Veuillez patienter pendant le transfert.
    </Say>

    <Dial>
        +16892172237
    </Dial>

</Response>
""", content_type="text/xml")

    return HttpResponse("""
<?xml version="1.0" encoding="UTF-8"?>
<Response>

    <Say voice="alice">
        Invalid option.
        Returning to main menu.
    </Say>

    <Redirect>
        https://ilana-deltoidal-raelene.ngrok-free.dev/twilio/voice/
    </Redirect>

</Response>
""", content_type="text/xml")