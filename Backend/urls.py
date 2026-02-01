from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import *


urlpatterns = [
    path("signup/", RegisterView.as_view(), name="signup"),
]
