import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar";
import "../styles/products.css";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currency, setCurrency] = useState("INR");
  const [conversionRate, setConversionRate] = useState(0.012);

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const categoryId = params.get("category");
  const isProductListPage =
    location.pathname === "/products" || location.pathname === "/products/";

  const PRODUCTS_PER_SLIDE = 9;

  // Fetch products
  const fetchProducts = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const data = {
        size: PRODUCTS_PER_SLIDE,
        page: pageNumber,
        category: categoryId || "all",
      };

      const res = await api.post("/products/list", data);
      setProducts(res.data.data || []);

      if (res.data.pagination) {
        const { total } = res.data.pagination;
        setTotalPages(Math.ceil(total / PRODUCTS_PER_SLIDE));
      } else {
        setTotalPages(1);
      }

      setPage(pageNumber);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch conversion rate dynamically
  const fetchConversionRate = async () => {
    try {
      const res = await fetch("https://api.exchangerate.host/latest?base=INR&symbols=USD");
      const data = await res.json();
      if (data.rates && data.rates.USD) {
        setConversionRate(data.rates.USD);
      }
    } catch (err) {
      console.error("Failed to fetch conversion rate:", err);
      // fallback to default
      setConversionRate(0.012);
    }
  };

  useEffect(() => {
    fetchProducts(1);
    fetchConversionRate();
  }, [categoryId]);

  const goToProductPage = (productId) => navigate(`/products/${productId}`);
  const goToAddProduct = () => navigate("/products/add");
  const goToEditProduct = (id) => navigate(`/products/edit/${id}`);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.post("/products/delete", { id });
      message.success("Product deleted successfully");
      fetchProducts(page);
    } catch (err) {
      console.error(err);
      message.error("Failed to delete product");
    }
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page && pageNumber >= 1 && pageNumber <= totalPages) {
      fetchProducts(pageNumber);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  const toggleCurrency = () => setCurrency(currency === "INR" ? "USD" : "INR");
  const formatPrice = (price) => (currency === "INR" ? `₹${price}` : `$${(price * conversionRate).toFixed(2)}`);

  if (loading) return <h2 style={{ textAlign: "center", marginTop: "40px" }}>Loading Products...</h2>;

  return (
    <div className="product-page-container">
      <div className="product-sidebar"><Sidebar /></div>
      <div className="product-content">
        <div className="page-header">
          <h2 className="page-title">{categoryId ? "Products in Selected Category" : "All Products"}</h2>
          {isProductListPage && <button className="add-product-btn" onClick={goToAddProduct}>+ Add Product</button>}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <button onClick={toggleCurrency} className="currency-toggle-btn">
            Show in {currency === "INR" ? "USD" : "INR"}
          </button>
        </div>

        <div className="product-grid modern-grid">
          {products.length > 0 ? products.map((product) => (
            <div className="product-item modern-card" key={product._id}>
              <div className="product-card">
                <div className="img-container" onClick={() => goToProductPage(product._id)}>
                  <img src={product.thumbnail} alt={product.title} className="product-image" />
                </div>
                <div className="product-info">
                  <p className="product-rating">⭐ 4.5</p>
                  <h3 className="product-name">{product.title}</h3>
                  <p className="product-price">
                    {formatPrice(product.discountPrice)} <small><del>{formatPrice(product.price)}</del></small>
                  </p>
                  <div className="product-actions">
                    <button className="edit-btn" onClick={() => goToEditProduct(product._id)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          )) : <p style={{ marginTop: 20 }}>No products found for this category</p>}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => handlePageClick(page - 1)} disabled={page === 1}>Prev</button>
            {getPageNumbers().map((num) => (
              <button key={num} className={num === page ? "active" : ""} onClick={() => handlePageClick(num)}>{num}</button>
            ))}
            <button onClick={() => handlePageClick(page + 1)} disabled={page === totalPages}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
