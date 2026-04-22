from django.contrib.auth.decorators import login_required, user_passes_test

from django.shortcuts import render, redirect

from accounts.models import Warehouse, PasswordResetOTP, Accounts
from accounts.serializers import RegisterSerializer ,LoginSerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import login, update_session_auth_hash

from accounts.utils import generate_otp, send_otp_email,send_welcome_email
from django.http import JsonResponse
from django.contrib.auth import get_user_model

from shipping.models import Package


#==== reset password
@api_view(["POST"])
def register_api(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        # ❗ pa aktive user la ankò
        user.is_active = False
        user.save()

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
    send_welcome_email(user)

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
    user = request.user
    context = {
        "user": user,
    }
    return render(request,'dashboard_user/dashboard.html',context)



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


from django.http import JsonResponse
from django.contrib.auth import logout


def logout_view(request):
    if request.method == "POST":
        logout(request)
        return JsonResponse({"status": "success"})

    return JsonResponse({"status": "error"})


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
from datetime import timedelta
from calendar import month_abbr

from accounts.models import Accounts


def is_admin(user):
    return user.is_staff or user.is_superuser


@login_required(login_url='/panel/login/')
@user_passes_test(is_admin, login_url='/panel/login/')
def dashboard(request):

    # ================= USERS =================
    active_users = Accounts.objects.filter(is_active=True).count()

    # ================= SHIPMENTS =================
    total_shipments = Package.objects.count()

    delivered_shipments = Package.objects.filter(
        status='delivered'
    ).count()

    # ================= REVENUE =================
    total_revenue = Package.objects.aggregate(
        total=Sum(F('price') + F('extra_fee'))
    )['total'] or 0

    # ================= LAST MONTH =================
    today = now()
    last_month = today - timedelta(days=30)

    last_month_revenue = Package.objects.filter(
        created_at__gte=last_month
    ).aggregate(
        total=Sum(F('price') + F('extra_fee'))
    )['total'] or 0

    if last_month_revenue > 0:
        revenue_change = ((total_revenue - last_month_revenue) / last_month_revenue) * 100
    else:
        revenue_change = 0

    # ================== USERS CHANGE ==================
    last_month_users = Accounts.objects.filter(
        is_active=True,
        date_joined__lt=last_month
    ).count()

    if last_month_users > 0:
        users_change = ((active_users - last_month_users) / last_month_users) * 100
    else:
        users_change = 0

    # ================== SHIPMENTS CHANGE ==================
    last_month_shipments = Package.objects.filter(
        created_at__lt=last_month
    ).count()

    if last_month_shipments > 0:
        shipments_change = ((total_shipments - last_month_shipments) / last_month_shipments) * 100
    else:
        shipments_change = 0

    # ================== DELIVERED CHANGE ==================
    last_month_delivered = Package.objects.filter(
        status='delivered',
        created_at__lt=last_month
    ).count()

    if last_month_delivered > 0:
        delivered_change = ((delivered_shipments - last_month_delivered) / last_month_delivered) * 100
    else:
        delivered_change = 0

    # ================== CHART DATA ==================



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

    # ================== MONTHLY DATA ==================
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

    # ================== FORCE 12 MONTHS ==================
    months = [month_abbr[i] for i in range(1, 13)]

    revenue_map = {
        item['month'].strftime('%b'): float(item['revenue'] or 0)
        for item in monthly_data
    }

    shipment_map = {
        item['month'].strftime('%b'): item['shipments']
        for item in monthly_data
    }

    labels = months
    revenue_data = [revenue_map.get(m, 0) for m in months]
    shipment_data = [shipment_map.get(m, 0) for m in months]

    # ================== ADD TO CONTEXT ==================
    context.update({
        'chart_labels': labels,
        'chart_revenue': revenue_data,
        'chart_shipments': shipment_data,
    })
    # 🔥 SI SE AJAX → voye data + partial
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'dashboard/partials/dashboard.html', context)

    # 🔥 SI SE NORMAL LOAD → base sèlman
    return render(request, 'dashboard/base.html')



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



def shipments(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'dashboard/partials/shipments.html')

    return render(request, 'dashboard/base.html')