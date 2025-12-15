import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/products.css";
import api from "../api";
import { useLocation, useNavigate } from "react-router-dom";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const categoryId = params.get("category");

  // Show Add Product button only on product list page
  const isProductListPage =
    location.pathname === "/products" || location.pathname === "/products/";

  const fetchProducts = async () => {
    try {
      const data = {
        size: 10,
        page: 1,
        category: categoryId || "all",
      };

      const res = await api.post("/products/list", data);
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  const goToProductPage = (productId) => {
    navigate(`/products/${productId}`);
  };

  const goToAddProduct = () => {
    navigate("/products/add"); // Navigate to Add Product page
  };

  if (loading) {
    return (
      <div className="product-page-container">
        <h2 style={{ textAlign: "center", marginTop: "40px" }}>
          Loading Products...
        </h2>
      </div>
    );
  }

  return (
    <div className="product-page-container">
      <div className="product-sidebar">
        <Sidebar />
      </div>

      <div className="product-content">
        <div className="page-header">
          <h2 className="page-title">
            {categoryId ? "Products in Selected Category" : "All Products"}
          </h2>
          {isProductListPage && (
            <button className="add-product-btn" onClick={goToAddProduct}>
              + Add Product
            </button>
          )}
        </div>

        <div className="product-grid modern-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <div className="product-item modern-card" key={product._id}>
                <div className="product-card">
                  <div
                    className="img-container"
                    onClick={() => goToProductPage(product._id)}
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="product-image"
                    />
                  </div>

                  <div className="product-info">
                    <p className="product-rating">⭐ 4.5</p>
                    <h3 className="product-name">{product.title}</h3>

                    <p className="product-price">
                      ₹{product.discountPrice}
                      <small>
                        <del> ₹{product.price}</del>
                      </small>
                    </p>

                    <button
                      className="add-cart-btn modern-add-cart"
                      onClick={() => goToProductPage(product._id)}
                    >
                      View Product
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ marginTop: 20 }}>
              No products found for this category
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
