from rest_framework import serializers
from .models import *
from rest_framework.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'gender', 'dob', 'profile_pic', 'password', 'confirm_password']
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 6},
        }
    
    def validate(self,data):
        if data['password'] != data['confirm_password']:
            raise ValidationError({"password": "Passwords do not match"})
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
    

# cart items for reading
class CartItemReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(read_only=True, source='product.name')
    product_image = serializers.ImageField(read_only=True, source='product.image')
    unit_price = serializers.DecimalField(read_only=True, decimal_places=2, max_digits=10, source='product.discounted_price')
    items_total = serializers.DecimalField(read_only=True, decimal_places=2, max_digits=10, source='items_total')
    
    class Meta:
        model = CartItem
        fields = ['id', 'product','product_name', 'product_image', 'unit_price', 'item_total', ]
        

# cart for readings
class CartReadSerializer(serializers.ModelSerializer):
    items = CartItemReadSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(read_only=True, decimal_places=2, max_digits=7)
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_items', 'total_price']


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(default=1, min_value=1)
    
    def validate_product_id(self, value):
        try:
            Product.objects.get(id=value, status='active')
        except Product.DoesNotExist:
            raise serializers.ValidationError(
                "Product not found or not available."
            )
        return value
    

class UpdateToCartSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
    
    
class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'product_count', 'created_at']
        
    def get_product_count(self, value):
        return value.products.count()
    

class CategoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'image', 'description']