from rest_framework import serializers
from .models import *
from rest_framework.exceptions import ValidationError

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField( min_length=6)
    email = serializers.EmailField()
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
    
    
class LoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    
class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'full_name', 'phone', 'avatar'
        ]
        
        
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'avatar'
        ]

# cart items for reading
class CartItemReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(read_only=True, source='product.name')
    product_image = serializers.ImageField(read_only=True, source='product.image')
    unit_price = serializers.DecimalField(read_only=True, decimal_places=2, max_digits=10, source='product.discounted_price')
    items_total = serializers.DecimalField(read_only=True, decimal_places=2, max_digits=10, source='items_total')
    
    class Meta:
        model = CartItem
        fields = ['id', 'product','product_name', 'product_image', 'unit_price', 'items_total', ]
        

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_new_password': 'New passwords do not match.'
            })
        return data
        

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
        
        
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(read_only=True, source='category.name')
    discounted_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_in_stock = serializers.BooleanField( read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'category','category_name', 'price', 'discount','discounted_price', 'image',
                  'is_in_stock', 'status']
        

class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(read_only=True, source='category.name')
    discounted_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_in_stock = serializers.BooleanField( read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'category','category_name', 'price', 'discount', 'discounted_price', 'image', 'status',
                  'is_in_stock','description', 'created_at', 'updated_at']

    
class ProductCreateSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'category', 'price', 'discount','discounted_price', 'image',
                  'is_in_stock', 'status' ]
        
    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price should not less than 0.")
        return value
    
    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value
        
    def validate_discount(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("discount should not less than 0 and not higher than 100")
        return value
    

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'fullname', 'street', 'city', 'state', 'zipcode', 'country', 'phone', 'is_default', 'created_at']
    
    def validate(self, data):
        if 'fullname' in data and not data.get('fullname','').strip():
            raise serializers.ValidationError({'fullname':'Fullname cannot be blank'})
        if 'street' in data and not data.get('street', '').strip():
            raise serializers.ValidationError({'street':'Street name cannot br blank'})
        return data
        
        
class OrdersItemSerializer(serializers.ModelSerializer):
    items_total = serializers.DecimalField(decimal_places=2, max_digits=7, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'product_image', 'unit_price', 'quantity' , 'items_total']
        
    
class OrderListSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()
    order_number = serializers.CharField(read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'status', 'payment_status', 'total', 'item_count', 'create_at']
        
    def get_item_count(self, obj):
        return obj.item_count()
        
    
class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrdersItemSerializer(many=True, read_only=True)
    shipped_address = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'shipped_address', 'status', 'payment_status', 'subtotal', 'tax', 'total',
                  'notes', 'created_at', 'updated_at']
    
    def get_shipped_address(self, obj):
        if obj.shipped_address:
            addr = obj.shipped_address
            return {
                'fullname': addr.full_name,
                'street': addr.street,
                'city': addr.city,
                'zipcode': addr.zipcode,
                'country': addr.country,
                'phone':addr.phone
            }
        return None
        
    
class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True, default='')