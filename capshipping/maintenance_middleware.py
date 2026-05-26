from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse


class MaintenanceMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        allowed_urls = [
            reverse("maintenance"),
        ]

        if settings.MAINTENANCE_MODE:

            if request.user.is_superuser:
                return self.get_response(request)

            if request.path not in allowed_urls:
                return redirect("maintenance")

        response = self.get_response(request)

        return response
