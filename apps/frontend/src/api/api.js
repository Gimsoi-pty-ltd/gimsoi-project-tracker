import axios from "axios";
import qs from "qs";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? 'https://project-tracker-api-10122923152.development.catalystappsail.com' : 'http://localhost:5001');

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

/**
 * Request Interceptor
 * 
 * 1. Serializes body using 'qs' for robust nested object support.
 * 2. Injects '_csrf' from readable XSRF-TOKEN cookie into the request body.
 * 3. Transparently handles Method-Override for non-GET/POST requests to bypass ZGS preflight.
 */
axiosInstance.interceptors.request.use((config) => {
    const rawMethod = config.method?.toLowerCase();
    
    // We only attach _csrf and apply method-override for mutating requests
    if (rawMethod !== "get") {
        // Extract the CSRF secret from the readable cookie set by the server
        const csrfToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];

        // Prepare the payload (standardize on object format first)
        const data = config.data || {};

        // 1. Inject CSRF
        if (csrfToken) {
            data._csrf = csrfToken;
        }

        // 2. Apply Method Override for PUT, PATCH, DELETE
        if (["put", "patch", "delete"].includes(rawMethod)) {
            data._method = rawMethod.toUpperCase();
            config.method = "post";
        }

        // 3. Serialize using qs (required for nested objects and parameterLimit compatibility)
        config.data = qs.stringify(data);
        config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    return config;
});

/**
 * Response Interceptor
 * 
 * Intercepts 401 Unauthorized errors to force a reload (clears stale state) 
 * or redirect to login. Prevents infinite loops via a simple sessionStorage flag.
 */
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isLoggingOut = sessionStorage.getItem("auth_redirect_loop");
            if (!isLoggingOut) {
                sessionStorage.setItem("auth_redirect_loop", "true");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
