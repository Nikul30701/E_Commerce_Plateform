
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from .serializers import *
from rest_framework import status
from .models import *
from rest_framework.generics import CreateAPIView, GenericAPIView, RetrieveAPIView, RetrieveUpdateAPIView, \
    get_object_or_404
from rest_framework.permissions import AllowAny,IsAuthenticated


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
            return Response(serializer.errors, status=status.HTTP_201_CREATED)
        
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
    

class CartView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CartReadSerializer
    
    def get_object(self):
        cart = Cart.objects.get(user=self.request.user)
        return cart
    
    def get(self, request):
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        product_id = serializers.validate_data['product_id']
        quantity = serializers.validate_data['quantity']
        
        product = Product.objects.get(id=product_id)
        
        if product.stock < quantity:
            return Response(
                {'error': f"Only {product.stock} are available only."},
                status = status.HTTP_400_BAD_REQUEST
            )
        cart, _ = Cart.objects.get_or_create(request.user)
        
        cart_item, created = CartItem.objects.select_for_update().get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity':quantity}
        )
        
        if not created:
            new_qty = cart_item + quantity
            
            if new_qty > product.stock:
                return Response(
                    {'error': f"Only {product.stock} items available."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cart_item.quantity = new_qty
            cart_item.save()
    
        cart_serializer = CartReadSerializer(cart)
        return Response({
            'message': f"Added {quantity} x {product.name} to cart.",
            'cart': cart_serializer.data
        }, status = status.HTTP_201_CREATED)

    