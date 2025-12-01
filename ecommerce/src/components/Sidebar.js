import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const sidebarStyle = {
    width: "200px",
    background: "#f5f5f5",
    height: "100vh",
    padding: "20px",
    boxSizing: "border-box",
  };

  const itemStyle = {
    marginTop: "15px",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "5px",
    transition: "background 0.2s",
  };

  const hoverStyle = {
    background: "#e0e0e0",
  };

  return (
    <div style={sidebarStyle}>
      <h3>Dashboard</h3>

      <div
        style={itemStyle}
        onClick={() => navigate("/category")}
        onMouseOver={(e) => (e.currentTarget.style.background = hoverStyle.background)}
        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
      >
        🛒 Categories
      </div>

      <div
        style={itemStyle}
        onClick={() => navigate("/product")}
        onMouseOver={(e) => (e.currentTarget.style.background = hoverStyle.background)}
        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
      >
        🛒 Products
      </div>
    </div>
  );
}
