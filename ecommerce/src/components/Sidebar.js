import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    price: "",
    rating: "",
    brand: "",
    availability: "",
  });

  useEffect(() => {
    api.post("/categories/list", { page: 1, size: 50 })
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => setCategories([]));
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    const query = Object.entries(filters)
      .filter(([_, value]) => value !== "")
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    navigate(`/products?${query}`);
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      price: "",
      rating: "",
      brand: "",
      availability: "",
    });
    navigate("/products");
  };

  /* ================= ADMIN ================= */
  const AdminSidebar = () => (
    <>
      <h3>Dashboard</h3>

      <div className="sidebar-item" onClick={() => navigate("/category")}>
        📁 <span>Categories</span>
      </div>

      <div className="sidebar-item" onClick={() => navigate("/products")}>
        🛍️ <span>Products</span>
      </div>

      <div className="sidebar-item" onClick={() => navigate("/admin/orders")}>
        📦 <span>Orders</span>
      </div>

      <div className="sidebar-item" onClick={() => navigate("/users")}>
        👤 <span>Users</span>
      </div>

      <div className="sidebar-item" onClick={() => navigate("/brands")}>
        🏷️ <span>Brands</span>
      </div>
    </>
  );

  /* ================= CUSTOMER ================= */
  const CustomerSidebar = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Filter Products</h3>
        <button
          onClick={resetFilters}
          style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>

      <div className="filter-group">
        <label>Category</label>
        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Price Range</label>
        <select name="price" value={filters.price} onChange={handleFilterChange}>
          <option value="">All Prices</option>
          <option value="0-1000">Under ₹1,000</option>
          <option value="1000-5000">₹1,000 - ₹5,000</option>
          <option value="5000-15000">₹5,000 - ₹15,000</option>
          <option value="15000-50000">Above ₹15,000</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Rating</label>
        <select name="rating" value={filters.rating} onChange={handleFilterChange}>
          <option value="">Any Rating</option>
          <option value="4">4.0 ★ & above</option>
          <option value="3">3.0 ★ & above</option>
          <option value="2">2.0 ★ & above</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Brand</label>
        <select name="brand" value={filters.brand} onChange={handleFilterChange}>
          <option value="">All Brands</option>
          <option value="Apple">Apple</option>
          <option value="Nike">Nike</option>
          <option value="Sony">Sony</option>
          <option value="Samsung">Samsung</option>
          <option value="Adidas">Adidas</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Availability</label>
        <select
          name="availability"
          value={filters.availability}
          onChange={handleFilterChange}
        >
          <option value="">All Items</option>
          <option value="in-stock">In Stock Only</option>
        </select>
      </div>

      <button className="apply-btn" onClick={applyFilters}>
        Apply Filters
      </button>
    </>
  );

  return (
    <aside className="sidebar sidebar-alt">
      {role === "admin" ? <AdminSidebar /> : <CustomerSidebar />}
    </aside>
  );
}
