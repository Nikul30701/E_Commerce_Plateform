from django.contrib import admin
from .models import *
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin


class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter   = ('is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    ordering      = ('-date_joined',)

    # EDIT a user
    fieldsets = (
        (None,              {'fields': ('email', 'password')}),
        ('Personal Info',   {'fields': ('first_name', 'last_name', 'phone', 'avatar')}),
        ('Permissions',     {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important Dates', {'fields': ('date_joined', 'last_login')}),
    )

    # Fields shown when you ADD a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )

admin.site.register(User, UserAdmin)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'price', 'category', 'stock', 'created_at')
    list_select_related = ('category',)
    search_fields = ('name', 'description')
    list_filter = ('category', 'stock', 'created_at')
    prepopulated_fields = {'slug': ('name',)}


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'unit_price', 'quantity')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display    = ('order_number', 'user', 'status', 'payment_status', 'total', 'created_at')
    list_filter     = ('status', 'payment_status', 'created_at')
    search_fields   = ('order_number', 'user__email')
    ordering        = ('-created_at',)
    inlines         = [OrderItemInline]
    readonly_fields = ('order_number', 'created_at', 'updated_at')


class CartItemInline(admin.TabularInline):
    """Shows CartItems inside the Cart admin page"""
    model = CartItem
    extra = 0   # Don't show empty extra rows


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_items', 'total_price', 'create_at')
    inlines = [CartItemInline]


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display  = ('fullname', 'user', 'city', 'state', 'country', 'is_default')
    list_filter   = ('is_default', 'country')
    search_fields = ('fullname', 'user__email', 'city')