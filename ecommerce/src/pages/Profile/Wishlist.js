import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { FaHeart, FaShoppingCart, FaBolt, FaArrowRight } from "react-icons/fa";
import api from "../../api";
import Navbar from "../../components/Navbar";
import useCartStore from "./cartStore";
import { 
  getProductImage, 
  isLifestyleProduct, 
  sanitizeProduct, 
  calculateDiscountPercentage 
} from "../../utils/productUtils";
import "../../styles/wishlist.css";
import "../../styles/home.css";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const syncCart = useCartStore((state) => state.syncCart);

  /* ─── Load wishlist from localStorage ─── */
  const loadWishlist = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("wishlistProducts") || "[]");
      setItems(Array.isArray(stored) ? stored.map(sanitizeProduct) : []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    loadWishlist();
    window.addEventListener("storage", loadWishlist);
    return () => window.removeEventListener("storage", loadWishlist);
  }, []);

  /* ─── Remove from wishlist ─── */
  const handleRemove = async (productId) => {
    const updatedProducts = items.filter((p) => p._id !== productId);
    setItems(updatedProducts);
    localStorage.setItem("wishlistProducts", JSON.stringify(updatedProducts));

    try {
      const ids = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
      localStorage.setItem("wishlistIds", JSON.stringify(ids.filter((id) => id !== productId)));
      window.dispatchEvent(new Event("storage"));
    } catch {}

    try {
      await api.post("/wishlists/create", { productId });
    } catch (err) {
      console.error("Backend wishlist toggle error:", err);
    }
    message.success("Removed from wishlist");
  };

  /* ─── Add to cart from wishlist ─── */
  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") {
      message.warning("Please sign in to add items to your cart");
      navigate("/login");
      return;
    }

    try {
      const res = await api.post("/users/cart", {
        productId: product._id,
        quantity: 1,
      });
      if (res.data?.success) {
        syncCart(res.data.cart);
        message.success(`"${product.title}" added to cart 🛒`);
      } else {
        message.error(res.data?.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      message.error("Failed to add to cart");
    }
  };

  const handleBuyNow = (product) => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") {
      message.warning("Please sign in to proceed to checkout");
      navigate("/login");
      return;
    }

    const data = { buyNow: true, product, quantity: 1 };
    localStorage.setItem("checkoutData", JSON.stringify(data));
    navigate("/checkout", { state: data });
  };

  const recommendedItems = [];

  /* ─── Empty state ─── */
  if (items.length === 0) {
    return (
      <div className="wishlist-page-root">
        <Navbar />
        <main className="wishlist-page">
          <div className="wishlist-empty-card">
            <div className="wishlist-empty-icon-wrap">
              <FaHeart className="empty-heart-icon" />
            </div>
            <h2>Your Wishlist is Empty</h2>
            <p>Save items you love by tapping the heart icon on any product card while browsing.</p>
            <button
              type="button"
              className="wishlist-browse-btn"
              onClick={() => navigate("/products")}
            >
              Explore Catalog <FaArrowRight size={12} />
            </button>
          </div>

          {/* REAL RECOMMENDED PRODUCTS SECTION */}
          <div className="wishlist-recommended-section">
            <div className="section-header">
              <div>
                <div className="section-eyebrow">
                  <span className="eyebrow-dot" />
                  <span>RECOMMENDED FOR YOU</span>
                </div>
                <h3 className="section-title">Trending Picks You Might <span className="highlight-text">Love</span></h3>
                <p className="section-subtitle">Top-rated bestsellers selected for you with express delivery</p>
              </div>
              <button className="view-all-btn" onClick={() => navigate("/products")}>
                <span>Browse All Deals</span>
                <FaArrowRight size={12} />
              </button>
            </div>

            <div className="product-grid">
              {recommendedItems.map((p) => {
                const img = getProductImage(p);
                const isLifestyle = isLifestyleProduct(p);
                const discount = calculateDiscountPercentage(p.price, p.discountPrice);

                return (
                  <div
                    key={p._id}
                    className="product-card"
                    onClick={() => navigate(`/products/${p._id}`)}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") navigate(`/products/${p._id}`); }}
                  >
                    <div className="card-top">
                      {discount && <span className="product-badge discount">-{discount}%</span>}
                    </div>

                    <div className={`img-container ${isLifestyle ? "lifestyle-wrap" : "isolated-wrap"}`}>
                      <img
                        src={img}
                        alt={p.title}
                        className={isLifestyle ? "product-img-cover" : "product-img-contain"}
                        loading="lazy"
                      />
                    </div>

                    <div className="card-details">
                      <span className="brand-name">{p.category?.name || "OneCart"}</span>
                      <h3 className="product-title">{p.title}</h3>

                      <div className="price-row">
                        <span className="current-price">₹{(p.discountPrice || p.price).toLocaleString()}</span>
                        {p.discountPrice && (
                          <del className="original-price">₹{p.price.toLocaleString()}</del>
                        )}
                        {discount && <span className="discount-pct">{discount}% OFF</span>}
                      </div>

                      <div className="product-card-actions">
                        <button
                          type="button"
                          className="add-to-cart-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(p);
                          }}
                        >
                          <FaShoppingCart size={13} /> Add
                        </button>
                        <button
                          type="button"
                          className="buy-now-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyNow(p);
                          }}
                        >
                          <FaBolt size={13} /> Buy
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="wishlist-page-root">
      <Navbar />
      <main className="wishlist-page">
        <div className="wishlist-header">
          <div>
            <div className="section-eyebrow">
              <span className="eyebrow-dot" />
              <span>SAVED FAVORITES</span>
            </div>
            <h1 className="wishlist-title">
              My Saved <span className="highlight-text">Wishlist</span>
              <span className="wishlist-count-badge">{items.length} {items.length === 1 ? "Item" : "Items"}</span>
            </h1>
            <p className="wishlist-sub">Products you have saved for later purchase or price-drop tracking</p>
          </div>
          <button
            type="button"
            className="continue-browsing-link"
            onClick={() => navigate("/products")}
          >
            ← Continue Shopping
          </button>
        </div>

        <div className="product-grid">
          {items.map((product, idx) => {
            const p = sanitizeProduct(product);
            const productId = p._id;
            const price = p.discountPrice ?? p.price ?? 0;
            const originalPrice = p.discountPrice ? p.price : null;
            const discount = calculateDiscountPercentage(originalPrice, price);
            const img = getProductImage(p);
            const isLifestyle = isLifestyleProduct(p);

            return (
              <div 
                className="product-card" 
                key={productId || idx}
                onClick={() => navigate(`/products/${productId}`)}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") navigate(`/products/${productId}`); }}
              >
                <div className="card-top">
                  {discount ? (
                    <span className="product-badge discount">-{discount}%</span>
                  ) : (
                    <span className="product-badge featured">SAVED</span>
                  )}

                  <button
                    type="button"
                    className="wishlist-icon active"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(productId);
                    }}
                    title="Remove from wishlist"
                    aria-label="Remove from wishlist"
                  >
                    <FaHeart />
                  </button>
                </div>

                <div className={`img-container ${isLifestyle ? "lifestyle-wrap" : "isolated-wrap"}`}>
                  <img
                    src={img}
                    alt={p.title || "Product"}
                    className={isLifestyle ? "product-img-cover" : "product-img-contain"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800";
                    }}
                  />
                </div>

                <div className="card-details">
                  <span className="brand-name">{p.category?.name || p.brand?.name || "OneCart"}</span>
                  <h3 className="product-title" title={p.title}>{p.title}</h3>

                  <div className="price-row">
                    <span className="current-price">₹{price.toLocaleString()}</span>
                    {originalPrice && (
                      <del className="original-price">₹{originalPrice.toLocaleString()}</del>
                    )}
                    {discount && <span className="discount-pct">{discount}% OFF</span>}
                  </div>

                  <div className="product-card-actions">
                    <button
                      type="button"
                      className="add-to-cart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(p);
                      }}
                    >
                      <FaShoppingCart size={13} /> Add to Cart
                    </button>
                    <button
                      type="button"
                      className="buy-now-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyNow(p);
                      }}
                    >
                      <FaBolt size={13} /> Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
