from django.urls import path,include
from .views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register(r'categories', CategoryListView, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'cart', CartView, basename='cart')

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('change-password', ChangePasswordView.as_view(), name='change-password'),
    
    #Profile url
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update', ProfileUpdateView.as_view(), name='profile-update'),
    
   # Cart
    path('cart/add/', AddToCartView.as_view(), name='cart-add'),
    path('cart/update/<int:pk>/', UpdateCartItemView.as_view(), name='cart-update'),
    path('cart/clear/', ClearCartView.as_view(), name='cart-clear'),
    
    # Checkout
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    
    #Admin only status update
    path('admin/orders/<int:order_id>/status/', OrderStatusUpdateView.as_view(),
         name='admin-order-status-update'),
    
    #All router Urls
    path('', include(router.urls))
]
