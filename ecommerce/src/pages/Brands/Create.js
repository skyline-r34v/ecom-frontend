import React, { useState } from "react";
import api from "../../api";
import "../../styles/createbrand.css";

export default function BrandCreate() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
  });
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("website", form.website);
      if (logo) fd.append("logo", logo);

      await api.post("/brands/create", fd);

      alert("Brand created successfully ✅");

      setForm({ name: "", description: "", website: "" });
      setLogo(null);
    } catch (error) {
      alert("Failed to create brand ❌");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-brand-page">
      <div className="create-brand-card">
        <h2>Create Brand</h2>

        <form className="create-brand-form" onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Brand name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Brand description"
            value={form.description}
            onChange={handleChange}
          />

          <input
            name="website"
            placeholder="Official website"
            value={form.website}
            onChange={handleChange}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files[0])}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Brand"}
          </button>
        </form>
      </div>
    </div>
  );
}
