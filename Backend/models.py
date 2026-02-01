from django.core.exceptions import ValidationError
from datetime import date
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify
import uuid

GENDER_CHOICES = [
    ("M", "Male"),
    ("F", "Female"),
    ("T", "Other"),
]

def validated_age(value):
    today = date.today()
    age = today.year - value.year - (
        (today.month, today.day) < (value.month, value.day)
    )
    if age < 16:
        raise ValidationError("User must me above 16.")


class User(AbstractUser):
    gender = models.CharField(max_length=10, default='Male', choices=GENDER_CHOICES)
    dob = models.DateField(validators=[validated_age])
    profile_pic = models.ImageField(upload_to='avatar/', null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date_joined']
      
    @property
    def fullname(self):
        return f"{self.first_name} {self.last_name}".strip()
        

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField()
    image = models.ImageField(upload_to='category/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
        
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
        
        
class Product(models.Model):
    STATUS_CHOICE = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('out_of_stock', 'Out Of Stock')
    ]
    
    categories = models.ForeignKey(Category, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(decimal_places=2, max_digits=7)
    discount = models.DecimalField(decimal_places=2, max_digits=7)
    stock = models.DecimalField(decimal_places=2, max_digits=7)
    image = models.ImageField(upload_to='product/', blank=True)
    status = models.CharField(choices=STATUS_CHOICE, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.name
    
    def save(self,*args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
        
    @property
    def discounted_price(self):
        if self.discount > 0:
            return round(self.price * (1 - self.discount/100), 2)
        return self.price
    
    @property
    def is_in_stock(self):
        return self.stock > 0 and self.status == 'active'
        
        
class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    create_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cart of: {self.user.email}"
    
    @property
    def total_items(self):
        """Total number of items (sum of all quantities)"""
        return sum(item.quantity for item in self.items.all())
    
    @property
    def total_price(self):
        """Total price of everything in the cart (after discounts)"""
        return sum(item.item_total for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.quantity}X{self.product.name}"
    
    def items_total(self):
        return self.product.discounted_price * self.quantity


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='address')
    fullname = models.CharField(max_length=100, blank=True)
    street =  models.TextField(blank=True)
    city = models.CharField(max_length=30, blank=True)
    state = models.CharField(max_length=15, default='Gujarat')
    zipcode =models.CharField(max_length=8, blank=True)
    country = models.CharField(max_length=20, default='India')
    phone = models.CharField(max_length=12, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_default', '-created_at']   # Default address shows first

    def __str__(self):
        return f"{self.full_name}, {self.city}, {self.state}"

    def save(self, *args, **kwargs):
        # If this address is set as default,
        # remove "default" from all other addresses of this user
        if self.is_default:
            Address.objects.filter(user=self.user).exclude(pk=self.pk).update(is_default=False)

        # If user has NO addresses yet, make this one default automatically
        if not self.pk and not Address.objects.filter(user=self.user).exists():
            self.is_default = True

        super().save(*args, **kwargs)



class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirm', 'Confirm'),
        ('canceled', 'Canceled'),
        ('shipped','Shipped'),
        ('delivered', 'Delivered')
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('unpaid', 'Unpaid'),
        ('refunded', 'Refunded')
    ]
    
    order_number = models.CharField(unique=True, max_length=20, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    shipped_address = models.ForeignKey(Address, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    subtotal = models.DecimalField(decimal_places=2, max_digits=7)
    tax = models.DecimalField(decimal_places=2, max_digits=7)
    total = models.DecimalField(decimal_places=2, max_digits=7)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Order {self.order_number} - {self.user.email}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = 'ORD-' + uuid.uuid4().hex[:8]
        super().save(*args, **kwargs)
    

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product,on_delete=models.CASCADE, null=True)
    product_name = models.CharField(max_length=100)
    product_image = models.ImageField(upload_to='orders_item/', blank=True, null=True)
    unit_price = models.DecimalField(decimal_places=2, max_digits=7)
    quantity = models.PositiveIntegerField()
    
    def __str__(self):
        return f"{self.quantity} X {self.product_name}"
    
    class Meta:
        ordering = ['id']
        
    @property
    def item_total(self):
        return self.quantity * self.unit_price
    
