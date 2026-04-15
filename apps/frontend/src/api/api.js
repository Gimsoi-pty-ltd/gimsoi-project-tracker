import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? 'https://project-tracker-api-10122923152.development.catalystappsail.com' : 'http://localhost:5001');

const axiosInstance = axios.create({
    baseURL: API_URL,
});

const METHOD_OVERRIDE_METHODS = ["put", "patch", "delete"];

axiosInstance.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();

  if (
    method !== "get" &&
    config.data &&
    typeof config.data === "object" &&
    !(config.data instanceof URLSearchParams)
  ) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(config.data)) {
      if (value !== undefined && value !== null) {
        params.append(key, typeof value === "object"
          ? JSON.stringify(value)
          : String(value));
      }
    }
    config.data = params;
  }

  if (METHOD_OVERRIDE_METHODS.includes(method)) {
    if (config.data instanceof URLSearchParams) {
      config.data.append("_method", method.toUpperCase());
    }
    config.method = "post";
  }

  return config;
});

axiosInstance.defaults.withCredentials = true;

export default axiosInstance;
