import React, { useEffect, useState } from "react";
import api from "../../api";
import "/Users/govind/eventfronted/event/ecomm fi/ecom-frontend/ecommerce/src/styles/craetecategory.css";
import { useNavigate } from "react-router-dom";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isFeatured: false,
    sortOrder: 0,
    isActive: true,
  });
  const navigate = useNavigate();


   


  // Fetch all categories
const fetchAllCategories = async (searchTerm = "", page = 1, size = 10) => {
    try {
      const data = { page, size, search: searchTerm };
      const response = await api.post("/categories/list", data);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/categories/create", form);

      alert("Category Created Successfully");

      // Add newly created category to the list without refetching
      setCategories((prev) => [...prev, res.data.data || res.data]);

      // Reset form
      setForm({
        name: "",
        slug: "",
        description: "",
        image: "",
        isFeatured: false,
        sortOrder: 0,
        isActive: true,
      });
      navigate(`/category`);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create category");
    }
  };

  return (
    <div className="category-container">
      <h2 className="cat-title">Manage Categories</h2>

      {/* CREATE CATEGORY FORM */}
      <form className="category-form" onSubmit={handleSubmit}>
        <h3>Create Category</h3>

        <input
          type="text"
          placeholder="Category Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Slug (SEO friendly)"
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
          type="text"
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        {form.image && <img src={form.image} className="preview-img" alt="Preview" />}

        <label className="switch-label">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />
          Featured Category?
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
          Active?
        </label>

        <button type="submit" className="btn-submit">
          Create Category
        </button>
      </form>

      {/* CATEGORY LIST */}
      <h3 className="section-title">All Categories</h3>
      <div className="category-list">
        {categories.length === 0 ? (
          <p>No categories added.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat._id} className="cat-card">
              <img
                src={cat.image || "https://cdn-icons-png.flaticon.com/512/7187/7187843.png"}
                alt="Icon"
                className="cat-img"
              />

              <div className="cat-info">
                <h4>{cat.name}</h4>
                <p className="slug">/{cat.slug}</p>
                <p>{cat.description || "No description"}</p>
                {cat.isFeatured && <span className="featured-tag">Featured</span>}
                {!cat.isActive && <span className="inactive-tag">Inactive</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
