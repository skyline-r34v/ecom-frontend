// utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://unconcurrent-tomi-mopishly.ngrok-free.dev/api",
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
