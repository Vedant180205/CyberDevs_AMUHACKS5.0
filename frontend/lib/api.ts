import axios from 'axios';

// Create an Axios instance with the base URL
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach the Authorization token
api.interceptors.request.use(
    (config) => {
        // Check if we are in the browser to access localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle unauthorized access (401)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Redirect to login page if authorized
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token'); // Clear invalid token
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
