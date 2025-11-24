import React, { useState, useEffect } from "react";
import "./style/Category.css";
import CreateCategoryDrawer from "./CreateCategory";
import api from "./api.js";

export default function CategoryPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await api.post("/categories/list", {
        page: 1,
        size: 200,
      });

      setCategories(res.data?.data?.categories || []);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="category-page">
      {/* Top Bar */}
      <div className="top-bar">
        <h1 className="heading">Categories</h1>
        <button className="create-btn" onClick={() => setDrawerOpen(true)}>
          + Create Category
        </button>
      </div>

      <div className="content-wrapper">
        {/* LEFT SIDE LIST */}
        <div className="left-panel">
          <h3>All Categories</h3>

          {categories.length === 0 ? (
            <p>No categories yet...</p>
          ) : (
            categories.map((cat) => (
              <div className="category-item" key={cat._id}>
                {cat.name}
              </div>
            ))
          )}
        </div>

        {/* RIGHT SIDE SECTION */}
        <div className="right-panel">
          <h2>Select a category</h2>
          <p>Category details will show here after selection.</p>

          {/* TABLE BELOW */}
          <h3 style={{ marginTop: "20px" }}>Category Table</h3>

          <table className="category-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Active</th>
                <th>Featured</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>{cat.name}</td>
                  <td>{cat.slug}</td>
                  <td>{cat.isActive ? "Yes" : "No"}</td>
                  <td>{cat.isFeatured ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>

      {/* Create Drawer */}
      <CreateCategoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        refreshList={fetchCategories}
      />
    </div>
  );
}
