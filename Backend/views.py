from django.shortcuts import render
from .serializers import *
from .models import *
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny,IsAuthenticated

class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
