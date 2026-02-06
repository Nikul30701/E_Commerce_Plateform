import { create } from 'zustand';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
    user: null,
    loading: true,
    error: null,

    // 1. App start hote hi user check karna
    initAuth: async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            await get().fetchUser();
        } else {
            set({ loading: false });
        }
    },

    // 2. User fetch karna
    fetchUser: async () => {
        set({ loading: true });
        try {
            const { data } = await authAPI.getProfile();
            set({ user: data });
        } catch (error) {
            console.error("Session invalid:", error);
            get().logout(false); // False matlab API call mat karo, bas cleanup karo
        } finally {
            set({ loading: false });
        }
    },

    // 3. Login
    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const { data } = await authAPI.login(credentials);
            
            // Storage update
            localStorage.setItem('access_token', data.tokens.access);
            localStorage.setItem('refresh_token', data.tokens.refresh);
            
            // State update
            set({ user: data.user, loading: false });
            toast.success('Welcome back!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Login failed';
            set({ loading: false, error: message });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    // 4. Register (Cleanup included)
    register: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const { data } = await authAPI.register(credentials);
            
            localStorage.setItem('access_token', data.tokens.access);
            localStorage.setItem('refresh_token', data.tokens.refresh);
            
            set({ user: data.user, loading: false });
            toast.success('Account created! 🎉');
            return { success: true };
        } catch (error) {
            const errors = error.response?.data?.error || {};
            // Wahi logic jo aapne likha tha, abhi bhi valid hai
            const message = Object.values(errors).flat()[0] || 'Registration Failed';
            
            set({ loading: false, error: message });
            toast.error(message);
            return { success: false, error: message };
        }
    },

    // 5. Unified Logout (Sab kuch ek jagah)
    logout: async (callApi = true) => {
        set({ loading: true });
        
        if (callApi) {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    await authAPI.logout(refreshToken);
                } catch (err) {
                    console.warn("Logout API failed (token might be expired already)");
                    console.log(err);
                    
                }
            }
        }

        // Cleanup: Tokens hatao, State null karo
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        set({ user: null, error: null, loading: false });
        
        if (callApi) toast.success('Logged out successfully');
        
        // Note: Redirect component level pe handle karein (e.g., using useEffect on user state)
        // ya phir router object pass karein.
    },

    // 6. Update Profile (Variable naming fix)
    updateProfile: async (updateData) => {
        try {
            const { data } = await authAPI.updateProfile(updateData);
            set({ user: data }); // State update taaki UI refresh ho jaye
            toast.success('Profile updated');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Update failed';
            toast.error(message);
            return { success: false, error: message };
        }
    }
}));