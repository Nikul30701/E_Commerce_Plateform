import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productAPI } from '../services/api'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/useAuthStore'
import toast from 'react-hot-toast'
import {
    Plus,
    Minus,
    ShoppingCart,
    ArrowLeft,
    Check,
    Clock,
    Shield,
    RotateCcw,
} from 'lucide-react'

const API_BASE = 'http://localhost:8000'

const ProductDetail = () => {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const { addToCart } = useCartStore()
    const { isAuthenticated } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        fetchProduct()
    }, [id])

    const fetchProduct = async () => {
        setLoading(true)
        try {
            const { data } = await productAPI.getById(id)
            setProduct(data)
        } catch (error) {
            console.error('Failed to fetch product:', error)
            toast.error('Product not found')
            navigate('/products')
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart')
            navigate('/login')
            return
        }

        await addToCart(product.id, quantity)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-3 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-500">Loading product...</p>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-white px-4">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="w-10 h-10 text-slate-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">
                        Product not found
                    </h1>
                    <p className="text-slate-600 mb-8">
                        Sorry, we couldn't find the product you're looking for.
                    </p>
                    <button
                        onClick={() => navigate('/products')}
                        className="w-full py-3.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all duration-300 cursor-pointer"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        )
    }

    const hasDiscount = product.discount > 0
    const savings = product.price - product.discounted_price

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-10 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-slate-600 hover:text-slate-900 mb-8 font-medium transition-colors duration-200 group cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* ─── Image Section ─── */}
                    <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden border border-none aspect-square">
                            {product.image ? (
                                <img
                                    src={product.image.startsWith('http') ? product.image : `${API_BASE}${product.image}`}
                                    alt={product.name}
                                    className="w-full h-full  object-contain"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <ShoppingCart size={64} />
                                </div>
                            )}

                            {/* Discount Badge */}
                            {hasDiscount && (
                                <div className="absolute top-6 left-6 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg">
                                    Save ₹{savings.toLocaleString('en-IN')}
                                </div>
                            )}

                            {/* Out of Stock Overlay */}
                            {!product.is_in_stock && (
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                                    <span className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg shadow-xl">
                                        OUT OF STOCK
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── Details Section ─── */}
                    <div className="flex flex-col">
                        {/* Category & Title */}
                        <div className="mb-8">
                            <span className="inline-block px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wider mb-4">
                                {product.category_name}
                            </span>

                            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
                                {product.name}
                            </h1>

                            {/* Price Section */}
                            <div className="flex items-baseline gap-4 mb-8">
                                <span className="text-4xl font-bold text-slate-900">
                                    ₹{parseFloat(product.discounted_price).toLocaleString('en-IN')}
                                </span>
                                {hasDiscount && (
                                    <>
                                        <span className="text-xl text-slate-400 line-through">
                                            ₹{parseFloat(product.price).toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                                            {product.discount}% off
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Stock Status */}
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-3 h-3 rounded-full ${
                                        product.is_in_stock
                                            ? 'bg-emerald-500'
                                            : 'bg-red-500'
                                    }`}
                                />
                                <span
                                    className={`text-sm font-semibold ${
                                        product.is_in_stock
                                            ? 'text-emerald-700'
                                            : 'text-red-700'
                                    }`}
                                >
                                    {product.is_in_stock
                                        ? 'In Stock — Ready to ship'
                                        : 'Currently Unavailable'}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-10 pb-10 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">
                                About
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-base">
                                {product.description ||
                                    'Premium quality product designed for your satisfaction.'}
                            </p>
                        </div>

                        {/* Trust Features */}
                        <div className="mb-12 space-y-4">
                            {[
                                {
                                    icon: Clock,
                                    label: 'Fast Delivery',
                                    text: 'Ships within 24 hours',
                                },
                                {
                                    icon: Shield,
                                    label: 'Secure Payment',
                                    text: 'Safe & encrypted checkout',
                                },
                                {
                                    icon: RotateCcw,
                                    label: 'Easy Returns',
                                    text: '30-day return policy',
                                },
                            ].map((feature, idx) => {
                                const Icon = feature.icon
                                return (
                                    <div key={idx} className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mt-0.5">
                                            <Icon className="w-5 h-5 text-slate-700" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {feature.label}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {feature.text}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* CTA Section */}
                        {product.is_in_stock && (
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    {/* Quantity Controls */}
                                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                                        <button
                                            onClick={() =>
                                                setQuantity(Math.max(1, quantity - 1))
                                            }
                                            disabled={quantity <= 1}
                                            className="px-3.5 py-2.5 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="px-5 py-2.5 font-bold text-slate-900 border-x border-slate-200 min-w-[50px] text-center select-none">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                setQuantity((q) => Math.min(10, q + 1))
                                            }
                                            className="px-3.5 py-2.5 text-slate-600 hover:bg-white hover:text-slate-900 transition-all duration-200 cursor-pointer"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md cursor-pointer"
                                    >
                                        <ShoppingCart size={20} />
                                        <span>Add to Cart</span>
                                    </button>
                                </div>

                                <p className="text-center text-xs text-slate-500 font-medium">
                                    ✓ Secure payment • 24-hour shipping • Easy returns
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail