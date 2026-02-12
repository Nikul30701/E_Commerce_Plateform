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

const API_BASE = 'http://localhost:8000'

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

    /* ─── Not Authenticated ─── */
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="mx-auto w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6">
                        <ShoppingBag className="h-10 w-10 text-stone-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Please login to view your cart
                    </h1>
                    <p className="text-gray-500 mb-8">
                        Sign in to your account to access your shopping cart and
                        continue shopping.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center px-8 py-3 bg-stone-700 text-white font-medium rounded-full hover:bg-stone-800 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                    >
                        Login to Continue
                    </button>
                </div>
            </div>
        )
    }

    /* ─── Loading ─── */
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="flex items-center gap-1">
                    <span className="inline-block w-[3px] h-5 bg-stone-400 rounded animate-scaleUp"></span>
                    <span className="inline-block w-[3px] h-8 bg-stone-400 rounded animate-scaleUp delay-200"></span>
                    <span className="inline-block w-[3px] h-5 bg-stone-400 rounded animate-scaleUp delay-500"></span>
                </div>
            </div>
        )
    }

    const isEmpty = !cart || !cart.items || cart.items.length === 0

    /* ─── Empty Cart ─── */
    if (isEmpty) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="mx-auto w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center mb-6">
                        <ShoppingBag className="h-12 w-12 text-stone-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Your cart is empty
                    </h2>
                    <p className="text-gray-500 mb-8">
                        Looks like you haven't added anything to your cart yet.
                        Start shopping to fill it up!
                    </p>
                    <button
                        onClick={() => navigate('/products')}
                        className="inline-flex items-center px-8 py-3 bg-stone-700 text-white font-medium rounded-full hover:bg-stone-800 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Browse Products
                    </button>
                </div>
            </div>
        )
    }

    /* ─── Helpers ─── */
    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return
        await updateCart(itemId, { quantity: newQuantity })
    }

    const handleRemoveItem = async (itemId) => {
        await deleteCart(itemId)
    }

    const handleClearCart = async () => {
        await clearCart()
    }

    const subtotal = parseFloat(cart.total_price) || 0
    const shipping = subtotal > 499 ? 0 : 49
    const total = subtotal + shipping

    /* ─── Main Cart View ─── */
    return (
        <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                            Shopping Cart
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {cart.total_items}{' '}
                            {cart.total_items === 1 ? 'item' : 'items'} in your
                            cart
                        </p>
                    </div>
                    <button
                        onClick={handleClearCart}
                        className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear Cart
                    </button>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* ─── Cart Items ─── */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Table header — desktop only */}
                            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <span className="col-span-6">Product</span>
                                <span className="col-span-2 text-center">
                                    Price
                                </span>
                                <span className="col-span-2 text-center">
                                    Quantity
                                </span>
                                <span className="col-span-2 text-right">
                                    Total
                                </span>
                            </div>

                            {/* Items */}
                            <ul className="divide-y divide-gray-100">
                                {cart.items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="group px-4 sm:px-6 py-5 hover:bg-stone-50/40 transition-colors duration-200"
                                    >
                                        <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center flex flex-col gap-4">
                                            {/* Product Info */}
                                            <div className="md:col-span-6 flex items-center gap-4">
                                                {/* Thumbnail */}
                                                <Link
                                                    to={`/product/${item.product}`}
                                                    className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 hover:border-stone-300 transition-colors"
                                                >
                                                    {item.product_image ? (
                                                        <img
                                                            src={
                                                                item.product_image.startsWith(
                                                                    'http'
                                                                )
                                                                    ? item.product_image
                                                                    : `${API_BASE}${item.product_image}`
                                                            }
                                                            alt={
                                                                item.product_name
                                                            }
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <ShoppingBag
                                                                size={28}
                                                            />
                                                        </div>
                                                    )}
                                                </Link>

                                                {/* Name & Remove */}
                                                <div className="min-w-0 flex-1">
                                                    <Link
                                                        to={`/product/${item.product}`}
                                                        className="text-sm sm:text-base font-semibold text-gray-800 hover:text-stone-600 transition-colors line-clamp-2"
                                                    >
                                                        {item.product_name}
                                                    </Link>

                                                    {/* Unit price — mobile */}
                                                    <p className="md:hidden text-sm text-gray-500 mt-1">
                                                        ₹
                                                        {parseFloat(
                                                            item.unit_price
                                                        ).toLocaleString(
                                                            'en-IN'
                                                        )}{' '}
                                                        each
                                                    </p>

                                                    <button
                                                        onClick={() =>
                                                            handleRemoveItem(
                                                                item.id
                                                            )
                                                        }
                                                        className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                    >
                                                        <X className="w-3 h-3" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Unit Price — desktop */}
                                            <div className="hidden md:flex md:col-span-2 justify-center">
                                                <span className="text-sm font-medium text-gray-700">
                                                    ₹
                                                    {parseFloat(
                                                        item.unit_price
                                                    ).toLocaleString('en-IN')}
                                                </span>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="md:col-span-2 flex md:justify-center">
                                                <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                    <button
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                item.id,
                                                                item.quantity -
                                                                    1
                                                            )
                                                        }
                                                        disabled={
                                                            item.quantity <= 1
                                                        }
                                                        className="px-2.5 py-1.5 text-gray-500 hover:bg-stone-50 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="px-4 py-1.5 text-sm font-semibold text-gray-800 border-x border-gray-200 min-w-[40px] text-center select-none">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                item.id,
                                                                item.quantity +
                                                                    1
                                                            )
                                                        }
                                                        className="px-2.5 py-1.5 text-gray-500 hover:bg-stone-50 hover:text-stone-700 transition-colors cursor-pointer"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Item Total */}
                                            <div className="md:col-span-2 flex md:justify-end">
                                                <span className="text-sm sm:text-base font-bold text-gray-900">
                                                    ₹
                                                    {parseFloat(
                                                        item.item_total
                                                    ).toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Continue Shopping */}
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/products')}
                                className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 font-medium transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Continue Shopping
                            </button>
                        </div>
                    </div>

                    {/* ─── Order Summary Sidebar ─── */}
                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-28">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">
                                Order Summary
                            </h2>

                            {/* Breakdown */}
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>
                                        Subtotal ({cart.total_items}{' '}
                                        {cart.total_items === 1
                                            ? 'item'
                                            : 'items'}
                                        )
                                    </span>
                                    <span className="font-medium text-gray-800">
                                        ₹
                                        {subtotal.toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    {shipping === 0 ? (
                                        <span className="font-medium text-green-600">
                                            Free
                                        </span>
                                    ) : (
                                        <span className="font-medium text-gray-800">
                                            ₹{shipping.toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                {shipping > 0 && (
                                    <p className="text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2">
                                        Add ₹
                                        {(499 - subtotal).toLocaleString(
                                            'en-IN',
                                            { minimumFractionDigits: 2 }
                                        )}{' '}
                                        more for{' '}
                                        <span className="font-semibold text-green-600">
                                            FREE shipping
                                        </span>
                                    </p>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-dashed border-gray-200 my-5" />

                            {/* Total */}
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-base font-bold text-gray-900">
                                    Total
                                </span>
                                <span className="text-xl font-extrabold text-gray-900">
                                    ₹
                                    {total.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full py-3.5 bg-stone-700 hover:bg-stone-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                            >
                                Proceed to Checkout
                            </button>

                            {/* Trust Badges */}
                            <div className="mt-6 grid grid-cols-3 gap-3">
                                <div className="flex flex-col items-center text-center gap-1.5">
                                    <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                                        <ShieldCheck className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-[10px] text-gray-500 leading-tight font-medium">
                                        Secure
                                        <br />
                                        Payment
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-1.5">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Truck className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="text-[10px] text-gray-500 leading-tight font-medium">
                                        Fast
                                        <br />
                                        Delivery
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-1.5">
                                    <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
                                        <RotateCcw className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <span className="text-[10px] text-gray-500 leading-tight font-medium">
                                        Easy
                                        <br />
                                        Returns
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart
