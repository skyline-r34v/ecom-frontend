import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // Customer filter state
  const [filters, setFilters] = useState({
    category: "",
    price: "",
    rating: "",
    brand: "",
    availability: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    const query = Object.entries(filters)
      .filter(([key, value]) => value !== "")
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    navigate(`/products?${query}`);
  };

  // Admin Sidebar
  const AdminSidebar = () => (
    <>
      <h3>Dashboard</h3>
      <div className="sidebar-item" onClick={() => navigate("/category")}>📁 <span>Categories</span></div>
      <div className="sidebar-item" onClick={() => navigate("/products")}>🛍️ <span>Products</span></div>
      <div className="sidebar-item" onClick={() => navigate("/orders")}>📦 <span>Orders</span></div>
      <div className="sidebar-item" onClick={() => navigate("/users")}>👤 <span>Users</span></div>
    </>
  );

  // Customer Sidebar
  const CustomerSidebar = () => (
    <>
      <h3>Filter Products</h3>

      <div className="filter-group">
        <label>Category</label>
        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
          <option value="home">Home</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Price</label>
        <select name="price" value={filters.price} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="0-500">0 - 500</option>
          <option value="500-1000">500 - 1000</option>
          <option value="1000-5000">1000 - 5000</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Rating</label>
        <select name="rating" value={filters.rating} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="1">1 ⭐ & up</option>
          <option value="2">2 ⭐ & up</option>
          <option value="3">3 ⭐ & up</option>
          <option value="4">4 ⭐ & up</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Brand</label>
        <select name="brand" value={filters.brand} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="nike">Nike</option>
          <option value="adidas">Adidas</option>
          <option value="apple">Apple</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Availability</label>
        <select name="availability" value={filters.availability} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="in-stock">In Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      <button className="apply-btn" onClick={applyFilters}>Apply Filters</button>
    </>
  );

  return (
    <div className="sidebar">
      {role === "admin" ? <AdminSidebar /> : <CustomerSidebar />}
    </div>
  );
}
