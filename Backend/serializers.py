from rest_framework import serializers
from .models import *


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'gender', 'dob', 'profile_pic', 'password', 'confirm_password']
    
    def validate(self,data):
        if data['password'] != data['confirm_password']:
            raise ValidationError("Password invalid!")
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data['email'],
            password=validated_data['password'],
            gender=validated_data.get('gender'),
            dob=validated_data.get('dob'),
            profile_pic=validated_data.get('profile_pic'),
        )
        return user