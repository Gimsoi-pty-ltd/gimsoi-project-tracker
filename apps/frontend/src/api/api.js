import axios from "axios";

const BASE_API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : "https://backend-appsail-10123938533.development.catalystappsail.com";

const AUTH_API_URL = `${BASE_API_URL}/api/auth`;
const RESOURCE_API_URL = `${BASE_API_URL}/api`;

// Auth API instance for authentication endpoints
const authAPI = axios.create({
    baseURL: AUTH_API_URL,
    withCredentials: true, // Send cookies with requests
    headers: {
        "Content-Type": "application/json",
    },
});

// Resource API instance for projects, tasks, sprints, clients, etc.
const resourceAPI = axios.create({
    baseURL: RESOURCE_API_URL,
    withCredentials: true, // Send cookies with requests
    headers: {
        "Content-Type": "application/json",
    },
});

const axiosInstance = authAPI; // Default export for backward compatibility

let csrfToken = null;
let csrfTokenPromise = null;

// 1. Fetch CSRF token on initialization
const fetchCsrfToken = () => {
    csrfTokenPromise = authAPI.get("/csrf-token")
        .then((response) => {
            csrfToken = response.data.csrfToken;
            console.log("CSRF Token initialized");
            return csrfToken;
        })
        .catch((error) => {
            console.error("Failed to fetch CSRF token:", error);
            csrfToken = null;
            return null;
        });
    return csrfTokenPromise;
};

fetchCsrfToken();

// 2. Request Interceptor: Attach CSRF token to both APIs
const requestInterceptor = async (config) => {
    if (["post", "put", "delete", "patch"].includes(config.method?.toLowerCase())) {
        if (!csrfToken && csrfTokenPromise) {
            await csrfTokenPromise;
        }
        if (csrfToken) {
            config.headers["x-csrf-token"] = csrfToken;
        }
    }
    return config;
};

authAPI.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
resourceAPI.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));

// 3. Response Interceptor: Retry on 403 (Invalid CSRF)
const responseErrorInterceptor = async (error) => {
    const originalRequest = error.config;

    if (
        error.response?.status === 403 &&
        error.response?.data?.message?.toLowerCase().includes("csrf token") &&
        !originalRequest._retry
    ) {
        originalRequest._retry = true;
        console.log("CSRF token invalid, refreshing...");
        try {
            await fetchCsrfToken(); // Re-fetch
            if (csrfToken) {
                originalRequest.headers["x-csrf-token"] = csrfToken;
                // Retry with appropriate instance
                const instance = originalRequest.baseURL?.includes("/auth") ? authAPI : resourceAPI;
                return instance(originalRequest);
            }
        } catch (refreshError) {
            console.error("CSRF refresh failed:", refreshError);
        }
    }
    return Promise.reject(error);
};

authAPI.interceptors.response.use((response) => response, responseErrorInterceptor);
resourceAPI.interceptors.response.use((response) => response, responseErrorInterceptor);

export { authAPI, resourceAPI };
export default axiosInstance;
