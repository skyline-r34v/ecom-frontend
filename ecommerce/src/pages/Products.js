import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/products.css";
import api from "../api";
import { useLocation } from "react-router-dom";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryId = params.get("category"); 

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const data = {
        size: 10,
        page: 1,
        category: categoryId || "" // send category ID to backend
      };

      const res = await api.post("/products/list", data);
      setProducts(res.data.data || []);
      setLoading(false);

    } catch (err) {
      console.log("Error fetching products:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryId]); // refetch when category changes


  const openModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };


  if (loading) {
    return (
      <div className="product-page-container">
        <h2 style={{ textAlign: "center", marginTop: "40px" }}>Loading Products...</h2>
      </div>
    );
  }

  return (
    <div className="product-page-container">
      <div className="product-sidebar">
        <Sidebar />
      </div>

      <div className="product-content">
        <h2 className="page-title">
          {categoryId ? "Products in Selected Category" : "All Products"}
        </h2>

        {/* Product Grid */}
        <div className="product-grid modern-grid">
          {products.length > 0 ? (
            products.map((product, index) => (
              <div className="product-item modern-card" key={index}>
                <div className="product-card">

                  <div className="img-container">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="product-image"
                      onClick={() => openModal(product)}
                    />
                  </div>

                  <div className="product-info">
                    <p className="product-rating">⭐ 4.5</p>
                    <h3 className="product-name">{product.title}</h3>

                    <p className="product-price">
                      ₹{product.discountPrice}
                      <small>
                        <del>{product.price && <span> ₹{product.price}</span>}</del>
                      </small>
                    </p>

                    <button className="add-cart-btn modern-add-cart">Add to Cart</button>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <p style={{ marginTop: 20 }}>No products found for this category</p>
          )}
        </div>
      </div>

      {showModal && selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content modern-modal" onClick={(e) => e.stopPropagation()}>
            <img src={selectedProduct.thumbnail} alt={selectedProduct.title} className="modal-image" />

            <div className="modal-details">
              <h2>{selectedProduct.title}</h2>

              <p className="product-price-modal">
                ₹{selectedProduct.discountPrice}
                <span className="old-price-modal"> ₹{selectedProduct.price}</span>
              </p>

              <div className="modal-images">
                {selectedProduct.images?.map((img, idx) => (
                  <img key={idx} src={img} className="modal-small-img" />
                ))}
              </div>

              <button className="add-cart-btn modal-cart-btn">Add to Cart</button>
              <button className="close-btn" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
