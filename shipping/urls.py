from django.urls import path
from . import views

urlpatterns = [
    path("scan/", views.scan_page, name="scan_page"),
    path("scan-package/", views.scan_package, name="scan_package"),
    path("mark-delivered/<int:pk>/", views.mark_as_delivered, name="mark_delivered"),
    path('confirm-delivery/', views.confirm_delivery, name='confirm_delivery'),
    path("api/track/", views.track_package, name="track_package"),
    path("tracking/", views.tracking_page, name="tracking_page"),
]