import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "../../styles/categories.css";
import api from "../../api";
import { useNavigate } from "react-router-dom";

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
  const role =  localStorage.getItem("role")
  console.log("role",role)
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchAllCategories(searchTerm, 1, 10);
      setCategories(data.data || []);
    } catch (err) {
      setError("Failed to load categories");
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
          <div className="category-header-row">
            <h1>Explore All Categories</h1>
            <button className="create-category-btn" onClick={goToCreateCategory}>
              + Create Category
            </button>
          </div>

          <input
            type="text"
            className="category-search"
            placeholder="Search category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

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
