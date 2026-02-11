import React, { useState } from 'react';
import { ShoppingCart, User, LogOut, Package, MapPin, Home, Search, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/cartStore';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuthStore();
    const cartCount = useCartStore(state => state.cart?.length ?? 0);
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        setShowMenu(false);
        navigate('/login', { replace: true });
    };

    return (
        <nav className='bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-16'>
                <div className='flex justify-between items-center h-20'>

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 shrink-0 group">
                        <div className="bg-stone-50 p-2 rounded-full group-hover:bg-stone-100 transition-colors">
                            <ShoppingCart className="h-6 w-6 text-stone-600" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800 tracking-tight group-hover:text-stone-600 transition-colors">
                            ECOM<span className="text-stone-600">Hub</span>
                        </span>
                    </Link>

                    {/* Search Bar - Modern Pill Shape */}
                    <div className='hidden md:flex flex-1 max-w-lg mx-8'>
                        <div className='relative w-full group'>
                            <input 
                                type="text"
                                placeholder='Search for products...'
                                className='w-full pl-11 pr-4 py-2.5 bg-gray-100 border-transparent text-gray-700 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-300'
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.target.value.trim()) {
                                        navigate(`/products?search=${e.target.value.trim()}`);
                                    }
                                }}
                            />
                            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-stone-500 transition-colors' size={18} />
                        </div>
                    </div>

                    {/* Right Side Navigation */}
                    <div className='flex items-center space-x-6'>
                        
                        <Link to='/' className='hidden sm:flex flex-col items-center text-gray-500 hover:text-stone-600 transition-colors group'>
                            <Home className='w-6 h-6 mb-0.5 group-hover:-translate-y-0.5 transition-transform duration-200' strokeWidth={1.5} />
                            <span className='text-[10px] font-medium'>Home</span>
                        </Link>

                        {/* Cart */}
                        <Link to='/cart' className='relative group flex flex-col items-center text-gray-500 hover:text-stone-600 transition-colors'>
                            <div className="relative">
                                <ShoppingCart className='w-6 h-6 group-hover:-translate-y-0.5 transition-transform duration-200' strokeWidth={1.5} />
                                {cartCount > 0 && (
                                    <span className='absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white'>
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span className='text-[10px] font-medium mt-0.5'>Cart</span>
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className='relative'>
                                <button 
                                    onClick={() => setShowMenu(!showMenu)} 
                                    className='flex items-center space-x-2 text-gray-700 hover:text-stone-600 focus:outline-none transition-colors'
                                >
                                    <div className='w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200'>
                                        <User className='w-5 h-5 text-gray-600' />
                                    </div>
                                    <div className="hidden sm:flex flex-col items-start text-sm">
                                        <span className='font-semibold text-gray-800 leading-tight'>{user?.first_name}</span>
                                        <span className='text-[10px] text-gray-500 flex items-center'>Account <ChevronDown size={10} className="ml-1"/></span>
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {showMenu && (
                                    <>
                                        <div className='fixed inset-0 z-10 cursor-default' onClick={() => setShowMenu(false)} />
                                        <div className='absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
                                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                                <p className="text-sm font-medium text-gray-900">Signed in as</p>
                                                <p className="text-sm text-gray-500 truncate">{user?.email || user?.first_name}</p>
                                            </div>
                                            
                                            <div className="py-1">
                                                <Link to='/profile' onClick={() => setShowMenu(false)} className='flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-stone-50 hover:text-amber-700 transition-colors'>
                                                    <User className='w-4 h-4 mr-3 text-gray-400' /> Profile
                                                </Link>
                                                <Link to='/orders' onClick={() => setShowMenu(false)} className='flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-stone-50 hover:text-amber-700 transition-colors'>
                                                    <Package className='w-4 h-4 mr-3 text-gray-400' /> Orders
                                                </Link>
                                                <Link to='/addresses' onClick={() => setShowMenu(false)} className='flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-stone-50 hover:text-amber-700 transition-colors'>
                                                    <MapPin className='w-4 h-4 mr-3 text-gray-400' /> Addresses
                                                </Link>
                                            </div>
                                            
                                            <div className="border-t border-gray-100 mt-1 py-1">
                                                <button onClick={handleLogout} className='flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left'>
                                                    <LogOut className='w-4 h-4 mr-3' /> Logout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link to='/login' className='px-5 py-2 rounded-full bg-stone-600 text-white text-sm font-medium hover:bg-stone-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-1'>
                                <User className='w-4 h-4' />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;