import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import CreateCategory from "../pages/Categories/CreateCategory";
import { Button } from "antd";
import "../styles/home.css";

export default function Home() {
  const [openModal, setOpenModal] = useState(false);
  const [categories, setCategories] = useState([]);

  // Load categories from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("categories")) || [];
    setCategories(saved);
  }, []);

  // Add new category
  const handleCreateCategory = (category) => {
    const updated = [...categories, category];
    setCategories(updated);
    localStorage.setItem("categories", JSON.stringify(updated));
    setOpenModal(false);
  };

  return (
    <div className="home-container">
      {/* Sidebar */}
      <div className="home-sidebar">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="home-content">
        <div className="home-header">
          <h1>Home</h1>
          <h3 className="explore-heading">Explore All Categories</h3>
        </div>

        {/* Category Grid */}
        {categories.length === 0 ? (
          <p className="no-category">No categories available. Add one.</p>
        ) : (
          <ul className="category-grid">
            {categories.map((cat, index) => (
              <li key={index} className="category-card">
                <img
                  src={cat.image || "https://via.placeholder.com/200"}
                  alt={cat.name}
                  className="category-image"
                />
                <p className="category-name">{cat.name}</p>
              </li>
            ))}
          </ul>
        )}

        {/* Create category button */}
        <Button
          type="primary"
          onClick={() => setOpenModal(true)}
          className="create-btn"
        >
          + Create Category
        </Button>
      </div>

      {/* Create Category Modal */}
      <CreateCategory
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreateCategory={handleCreateCategory}
      />
    </div>
  );
}
