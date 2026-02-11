import React from 'react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ProductCard = ({product}) => {
    const { addToCart } = useCartStore();
    const {isAuthenticated} = useAuthStore();

    const handelAddCart = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error("Please Login to add items to cart")
            return;
        }
        await addToCart(product.id, 1)
    }

    const hasDiscount = product.discount > 0;

    return (
        <Link 
            to={`/product/${product.id}`}
            className='group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300'
            >
            {/* Image */}
            <div className='relative h-48 bg-gray-200 overflow-hidden'>
                {product.image ? (
                    <img 
                        src={product.image}
                        alt={product.name}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                    />
                ) : (
                    <div className='w-full h-full flex items-center justify-center bg-gray-100'>
                        <span className='text-gray-400 text-sm'>No Image</span>
                    </div>
                )}
            </div>
        </Link>
    )
}

export default ProductCard
