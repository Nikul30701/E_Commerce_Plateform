import React, { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/cartStore'
import { useNavigate, Link } from 'react-router-dom'
import {
    ShoppingBag,
    Minus,
    Plus,
    Trash2,
    ArrowLeft,
    ShieldCheck,
    Truck,
    RotateCcw,
    X,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Cart = () => {
    const { isAuthenticated } = useAuthStore()
    const { cart, loading, fetchCart, updateCart, deleteCart, clearCart } =
        useCartStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart()
        }
    }, [isAuthenticated, fetchCart])

    // Not Authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="mx-auto w-20 h-20 rounded-2xl bg-slate-200/50 flex items-center justify-center mb-6 backdrop-blur-sm">
                        <ShoppingBag className="h-10 w-10 text-slate-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                        Cart awaits
                    </h1>
                    <p className="text-slate-600 mb-8 leading-relaxed text-sm">
                        Sign in to your account to view your shopping cart and continue shopping.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                    >
                        Sign in
                    </button>
                </div>
            </div>
        )
    }

    // Loading
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-6 bg-slate-300 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-8 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-6 bg-slate-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
            </div>
        )
    }

    const isEmpty = !cart || !cart.items || cart.items.length === 0

    // Empty Cart
    if (isEmpty) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="mx-auto w-24 h-24 rounded-2xl bg-slate-200/40 flex items-center justify-center mb-6 backdrop-blur-sm">
                        <ShoppingBag className="h-12 w-12 text-slate-300" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                        Your cart is empty
                    </h2>
                    <p className="text-slate-600 mb-8 text-sm leading-relaxed">
                        No items yet. Start exploring to find something you love.
                    </p>
                    <button
                        onClick={() => navigate('/products')}
                        className="w-full py-3.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        )
    }

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return
        await updateCart(itemId, newQuantity)
    }

    const handleRemoveItem = async (itemId) => {
        await deleteCart(itemId)
    }

    const handleClearCart = async () => {
        await clearCart()
    }

    const subtotal = cart?.items?.reduce((sum, item) => {
        const price = Number(item.item_total) || Number(item.unit_price) * Number(item.quantity) || 0;
        return sum + price;
    }, 0) || 0;
    const shipping = (subtotal > 499 || subtotal === 0) ? 0 : 49;
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 py-10 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                            Cart
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm">
                            {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'}
                        </p>
                    </div>
                    <button
                        onClick={handleClearCart}
                        className="mt-4 sm:mt-0 px-4 py-2.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50/30 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear
                    </button>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* ─── Cart Items ─── */}
                    <div className="lg:col-span-8">
                        <div className="space-y-3">
                            {cart.items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all duration-300"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex gap-5">
                                        {/* Product Image */}
                                        <Link
                                            to={`/product/${item.product}`}
                                            className="shrink-0 relative"
                                        >
                                            <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 group-hover:border-slate-300 transition-colors">
                                                {item.product_image ? (
                                                    <img
                                                        src={item.product_image.startsWith('http') 
                                                            ? item.product_image 
                                                            : `${API_BASE}${item.product_image.replace(/\/+/g, '/').startsWith('/') ? '' : '/'}${item.product_image.replace(/\/+/g, '/')}`}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <ShoppingBag size={28} />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <Link
                                                    to={`/product/${item.product}`}
                                                    className="text-base font-semibold text-slate-900 hover:text-slate-700 transition-colors line-clamp-2"
                                                >
                                                    {item.product_name}
                                                </Link>
                                                <p className="text-sm text-slate-500 mt-1.5">
                                                    ₹{parseFloat(item.unit_price).toLocaleString('en-IN')} each
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-xs text-slate-400 hover:text-red-600 transition-colors w-fit font-medium cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        {/* Quantity & Total */}
                                        <div className="flex flex-col items-end justify-between">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                                                <button
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    disabled={item.quantity <= 1}
                                                    className="px-3 py-1.5 text-slate-500 hover:bg-white hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="px-3 py-1.5 text-sm font-semibold text-slate-900 border-x border-slate-200 min-w-[40px] text-center select-none">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="px-3 py-1.5 text-slate-500 hover:bg-white hover:text-slate-700 transition-all cursor-pointer"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            {/* Item Total */}
                                            <span className="text-lg font-bold text-slate-900">
                                                ₹
                                                {parseFloat(item.item_total).toLocaleString(
                                                    'en-IN',
                                                    { minimumFractionDigits: 2 }
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Continue Shopping */}
                        <div className="mt-8">
                            <button
                                onClick={() => navigate('/products')}
                                className="text-sm text-slate-600 hover:text-slate-900 font-medium flex items-center gap-2 transition-colors cursor-pointer group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Continue Shopping
                            </button>
                        </div>
                    </div>

                    {/* ─── Order Summary ─── */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-7 lg:sticky lg:top-28">
                            <h2 className="text-xl font-bold text-slate-900 mb-7">
                                Summary
                            </h2>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600">
                                        Subtotal
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        ₹
                                        {subtotal.toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600">Shipping</span>
                                    {shipping === 0 ? (
                                        <span className="font-semibold text-emerald-600">
                                            Free
                                        </span>
                                    ) : (
                                        <span className="font-semibold text-slate-900">
                                            ₹{shipping.toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                {shipping > 0 && (
                                    <div className="bg-amber-50/60 border border-amber-200/50 rounded-lg px-4 py-3 mt-4">
                                        <p className="text-xs text-amber-900/70 font-medium">
                                            Add{' '}
                                            <span className="font-bold">
                                                ₹
                                                {(499 - subtotal).toLocaleString(
                                                    'en-IN',
                                                    { minimumFractionDigits: 2 }
                                                )}
                                            </span>{' '}
                                            for free shipping
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-200 my-6" />

                            {/* Total */}
                            <div className="mb-6">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm font-medium text-slate-600">
                                        Total
                                    </span>
                                    <span className="text-3xl font-bold text-slate-900">
                                        ₹
                                        {parseFloat(total).toLocaleString(
                                            'en-IN',
                                            { minimumFractionDigits: 2 }
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer mb-6"
                            >
                                Proceed to Checkout
                            </button>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    {
                                        icon: ShieldCheck,
                                        label: 'Secure',
                                        color: 'emerald',
                                    },
                                    {
                                        icon: Truck,
                                        label: 'Fast',
                                        color: 'blue',
                                    },
                                    {
                                        icon: RotateCcw,
                                        label: 'Returns',
                                        color: 'amber',
                                    },
                                ].map((badge, idx) => {
                                    const colorMap = {
                                        emerald: 'bg-emerald-50 text-emerald-600',
                                        blue: 'bg-blue-50 text-blue-600',
                                        amber: 'bg-amber-50 text-amber-600',
                                    }
                                    const Icon = badge.icon
                                    return (
                                        <div
                                            key={idx}
                                            className="flex flex-col items-center gap-2"
                                        >
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    colorMap[badge.color]
                                                }`}
                                            >
                                                <Icon size={18} />
                                            </div>
                                            <span className="text-xs text-slate-600 font-medium text-center leading-tight">
                                                {badge.label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart