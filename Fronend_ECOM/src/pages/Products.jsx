import React, { useEffect, useState, useMemo } from 'react'

import { categoryAPI, productAPI } from '../services/api'
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import debounce from 'lodash.debounce';
import ProductCard from '../components/ProductCard';


const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [ totalCount, setTotalCount] = useState(0)
    const [showFilters, setShowFilters] = useState(false)

    
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        search: searchParams.get('search') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sortBy: searchParams.get('sortBy') || '-created_at',
        page: searchParams.get('page') || 1,
    })

    // this handle forward and backward button
    useEffect(() => {
        setFilters({
            category: searchParams.get('category') || '',
            search: searchParams.get('search') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            sortBy: searchParams.get('sortBy') || '-created_at',
            page: searchParams.get('page') || 1,
        });
    }, [searchParams]);

    // fetch categories
    useEffect(() => {
        fetchCategories()
    },[])

    const fetchCategories = async() => {
        try {
            const {data} = await categoryAPI.getAllCategories();
            setCategories(data.results)
        } catch (error) {
            console.log(error)
        }
    }

    // Debounce product fetch
    const debouncedFetch = useMemo(
        () => debounce((params) => {
            fetchProducts(params);
        }, 500),
        []
    );

    useEffect(() => {
        debouncedFetch(filters);

        return () => debouncedFetch.cancel();
    }, [filters]);


    // Fetch products
    const fetchProducts = async () => {
        setLoading(true)
        try{
            const params = {};
            Object.keys(filters).forEach(key => {
                if (filters[key]) params[key] = filters[key]
            })

            const {data} = await productAPI.getAllProducts(params);
            setProducts(data.results);
            setTotalCount(data.count);
        }catch(error){
            console.error("Error fetching products:", error)
        } finally{
            setLoading(false)
        }
    }

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]:value, page:'1'}
        setFilters(newFilters)

        // update url
        const params = {}
        Object.keys(newFilters).forEach(k => {
            if (newFilters[k]) params[k] = newFilters[k];
        })
        setSearchParams(params)
    }

    const clearFilters = () => {
        setFilters({
            category: '',
            search:'',
            minPrice:'',
            maxPrice:'',
            sortBy:'-created_at',
            page:1,
        })
        setSearchParams({})
    }
    
    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* header */}
                <div className='flex items-center justify-between mb-6'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-800'>Products</h1>
                        <p className='text-gray-600'>
                            {loading ? 'Updating...' : `Showing ${products.length} of ${totalCount} products`}
                        </p>
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className='lg:hidden flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md'>
                        <SlidersHorizontal className="h-5 w-5" />
                        <span>Filters</span>
                    </button>
                </div>


                <div className='flex flex-col lg:flex-row gap-6'>
                    {/* filter sidbar */}
                    <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className='bg-white rounded-lg shadow-md p-6 sticky top-20'>
                            <div className='flex items-center justify-between mb-4'>
                                <h2 className='text-lg font-semibold '>Filters</h2>
                                <button
                                    onClick={clearFilters}
                                    className='text-sm text-stone-600 hover:text-stone-700'
                                >Clear All</button>
                            </div>

                            {/* Category Filter */}
                            <div className='mb-6'>
                                <label className='font-semibold mb-3'>Category</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className='w-full px-3 py-2 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-stone-500'
                                >
                                    <option value=''>All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range Filter */}  
                            <div className='mb-6'>
                                <label className='font-semibold mb-3'>Price Range</label>
                                <div className='flex space-x-2'>
                                    <input
                                        type='number'
                                        placeholder='Min'
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        className='w-full px-3 py-2 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-stone-500'
                                    />
                                    <input
                                        type='number'
                                        placeholder='Max'
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        className='w-full px-3 py-2 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-stone-500'
                                    />
                                </div>
                            </div>

                            {/* Sort By Filter */}
                            <div className='mb-6'>
                                <label className='font-semibold mb-3'>Sort By</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className='w-full px-3 py-2 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-stone-500'
                                >
                                    <option value='-created_at'>Newest First</option>
                                    <option value='created_at'>Oldest First</option>
                                    <option value='price'>Price: Low to High</option>
                                    <option value='-price'>Price: High to Low</option>
                                </select>
                            </div>

                            {/* Search Filter */}
                            <div className='mb-6'>
                                <label className='font-semibold mb-3'>Search</label>
                                <input
                                    type='text'
                                    placeholder='Search products...'
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className='w-full px-3 py-2 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-stone-500'
                                />
                            </div>
                            </div>
                        </div>
                        {/* product grid */}
                        <div className='flex-1'>
                            {loading ? (
                                <div className='flex items-center jsutify-center py-29'>
                                    <div className='aminamte-pin rounded-full h-12 w-12 border-stone-500 border-t-transparent' />
                                </div>
                            ) : products.length === 0 ? (
                                <div className='bg-white rounded-lg shadow-md p-12 text-center'>
                                    <p className='text-gray-500 text-lg'>
                                        No products found
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className='mt-4 text-stone-600 hover:text-stone-700 font-semibold'
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default Products
