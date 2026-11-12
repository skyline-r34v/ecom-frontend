import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/createbrand.css";
import { message } from "antd";

export default function BrandCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
  });

  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || token === "undefined" || token === "null") {
      message.error("Please login as an Admin to create brands");
      navigate("/login");
      return;
    }

    if (role && role !== "admin") {
      message.error("Access denied: You are signed in as a '" + role + "'. Admin privileges are required to create brands.");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("website", form.website);

      if (logo) fd.append("logo", logo);

      await api.post("/brands/create", fd);

      message.success("Brand created successfully! 🎉");

      setForm({ name: "", description: "", website: "" });
      setLogo(null);

      navigate("/brands"); // redirect to brand list page
    } catch (error) {
      const errMsg = error.response?.data?.message || error.response?.data?.error || "Failed to create brand";
      if (
        errMsg.toLowerCase().includes("forbidden") ||
        errMsg.toLowerCase().includes("insufficient permissions")
      ) {
        message.error("Access denied: Admin privileges required to create brands.");
      } else if (
        errMsg.toLowerCase().includes("access denied") ||
        errMsg.toLowerCase().includes("no token") ||
        errMsg.toLowerCase().includes("invalid token")
      ) {
        message.error("Session expired or not logged in. Please log in as Admin.");
        navigate("/login");
      } else {
        message.error(errMsg);
      }
      console.error("Brand creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-brand-page">

      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

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