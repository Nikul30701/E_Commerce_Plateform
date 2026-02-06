import { create } from 'zustand';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useCartStore = create((set, get) => ({
    cart: null,
    loading: false,

    // fetch cart
    fetchCart: async () => {
        set({loading: true})
        try {
            const { data } = await cartAPI.get();
            set({cart: data})
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            set({loading: false})
        }
    },
    // Add Item
    addToCart: async (productId, quantity=1) =>{
        try{
            const { data } = await cartAPI.addToCart(productId, quantity);
            set({cart: data.cart});
            toast.success(data.message || 'Add to cart');
            return {success: true};
        }catch(error){
            const message = error.response?.data?.error || 'Failed to add item to cart';
            toast.error(message);
            return {success: false, error: message};
        }
    },
    // Update Cart
    updateCart: async (itemId, quantity) => {
        try {
            const { data } = await cartAPI.updateCart(itemId, quantity);
            set({ cart: data.cart });
            toast.success(data.message || 'Cart updated');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to update cart';
            toast.error(message);
            return { success: false, error: message };
        }
    },
    // Delete Cart
    deleteCart: async (itemId) => {
        try {
            const { data } = await cartAPI.deleteCart(itemId);
            set({ cart: data.cart });
            toast.success(data.message || 'Item removed from cart');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to remove item from cart';
            toast.error(message);
            return { success: false, error: message };
        }
    },
    // Clear Cart
    clearCart: async () => {
        try {
            await cartAPI.clearCart();
            set({ cart: {items: [], total_items: 0, total_price: 0} });
            toast.success('Cart cleared');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to clear cart';
            toast.error(message);
            return { success: false, error: message };
        }
    },

    // Reset local state
    resetCart: () => {
        set({cart: null, loading: false})
    },
    
    // Derived state
    totalItems: () => get().cart?.total_items ?? 0,
    totalPrice: () => get().cart?.total_price ?? 0,
    subtotal: () => get().cart?.subtotal ?? 0,
    cartItems: () => get().cart?.items ?? [],
    isEmpty: () => get().totalItems === 0,
}))