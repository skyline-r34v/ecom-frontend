import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/categories.css";
import api from "../api"; // 2. IMPORT API CONFIGURATION

export const fetchAllCategories = async (searchTerm = "", page = 1, size = 10) => {
  try {
    const data = {
      page,
      size: size,
      search: searchTerm
    };
    const response = await api.post("/categories/list", data);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// 4. REACT COMPONENT
export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Refetch categories whenever searchTerm changes
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);

        // Always load 10 categories with search filtering
        const data = await fetchAllCategories(searchTerm, 1, 10);

        // Extract categories correctly
        setCategories(data.data?.categories || []);

      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          "Failed to load categories. Please check the network.";
        setError(errorMessage);
        console.error("API Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [searchTerm]);


  // --- Rendering Logic: Loading, Error, and Success States ---
  if (loading) {
    return (
      <div className="loading-state-container">
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state-container">
        <h1>Error</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  // --- Main Render (Success State) ---
  return (
    <div>
      <Navbar />

      <div className="category-page-row-container">
        <aside className="category-sidebar">
          <Sidebar />
        </aside>

        <main className="category-row-content">
          <div className="category-header">
            <h1>Explore All Categories</h1>
            <p>{categories.length} Categories Available</p>
          </div>

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
                <div className="category-card" key={index}>
                  <img src={cat.image} alt={cat.name} className="category-card-image" />
                  <h3>{cat.name}</h3>
                </div>
              ))
            ) : (
              <p>No categories found matching "{searchTerm}".</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}