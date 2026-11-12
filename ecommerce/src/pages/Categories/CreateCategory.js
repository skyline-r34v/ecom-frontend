import React, { useEffect, useState } from "react";
import api from "../../api";
import "../../styles/createcategory.css";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { FaArrowLeft, FaPen, FaFileExcel } from "react-icons/fa";
import CategoryExcelUpload from "../../components/ExcelUpload/CategoryExcelUpload";

export default function CategoryPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("manual"); // "manual" | "excel"

  /* ---------------- FORM STATE ---------------- */
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: null,
    parentCategory: "",
    isFeatured: false,
    sortOrder: 0,
    isActive: true,
  });

  /* FETCH CATEGORIES */
  const fetchCategories = async () => {
    try {
      const res = await api.post("/categories/list", {
        page: 1,
        size: 100,
      });
      setCategories(res.data.data || []);
    } catch {
      message.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || token === "undefined" || token === "null") {
      message.error("Please login as Admin to create categories");
      navigate("/login");
      return;
    }

    if (role && role !== "admin") {
      message.error("Access denied: You are signed in as a '" + role + "'. Admin privileges are required to create categories.");
      return;
    }

    if (!form.name.trim() || !form.slug.trim()) {
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
      formData.append("isFeatured", String(form.isFeatured));
      formData.append("sortOrder", String(form.sortOrder || 0));
      formData.append("isActive", String(form.isActive));

      if (form.image) {
        formData.append("image", form.image);
      }

      await api.post("/categories/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Category created successfully! 🎉");
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
      fetchCategories();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || "Create failed";
      if (
        errMsg.toLowerCase().includes("forbidden") ||
        errMsg.toLowerCase().includes("insufficient permissions")
      ) {
        message.error("Access denied: Admin privileges required to create categories.");
      } else if (
        err.response?.status === 401 ||
        err.response?.status === 403 ||
        errMsg.toLowerCase().includes("invalid token") ||
        errMsg.toLowerCase().includes("token expired") ||
        errMsg.toLowerCase().includes("access denied") ||
        errMsg.toLowerCase().includes("no token") ||
        errMsg.toLowerCase().includes("jwt")
      ) {
        message.error("Session expired or invalid login. Please sign in as Admin.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      } else {
        message.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  /* DELETE CATEGORY */
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
      {/* Header */}
      <div className="cat-header-wrap">
        <button className="back-btn" onClick={() => navigate("/category")}>
          <FaArrowLeft size={11} style={{ marginRight: 6 }} /> Back to Categories
        </button>
        <div className="section-eyebrow">
          <span className="eyebrow-dot" />
          <span>CATALOG MANAGEMENT</span>
        </div>
        <h1 className="cat-title">
          Create <span className="highlight-text">Category</span>
        </h1>
        <p className="cat-subtitle">
          Add new product categories to organize your store catalog.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="excel-mode-switcher">
        <button
          type="button"
          className={`excel-mode-tab ${activeTab === "manual" ? "active" : ""}`}
          onClick={() => setActiveTab("manual")}
        >
          <FaPen size={13} />
          Manual Single Entry
        </button>
        <button
          type="button"
          className={`excel-mode-tab ${activeTab === "excel" ? "active" : ""}`}
          onClick={() => setActiveTab("excel")}
        >
          <FaFileExcel size={15} color="#16a34a" />
          Upload Excel File
          <span className="excel-tab-badge">Excel Only</span>
        </button>
      </div>

      {activeTab === "excel" ? (
        <CategoryExcelUpload
          onUploadSuccess={() => {
            fetchCategories();
            navigate("/category");
          }}
        />
      ) : (
        <form className="category-form" onSubmit={handleSubmit}>
          <h3>Category Details</h3>

        <div className="form-group">
          <label>Category Name *</label>
          <input
            placeholder="e.g. Footwear & Shoes"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
              setForm({ ...form, name, slug: form.slug ? form.slug : autoSlug });
            }}
          />
        </div>

        <div className="form-group">
          <label>Slug *</label>
          <input
            placeholder="e.g. footwear-shoes"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </div>

        <div className="form-group full">
          <label>Description</label>
          <textarea
            placeholder="Brief overview of products included in this category..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="form-group full">
          <label style={{ marginBottom: "8px", display: "block", fontWeight: 700 }}>
            Category Banner Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
          />
          {form.image && (
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src={URL.createObjectURL(form.image)}
                className="preview-img"
                alt="preview"
                style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
              />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "13px" }}>{form.image.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>
                  ✓ Image File Attached ({(form.image.size / 1024).toFixed(0)} KB)
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Parent Category</label>
          <select
            value={form.parentCategory}
            onChange={(e) => setForm({ ...form, parentCategory: e.target.value })}
          >
            <option value="">No Parent Category (Top Level)</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Sort Order</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />
        </div>

        <div className="form-group switch">
          <label>
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            Featured Category
          </label>
        </div>

        <div className="form-group switch">
          <label>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active in Store
          </label>
        </div>

        <button className="btn-submit" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Category"}
        </button>
      </form>
      )}

      {/* CATEGORY LIST */}
      <h3 className="section-title" style={{ marginTop: "40px" }}>
        Existing Categories ({categories.length})
      </h3>

      <div className="category-list">
        {categories.map((cat) => (
          <div className="cat-card" key={cat._id}>
            <img
              src={cat.image || "https://cdn-icons-png.flaticon.com/512/7187/7187843.png"}
              className="cat-img"
              alt={cat.name}
            />

            <div className="cat-info">
              <h4>{cat.name}</h4>
              <p className="slug">/{cat.slug}</p>
              {cat.description && <p className="desc">{cat.description}</p>}
            </div>

            <div className="cat-actions">
              <button
                className="btn-edit"
                onClick={() => navigate(`/edit-category/${cat._id}`)}
              >
                Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => deleteCategory(cat._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}