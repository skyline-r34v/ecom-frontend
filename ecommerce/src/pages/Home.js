import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="home-navbar">
        <h2 className="logo">ShopEase</h2>
        <div className="nav-buttons">
          <button onClick={() => navigate("/login")}>Login</button>
          <button className="register" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1>Welcome to ShopEase</h1>
        <p>Your one-stop destination for quality products</p>
        <button onClick={() => navigate("/products")}>
          Explore Products
        </button>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-card">
          <h3>🛒 Wide Products</h3>
          <p>Choose from multiple categories</p>
        </div>

        <div className="feature-card">
          <h3>⚡ Fast Delivery</h3>
          <p>Quick and reliable shipping</p>
        </div>

        <div className="feature-card">
          <h3>🔒 Secure</h3>
          <p>Safe and secure payments</p>
        </div>
      </section>
    </div>
  );
}
