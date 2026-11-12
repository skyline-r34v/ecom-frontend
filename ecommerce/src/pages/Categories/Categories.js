import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "../../styles/categories.css";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch, FaTimes, FaLayerGroup } from "react-icons/fa";

export const fetchAllCategories = async (searchTerm = "", page = 1, size = 10) => {
  const data = { page, size, search: searchTerm };
  const response = await api.post("/categories/list", data);
  return response.data;
};

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchAllCategories(searchTerm, 1, 50);
      setCategories(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError("Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [searchTerm]);

  const openCategoryProducts = (id) => {
    navigate(`/products?category=${id}`);
  };

  const goToCreateCategory = () => {
    navigate("/create-category");
  };

  const editCategory = (e, id) => {
    e.stopPropagation();
    navigate(`/edit-category/${id}`);
  };

  const deleteCategory = async (e, id) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;

    try {
      const data = { id };
      await api.post(`/categories/delete/`, data);
      loadCategories();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="category-page-row-container">
        <aside className="category-sidebar">
          <Sidebar />
        </aside>

        <main className="category-row-content">
          <div className="category-header-section">
            <div className="category-header-top">
              <div>
                <div className="section-eyebrow">
                  <FaLayerGroup size={11} />
                  <span>STORE DIRECTORY</span>
                </div>
                <h1 className="category-page-title">
                  Explore All <span className="highlight-text">Categories</span>
                  <span className="category-count-badge">{categories.length} Departments</span>
                </h1>
                <p className="category-page-subtitle">
                  Browse authentic products across our verified department catalog or organize new listings.
                </p>
              </div>

              <button className="create-category-btn" onClick={goToCreateCategory}>
                <FaPlus size={12} />
                <span>Create Category</span>
              </button>
            </div>

            <div className="category-search-bar-wrap">
              <div className="category-search-input-box">
                <FaSearch className="category-search-icon" />
                <input
                  type="text"
                  className="category-search-input"
                  placeholder="Search departments (e.g. Electronics, Fashion, Gourmet)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="category-search-clear"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <FaTimes size={13} />
                  </button>
                )}
              </div>
              {searchTerm && (
                <span className="category-search-indicator">
                  Showing {categories.length} {categories.length === 1 ? "match" : "matches"}
                </span>
              )}
            </div>
          </div>

          <div className="category-grid">
            {loading ? (
              <div className="grid-loader-container">
                <div className="grid-loader"></div>
              </div>
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <div
                  className="category-card"
                  key={cat._id}
                  onClick={() => openCategoryProducts(cat._id)}
                >
                  <img src={cat.image} alt={cat.name} className="category-card-image" />
                  <h3>{cat.name}</h3>

                  <div className="category-actions">
                    <button className="edit-btn" onClick={(e) => editCategory(e, cat._id)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={(e) => deleteCategory(e, cat._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No categories found</p>
            )}
          </div>

          {error && <p className="error-state-container">{error}</p>}
        </main>
      </div>
    </div>
  );
}
