import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "../../styles/products.css";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currency, setCurrency] = useState("INR");
  const [conversionRate, setConversionRate] = useState(0.012);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryId = params.get("category");

  const PRODUCTS_PER_PAGE = 9;

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = async (pageNumber = 1, search = "") => {
    try {
      setLoading(true);

      const res = await api.post("/products/list", {
        size: PRODUCTS_PER_PAGE,
        page: pageNumber,
        category: categoryId || "all",
        search: search,
      });

      setProducts(res.data?.data || []);

      if (res.data?.pagination?.total) {
        setTotalPages(Math.ceil(res.data.pagination.total / PRODUCTS_PER_PAGE));
      }

      setPage(pageNumber);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CURRENCY RATE ---------------- */
  const fetchConversionRate = async () => {
    try {
      const res = await fetch(
        "https://api.exchangerate.host/latest?base=INR&symbols=USD"
      );
      const data = await res.json();
      if (data?.rates?.USD) {
        setConversionRate(data.rates.USD);
      }
    } catch {
      setConversionRate(0.012);
    }
  };

  useEffect(() => {
    fetchProducts(1, searchTerm);
    fetchConversionRate();
  }, [categoryId]);

  /* ---------------- SEARCH ---------------- */
  const handleSearch = async () => {
    fetchProducts(1, searchTerm);
  };

  /* ---------------- HELPERS ---------------- */
  const formatPrice = (price) =>
    currency === "INR"
      ? `₹${price}`
      : `$${(price * conversionRate).toFixed(2)}`;

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.post("/products/delete", { id });
      message.success("Product deleted");
      fetchProducts(page, searchTerm);
    } catch {
      message.error("Delete failed");
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return <h2 className="loading-text">Loading Products...</h2>;
  }

  /* ---------------- UI ---------------- */
  return (
    <>
      <Navbar />

      <div className="product-page-container">
        <Sidebar />

        <div className="product-content">
          {/* HEADER */}
          <div className="page-header">
            <div className="page-left">
              <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
              <h2 className="page-title">
                {categoryId ? "Category Products" : "All Products"}
              </h2>
            </div>

            <div className="header-actions">
              <button
                className="currency-toggle-btn"
                onClick={() =>
                  setCurrency(currency === "INR" ? "USD" : "INR")
                }
              >
                Show {currency === "INR" ? "USD" : "INR"}
              </button>

              <button
                className="add-product-btn"
                onClick={() => navigate("/products/add")}
              >
                + Add Product
              </button>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch}>Search</button>
          </div>

          {/* PRODUCTS GRID */}
          <div className="product-grid">
            {products.length > 0 ? (
              products.map((p) => (
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

                    <p className="product-price">
                      {formatPrice(p.discountPrice)}{" "}
                      <del>{formatPrice(p.price)}</del>
                    </p>

                    <div className="product-actions">
                      <button
                        className="edit-btn"
                        onClick={() =>
                          navigate(`/products/edit/${p._id}`)
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(p._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No products found</p>
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => fetchProducts(page - 1, searchTerm)}
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={page === i + 1 ? "active" : ""}
                  onClick={() => fetchProducts(i + 1, searchTerm)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => fetchProducts(page + 1, searchTerm)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
