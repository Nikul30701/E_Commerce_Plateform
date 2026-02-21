import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { categoryAPI, productAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { 
    Search, X, Flame,
    Star, ShoppingBag, ArrowRight, Zap, ArrowUpRight
} from 'lucide-react';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';

const API_BASE = 'http://localhost:8000/'

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Header scroll effect
    useEffect(() => {
        const handleScroll = throttle(() => {
            setIsScrolled(window.scrollY > 50);
        }, 200);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Initial Data Fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [categoriesRes, productsRes] = await Promise.all([
                    categoryAPI.getAllCategories(),
                    productAPI.getAllProducts()
                ]);
                setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : (categoriesRes.data.results || []));
                const allProducts = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.results || []);
                setProducts(allProducts);
                setFeaturedProducts([...allProducts].sort(() => 0.5 - Math.random()).slice(0, 8));
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
            setProducts(Array.isArray(res.data) ? res.data : (res.data.results || []));
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
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
                    <p className="text-stone-500 font-medium animate-pulse">Loading experience...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#f8f9fa] text-stone-900 font-sans">
            {isSearchOpen && (
                <div className="fixed inset-0 z-[999] flex items-start justify-center pt-20 px-4">
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-md" onClick={() => setIsSearchOpen(false)} />
                    
                    <div className="relative w-full max-w-2xl transform transition-all duration-500 animate-in fade-in zoom-in-95">
                        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden">
                            <div className="p-6 flex items-center gap-4 border-b border-stone-100">
                                <Search className="text-stone-400" size={24} />
                                <input
                                    autoFocus
                                    className="w-full bg-transparent text-xl outline-none placeholder:text-stone-400"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-4">
                                {products.length > 0 ? (
                                    <div className="space-y-2">
                                        {products.map(product => (
                                            <Link 
                                                key={product.id} to={`/product/${product.id}`}
                                                className="flex items-center gap-4 p-3 hover:bg-white rounded-3xl transition-all hover:shadow-sm"
                                                onClick={() => setIsSearchOpen(false)}
                                            >
                                                <div className="h-12 w-12 bg-stone-100 rounded-2xl flex items-center justify-center">
                                                    <ShoppingBag size={20} className="text-stone-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-stone-800">{product.name}</h4>
                                                    <p className="text-sm text-stone-500">${product.price}</p>
                                                </div>
                                                <ArrowUpRight size={18} className="text-stone-300" />
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-stone-400">No products found for "{search}"</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HERO  */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-6xl md:text-8xl  font-black text-stone-900 leading-[0.9] mb-8 tracking-tighter">
                            ELEVATE YOUR <br />
                            <span className="text-stone-400 italic">APP EXPERIENCE.</span>
                        </h1>
                        <p className="text-xl text-stone-500 mb-10 max-w-lg leading-relaxed font-medium">
                            Practicing Django Rest Framework and React.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/products" className="px-10 py-5 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-stone-200">
                                Browse Store
                            </Link>
                            <button 
                                onClick={() => setIsSearchOpen(true)}
                                className="px-10 py-5 bg-white text-stone-900 border border-stone-200 rounded-2xl font-bold hover:bg-stone-50 transition-all"
                            >
                                Quick Search
                            </button>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-stone-200/30 -z-0 rounded-bl-[200px] hidden lg:block" />
            </section>

            {/*  CATEGORIES  */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">SHOP CATEGORIES</h2>
                            <p className="text-stone-400 font-medium">Curated selections for your lifestyle</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/products?category=${category.id}`}
                                className="group flex flex-col items-center"
                            >
                                <div className="w-full aspect-square bg-[#f8f9fa] rounded-[2.5rem] flex items-center justify-center mb-4 group-hover:bg-stone-900 transition-all duration-500 group-hover:rotate-6 group-hover:shadow-2xl">
                                    <span className="text-4xl group-hover:scale-125 transition-transform duration-500 group-hover:text-stone-200 font-black opacity-20 group-hover:opacity-100">
                                        {category.name[0]}
                                    </span>
                                </div>
                                <h3 className="font-bold text-stone-800 uppercase tracking-widest text-xs">{category.name}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRODUCTS  */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-neutral-900 rounded-2xl flex items-center justify-center">
                                <Flame className="text-white" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">FEATURED DROPS</h2>
                        </div>
                        <Link to="/products" className="group flex items-center gap-2 font-bold text-stone-500 hover:text-stone-900 transition-colors">
                            VIEW ALL <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>

                    <section className="py-12">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {featuredProducts.slice(0, 4).map((product, idx) => (
                                    <Link
                                        key={product.id}
                                        to={`/product/${product.id}`}
                                        className="group relative"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:-translate-y-2">
                                            {/* Product Image */}
                                            <div className="relative w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden flex items-center justify-center">
                                                {product.image ? (
                                                    <img
                                                        src={
                                                            product.image.startsWith(
                                                                'http'
                                                            )
                                                                ? product.image
                                                                : `${API_BASE}${product.image}`
                                                        }
                                                        alt={product.name}
                                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <ShoppingBag
                                                        size={48}
                                                        className="text-slate-200 group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                )}

                                                {/* Badge */}
                                                <div className="absolute top-4 right-4 px-3 py-1.5 hover:opacity-100  bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
                                                    {product.discount > 0 ? (
                                                        <span className="text-emerald-600">
                                                            {product.discount}% OFF
                                                        </span>
                                                    ) : (
                                                        'NEW'
                                                    )}
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div className="p-5">
                                                <h3 className="font-semibold text-slate-900 line-clamp-2 mb-3 group-hover:text-slate-700 transition-colors hover:opacity-100">
                                                    {product.name}
                                                </h3>

                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-lg font-bold text-slate-900">
                                                        ₹
                                                        {parseFloat(
                                                            product.discounted_price ||
                                                                product.price
                                                        ).toLocaleString('en-IN')}
                                                    </span>
                                                    {product.discount > 0 && (
                                                        <span className="text-sm text-slate-400 line-through">
                                                            ₹
                                                            {parseFloat(
                                                                product.price
                                                            ).toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Stock Status */}
                                            <div className="px-5 pb-5">
                                                <div className="flex items-center gap-2 text-xs font-medium">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${
                                                            product.is_in_stock
                                                                ? 'bg-emerald-500'
                                                                : 'bg-red-500'
                                                        }`}
                                                    />
                                                    <span
                                                        className={
                                                            product.is_in_stock
                                                                ? 'text-emerald-700'
                                                                : 'text-red-700'
                                                        }
                                                    >
                                                        {product.is_in_stock
                                                            ? 'In Stock'
                                                            : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            
                        </div>
                    </section>
                </div>
            </section>
        </div>
    );
};

export default Home;