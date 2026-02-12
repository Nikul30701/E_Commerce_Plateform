from rest_framework.views import APIView
from django.contrib.auth import authenticate, update_session_auth_hash, get_user_model
from rest_framework.viewsets import ViewSet, ModelViewSet, ReadOnlyModelViewSet
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from .serializers import *
from rest_framework import status
from .models import *
from rest_framework.generics import CreateAPIView, GenericAPIView, RetrieveAPIView, RetrieveUpdateAPIView, \
    get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.db import transaction
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from decimal import Decimal
from django.db.models import F
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


# user registrations
class RegisterView(CreateAPIView):
        serializer_class = RegisterSerializer
        permission_classes = [AllowAny]
        
        def create(self, request, *args, **kwargs):
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                print("Register Validation Errors:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Mission Successful!',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'profile_pic': user.profile_pic.url if user.profile_pic else None,
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_201_CREATED)
    

class LoginView(APIView):
    """
    User login endpoint.
    
    POST /api/login/
    {
        "email": "user@example.com",
        "password": "password123"
    }
    
    Returns:
    {
        "message": "Login successful!",
        "user": {
            "id": 1,
            "email": "user@example.com",
            "first_name": "John",
            "last_name": "Doe"
        },
        "tokens": {
            "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
            "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
        }
    }
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    def post(self, request, *args, **kwargs):
        """Handle login POST request"""
        
        # Validate input
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Login validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data.get('email')
        password = serializer.validated_data.get('password')
        
        try:
            # Step 1: Try using Django's authenticate function
            # This will use your custom backend if configured
            logger.info(f"Attempting authentication for: {email}")
            user = authenticate(request=request, username=email, password=password)
            
            # Step 2: If authenticate returns None, try manual lookup
            # (in case the backend is not configured properly)
            if user is None:
                logger.info(f"Authenticate returned None, trying manual lookup for: {email}")
                try:
                    user = User.objects.get(email=email)
                    
                    # Verify password
                    if not user.check_password(password):
                        logger.warning(f"Invalid password for user: {email}")
                        return Response(
                            {'error': 'Invalid email or password'},
                            status=status.HTTP_401_UNAUTHORIZED
                        )
                    
                    # Check if user is active
                    if not user.is_active:
                        logger.warning(f"Login attempt for inactive user: {email}")
                        return Response(
                            {'error': 'Account is disabled'},
                            status=status.HTTP_401_UNAUTHORIZED
                        )
                        
                except User.DoesNotExist:
                    logger.warning(f"User not found: {email}")
                    return Response(
                        {'error': 'Invalid email or password'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            else:
                # User was authenticated, but double-check they're active
                if not user.is_active:
                    logger.warning(f"Login attempt for inactive user: {email}")
                    return Response(
                        {'error': 'Account is disabled'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            
            # Step 3: Generate JWT tokens
            logger.info(f"Generating tokens for user: {email}")
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"Successful login for user: {email}")
            
            return Response({
                'message': 'Login successful!',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist as e:
            logger.error(f"User.DoesNotExist: {str(e)}")
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        except Exception as e:
            # Catch any unexpected errors and log them
            logger.exception(f"Unexpected error during login: {str(e)}")
            print(f"\n❌ LOGIN ERROR: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()  # Print full traceback to console
            
            return Response(
                {'error': 'An error occurred during login. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )    
    
class LogoutView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({
                'error': 'Refresh Token is invalid!'
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        except Exception:
            raise ValidationError({
                'refresh': 'Invalid or expire refresh token.'
            })
        
        return Response(
            {'message':'Logout out successful'},
            status=status.HTTP_200_OK
        )
    

class ChangePasswordView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    
    @transaction.atomic
    def post(self, request):
        serializer = self.get_serializer(
            data=request.data,
            context={'request':request}
        )
        serializer.is_valid(raise_exception=True)
        
        user= request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        
#         keeps user logged in
        update_session_auth_hash(request, user)
        
        return Response({
            'message':'Password change successfully!'
        }, status=status.HTTP_200_OK)
    

#  User's Profile
# GET /api/auth/profile/
class ProfileView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get_object(self):
        return self.request.user
    
# PATCH /api/auth/profile/update/
class ProfileUpdateView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get_object(self):
        return self.request.user
    

# Cart
class CartView(ViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CartReadSerializer
    
    def get_object(self):
        cart,_ = Cart.objects.get_or_create(user=self.request.user)
        return Cart.objects.prefetch_related("items__product").get(id=cart.id)

    def list(self, request):
        cart = self.get_object()
        serializer = self.serializer_class(cart)
        return Response(serializer.data)
    

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Fetch product and cart
        product = get_object_or_404(
            Product.objects.select_for_update(),
            id=serializer.validated_data["product_id"]
        )
        quantity = serializer.validated_data["quantity"]
        cart, _ = Cart.objects.get_or_create(
            user=request.user
        )
        
        # Get or update the CartItem
        cart_item, created = CartItem.objects.select_for_update().get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity':0}
        )
        
        # calculate total potential quantity
        current_qty = cart_item.quantity
        total_requested_qty = current_qty + quantity
        
        # Stock validation
        if total_requested_qty > product.stock:
            raise ValidationError(
                f"Insufficient stock. You have {current_qty}, adding {quantity} exceeds limit of {product.stock}."
            )
        
        # save
        cart_item.quantity = total_requested_qty
        cart_item.save()
        
        return Response({
            'message': 'Item added to cart.'
        }, status=status.HTTP_201_CREATED)
    

class UpdateCartItemView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateToCartSerializer
    
    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)
    

class ClearCartView(APIView):
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def delete(self,request):
        delete_count, _ = CartItem.objects.filter(
            cart__user=request.user
        ).delete()
        
        return Response(
            {
                'message':f"{delete_count} item(s)",
                "cleared":True
            },
            status=status.HTTP_200_OK
        )
    
#  Category all List
class CategoryListView(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]
    
    
# Product List
class ProductViewSet(ModelViewSet):
    queryset = Product.objects.select_related("category")
    
    def get_queryset(self):
        if self.action in ["list", 'retrieve']:
            return Product.objects.filter(
                status='active'
            ).select_related('category')
        return Product.objects.select_related("category")
    
    filter_backends = [
        DjangoFilterBackend,
        OrderingFilter,
        SearchFilter
    ]
    
    filterset_fields  = ['category']
    search_fields =[
        'name',
        'description',
        'category__name'
    ]
    ordering_fields = ['price', '-created_at']
    
    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        if self.action in ["list"]:
            return ProductSerializer
        return ProductCreateSerializer
    
    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]
    
    
TAX_RATE = Decimal('0.10')

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        address_id = serializer.validated_data["address_id"]
        notes = serializer.validated_data.get("notes", "")

        # Address validation
        address = get_object_or_404(
            Address,
            id=address_id,
            user=request.user
        )

        #  Lock cart
        cart = (
            Cart.objects
            .select_for_update()
            .prefetch_related("items__product")
            .filter(user=request.user)
            .first()
        )

        if not cart or not cart.items.exists():
            return Response(
                {"error": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_items = cart.items.all()

        products = []

        for item in cart_items:
            product = item.product

            if product.stock < item.quantity:
                return Response(
                    {
                        "error": f'Not enough stock for "{product.name}". Only {product.stock} left.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            products.append(product)

        #
        subtotal = sum(
            Decimal(item.item_total) for item in cart_items
        )

        tax = (subtotal * TAX_RATE).quantize(Decimal("0.01"))
        total = subtotal + tax

        # Create Order
        order = Order.objects.create(
            user=request.user,
            shipping_address=address,
            subtotal=subtotal,
            tax=tax,
            total=total,
            notes=notes,
            status="pending",
            payment_status="pending",
        )

        #  create OrderItems
        order_items = [
            OrderItem(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_image=item.product.image,
                unit_price=item.product.discounted_price,
                quantity=item.quantity,
            )
            for item in cart_items
        ]

        OrderItem.objects.bulk_create(order_items)

        #  Reduce stock efficiently
        for product, item in zip(products, cart_items):
            product.stock -= item.quantity
        
        # to improve performance and reduce db hits using bulk_update
        Product.objects.bulk_update(products, ["stock"])

        #  Clear cart
        cart.items.all().delete()

        return Response(
            {
                "message": "Order placed successfully 🎉",
                "order": OrderDetailSerializer(order).data
            },
            status=status.HTTP_201_CREATED
        )
    
    
# User's Order
class OrderViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user
        ).select_related(
            'shipping_address'
        ).prefetch_related('items__product')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrderDetailSerializer
        return OrderListSerializer
    
    @action(detail=True, methods=['post'], url_path='cancel')
    @transaction.atomic #to rollback everything if cancel turns wrong
    def cancel_order(self, request, pk=None):
        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=pk,
            user=request.user
        )
        
        # Order check
        if order.status in ('delivered', 'cancelled'):
            return Response(
                {'error': f'Cannot cancel with status "{order.status}"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # stock restore
        for item in order.items.select_related('product'):
            if item.product:
                # F() ef db field ko directly db level par reference karta hai - without value Python me load liye
                Product.objects.filter(pk=item.product_id).update(
                    stock=F('stock') + item.quantity
                )
                
        order.status = 'cancelled'
        order.payment_status = 'refunded'
        order.save(update_fields=['status', 'payment_status'])
        
        return Response(
            {'status': 'Order cancelled', 'id':order.id},
            status=status.HTTP_200_OK
        )
        
        
class OrderStatusUpdateView(RetrieveUpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderStatusUpdateSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'id'
    lookup_url_kwarg = 'order_id'

    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        # You can add extra logic here if needed
        return super().patch(request, *args, **kwargs)
    
    
# User Address
class AddressViewSet(ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)
        
    def perform_destroy(self, instance):
        was_default = instance.is_default
        user =instance.user
        instance.delete()
        
        if was_default:
            new_default = Address.objects.filter(user=user).latest('-created_at').first()
            if new_default:
                new_default.is_default = True
                new_default.save(update_fields=['is_default'])
                
    @action(detail=True, methods=['post'], url_path='set-default')
    @transaction.atomic
    def set_default(self, request, pk=None):
        address = self.get_object()
        
        Address.objects.filter(
            user=request.user,
            is_default=True,
        ).update(is_default=False)
        
        address.is_default = True
        address.save(update_fields=['is_default'])
        
        serializer = self.get_serializer(address)
        return Response({
            'message': 'Default address updated',
            'address': serializer.data
        },status=status.HTTP_200_OK)