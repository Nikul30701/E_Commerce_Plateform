from rest_framework import serializers
from .models import *
from rest_framework.exceptions import ValidationError

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'gender', 'dob', 'profile_pic', 'password', 'confirm_password']
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 6},
            'email':{'required':True},
            'gender': {'required': False, 'allow_blank': True},
            'dob': {'required': False, 'allow_null': True},
            'phone': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'profile_pic': {'required': False}
        }
    
    def validate(self,data):
        if data['password'] != data['confirm_password']:
            raise ValidationError({"password": "Passwords do not match"})
        return data
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        
        # Handle optional fields with defaults or None
        gender = validated_data.get('gender') or 'M'  # Default to Male if not provided
        dob = validated_data.get('dob')
        profile_pic = validated_data.get('profile_pic')
        phone = validated_data.get('phone')

        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            gender=gender,
            dob=dob,
            phone=phone,
            profile_pic=profile_pic,
        )
        return user

    def validate_dob(self, value):
        """Validate in serializer instead of relying on model validator"""
        if value is None:
            return value
        
        today = date.today()
        if value > today:
            raise serializers.ValidationError("Date of birth cannot be in the future.")
        
        age = today.year - value.year - (
            (today.month, today.day) < (value.month, value.day)
        )
        
        if age < 16:
            raise serializers.ValidationError("You must be at least 16 years old to register.")
        
        return value
    
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    
class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'full_name', 'phone', 'profile_pic'
        ]
        
        
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'profile_pic'
        ]
        

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_new_password': 'New passwords do not match.'
            })
        
        if data['old_password'] == data["new_password"]:
            raise serializers.ValidationError({
                'new_password': 'New password cannot be the same as the old password.'
            })
        
        # Verify old password
        user=self.context['request'].user
        if not user.check_password(data['old_password']):
            raise serializers.ValidationError({
                'old_password': 'Current password is incorrect.'
            })
        return data


# cart items for reading
class CartItemReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(read_only=True, source='product.name')
    product_image = serializers.ImageField(read_only=True, source='product.image')
    unit_price = serializers.DecimalField(read_only=True, decimal_places=2, max_digits=10,
                                          source='product.discounted_price')
    item_total = serializers.DecimalField(read_only=True, decimal_places=2, max_digits=10, source='items_total')
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_image', 'unit_price', 'quantity', 'item_total']


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
        if not Product.objects.filter(id=value, status='active').exists():
            raise serializers.ValidationError("Product not found or available.")
        return value


class UpdateToCartSerializer(serializers.ModelSerializer):
    quantity = serializers.IntegerField(min_value=1)
    
    class Meta:
        model = CartItem
        fields = ['quantity']
    
    # 'self.instance' is the CartItem being updated
    def validate(self, data):
        instance = self.instance
        if instance:
            product = instance.product
            quantity = data.get("quantity")
            if quantity > product.stock:
                raise serializers.ValidationError({
                    'quantity': f"Only {product.stock} units available."
                })
            return data


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='product.count', read_only=True)
    
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
                  'is_in_stock','stock', 'description', 'status' ]
        
    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value
    
    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value
        
    def validate_discount(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError('Discount must be between 0 and 100.')
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
        
        
class OrderItemSerializer(serializers.ModelSerializer):
    items_total = serializers.DecimalField(decimal_places=2, max_digits=7, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'product_image', 'unit_price', 'quantity' , 'items_total']
        
    
class OrderListSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()
    order_number = serializers.CharField(read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'status', 'payment_status', 'total', 'item_count', 'created_at']
        
    def get_item_count(self, obj):
        return obj.items.count()
        
    
class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipped_address = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'shipped_address', 'status', 'payment_status', 'subtotal', 'tax', 'total',
                  'notes', 'created_at', 'updated_at']
    
    def get_shipping_address(self, obj):
        if obj.shipping_address:
            addr = obj.shipping_address
            return {
                'fullname': addr.fullname,
                'street': addr.street,
                'city': addr.city,
                'zipcode': addr.zipcode,
                'country': addr.country,
                'phone':addr.phone
            }
        return None


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']

    def validate_status(self, value):
        valid_statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid status. Choose from: {valid_statuses}")
        return value

    
class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True, default='')