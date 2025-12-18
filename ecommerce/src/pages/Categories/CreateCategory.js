import React, { useEffect, useState } from "react";
import api from "../../api";
import "../../styles/craetecategory.css";
import { useNavigate } from "react-router-dom";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isFeatured: false,
    sortOrder: 0,
    isActive: true,
  });

  // ✅ FETCH ALL CATEGORIES
  const fetchAllCategories = async () => {
    try {
      const res = await api.post("/categories/list", {
        page: 1,
        size: 50,
      });
      setCategories(res.data.data || []);
    } catch (err) {
      alert("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  // ✅ CREATE CATEGORY
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/categories/create", form);
      alert("Category Created Successfully");
      fetchAllCategories();

      setForm({
        name: "",
        slug: "",
        description: "",
        image: "",
        isFeatured: false,
        sortOrder: 0,
        isActive: true,
      });
    } catch (err) {
      alert(err.response?.data?.message || "Create failed");
    }
  };

  // ✅ DELETE CATEGORY
  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/delete/${id}`);
      fetchAllCategories();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="category-container">
      <h2 className="cat-title">Manage Categories</h2>

      {/* CREATE FORM */}
      <form className="category-form" onSubmit={handleSubmit}>
        <h3>Create Category</h3>

        <input
          placeholder="Category Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        {form.image && <img src={form.image} className="preview-img" alt="preview" />}

        <label className="switch-label">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />
          Featured
        </label>

        <input
          type="number"
          placeholder="Sort Order"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
        />

        <label className="switch-label">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>

        <button className="btn-submit">Create Category</button>
      </form>

      {/* CATEGORY LIST */}
      <h3 className="section-title">All Categories</h3>

      <div className="category-list">
        {categories.map((cat) => (
          <div className="cat-card" key={cat._id}>
            <img
              src={cat.image || "https://cdn-icons-png.flaticon.com/512/7187/7187843.png"}
              className="cat-img"
              alt="icon"
            />

            <div className="cat-info">
              <h4>{cat.name}</h4>
              <p className="slug">/{cat.slug}</p>
              <p>{cat.description || "No description"}</p>

              {cat.isFeatured && <span className="featured-tag">Featured</span>}
              {!cat.isActive && <span className="inactive-tag">Inactive</span>}

              <div className="cat-actions">
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/edit-category/${cat._id}`)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteCategory(cat._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
