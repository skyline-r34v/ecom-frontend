import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/brandedit.css";

export default function BrandEdit() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [brand, setBrand] = useState(null);
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrand();
  }, []);

  const loadBrand = async () => {
    try {
      const res = await api.get(`/brands/${slug}`);
      setBrand(res.data.data);
    } catch (err) {
      console.error("Failed to load brand", err);
      alert("Failed to load brand");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setBrand({
      ...brand,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("id", brand._id);
      fd.append(
        "update",
        JSON.stringify({
          name: brand.name,
          description: brand.description,
          website: brand.website,
        })
      );

      if (logo) {
        fd.append("logo", logo);
      }

      await api.post("/brands/update", fd);
      alert("Brand updated successfully");
      navigate("/brands");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update brand");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (!brand) return <p style={{ textAlign: "center" }}>Brand not found</p>;

  return (
    <div className="brand-edit-container">
      <h2>Edit Brand</h2>

      <form className="brand-edit-form" onSubmit={handleSubmit}>
        {/* Brand Name */}
        <input
          type="text"
          name="name"
          placeholder="Brand Name"
          value={brand.name || ""}
          onChange={handleChange}
          required
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Brand Description"
          value={brand.description || ""}
          onChange={handleChange}
        />

        {/* Website */}
        <input
          type="text"
          name="website"
          placeholder="Website URL"
          value={brand.website || ""}
          onChange={handleChange}
        />

        {/* Logo Preview */}
        {brand.logo && (
          <div className="brand-logo-preview">
            <img src={brand.logo} alt={brand.name} />
          </div>
        )}

        {/* Upload New Logo */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogo(e.target.files[0])}
        />

        {/* Buttons */}
        <div className="brand-edit-actions">
          <button type="submit" className="update-btn">
            Update
          </button>

          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/brands")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
