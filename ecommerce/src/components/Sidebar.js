import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const sidebarStyle = {
    width: "230px",
    height: "100vh",
    background: "#ffffff",
    padding: "25px 20px",
    boxSizing: "border-box",
    boxShadow: "2px 0px 10px rgba(0,0,0,0.1)",
    borderRight: "1px solid #e5e5e5",
  };

  const titleStyle = {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "25px",
    color: "black",
  };

  const itemBaseStyle = {
    padding: "12px 15px",
    marginBottom: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  // Colors for each menu item
  const colors = {
    categories: "#ff5733",   // orange red
    products: "#2e86de",     // blue
    orders: "#28a745",       // green
    users: "#8e44ad",        // purple
  };

  const handleHover = (e) => {
    e.currentTarget.style.background = "#f0f0f0";
    e.currentTarget.style.transform = "translateX(4px)";
  };

  const handleLeave = (e) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.transform = "translateX(0px)";
  };

  return (
    <div style={sidebarStyle}>
      <h3 style={titleStyle}>Dashboard</h3>

      <div
        style={{ ...itemBaseStyle, color: colors.categories }}
        onClick={() => navigate("/category")}
        onMouseOver={handleHover}
        onMouseOut={handleLeave}
      >
        📁 <span style={{ color: colors.categories }}>Categories</span>
      </div>

      <div
        style={{ ...itemBaseStyle, color: colors.products }}
        onClick={() => navigate("/products")}
        onMouseOver={handleHover}
        onMouseOut={handleLeave}
      >
        🛍️ <span style={{ color: colors.products }}>Products</span>
      </div>

      <div
        style={{ ...itemBaseStyle, color: colors.orders }}
        onClick={() => navigate("/orders")}
        onMouseOver={handleHover}
        onMouseOut={handleLeave}
      >
        📦 <span style={{ color: colors.orders }}>Orders</span>
      </div>

      <div
        style={{ ...itemBaseStyle, color: colors.users }}
        onClick={() => navigate("/users")}
        onMouseOver={handleHover}
        onMouseOut={handleLeave}
      >
        👤 <span style={{ color: colors.users }}>Users</span>
      </div>
    </div>
  );
}
