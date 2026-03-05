import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
if (!baseURL.endsWith("/api") && !baseURL.endsWith("/api/")) {
    baseURL = baseURL.endsWith("/") ? `${baseURL}api` : `${baseURL}/api`;
}

const api = axios.create({
    baseURL,
    withCredentials: true,
});

// Attach the admin JWT token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Global error handling for API responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 errors (expired or invalid token)
        if (error.response?.status === 401) {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("studentData");
            // Only redirect if not already on a login page to avoid loops
            if (!window.location.pathname.includes('login') && window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
