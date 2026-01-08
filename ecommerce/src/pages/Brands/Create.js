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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("website", form.website);
    if (logo) fd.append("logo", logo);

    await api.post("/brands/create", fd);
    alert("Brand created successfully");

    setForm({ name: "", description: "", website: "" });
    setLogo(null);
  };

  return (
    <div>
      <h2>Create Brand</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Brand name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          name="website"
          placeholder="Website"
          value={form.website}
          onChange={handleChange}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogo(e.target.files[0])}
        />

        <button type="submit">Create</button>
      </form>
    </div>
  );
}
