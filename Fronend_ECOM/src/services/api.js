import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL  = import.meta.env.VITE_API_BASE_URL;

// create axios instance
const api = axios.create({
    baseURL:API_BASE_URL,
    headers:{
        'Content-Type': 'application/json'
    }
})

// request interceptor
// Add token to every request if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // automatically to multipart/form-data with the correct boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => Promise.reject(error)
)

// response interceptors
// handle token refresh and error globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if(error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${API_BASE_URL.replace('/api', '')}/auth/token/refresh`, {
                        refresh: refreshToken
                    });
                    localStorage.setItem('access_token', data.access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
                    originalRequest.headers.Authorization = `Bearer ${data.access}`;
                    return api(originalRequest);
                } catch (err) {
                    // refresh faild -> logout
                    localStorage.clear();
                    toast.error('Session expired.Please login again')
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000)
                    return Promise.reject(err)
                }
            }
        }
        return Promise.reject(error);
    }
)

export default api;

// Auth API
export const authAPI = {
    register: (data) => api.post('/register/', data),
    login: (data) => api.post('/login/', data),
    logout: (refreshToken) => api.post('/logout/', { refresh: refreshToken }),
    getProfile: () => api.get('/profile/'),
    updateProfile: (data) => api.patch('/profile/update', data),
    changePassword: (data) => api.post('/change-password/', data),
}

// Product API
export const productAPI = {
    getAllProducts: (params) => api.get('/products/', { params }),
    getById: (id) => api.get(`/products/${id}/`),
    getByCategory: (categoryId) => api.get(`/products/?category=${categoryId}`),
    createProduct: (data) => api.post('/products/create', data),
    updateProduct: (id, data) => api.put(`/products/${id}/`, data),
    deleteProduct: (id) => api.delete(`/products/${id}/`),
    partialUpdateProduct: (id, data) => api.patch(`/products/${id}/`, data),
}

// Category API
export const categoryAPI = {
    getAllCategories: () => api.get('/categories/'),
    getById: (id) => api.get(`/categories/${id}/`),
    createCategory: (data) => api.post('/categories/create', data),
    updateCategory: (id, data) => api.put(`/categories/${id}/`, data),
    deleteCategory: (id) => api.delete(`/categories/${id}/`),
    partialUpdateCategory: (id, data) => api.patch(`/categories/${id}/`, data),
}

// Cart API
// Cart API
export const cartAPI = {
    getCart: () => api.get('/cart/'),
    addToCart: (data) => api.post('/cart/add/', data),  // ← Add trailing slash
    updateCart: (id, data) => api.patch(`/cart/update/${id}/`, data),
    deleteCart: (id) => api.delete(`/cart/${id}/`),
    clearCart: () => api.delete('/cart/clear/'),  // ← Add trailing slash
}
// Order API
export const orderAPI = {
    getAllOrders: () => api.get('/orders/'),
    getById: (id) => api.get(`/orders/${id}/`),
    checkout: (data) => api.post('/checkout/', data),
    cancelOrder: (id) => api.post(`/orders/${id}/cancel/`),
    updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),  
}

// Address API
export const addressAPI = {
    getAllAddresses: () => api.get('/addresses/'),
    getById: (id) => api.get(`/addresses/${id}/`),
    createAddress: (data) => api.post('/addresses/', data),
    updateAddress: (id, data) => api.put(`/addresses/${id}/`, data),
    deleteAddress: (id) => api.delete(`/addresses/${id}/`),
    setDefaultAddress: (id) => api.post(`/addresses/${id}/set-default/`),
}
