
from django.contrib import admin
from django.urls import path, include

from django.conf.urls.static import static
from capshipping import views, settings
from capshipping.views import logout_view

urlpatterns = [
    path('admin/', admin.site.urls),

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

    path('api/register/',views.register_api),
    path("api/login/", views.login_api),
    path('login/',views.loginform,name='login'),

    path("register/", views.register_api),
    path("verify-register-otp/", views.verify_register_otp),
    path("resend-register-otp/", views.resend_register_otp),

    path('dashboard/',views.dashboard_user,name='dashboard_user'),
    # language switch
    path('i18n/', include('django.conf.urls.i18n')),





    ######=====  test bar code


    path('package/<int:pk>/label/', views.package_label, name='package_label'),

    path('shipping/', include('shipping.urls')),



#=======dashboard



    path('panel/', views.dashboard_home),

    path('panel/dashboard/', views.dashboard),
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
 # no SPA
    path('panel/add-shipments/', views.add_shipment, name='add_shipment'),

    # 📦 SHIPMENTS
    path('api/shipments/create/', views.create_shipment),

    # 👤 USERS
    path('api/search-users/', views.search_users),

    # 📞 CONTACTS
    path('api/user-contacts/', views.user_contacts),
    path('api/create-contact/', views.create_contact),


   # path('panel/shipments/', views.shipments),

    path('panel/login/', views.login_view, name='panel_login'),
    path('panel/logout/', logout_view, name='logout'),

]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)