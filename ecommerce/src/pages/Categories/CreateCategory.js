import React, { useEffect, useState } from "react";
import api from "../../api";
import "../../styles/craetecategory.css";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

export default function CategoryPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: null, // FILE
    parentCategory: "",
    isFeatured: false,
    sortOrder: 0,
    isActive: true,
  });

  /* =======================
     FETCH CATEGORIES
  ======================= */
  const fetchCategories = async () => {
    try {
      const res = await api.post("/categories/list", {
        page: 1,
        size: 100,
      });
      setCategories(res.data.data || []);
    } catch (error) {
      message.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* =======================
     CREATE CATEGORY
  ======================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.slug) {
      message.warning("Category name and slug are required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("slug", form.slug);
      formData.append("description", form.description);
      formData.append("parentCategory", form.parentCategory);
      formData.append("isFeatured", form.isFeatured);
      formData.append("sortOrder", form.sortOrder);
      formData.append("isActive", form.isActive);

      if (form.image) {
        formData.append("image", form.image); // MUST MATCH BACKEND
      }

      await api.post("/categories/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Category Created Successfully");
      fetchCategories();

      setForm({
        name: "",
        slug: "",
        description: "",
        image: null,
        parentCategory: "",
        isFeatured: false,
        sortOrder: 0,
        isActive: true,
      });
    } catch (err) {
      message.error(err.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     DELETE CATEGORY
  ======================= */
  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await api.post("/categories/delete", { id });
      message.success("Category Deleted");
      fetchCategories();
    } catch {
      message.error("Delete failed");
    }
  };

  return (
    <div className="category-container">
      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2 className="cat-title">Manage Categories</h2>

      {/* =======================
          CREATE CATEGORY FORM
      ======================= */}
      <form className="category-form" onSubmit={handleSubmit}>
        <h3>Create Category</h3>

        <input
          placeholder="Category Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          required
        />

        <input
          placeholder="Slug"
          value={form.slug}
          onChange={(e) =>
            setForm({ ...form, slug: e.target.value })
          }
          required
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        {/* IMAGE UPLOAD */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setForm({ ...form, image: e.target.files[0] })
          }
        />

        {/* IMAGE PREVIEW */}
        {form.image && (
          <img
            src={URL.createObjectURL(form.image)}
            className="preview-img"
            alt="preview"
          />
        )}

        {/* PARENT CATEGORY */}
        <select
          value={form.parentCategory}
          onChange={(e) =>
            setForm({ ...form, parentCategory: e.target.value })
          }
        >
          <option value="">No Parent Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* FEATURED */}
        <label className="switch-label">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) =>
              setForm({ ...form, isFeatured: e.target.checked })
            }
          />
          Featured
        </label>

        {/* SORT ORDER */}
        <input
          type="number"
          placeholder="Sort Order"
          value={form.sortOrder}
          onChange={(e) =>
            setForm({
              ...form,
              sortOrder: Number(e.target.value),
            })
          }
        />

        {/* ACTIVE */}
        <label className="switch-label">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm({ ...form, isActive: e.target.checked })
            }
          />
          Active
        </label>

        <button
          className="btn-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Category"}
        </button>
      </form>

      {/* =======================
          CATEGORY LIST
      ======================= */}
      <h3 className="section-title">All Categories</h3>

      <div className="category-list">
        {categories.map((cat) => (
          <div className="cat-card" key={cat._id}>
            <img
              src={
                cat.image ||
                "https://cdn-icons-png.flaticon.com/512/7187/7187843.png"
              }
              className="cat-img"
              alt={cat.name}
            />

            <div className="cat-info">
              <h4>{cat.name}</h4>
              <p className="slug">/{cat.slug}</p>
              <p>{cat.description || "No description"}</p>

              {cat.parentCategory && (
                <p className="parent-text">
                  Parent:{" "}
                  {
                    categories.find(
                      (c) => c._id === cat.parentCategory
                    )?.name
                  }
                </p>
              )}

              {cat.isFeatured && (
                <span className="featured-tag">Featured</span>
              )}
              {!cat.isActive && (
                <span className="inactive-tag">Inactive</span>
              )}

              <div className="cat-actions">
                <button
                  className="edit-btn"
                  onClick={() =>
                    navigate(`/edit-category/${cat._id}`)
                  }
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