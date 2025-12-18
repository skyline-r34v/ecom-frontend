import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/sidebar.css"; // import the CSS file
export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h3>Dashboard</h3>

      <div
        className="sidebar-item categories"
        onClick={() => navigate("/category")}
      >
        📁 <span>Categories</span>
      </div>

      <div
        className="sidebar-item products"
        onClick={() => navigate("/products")}
      >
        🛍️ <span>Products</span>
      </div>

      <div
        className="sidebar-item orders"
        onClick={() => navigate("/orders")}
      >
        📦 <span>Orders</span>
      </div>

      <div
        className="sidebar-item users"
        onClick={() => navigate("/users")}
      >
        👤 <span>Users</span>
      </div>
    </div>
  );
}
