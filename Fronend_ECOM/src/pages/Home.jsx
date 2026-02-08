import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { categoryAPI, productAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, X } from 'lucide-react';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Close search on ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsSearchOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Fetch Initial Data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [categoriesRes, productsRes] = await Promise.all([
                    categoryAPI.getAllCategories(),
                    productAPI.getAllProducts()
                ]);
                setCategories(categoriesRes.data);
                setProducts(productsRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Search Logic
    const fetchProducts = useCallback(async (searchTerm) => {
        try {
            const res = await productAPI.getAllProducts(searchTerm);
            setProducts(res.data);
        } catch (error) {
            console.error("Search error:", error);
        }
    }, []);

    const debouncedFetchProducts = useMemo(
        () => debounce((value) => fetchProducts(value), 500),
        [fetchProducts]
    );

    useEffect(() => {
        if (search) debouncedFetchProducts(search);
        return () => debouncedFetchProducts.cancel();
    }, [search, debouncedFetchProducts]);

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center '>
                <div className='animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent'></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gray-50">
            
            {/* 1. SEARCH OVERLAY MODAL */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
                    {/* Dark Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsSearchOpen(false)}
                    />
                    
                    {/* Search Input Container */}
                    <div className="relative w-full max-w-2xl transform transition-all">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                            <div className="flex items-center px-5 py-4 border-b">
                                <Search className="h-6 w-6 text-gray-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    className="flex-1 ml-4 text-lg outline-none text-gray-800 placeholder-gray-400"
                                    placeholder="Search products, brands, or categories..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button onClick={() => setIsSearchOpen(false)}>
                                    <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                                </button>
                            </div>

                            {/* Live Results Preview */}
                            {search && (
                                <div className="max-h-96 overflow-y-auto p-2">
                                    {products.length > 0 ? (
                                        products.map(product => (
                                            <Link 
                                                key={product.id}
                                                to={`/product/${product.id}`}
                                                className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors"
                                                onClick={() => setIsSearchOpen(false)}
                                            >
                                                <div className="h-12 w-12 bg-gray-100 rounded-lg flex-shrink-0" />
                                                <div className="ml-4">
                                                    <p className="font-medium text-gray-900">{product.name}</p>
                                                    <p className="text-sm text-gray-500">${product.price}</p>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500">No results found for "{search}"</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 2. MAIN CONTENT WRAPPER (Blurs when search is open) */}
            <div className={`transition-all duration-500 ${isSearchOpen ? 'blur-md grayscale-[20%] pointer-events-none scale-95' : ''}`}>
                
                {/* Hero Section */}
                <div className='bg-white'> 
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24'>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <h1 className='text-5xl font-bold mb-4 text-gray-900 tracking-tight'>
                                    Find Your Next <span className="text-amber-600">Favorite</span>
                                </h1>
                                <p className='text-xl text-gray-600 mb-8'>Discover over 20,000+ premium products.</p>
                                <div className="flex gap-4">
                                    <Link to="/products" className='bg-amber-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-amber-700 transition-all'>
                                        Shop Now
                                    </Link>
                                    <button 
                                        onClick={() => setIsSearchOpen(true)}
                                        className='flex items-center bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all'
                                    >
                                        <Search className="h-5 w-5 mr-2" /> Search
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
                        <h2 className='text-2xl font-bold text-gray-900 mb-8'>Shop by Category</h2>
                        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6'>
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/products?category=${category.id}`}
                                    className='group text-center'
                                >
                                    <div className="aspect-square bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-3 group-hover:shadow-md group-hover:-translate-y-1 transition-all">
                                        <span className="text-3xl group-hover:scale-110 transition-transform">
                                            {category.name[0]}
                                        </span>
                                    </div>
                                    <h3 className='font-medium text-gray-800 group-hover:text-amber-600'>{category.name}</h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Featured Products */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Featured Collections</h2>
                        <Link to="/products" className="text-amber-600 font-semibold flex items-center hover:underline">
                            View All <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.slice(0, 4).map((product) => (
                            <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <div className="aspect-square bg-gray-50 rounded-xl mb-4" />
                                <h3 className="font-bold text-gray-900">{product.name}</h3>
                                <p className="text-amber-600 font-bold mt-1">${product.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;