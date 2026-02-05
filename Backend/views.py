from django.db.models.functions import Trunc
from rest_framework.mixins import DestroyModelMixin
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.viewsets import ViewSet, ModelViewSet, ReadOnlyModelViewSet
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from .serializers import *
from rest_framework import status
from .models import *
from rest_framework.generics import CreateAPIView, GenericAPIView, RetrieveAPIView, RetrieveUpdateAPIView, \
    get_object_or_404, DestroyAPIView, ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.db import transaction
from rest_framework.decorators import action, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from decimal import Decimal
from django.db.models import F


class RegisterView(CreateAPIView):
        serializer_class = RegisterSerializer
        permission_classes = [AllowAny]
        
        def create(self, request, *args, **kwargs):
            serializer = self.get_serializer(data=request.data)
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
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_201_CREATED)
    

class LoginView(CreateAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(request=request, email=email, password=password)
        
        if user is None:
            return Response(
                {'error':'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message':'Login successful!',
            'user':{
                'id':user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name':user.last_name
            },
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_200_OK)
    
    
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
    

class CartView(ViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CartReadSerializer
    
    def get_object(self):
        cart,_ = Cart.objects.get_or_create(user=self.request.user)
        return Cart.objects.prefetch_related("items__product").get(id=cart.id)
    

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Fetch product and cart
        product = Product.objects.select_for_update().get(
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
        if created:
            total_requested_qty = quantity
        else:
            total_requested_qty = cart_item.quantity + quantity
        
        # Stock validation
        if total_requested_qty > product.stock:
            raise ValidationError(f"Only {product.stock} items available. You already have {cart_item.quantity} in cart.")
        
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
            return [AllowAny]
        return [IsAdminUser]
    
    
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
            return [AllowAny]
        return [IsAdminUser]
    
    
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

        TAX_RATE = Decimal("0.18")
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
    
class MyOrdersView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderListSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
    
    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user
        ).select_related(
            'shipping_address'
        ).prefetch_related('item__product')
    
    
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