import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addressAPI, orderAPI } from '../services/api'
import { useCartStore } from '../store/cartStore'
import {
    MapPin,
    Plus,
    Check,
    ArrowLeft,
    Shield,
    Truck,
    Clock,
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Checkout = () => {
    const navigate = useNavigate()
    const { cart, fetchCart } = useCartStore()
    const [addresses, setAddresses] = useState([])
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchAddresses()
    }, [])

    const fetchAddresses = async () => {
        try {
            const { data } = await addressAPI.getAllAddresses()
            const addressList = Array.isArray(data) ? data : data.results || []
            setAddresses(addressList)
            const defaultAddr = addressList.find((addr) => addr.is_default)
            if (defaultAddr) setSelectedAddress(defaultAddr.id)
        } catch (error) {
            console.error('Failed to fetch addresses:', error)
        }
    }

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select a delivery address')
            return
        }

        setLoading(true)
        try {
            const { data } = await orderAPI.checkout({
                address_id: selectedAddress,
                notes: notes,
            })

            toast.success('Order placed successfully! 🎉')
            fetchCart()
            navigate(`/orders/${data.order.id}`)
        } catch (error) {
            const message =
                error.response?.data?.error || 'Failed to place order'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!cart || cart.items.length === 0) {
            navigate('/cart')
            return
        }
        fetchAddresses()
    }, [cart, navigate])

    if (!cart) return null;

    const subtotal =
        cart?.items?.reduce((sum, item) => {
            const price =
                Number(item.item_total) ||
                Number(item.unit_price) * Number(item.quantity) ||
                0
            return sum + price
        }, 0) || 0
    const shipping = subtotal > 499 || subtotal === 0 ? 0 : 49
    const total = subtotal + shipping

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center text-slate-600 hover:text-slate-900 mb-10 font-medium transition-colors group cursor-pointer"
                >
                    <ArrowLeft
                        size={18}
                        className="mr-2 group-hover:-translate-x-1 transition-transform"
                    />
                    Back to Cart
                </button>

                <h1 className="text-5xl font-bold text-slate-900 tracking-tight mb-2">
                    Checkout
                </h1>
                <p className="text-slate-600 text-lg mb-12 font-medium">
                    Review your order and complete your purchase
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                    {/* ─── Main Form ─── */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Shipping Address Section */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-100 rounded-lg">
                                        <MapPin
                                            size={22}
                                            className="text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">
                                            Shipping Details
                                        </h2>
                                        <p className="text-slate-600 text-sm mt-0.5">
                                            Where should we deliver your order?
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        navigate(
                                            '/addresses?redirect=/checkout'
                                        )
                                    }
                                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-all duration-200 cursor-pointer text-sm"
                                >
                                    <Plus size={18} />
                                    Add New
                                </button>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mx-auto mb-4">
                                        <MapPin
                                            size={28}
                                            className="text-slate-400"
                                        />
                                    </div>
                                    <p className="text-slate-600 mb-6 font-medium">
                                        No shipping addresses saved
                                    </p>
                                    <button
                                        onClick={() =>
                                            navigate(
                                                '/addresses?redirect=/checkout'
                                            )
                                        }
                                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all duration-300 cursor-pointer"
                                    >
                                        <Plus size={18} />
                                        Add Address
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addresses.map((address) => (
                                        <div
                                            key={address.id}
                                            onClick={() =>
                                                setSelectedAddress(address.id)
                                            }
                                            className={`relative p-6 rounded-2xl cursor-pointer border-2 transition-all duration-300 ${
                                                selectedAddress === address.id
                                                    ? 'border-slate-900 bg-slate-50 shadow-lg'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                        >
                                            {selectedAddress === address.id && (
                                                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                                                    <Check
                                                        size={16}
                                                        className="text-white"
                                                    />
                                                </div>
                                            )}
                                            <p className="font-bold text-slate-900 text-lg mb-2">
                                                {address.fullname}
                                            </p>
                                            <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                                {address.street}, {address.city}
                                                <br />
                                                {address.state} —{' '}
                                                {address.zipcode}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                <span className="text-xs font-medium text-slate-500">
                                                    {address.phone}
                                                </span>
                                                {address.is_default && (
                                                    <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Delivery Instructions */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                Delivery Instructions
                            </h2>
                            <p className="text-slate-600 text-sm mb-5 font-medium">
                                Add any special requests or gate codes
                            </p>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g., Leave at the door, ring bell twice, call before delivery..."
                                rows={3}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 transition-all resize-none placeholder:text-slate-400 font-medium text-slate-900 text-sm"
                            />
                        </div>

                        {/* Trust Features */}
                        <div className="grid grid-cols-3 gap-4 bg-slate-50 rounded-2xl border border-slate-200 p-6">
                            {[
                                {
                                    icon: Truck,
                                    label: 'Fast Delivery',
                                    text: '24-48 hours',
                                },
                                {
                                    icon: Shield,
                                    label: 'Secure Payment',
                                    text: 'Encrypted SSL',
                                },
                                {
                                    icon: Clock,
                                    label: 'Track Order',
                                    text: 'Real-time updates',
                                },
                            ].map((feature, idx) => {
                                const Icon = feature.icon
                                return (
                                    <div
                                        key={idx}
                                        className="flex flex-col items-center text-center"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-2.5">
                                            <Icon
                                                size={20}
                                                className="text-slate-700"
                                            />
                                        </div>
                                        <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-0.5">
                                            {feature.label}
                                        </p>
                                        <p className="text-xs text-slate-600">
                                            {feature.text}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* ─── Order Summary Sidebar ─── */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm lg:sticky lg:top-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">
                                Order Summary
                            </h2>

                            {/* Items Preview */}
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                                    Items ({cart?.total_items || 0})
                                </p>
                                <div className="space-y-3 max-h-48 overflow-y-auto">
                                    {cart.items && cart.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-3"
                                        >
                                            {item.product_image && (
                                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                                                    <img
                                                        src={
                                                            item.product_image.startsWith(
                                                                'http'
                                                            )
                                                                ? item.product_image
                                                                : `${API_BASE}${item.product_image.startsWith('/') ? '' : '/'}${item.product_image}`
                                                        }
                                                        alt={item.product_name}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                                                    {item.product_name}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900 flex-shrink-0">
                                                ₹
                                                {parseFloat(
                                                    item.item_total
                                                ).toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing Breakdown */}
                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between text-sm">
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
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">
                                        Shipping
                                    </span>
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
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-200 mb-8" />

                            {/* Total */}
                            <div className="mb-8">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm font-medium text-slate-600">
                                        Total
                                    </span>
                                    <span className="text-3xl font-bold text-slate-900">
                                        ₹
                                        {total.toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading || !selectedAddress}
                                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 cursor-pointer mb-4"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    'Complete Purchase'
                                )}
                            </button>

                            {/* Security Badge */}
                            <div className="flex items-center justify-center gap-2 text-slate-600 text-xs font-medium py-2">
                                <Shield size={14} />
                                <span>Secure Checkout</span>
                            </div>

                            {!selectedAddress && (
                                <p className="text-xs text-red-600 mt-4 text-center font-medium">
                                    Please select a delivery address
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout