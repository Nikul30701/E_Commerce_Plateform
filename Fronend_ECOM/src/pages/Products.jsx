import React, { useEffect, useState, useMemo, useCallback } from 'react'

import { categoryAPI, productAPI } from '../services/api'
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import debounce from 'lodash.debounce';
import ProductCard from '../components/ProductCard';


const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [totalCount, setTotalCount] = useState(0)
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

    // Fetch products
    const fetchProducts = useCallback(async (currentFilters) => {
        setLoading(true);
        try {
            const params = {};
            // Only send non-empty values to API
            Object.keys(currentFilters).forEach(key => {
                if (currentFilters[key]) params[key] = currentFilters[key];
            });

            const { data } = await productAPI.getAllProducts(params);
            setProducts(data.results);
            setTotalCount(data.count);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce product fetch
    const debouncedFetch = useMemo(
        () => debounce((f) => fetchProducts(f), 400),
        [fetchProducts]
    );

    useEffect(() => {
        debouncedFetch(filters);
        return () => debouncedFetch.cancel();
    }, [filters, debouncedFetch]);

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

    const handlePageChange = (page) => {
        const newFilters = { ...filters, page: page.toString() }
        setFilters(newFilters)

        // update url
        const params = {}
        Object.keys(newFilters).forEach(k => {
            if (newFilters[k]) params[k] = newFilters[k];
        })
        setSearchParams(params)
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })
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

    // Pagination calculations
    const itemsPerPage = 12
    const totalPages = Math.ceil(totalCount / itemsPerPage)
    const currentPage = parseInt(filters.page)

    // Generate page numbers with ellipsis
    const getPageNumbers = () => {
        const pages = []
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            if (currentPage > 3) pages.push('...')
            
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)
            for (let i = start; i <= end; i++) pages.push(i)
            
            if (currentPage < totalPages - 2) pages.push('...')
            pages.push(totalPages)
        }
        return pages
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
                                <div className='flex items-center justify-center py-29'>
                                    <div className='animated-pin rounded-full h-12 w-12 border-stone-500 border-t-transparent' />
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
                                <>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                        {products.map((product) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className='mt-8 flex items-center justify-center gap-2'>
                                            {/* Previous Button */}
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className='flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium'
                                            >
                                                <ChevronLeft className='h-4 w-4' />
                                                Prev
                                            </button>

                                            {/* Page Numbers */}
                                            <div className='flex items-center gap-1'>
                                                {getPageNumbers().map((pageNum, idx) => (
                                                    pageNum === '...' ? (
                                                        <span key={`dots-${idx}`} className='px-2 text-gray-400 select-none'>…</span>
                                                    ) : (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                                                                currentPage === pageNum
                                                                    ? 'bg-stone-600 text-white shadow-sm'
                                                                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    )
                                                ))}
                                            </div>

                                            {/* Next Button */}
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage >= totalPages}
                                                className='flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium'
                                            >
                                                Next
                                                <ChevronRight className='h-4 w-4' />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default Products
