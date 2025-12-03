import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import CreateCategory from "./CreateCategory";
import { Button } from "antd";
import "../styles/ home.css";

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
        <Sidebar onCategoryClick={() => setOpenModal(true)} />
      </div>

      {/* Right Content */}
      <div className="home-content">
        <h2>All Categories</h2>

        {categories.length === 0 ? (
          <p className="no-category">
            No categories yet. Click "Categories" from sidebar to add.
          </p>
        ) : (
          <ul className="category-list">
            {categories.map((cat, index) => (
              <li key={index}>{cat.name}</li>
            ))}
          </ul>
        )}

        {/* Create Category Button */}
        <Button
          type="primary"
          onClick={() => setOpenModal(true)}
          style={{ marginTop: 20 }}
        >
          + Create Category
        </Button>
      </div>

      {/* Category Modal */}
      <CreateCategory
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreateCategory={handleCreateCategory}
      />
    </div>
  );
}
