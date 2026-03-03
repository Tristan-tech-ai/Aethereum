import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding the bearer token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't override Content-Type for FormData (file uploads)
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor for handling errors (e.g., 401)
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        // Only redirect if not already on auth pages
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});

export default api;
