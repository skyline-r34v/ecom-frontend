import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import useCartStore from "../Profile/cartStore";
import "../../styles/products.css";
import "../../styles/home.css";

export default function Product() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const categoryId = params.get("category");
  const role = localStorage.getItem("role");
  const syncCart = useCartStore((state) => state.syncCart);

  const PRODUCTS_PER_PAGE = 9;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currency, setCurrency] = useState("INR");
  const [conversionRate, setConversionRate] = useState(0.012);
  const [searchTerm, setSearchTerm] = useState("");
  // wishlist: array of product IDs — loaded from localStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch { return []; }
  });

  const fetchProducts = async (pageNumber = 1, search = "") => {
    try {
      setLoading(true);

      const res = await api.post("/products/list", {
        page: pageNumber,
        size: PRODUCTS_PER_PAGE,
        category: categoryId || undefined,
        search: search || undefined
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
    fetchWishlist();
  }, [categoryId]);

  /* ─── Fetch user's wishlist IDs from profile ─── */
  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || token === "undefined" || !userId) return;
    try {
      const res = await api.post("/users/profile", { userId });
      const wishlistRaw = res.data?.data?.wishlist || [];
      const ids = wishlistRaw.map((w) =>
        typeof w === "string" ? w : w._id || w.product?._id
      ).filter(Boolean);
      if (ids.length > 0) setWishlist(ids);
    } catch (err) {
      console.error("Wishlist fetch error:", err);
    }
  };

  /* ─── Toggle wishlist ─── */
  const handleToggleWishlist = async (e, productId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") {
      message.warning("Please login to add to wishlist");
      navigate("/login");
      return;
    }

    const isWishlisted = wishlist.includes(productId);
    // find the full product object from current products list
    const product = products.find((p) => p._id === productId);

    try {
      // /wishlists/create toggles add/remove on the backend
      await api.post("/wishlists/create", { productId });

      if (isWishlisted) {
        // Remove from state + localStorage
        const updated = wishlist.filter((id) => id !== productId);
        setWishlist(updated);
        localStorage.setItem("wishlistIds", JSON.stringify(updated));
        // Remove product from localStorage wishlist store
        try {
          const stored = JSON.parse(localStorage.getItem("wishlistProducts") || "[]");
          localStorage.setItem("wishlistProducts", JSON.stringify(stored.filter((p) => p._id !== productId)));
        } catch {}
        message.success("Removed from wishlist 💔");
      } else {
        // Add to state + localStorage
        const updated = [...wishlist, productId];
        setWishlist(updated);
        localStorage.setItem("wishlistIds", JSON.stringify(updated));
        // Save full product data for Wishlist page to display
        if (product) {
          try {
            const stored = JSON.parse(localStorage.getItem("wishlistProducts") || "[]");
            const alreadyIn = stored.find((p) => p._id === productId);
            if (!alreadyIn) {
              localStorage.setItem("wishlistProducts", JSON.stringify([...stored, product]));
            }
          } catch {}
        }
        message.success("Added to wishlist ❤️");
      }
    } catch (err) {
      console.error(err);
      message.error("Wishlist action failed");
    }
  };

  const handleSearch = () => {
    fetchProducts(1, searchTerm);
  };

  const formatPrice = (price) =>
    currency === "INR"
      ? `₹${price}`
      : `$${(price * conversionRate).toFixed(2)}`;

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

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");

    if (!token || token === "undefined" || token === "null") {
      message.warning("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const res = await api.post("/users/cart", {
        productId: product._id,
        quantity: 1,
      });

      if (res.data?.success) {
        // Sync the full cart (with items) into Zustand store
        syncCart(res.data.cart);
        message.success(`${product.title} added to cart 🛒`);
      } else {
        message.error(res.data?.message || "Failed to add product");
      }

    } catch (err) {
      console.error("Add to cart error:", err);
      message.error("Unable to add product to cart");
    }
  };

  const handleBuyNow = (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      message.warning("Please login to buy products");
      navigate("/login");
      return;
    }

    const data = {
      buyNow: true,
      product,
      quantity: 1
    };

    // store for refresh safety
    localStorage.setItem("checkoutData", JSON.stringify(data));

    navigate("/checkout", {
      state: data
    });
  };

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

              {role === "admin" && (
                <button
                  className="add-product-btn"
                  onClick={() => navigate("/products/add")}
                >
                  + Add Product
                </button>
              )}
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

          <div className="product-grid">
            {products.length ? (
              products.map((p) => (
                <div className="product-card" key={p._id}>

                  <div className="card-top">
                    {p.discountPrice && (
                      <span className="product-badge">
                        -{Math.round(((p.price - p.discountPrice) / p.price) * 100)}%
                      </span>
                    )}
                    <button
                      className={`wishlist-icon ${wishlist.includes(p._id) ? "active" : ""}`}
                      onClick={(e) => handleToggleWishlist(e, p._id)}
                      title={wishlist.includes(p._id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      {wishlist.includes(p._id) ? "❤️" : "🤍"}
                    </button>
                  </div>

                  <div
                    className="img-container"
                    onClick={() => navigate(`/products/${p._id}`)}
                  >
                    <img src={p.thumbnail} alt={p.title} />
                  </div>

                  <div className="card-details">
                    <span className="brand-name">{p.brand?.name || "Brand"}</span>
                    <h3 className="product-title" onClick={() => navigate(`/products/${p._id}`)} style={{ cursor: "pointer" }}>{p.title}</h3>

                    <div className="product-rating">
                      ⭐⭐⭐⭐⭐ <span>(100)</span>
                    </div>

                    <div className="price-row">
                      <span className="current-price">
                        {formatPrice(p.discountPrice || p.price)}
                      </span>
                      {p.discountPrice && (
                        <span className="original-price">
                          <del>{formatPrice(p.price)}</del>
                        </span>
                      )}
                    </div>

                    {role !== "admin" && (
                      <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                        <button
                          className="add-to-cart-btn"
                          style={{ opacity: 1, transform: "none", flex: 1, padding: "8px", fontSize: "13px" }}
                          onClick={() => handleAddToCart(p)}
                        >
                          Add to Cart
                        </button>
                        <button
                          className="add-to-cart-btn"
                          style={{ opacity: 1, transform: "none", flex: 1, padding: "8px", fontSize: "13px", background: "var(--primary)", color: "white" }}
                          onClick={() => handleBuyNow(p)}
                        >
                          Buy Now
                        </button>
                      </div>
                    )}

                    {role === "admin" && (
                      <div className="product-actions" style={{ marginTop: "auto" }}>
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
                    )}
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