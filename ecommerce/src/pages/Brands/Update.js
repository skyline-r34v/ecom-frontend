import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";

export default function BrandEdit() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [brand, setBrand] = useState(null);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    loadBrand();
  }, []);

  const loadBrand = async () => {
    const res = await api.get(`/brands/${slug}`);
    setBrand(res.data.data);
  };

  const handleChange = (e) =>
    setBrand({ ...brand, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    if (logo) fd.append("logo", logo);

    await api.post("/brands/update", fd);
    alert("Brand updated successfully");
    navigate("/brands");
  };

  if (!brand) return null;

  return (
    <div>
      <h2>Edit Brand</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={brand.name}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          value={brand.description || ""}
          onChange={handleChange}
        />

        <input
          name="website"
          value={brand.website || ""}
          onChange={handleChange}
        />

        {brand.logo && (
          <img src={brand.logo} alt="" width="80" />
        )}

        <input
          type="file"
          onChange={(e) => setLogo(e.target.files[0])}
        />

        <button type="submit">Update</button>
      </form>
    </div>
  );
}
