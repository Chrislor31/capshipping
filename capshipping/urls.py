
from django.contrib import admin
from django.urls import path, include

from django.conf.urls.static import static
from capshipping import views, settings
from capshipping.views import logout_view, KYCAPIView

from django.shortcuts import redirect, render


def custom_404(request, exception):

    return render(
        request,
        "404.html",
        status=404
    )

handler404 = "capshipping.urls.custom_404"


urlpatterns = [
   # path('admin/', admin.site.urls),

    path('', views.index, name='home'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),

    path('register/',views.register,name='register'),
    path("change-password/", views.change_password, name="change_password"),

    #reset password and otp

   path("send-otp/", views.send_otp),
    path("verify-otp/", views.verify_otp),
    path("reset-password/", views.reset_password),
    path("reset/", views.reset_page,name='reset'),
    path("logout/", views.logout_view, name="logout"),

path("user-logout/", views.user_logout, name="user_logout"),

    path('api/register/',views.register_api),
    path("api/login/", views.login_api),
    path('login/',views.loginform,name='login'),

    path("register/", views.register_api),
    path("verify-register-otp/", views.verify_register_otp),
    path("resend-register-otp/", views.resend_register_otp),

    path('dashboard/',views.dashboard_user,name='dashboard_user'),

path(
    "update-profile/",
    views.update_profile,
    name="update_profile"
),

path(
    "user-calculator/",
    views.user_calculator,
    name="user_calculator"
),
    # language switch
    path('i18n/', include('django.conf.urls.i18n')),





    ######=====  test bar code


    path('package/<int:pk>/label/', views.package_label, name='package_label'),

    path('shipping/', include('shipping.urls')),



#=======dashboard



    path('panel/', views.dashboard_home),
path(
    'panel/calculator/',
    views.calculator
),

    path('panel/dashboard/', views.dashboard,name='Panel-admin-access'),
    path('panel/users/', views.users),
    path('panel/add-user/', views.add_users),
    # 🔹 EDIT (GET)
    path('panel/edit-user/<int:id>/', views.edit_user, name='edit_user'),

    # 🔹 UPDATE (POST)
    path('panel/update-user/<int:id>/', views.update_user, name='update_user'),

    path("panel/delete-users/", views.delete_users),

    path("panel/user-details/<int:id>/", views.user_details, name="user_details"),

    # 📦 LIST SHIPMENTS
    path('panel/shipments/', views.shipment_list, name='shipment_list'),

    path('panel/add-shipments/', views.add_shipment, name='add_shipment'),

    path("panel/edit-shipment/<int:id>/", views.edit_shipment, name="edit_shipment"),
    path("api/update-shipment/<int:id>/", views.update_shipment, name="update_shipment_api"),
    path("api/delete-shipment/<int:id>/", views.delete_shipment),

 ## warehouse

path(
    "panel/warehouses/",
    views.warehouses,
    name="warehouses"
),

#==== add warehouse

path(
    "api/add-warehouse/",
    views.add_warehouse,
    name="add_warehouse"
),

 #=== edite warehouse

path(
    "api/edit-warehouse/<int:id>/",
    views.edit_warehouse,
    name="edit_warehouse"
),

 #=== delete warehouse

path(
    "api/delete-warehouse/<int:id>/",
    views.delete_warehouse,
    name="delete_warehouse"
),


    ##==== update tracking

path(
    "panel/tracking-updates/",
    views.tracking_updates,
    name="tracking_updates"
),


path(
    "api/delete-tracking-update/<int:id>/",
    views.delete_tracking_update,
    name="delete_tracking_update"
),



# CATEGORY
path(
    "panel/categories/",
    views.categories,
    name="categories"
),

path(
    "api/add-category/",
    views.add_category,
    name="add_category"
),

path(
    "api/edit-category/<int:id>/",
    views.edit_category,
    name="edit_category"
),

path(
    "api/update-category/",
    views.update_category,
    name="update_category"
),

path(
    "api/delete-category/<int:id>/",
    views.delete_category,
    name="delete_category"
),



# CONTACTS
path(
    "panel/contacts/",
    views.contacts,
    name="contacts"
),


path(
    "api/edit-contact/<int:id>/",
    views.edit_contact,
    name="edit_contact"
),


path(
    "api/update-contact/",
    views.update_contact,
    name="update_contact"
),


path(
    "api/delete-contact/<int:id>/",
    views.delete_contact,
    name="delete_contact"
),


   #==== pricing_rules


path(
    "panel/pricing-rules/",
    views.pricing_rules,
    name="pricing_rules"
),

path(
    "api/create-pricing-rule/",
    views.create_pricing_rule,
    name="create_pricing_rule"
),


# EDIT
path(
    "api/edit-pricing-rule/<int:id>/",
    views.edit_pricing_rule,
    name="edit_pricing_rule"
),


# UPDATE
path(
    "api/update-pricing-rule/",
    views.update_pricing_rule,
    name="update_pricing_rule"
),

path(
    "api/delete-pricing-rule/<int:id>/",
    views.delete_pricing_rule,
    name="delete_pricing_rule"
),


# ROUTE PRICING PAGE
path(
    "panel/route-pricings/",
    views.route_pricings,
    name="route_pricings"
),

# CREATE
path(
    "api/create-route-pricing/",
    views.create_route_pricing,
    name="create_route_pricing"
),

# EDIT
path(
    "api/edit-route-pricing/<int:id>/",
    views.edit_route_pricing,
    name="edit_route_pricing"
),

# UPDATE
path(
    "api/update-route-pricing/",
    views.update_route_pricing,
    name="update_route_pricing"
),

# DELETE
path(
    "api/delete-route-pricing/<int:id>/",
    views.delete_route_pricing,
    name="delete_route_pricing"
),
    # 📦 SHIPMENTS
    path('api/shipments/create/', views.create_shipment),
    path('panel/shipment-details/<int:id>/', views.shipment_details, name='shipment_details'),
    path("api/admin-track/", views.admin_track_package, name="admin_track_package"),


    # 👤 USERS
    path('api/search-users/', views.search_users),

    # 📞 CONTACTS
    path('api/user-contacts/', views.user_contacts),
    path('api/create-contact/', views.create_contact),


   # path('panel/shipments/', views.shipments),

    path('panel/login/', views.login_view, name='panel_login'),
    path('panel/logout/', logout_view, name='panel_logout'),

    path('term-and-condition/',views.term_condition,name='term_condition'),

    path(
        "api/kyc/",
        KYCAPIView.as_view(),
        name="kyc-api"
    ),

# =========================
# URLS.PY
# =========================

    path(
        "panel/kyc-management/",
        views.kyc_management,
        name="kyc_management"
    ),

# urls.py

path(
    "panel/kyc-details/<int:id>/",
    views.kyc_details,
    name="kyc_details"
),


# urls.py

path(
    "api/admin/kyc-decision/<int:id>/",
    views.admin_kyc_decision,
    name="admin_kyc_decision"
),

# urls.py

path(

    "api/kyc-pending-count/",

    views.kyc_pending_count,

    name="kyc_pending_count"

),

path(

    "api/delete-kyc/<int:kyc_id>/",

    views.delete_kyc,

    name="delete_kyc"

),


path(

    "panel/settings/",

    views.settings_page,

    name="settings_page"

),



path(

    "api/save-settings/",

    views.save_settings,

    name="save_settings"

),


path(

    "api/save-settings/",

    views.save_settings,

    name="save_settings"

),

]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)