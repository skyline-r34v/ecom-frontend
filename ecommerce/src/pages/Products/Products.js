import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import useCartStore from "../Profile/cartStore";
import "../../styles/products.css";
import "../../styles/home.css";
import { FaHeart, FaStar, FaShoppingCart, FaBolt, FaArrowLeft, FaTimes, FaPlus, FaSearch } from "react-icons/fa";
import { getProductImage, isLifestyleProduct, sanitizeProduct } from "../../utils/productUtils";


export default function Product() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const categoryId = params.get("category");
  const searchQueryParam = params.get("search");
  const role = localStorage.getItem("role");
  const syncCart = useCartStore((state) => state.syncCart);

  const PRODUCTS_PER_PAGE = 12;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currency, setCurrency] = useState("INR");
  const [conversionRate, setConversionRate] = useState(0.012);
  const [searchTerm, setSearchTerm] = useState(searchQueryParam || "");
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

      let fetchedList = [];
      try {
        const res = await api.post("/products/list", {
          page: pageNumber,
          size: PRODUCTS_PER_PAGE,
          category: categoryId || undefined,
          search: search || undefined
        });
        fetchedList = (res.data?.data || []).map(sanitizeProduct);
      } catch (e) {
        console.warn("Backend products fetch failed:", e);
      }

      let localImported = [];
      try {
        localImported = JSON.parse(localStorage.getItem("importedProducts") || "[]");
      } catch (e) {
        localImported = [];
      }

      if (categoryId) {
        localImported = localImported.filter(
          (p) =>
            p.category?._id === categoryId ||
            p.category?.slug === categoryId ||
            p.category?.name?.toLowerCase() === categoryId.toLowerCase()
        );
      }
      if (search) {
        const q = search.toLowerCase();
        localImported = localImported.filter(
          (p) =>
            p.title?.toLowerCase().includes(q) ||
            (p.category?.name || "").toLowerCase().includes(q)
        );
      }

      const existingIds = new Set(fetchedList.map((p) => p._id));
      const combined = [
        ...localImported.filter((p) => !existingIds.has(p._id)),
        ...fetchedList
      ];

      setProducts(combined);
      setTotalPages(Math.max(1, Math.ceil(combined.length / PRODUCTS_PER_PAGE)));
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
    const currentParams = new URLSearchParams(location.search);
    const q = currentParams.get("search") || "";
    setSearchTerm(q);
    fetchProducts(1, q);
    fetchConversionRate();
    fetchWishlist();
  }, [categoryId, location.search]);

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

  const handleAddToCart = async (e, product) => {
    if (e && e.stopPropagation) e.stopPropagation();
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

  const handleBuyNow = (e, product) => {
    if (e && e.stopPropagation) e.stopPropagation();
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

          {/* UPGRADED HEADER */}
          <div className="products-header-section">
            <div className="products-header-top">
              <div className="products-header-info">
                <div className="section-eyebrow">
                  <span className="eyebrow-dot" />
                  <span>OFFICIAL STORE CATALOG</span>
                </div>
                <div className="products-title-row">
                  {categoryId && (
                    <button className="back-btn" onClick={() => navigate(-1)} title="Go Back">
                      <FaArrowLeft size={11} /> <span>Back</span>
                    </button>
                  )}
                  <h1 className="page-title">
                    {(() => {
                      const matched = products.find((p) => p.category?._id === categoryId || p.category?.slug === categoryId)?.category;
                      if (matched?.name) return matched.name;
                      if (categoryId) return "Category Collection";
                      if (searchTerm) return `Search: "${searchTerm}"`;
                      return "All Products";
                    })()}
                    <span className="product-count-badge">{products.length} Products</span>
                  </h1>
                </div>
                <p className="page-subtitle">
                  Showing genuine products with verified manufacturer warranty & express 24h dispatch.
                </p>
              </div>

              <div className="header-actions">
                <button
                  type="button"
                  className="currency-toggle-btn"
                  onClick={() =>
                    setCurrency(currency === "INR" ? "USD" : "INR")
                  }
                >
                  Currency: <strong>{currency}</strong> (Switch to {currency === "INR" ? "USD" : "INR"})
                </button>

                {role === "admin" && (
                  <button
                    type="button"
                    className="add-product-btn"
                    onClick={() => navigate("/products/add")}
                  >
                    <FaPlus size={12} /> <span>Add Product</span>
                  </button>
                )}
              </div>
            </div>

            {/* SEARCH */}
            <div className="search-bar">
              <div className="search-input-wrapper">
                <FaSearch className="search-box-icon" />
                <input
                  type="text"
                  placeholder="Search by product name, category, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => {
                      setSearchTerm("");
                      fetchProducts(1, "");
                    }}
                    aria-label="Clear search"
                  >
                    <FaTimes size={13} />
                  </button>
                )}
              </div>
              <button type="button" className="search-submit-btn" onClick={handleSearch}>
                <FaSearch size={13} /> <span>Search</span>
              </button>
            </div>
          </div>

          <div className="product-grid">
            {products.length ? (
              products.map((p) => {
                const imageSrc = getProductImage(p);
                const isLifestyle = isLifestyleProduct(p);
                const isWishlisted = wishlist.includes(p._id);
                const discountPct = p.discountPrice && p.price > p.discountPrice
                  ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
                  : null;

                return (
                  <div 
                    className="product-card" 
                    key={p._id}
                    onClick={() => navigate(`/products/${p._id}`)}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") navigate(`/products/${p._id}`); }}
                    aria-label={`View ${p.title}`}
                  >
                    <div className="card-top">
                      {discountPct ? (
                        <span className="product-badge discount">
                          -{discountPct}%
                        </span>
                      ) : (
                        <span className="product-badge featured">POPULAR</span>
                      )}
                      <button
                        type="button"
                        className={`wishlist-icon ${isWishlisted ? "active" : ""}`}
                        onClick={(e) => handleToggleWishlist(e, p._id)}
                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <FaHeart />
                      </button>
                    </div>

                    <div className={`img-container ${isLifestyle ? "lifestyle-wrap" : "isolated-wrap"}`}>
                      <img 
                        src={imageSrc} 
                        alt={p.title} 
                        loading="lazy"
                        className={isLifestyle ? "product-img-cover" : "product-img-contain"}
                        onError={(e) => { 
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"; 
                        }}
                      />
                    </div>

                    <div className="card-details">
                      <span className="brand-name">{p.category?.name || "OneCart Exclusive"}</span>
                      <h3 className="product-title" title={p.title}>{p.title}</h3>

                      <div className="product-rating">
                        <span className="stars-row">
                          <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar />
                        </span>
                        <span className="rating-score">{p.rating || 4.9}</span>
                        <span className="review-count">({p.reviews?.length || 42})</span>
                      </div>

                      <div className="price-row">
                        <span className="current-price">
                          {formatPrice(p.discountPrice || p.price)}
                        </span>
                        {p.discountPrice && p.price > p.discountPrice && (
                          <span className="original-price">
                            <del>{formatPrice(p.price)}</del>
                          </span>
                        )}
                        {discountPct && (
                          <span className="discount-pct">
                            {discountPct}% OFF
                          </span>
                        )}
                      </div>

                      {role !== "admin" && (
                        <div className="product-card-actions">
                          <button
                            type="button"
                            className="add-to-cart-btn"
                            onClick={(e) => handleAddToCart(e, p)}
                            aria-label={`Add ${p.title} to cart`}
                          >
                            <FaShoppingCart size={13} /> <span>Add to Cart</span>
                          </button>
                          <button
                            type="button"
                            className="buy-now-btn"
                            onClick={(e) => handleBuyNow(e, p)}
                            aria-label={`Buy ${p.title} now`}
                          >
                            <FaBolt size={13} /> <span>Buy Now</span>
                          </button>
                        </div>
                      )}

                      {role === "admin" && (
                        <div className="product-actions" style={{ marginTop: "auto" }}>
                          <button
                            type="button"
                            className="edit-btn"
                            onClick={(e) => { e.stopPropagation(); navigate(`/products/edit/${p._id}`); }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-products" style={{ gridColumn: '1 / -1' }}>
                <h3>No products found</h3>
                <p>Try searching for another keyword or clearing your filters.</p>
              </div>
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