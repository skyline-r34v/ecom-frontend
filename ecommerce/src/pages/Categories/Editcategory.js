import React, { useEffect, useState } from "react";
import api from "../../api";
import "../../styles/createcategory.css";
import { useNavigate, useParams } from "react-router-dom";

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isFeatured: false,
    sortOrder: 0,
    isActive: true,
  });

  // Fetch category details
  const fetchCategory = async () => {
    try {
      const res = await api.get(`/categories/${id}`);

      console.log("API Response:", res.data);

      const cat = res.data.data || res.data;

      setForm({
        name: cat.name || "",
        slug: cat.slug || "",
        description: cat.description || "",
        image: cat.image || "",
        isFeatured: cat.isFeatured || false,
        sortOrder: cat.sortOrder || 0,
        isActive: cat.isActive !== false,
      });
    } catch (err) {
      console.error(err);
      alert("Category not found");
      navigate("/category");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  // Update category
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      id: id,
      update: {
        name: form.name,
        slug: form.slug,
        description: form.description,
        image: form.image,
        isFeatured: form.isFeatured,
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
      },
    };

    try {
      await api.post("/categories/update", payload);
      alert("Category Updated Successfully");
      navigate("/category");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return <p className="loading-state-container">Loading category...</p>;
  }

  return (
    <div className="category-container">
      <h2 className="cat-title">Edit Category</h2>

      <form className="category-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Category Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          required
        />

        <input
          type="text"
          placeholder="Slug"
          value={form.slug}
          onChange={(e) =>
            setForm({ ...form, slug: e.target.value })
          }
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Image URL"
          value={form.image}
          onChange={(e) =>
            setForm({ ...form, image: e.target.value })
          }
        />

        {form.image && (
          <img
            src={form.image}
            alt="preview"
            className="preview-img"
            style={{ width: "120px", marginTop: "10px" }}
          />
        )}

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

        <input
          type="number"
          placeholder="Sort Order"
          value={form.sortOrder}
          onChange={(e) =>
            setForm({ ...form, sortOrder: e.target.value })
          }
        />

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

        <button type="submit" className="btn-submit">
          Update Category
        </button>
      </form>
    </div>
  );
}