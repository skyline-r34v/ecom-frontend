import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../../components/Navbar";
import "../../styles/wishlist.css";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  /* ─── Load wishlist from localStorage ─── */
  const loadWishlist = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("wishlistProducts") || "[]");
      setItems(Array.isArray(stored) ? stored : []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    loadWishlist();
    // Also listen for wishlist updates from other tabs
    window.addEventListener("storage", loadWishlist);
    return () => window.removeEventListener("storage", loadWishlist);
  }, []);

  /* ─── Remove from wishlist ─── */
  const handleRemove = async (productId) => {
    // Remove from localStorage immediately
    const updatedProducts = items.filter((p) => p._id !== productId);
    setItems(updatedProducts);
    localStorage.setItem("wishlistProducts", JSON.stringify(updatedProducts));

    // Update the IDs list too
    try {
      const ids = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
      localStorage.setItem("wishlistIds", JSON.stringify(ids.filter((id) => id !== productId)));
    } catch {}

    // Also call backend to toggle (remove)
    try {
      await api.post("/wishlists/create", { productId });
    } catch (err) {
      console.error("Backend wishlist toggle error:", err);
    }
  };

  /* ─── Add to cart from wishlist ─── */
  const handleAddToCart = async (product) => {
    try {
      const res = await api.post("/users/cart", {
        productId: product._id,
        quantity: 1,
      });
      if (res.data?.success) {
        alert(`"${product.title}" added to cart 🛒`);
      } else {
        alert(res.data?.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add to cart");
    }
  };

  /* ─── Empty ─── */
  if (items.length === 0)
    return (
      <>
        <Navbar />
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">🤍</div>
          <h2>Your wishlist is empty</h2>
          <p>Browse products and click the ❤️ heart icon to save them here.</p>
          <button
            className="wishlist-browse-btn"
            onClick={() => navigate("/products")}
          >
            Browse Products
          </button>
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="wishlist-page">
        <div className="wishlist-header">
          <h1>
            My Wishlist <span>({items.length} items)</span>
          </h1>
        </div>

        <div className="wishlist-grid">
          {items.map((product, idx) => {
            const productId = product._id;
            const price = product.discountPrice ?? product.price ?? 0;
            const originalPrice = product.discountPrice ? product.price : null;
            const discount = originalPrice
              ? Math.round(((originalPrice - price) / originalPrice) * 100)
              : null;

            return (
              <div className="wishlist-card" key={productId || idx}>
                {discount && (
                  <span className="wishlist-badge">-{discount}%</span>
                )}

                {/* Remove (heart) button */}
                <button
                  className="wishlist-remove-btn"
                  onClick={() => handleRemove(productId)}
                  title="Remove from wishlist"
                >
                  ❤️
                </button>

                {/* Image */}
                <div
                  className="wishlist-img"
                  onClick={() => navigate(`/products/${productId}`)}
                >
                  <img
                    src={product.thumbnail || product.images?.[0]}
                    alt={product.title || "Product"}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/200x200?text=No+Image";
                    }}
                  />
                </div>

                {/* Details */}
                <div className="wishlist-details">
                  <p className="wishlist-brand">
                    {product.brand?.name || ""}
                  </p>
                  <h3
                    className="wishlist-title"
                    onClick={() => navigate(`/products/${productId}`)}
                  >
                    {product.title}
                  </h3>

                  <div className="wishlist-price-row">
                    <span className="wishlist-price">
                      ₹{price.toLocaleString()}
                    </span>
                    {originalPrice && (
                      <span className="wishlist-original">
                        <del>₹{originalPrice.toLocaleString()}</del>
                      </span>
                    )}
                  </div>

                  <div className="wishlist-actions">
                    <button
                      className="wishlist-cart-btn"
                      onClick={() => handleAddToCart(product)}
                    >
                      🛒 Add to Cart
                    </button>
                    <button
                      className="wishlist-buy-btn"
                      onClick={() =>
                        navigate("/checkout", {
                          state: { buyNow: true, product, quantity: 1 },
                        })
                      }
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
