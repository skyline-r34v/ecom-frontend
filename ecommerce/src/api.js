// utils/api.js
import axios from "axios";

// Historical backend URLs for reference:
// - Render: "https://ecom-backend-i74i.onrender.com/api"
// - DevTunnel: "https://92hktjzx-7045.inc1.devtunnels.ms/api"
// - Localhost: "http://localhost:7045/api"
const rawBaseURL = process.env.REACT_APP_API_URL || "https://ecom-backend-i74i.onrender.com";
const baseURL = rawBaseURL.replace(/\/+$/, "").endsWith("/api")
  ? rawBaseURL.replace(/\/+$/, "")
  : `${rawBaseURL.replace(/\/+$/, "")}/api`;

const api = axios.create({
  baseURL,
  timeout: 30000,
});

// Attach token automatically on every request (supports Authorization, token, x-access-token)
api.interceptors.request.use(
  (config) => {
    // If config.url starts with "/api/", strip the redundant prefix to avoid "/api/api/..."
    if (config.url && config.url.startsWith("/api/")) {
      config.url = config.url.replace(/^\/api\//, "/");
    }
    let token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      token = token.replace(/^Bearer\s+/i, "").replace(/^"|"$/g, "").trim();
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.token = token;
      config.headers["x-access-token"] = token;
      config.headers["auth-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global handler — clear stale/invalid token and notify on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errMsg = (error.response?.data?.message || error.response?.data?.error || "").toString().toLowerCase();
    const isTokenIssue =
      status === 401 ||
      errMsg.includes("invalid token") ||
      errMsg.includes("jwt expired") ||
      errMsg.includes("token expired") ||
      errMsg.includes("jwt malformed") ||
      errMsg.includes("no token provided");

    if (isTokenIssue) {
      console.warn("Invalid or expired session token:", errMsg);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("name");
      localStorage.removeItem("email");
    }
    return Promise.reject(error);
  }
);

export default api;
