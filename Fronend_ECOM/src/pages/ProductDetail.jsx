import React,{useCallback, useEffect, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/useAuthStore'
import { productAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Minus, ShoppingCart } from 'lucide-react'

const ProductDetail = () => {
    const {id} = useParams()
    const [product, setProduct] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const {addToCart} = useCartStore()
    const {isAuthenticated} = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => (
        fetchProduct()
    ), [fetchProduct]);
    
    const fetchProduct = useCallback(async () => {
        try {
            const {data} = await productAPI.getById(id)
            setProduct(data)
        } catch (error) {
            console.error("Failed to fetch product:", error);
            toast.error("Product not found")
            navigate("/product")
        } finally {
            setLoading(false)
        }
    }, [id,navigate])

    const handleAddToCart = async() => {
        if (!isAuthenticated) {
            toast.error("Please login to add to cart")
            navigate("/login")
            return
        }
        const result = await addToCart(product.id, quantity)
        if (result.success) {
            setQuantity(1);
            toast.success("Product added to cart")
        }
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-xl">Product not found</p>
            </div>
        );
    }

    const hasDiscount = product?.discount > 0;

    if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="flex items-center">
                <span className="inline-block w-[3px] h-5 bg-gray-400 rounded animate-scaleUp"></span>
                <span className="inline-block w-[3px] h-8 mx-[5px] bg-gray-400 rounded animate-scaleUp delay-200"></span>
                <span className="inline-block w-[3px] h-5 bg-gray-400 rounded animate-scaleUp delay-500"></span>
            </div>
        </div>
    )
}

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 p-8'>
                        {/* image */}
                        <div className='relative'>
                            <div className='aspect-square bg-gray-200 rounded-lg overflow-hidden'>
                                {product.image ? (
                                    <img 
                                    src={product?.image} 
                                    alt={product?.name} 
                                    className='w-full h-full object-cover'
                                />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center text-gray-400 text-xl'>
                                        No Image Available
                                    </div>
                                )}
                            </div>

                            {hasDiscount && (
                                <div className='absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold'>
                                    {product.discount}% OFF
                                </div>
                            )}

                            {!product.is_in_stock && (
                                <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg'>
                                    <span className='bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold text-xl'>
                                        Out of Stock
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* details */}
                        <div className='flex flex-col'>
                            <div className='flex-1'>
                                <p className='text-indigo-600 font-semibold mb-2'>
                                    {product?.category?.name}
                                </p>
                                {/* name */}
                                <h1 className='text-2xl font-bold mb-2'>
                                    {product?.name}
                                </h1>

                                {/* price */}
                                <div>
                                    <span>
                                        ₹{product.discounted_price}
                                    </span>
                                    {hasDiscount && (
                                        <>
                                        <span className='text-gray-500 line-through ml-2'>
                                            ₹{product.price}
                                        </span>
                                        <span className="text-green-600 font-semibold">
                                            Save ₹{(product.price - product.discounted_price).toFixed(2)}
                                        </span></>
                                    )}
                                </div>

                                {/* stock */}
                                <div className='mb-6'>
                                    {product.is_in_stock ? (
                                        <span className='text-green-600 font-semibold'>
                                            In Stock
                                        </span>
                                    ) : (
                                        <span className='text-red-600 font-semibold'>
                                            Out of Stock
                                        </span>
                                    )}
                                </div>

                                {/* description */}
                                {product?.description && (
                                    <div className='mb-6'>
                                        <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                                            Description
                                        </h2>
                                        <p className='text-gray-700 leading-relaxed'>
                                            {product?.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {/* quantity and cart */}
                            {product?.is_in_stock && (
                                <div className="border-t pt-6">
                                    <div className='flex items-center space-x-4 mb-4'>
                                        <span className='text-gray-700 font-medium'>
                                            Quantity
                                        </span>
                                        <div className='flex items-center border border-gray-300 rounded-lg'>
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity -1))}
                                                className='p-2 hover:bg-white rounded-lg transition-colors shadow-sm'
                                                disabled={quantity <= 1}
                                            >
                                                <Minus size={20} />
                                            </button>
                                            <span className='px-4 py-1 border-x border-gray-300'>
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => setQuantity(q => Math.min(10, q + 1))}
                                                className='p-2 hover:bg-white rounded-lg transition-colors shadow-sm'
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        className='w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 flex items-center justify-center space-x-2 text-lg'
                                    >
                                        <ShoppingCart />
                                        <span>Add to Cart</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail
