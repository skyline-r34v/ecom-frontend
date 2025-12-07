import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "../../styles/categories.css";
import api from "../../api";
import { useNavigate } from "react-router-dom";

export const fetchAllCategories = async (searchTerm = "", page = 1, size = 10) => {
  try {
    const data = { page, size, search: searchTerm };
    const response = await api.post("/categories/list", data);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const openCategoryProducts = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchAllCategories(searchTerm, 1, 10);
        setCategories(data.data?.categories || []);
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to load categories";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [searchTerm]);


  if (loading) return <p className="loading-state-container">Loading categories...</p>;
  if (error) return <p className="error-state-container">{error}</p>;

  return (
    <div>
      <Navbar />

      <div className="category-page-row-container">
        <aside className="category-sidebar">
          <Sidebar />
        </aside>

        <main className="category-row-content">
          <h1>Explore All Categories</h1>

          <input
            type="text"
            className="category-search"
            placeholder="Search category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="category-grid">
            {categories.length > 0 ? (
              categories.map((cat, index) => (
                <div
                  className="category-card"
                  key={index}
                  onClick={() => openCategoryProducts(cat._id)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={cat.image} alt={cat.name} className="category-card-image" />
                  <h3>{cat.name}</h3>
                </div>
              ))
            ) : (
              <p>No categories found</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
