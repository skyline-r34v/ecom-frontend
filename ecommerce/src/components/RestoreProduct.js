import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/products.css";

export default function RestoreProduct() {
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDeletedProducts = async () => {
    try {
      setLoading(true);
      const res = await api.post("/products/deleted"); // API endpoint for deleted products
      setDeletedProducts(res.data?.data || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch deleted products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedProducts();
  }, []);

  const handleRestore = async (id) => {
    try {
      await api.post("/products/restore", { id }); // API endpoint to restore product
      message.success("Product restored successfully");
      fetchDeletedProducts();
    } catch (error) {
      console.error(error);
      message.error("Restore failed");
    }
  };

  if (loading) {
    return <h2 className="loading-text">Loading Deleted Products...</h2>;
  }

  return (
    <>
      <Navbar />
      <div className="product-page-container">
        <Sidebar />
        <div className="product-content">
          <div className="page-header">
            <div className="page-left">
              <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
              <h2 className="page-title">Deleted Products</h2>
            </div>
          </div>

          {deletedProducts.length === 0 ? (
            <p style={{ textAlign: "center", marginTop: "30px" }}>
              No deleted products found.
            </p>
          ) : (
            <div className="product-grid">
              {deletedProducts.map((p) => (
                <div className="product-card" key={p._id}>
                  <div className="product-image-wrapper">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      onClick={() => navigate(`/products/${p._id}`)}
                    />
                  </div>

                  <div className="product-info">
                    <span className="product-rating">⭐ 4.5</span>
                    <h3>{p.title}</h3>
                    <p className="product-price">₹{p.price}</p>
                    <div className="product-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleRestore(p._id)}
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
