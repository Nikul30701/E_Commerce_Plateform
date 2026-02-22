import React from 'react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/useAuthStore'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { ShoppingBag, Plus } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ProductCard = ({ product }) => {
    const { addToCart } = useCartStore()
    const { isAuthenticated } = useAuthStore()

    const handleAddToCart = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!isAuthenticated) {
            toast.error('Please login to add items to cart')
            return
        }
        await addToCart(product.id, 1)
    }

    const hasDiscount = product.discount > 0
    const savings = product.price - product.discounted_price

    return (
        <Link
            to={`/product/${product.id}`}
            className="group relative h-full"
        >
            <div className="relative h-full flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                    {product.image ? (
                        <img
                            src={product.image.startsWith('http') ? product.image : `${API_BASE}${product.image}`}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                            <ShoppingBag
                                size={40}
                                className="text-slate-300"
                            />
                        </div>
                    )}

                    {/* Discount Badge */}
                    {hasDiscount && (
                        <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-md">
                            Save ₹{savings.toLocaleString('en-IN')}
                        </div>
                    )}

                    {/* Stock Overlay */}
                    {!product.is_in_stock && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                            <span className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold shadow-xl">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col">
                    {/* Category */}
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                        {product.category_name || 'Product'}
                    </span>

                    {/* Product Name */}
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-3 group-hover:text-slate-700 transition-colors leading-snug">
                        {product.name}
                    </h3>

                    {/* Price Section */}
                    <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-slate-900">
                                ₹{parseFloat(product.discounted_price).toLocaleString('en-IN')}
                            </span>
                            {hasDiscount && (
                                <>
                                    <span className="text-sm text-slate-400 line-through">
                                        ₹{parseFloat(product.price).toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                        {product.discount}% off
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-4 flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                product.is_in_stock
                                    ? 'bg-emerald-500'
                                    : 'bg-red-500'
                            }`}
                        />
                        <span
                            className={`text-xs font-medium ${
                                product.is_in_stock
                                    ? 'text-emerald-700'
                                    : 'text-red-700'
                            }`}
                        >
                            {product.is_in_stock ? 'In Stock' : 'Unavailable'}
                        </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={!product.is_in_stock}
                        className="w-full mt-auto px-4 py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
        </Link>
    )
}

export default ProductCard