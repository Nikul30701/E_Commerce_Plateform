import React from 'react'
import Home from './pages/Home'
import {  Route, Routes } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';


const App = () => {
  const initAuth = useAuthStore(state => state.initAuth);

  useEffect(() => {
      initAuth();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50"> 
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/products' element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path='/cart' element={<Cart />} />
      </Routes>
      <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#363636',
              },
              success: {
                iconTheme: {
                  primary: '#0ea5e9',
                  secondary: '#fff',
                },
              },
            }}
          />
    </div>
      
  )
}

export default App