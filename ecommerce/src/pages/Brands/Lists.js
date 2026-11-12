import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import "../../styles/brandlist.css";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { FaPlus } from "react-icons/fa";

export default function BrandList() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await api.post("/brands/list", {
        page: 1,
        size: 50,
      });
      setBrands(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch brands", err);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this brand?")) return;

    try {
      await api.delete(`/brands/delete/${id}`);
      setBrands((prev) => prev.filter((b) => b._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="brand-layout">
        {/* Sidebar */}
        <Sidebar />

        {/* Content */}
        <div className="brand-container">
          <div className="brand-header">
            <div>
              <div className="section-eyebrow">
                <span className="eyebrow-dot" />
                <span>DIRECT PARTNERSHIPS</span>
              </div>
              <h1 className="brand-title">
                Partner <span className="highlight-text">Brands</span>
                <span className="brand-count-badge">{brands.length} Brands</span>
              </h1>
              <p className="brand-subtitle">
                Official verified manufacturers and authorized distributors on OneCart.
              </p>
            </div>
            <button
              className="add-brand-btn"
              onClick={() => navigate("/brands/create")}
            >
              <FaPlus size={12} />
              <span>Add Brand</span>
            </button>
          </div>

          {loading ? (
            <p className="loading-text">Loading brands...</p>
          ) : (
            <div className="brand-card-grid">
              {brands.length ? (
                brands.map((brand) => (
                  <div className="brand-card" key={brand._id}>
                    <div className="brand-logo">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} />
                      ) : (
                        <span className="no-logo">No Logo</span>
                      )}
                    </div>

                    <h3 className="brand-name">{brand.name}</h3>
                    <p className="brand-website">
                      {brand.website || "No website"}
                    </p>

                    <div className="brand-actions">
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
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No brands found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
