// utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://ecom-backend-i74i.onrender.com/api/",
  timeout: 30000, // 30s for Render cold starts
});

// Attach token automatically on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 handler — auto redirect to login when token expires
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token expired or invalid — redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
