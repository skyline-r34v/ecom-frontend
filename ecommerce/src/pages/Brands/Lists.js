import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import "../../styles/brandlist.css";

export default function BrandList() {
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await api.post("/brands/list", {
        page: 1,
        size: 50,
      });
      setBrands(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch brands", err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this brand?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/brands/delete/${id}`);
      setBrands(brands.filter((brand) => brand._id !== id));
    } catch (err) {
      console.error("Failed to delete brand", err);
      alert("Failed to delete brand");
    }
  };

  return (
    <div className="brand-container">
      <h2 className="brand-title">Brands</h2>

      <table className="brand-table">
        <thead>
          <tr>
            <th>Logo</th>
            <th>Name</th>
            <th>Website</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {brands.length > 0 ? (
            brands.map((brand) => (
              <tr key={brand._id}>
                <td>
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} />
                  ) : (
                    "—"
                  )}
                </td>
                <td>{brand.name}</td>
                <td>{brand.website || "—"}</td>
                <td className="action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() =>
                      navigate(`/brands/edit/${brand.slug}`)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(brand._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="no-data">
                No brands found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
