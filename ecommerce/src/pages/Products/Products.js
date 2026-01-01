import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "../../styles/products.css"; // keep CSS import

export default function Product() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const categoryId = params.get("category");

  const PRODUCTS_PER_PAGE = 9;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [currency, setCurrency] = useState("INR");
  const [conversionRate, setConversionRate] = useState(0.012);
  const [searchTerm, setSearchTerm] = useState("");

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async (pageNumber = 1, search = "") => {
    try {
      setLoading(true);

      const res = await api.post("/products/list", {
        page: pageNumber,
        size: PRODUCTS_PER_PAGE,
        category: categoryId || undefined,
        search,
      });

      setProducts(res.data?.data || []);

      if (res.data?.pagination?.total) {
        setTotalPages(
          Math.ceil(res.data.pagination.total / PRODUCTS_PER_PAGE)
        );
      }

      setPage(pageNumber);
    } catch (err) {
      console.error(err);
      message.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CURRENCY ================= */
  const fetchConversionRate = async () => {
    try {
      const res = await fetch(
        "https://api.exchangerate.host/latest?base=INR&symbols=USD"
      );
      const data = await res.json();
      setConversionRate(data?.rates?.USD || 0.012);
    } catch {
      setConversionRate(0.012);
    }
  };

  useEffect(() => {
    fetchProducts(1, searchTerm);
    fetchConversionRate();
  }, [categoryId]);

  /* ================= SEARCH ================= */
  const handleSearch = () => {
    fetchProducts(1, searchTerm);
  };

  /* ================= PRICE FORMAT ================= */
  const formatPrice = (price) =>
    currency === "INR"
      ? `₹${price}`
      : `$${(price * conversionRate).toFixed(2)}`;

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.post("/products/delete", { id });
      message.success("Product deleted");
      fetchProducts(page, searchTerm);
    } catch {
      message.error("Delete failed");
    }
  };

  /* ================= ADD TO CART ================= */
  const handleAddToCart = (product) => {
    message.success(`${product.title} added to cart`);
  };

  /* ================= LOADING ================= */
  if (loading) {
    return <h2 className="loading-text">Loading Products...</h2>;
  }

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

          {/* SEARCH */}
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

          {/* GRID */}
          <div className="home-product-grid">
            {products.length ? (
              products.map((p) => (
                <div className="fk-card" key={p._id}>
                  <div className="fk-img-box" onClick={() => navigate(`/products/${p._id}`)}>
                    <img src={p.thumbnail} alt={p.title} />
                  </div>

                  <div className="fk-info">
                    <h3 className="fk-title">{p.title}</h3>
                    <div className="fk-rating">
                      ⭐ 4.5 <span>(100 reviews)</span>
                    </div>

                    <div className="fk-price">
                      {formatPrice(p.discountPrice || p.price)}
                      {p.discountPrice && <del>{formatPrice(p.price)}</del>}
                      {p.discountPrice && <span className="fk-off">OFF</span>}
                    </div>

                    <button className="fk-cart-btn" onClick={() => handleAddToCart(p)}>
                      Add to Cart
                    </button>

                    <div className="product-actions" style={{marginTop: '8px'}}>
                      <button
                        className="edit-btn"
                        onClick={() => navigate(`/products/edit/${p._id}`)}
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
