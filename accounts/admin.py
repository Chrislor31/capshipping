from django.contrib import admin

from accounts.models import Accounts,Warehouse,PasswordResetOTP

admin.site.register(Accounts)
admin.site.register(Warehouse)
admin.site.register(PasswordResetOTP)