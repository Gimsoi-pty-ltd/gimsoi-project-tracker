import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Send cookies with requests
});

export default axiosInstance;
