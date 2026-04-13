import axios from "axios";

const API_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5173/api/auth" 
  : "https://appsail-10122923152.development.catalystappsail.com/api/auth";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Send cookies with requests
    headers: {
        "Content-Type": "application/json",
    },
});

let csrfToken = null;

// 1. Fetch CSRF token on initialization
const fetchCsrfToken = async () => {
    try {
        const response = await axiosInstance.get("/csrf-token");
        csrfToken = response.data.csrfToken;
        console.log("CSRF Token initialized");
    } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
    }
};

fetchCsrfToken();

// 2. Request Interceptor: Attach CSRF token
axiosInstance.interceptors.request.use(
    (config) => {
        if (["post", "put", "delete", "patch"].includes(config.method?.toLowerCase()) && csrfToken) {
            config.headers["x-csrf-token"] = csrfToken;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Response Interceptor: Retry on 403 (Invalid CSRF)
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 403 &&
            error.response?.data?.message === "Invalid CSRF token" &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            console.log("CSRF token invalid, refreshing...");
            try {
                await fetchCsrfToken(); // Re-fetch
                if (csrfToken) {
                    originalRequest.headers["x-csrf-token"] = csrfToken;
                    return axiosInstance(originalRequest); // Retry
                }
            } catch (refreshError) {
                console.error("CSRF refresh failed:", refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
