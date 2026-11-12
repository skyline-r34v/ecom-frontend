import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { FaShoppingCart, FaBolt, FaArrowRight } from "react-icons/fa";
import api from "../../api";
import useCartStore from "../Profile/cartStore";
import Navbar from "../../components/Navbar";
import { 
  getProductImage, 
  isLifestyleProduct, 
  calculateDiscountPercentage 
} from "../../utils/productUtils";
import "../../styles/cart.css";
import "../../styles/home.css";

const Cart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const navigate = useNavigate();

  // Read cart items directly from Zustand store
  const cartItems = useCartStore((state) => state.cartItems);
  const syncCart = useCartStore((state) => state.syncCart);

  /* ================= FETCH CART FROM BACKEND ================= */
  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/users/cart", {});
      console.log("Cart fetch response:", res.data);

      if (res.data?.success) {
        syncCart(res.data.cart);
      } else {
        setError(res.data?.message || "Failed to load cart");
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
      if (err.response?.status === 401) {
        setLoading(false);
      } else {
        setError("Unable to load cart. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* ================= UPDATE QUANTITY ================= */
  const updateQuantity = async (productId, change) => {
    try {
      const res = await api.post("/users/cart", {
        productId,
        quantity: change,
      });
      if (res.data?.success) {
        syncCart(res.data.cart);
      } else {
        message.error(res.data?.message || "Failed to update quantity");
      }
    } catch (err) {
      console.error("Update cart error:", err);
      message.error("Unable to update cart");
    }
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = async (productId) => {
    try {
      const res = await api.post("/users/cart", {
        productId,
        quantity: -999,
      });
      if (res.data?.success) {
        syncCart(res.data.cart);
      } else {
        syncCart({
          items: cartItems.filter((item) => item.product?._id !== productId),
        });
      }
    } catch (err) {
      console.error("Remove error:", err);
      syncCart({
        items: cartItems.filter((item) => item.product?._id !== productId),
      });
    }
  };

  /* ================= HELPERS ================= */
  const getProduct = (item) => item.product || item;
  const getQty = (item) => item.quantity || 1;
  const getPrice = (item) => {
    const p = getProduct(item);
    return p.discountPrice ?? p.price ?? 0;
  };
  const getOriginalPrice = (item) => {
    const p = getProduct(item);
    return p.discountPrice ? p.price : null;
  };

  /* ================= TOTALS ================= */
  const subtotal = cartItems.reduce(
    (sum, item) => sum + getPrice(item) * getQty(item),
    0
  );
  const totalQty = cartItems.reduce((sum, item) => sum + getQty(item), 0);
  const freeShippingThreshold = 999;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const progressToFreeShipping = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );
  const shippingFee = subtotal === 0 || isFreeShipping ? 0 : 50;
  const finalTotal = Math.max(0, subtotal - discountAmount + (isFreeShipping ? 0 : shippingFee));

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "ONECART10") {
      const disc = Math.round(subtotal * 0.1);
      setDiscountAmount(disc);
      setPromoApplied(true);
    } else {
      alert("Invalid code. Try ONECART10 for 10% off!");
    }
  };

  /* ================= CHECKOUT ================= */
  const proceedToCheckout = () => {
    navigate("/checkout", {
      state: { cartItems, total: finalTotal },
    });
  };

  /* ================= STATES ================= */
  if (loading)
    return (
      <div className="cart-page-wrapper">
        <Navbar />
        <div className="empty-cart">
          <div className="empty-cart-spinner"></div>
          <p>Loading your shopping cart...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="cart-page-wrapper">
        <Navbar />
        <div className="empty-cart">
          <div className="empty-cart-icon">⚠️</div>
          <p style={{ color: "#ef4444", fontWeight: 600 }}>{error}</p>
          <button className="continue-shopping" onClick={fetchCart}>
            Retry Loading
          </button>
        </div>
      </div>
    );

  if (!cartItems || cartItems.length === 0) {
    const recommendedCartPicks = [];

    return (
      <div className="cart-page-wrapper">
        <Navbar />
        <div className="cart-page" style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 20px" }}>
          <div className="empty-cart" style={{ marginBottom: "48px" }}>
            <div className="empty-cart-icon">🛍️</div>
            <h2>Your Shopping Bag is Empty</h2>
            <p>Explore our curated collections and trending bestsellers to fill your cart with great finds.</p>
            <div className="empty-cart-actions">
              <button
                type="button"
                className="continue-shopping"
                onClick={() => navigate("/products")}
              >
                Explore Products <FaArrowRight size={12} />
              </button>
              <button
                type="button"
                className="continue-shopping outline"
                onClick={() => navigate("/category")}
              >
                Browse Categories
              </button>
            </div>
          </div>

          {/* REAL RECOMMENDED PICKS */}
          <div className="cart-recommendations-section">
            <div className="section-header">
              <div>
                <h3 className="section-title">Popular Items You Might Like</h3>
                <p className="section-subtitle">Add trending bestsellers directly to your bag</p>
              </div>
              <button className="view-all-btn" onClick={() => navigate("/products")}>
                Browse All Deals
              </button>
            </div>

            <div className="product-grid">
              {recommendedCartPicks.map((p) => {
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
                          onClick={async (e) => {
                            e.stopPropagation();
                            const token = localStorage.getItem("token");
                            if (!token) {
                              message.warning("Please sign in to add to cart");
                              navigate("/login");
                              return;
                            }
                            try {
                              const res = await api.post("/users/cart", { productId: p._id, quantity: 1 });
                              if (res.data?.success) {
                                syncCart(res.data.cart);
                                message.success(`Added ${p.title} to cart 🛒`);
                              }
                            } catch {
                              message.error("Unable to add to cart");
                            }
                          }}
                        >
                          <FaShoppingCart size={13} /> Add
                        </button>
                        <button
                          type="button"
                          className="buy-now-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const token = localStorage.getItem("token");
                            if (!token) {
                              message.warning("Please sign in to buy");
                              navigate("/login");
                              return;
                            }
                            const data = { buyNow: true, product: p, quantity: 1 };
                            localStorage.setItem("checkoutData", JSON.stringify(data));
                            navigate("/checkout", { state: data });
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
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <Navbar />

      <div className="cart-page">
        {/* Header Breadcrumb / Title */}
        <div className="cart-header-row">
          <div>
            <div className="section-eyebrow">
              <span className="eyebrow-dot" />
              <span>CHECKOUT READY</span>
            </div>
            <h1 className="cart-title">
              Shopping <span className="highlight-text">Cart</span>
              <span className="cart-count-badge">{totalQty} {totalQty === 1 ? "Item" : "Items"}</span>
            </h1>
            <p className="cart-subtitle">
              You have <span className="highlight-count">{totalQty} {totalQty === 1 ? "item" : "items"}</span> ready for checkout with express dispatch.
            </p>
          </div>
          <button
            type="button"
            className="continue-browsing-link"
            onClick={() => navigate("/products")}
          >
            ← Continue Shopping
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="shipping-progress-banner">
          <div className="shipping-progress-label">
            {isFreeShipping ? (
              <span className="free-shipping-unlocked">
                🎉 Congratulations! You qualify for <strong>FREE Express Delivery</strong>!
              </span>
            ) : (
              <span>
                Add <strong>₹{(freeShippingThreshold - subtotal).toLocaleString()}</strong> more to unlock <strong>FREE Express Delivery</strong>!
              </span>
            )}
            <span className="shipping-percent">{progressToFreeShipping}%</span>
          </div>
          <div className="shipping-progress-track">
            <div
              className="shipping-progress-bar"
              style={{ width: `${progressToFreeShipping}%` }}
            ></div>
          </div>
        </div>

        <div className="cart-layout">
          {/* ================= ITEMS ================= */}
          <div className="cart-items">
            {cartItems.map((item, idx) => {
              const product = getProduct(item);
              const qty = getQty(item);
              const price = getPrice(item);
              const origPrice = getOriginalPrice(item);
              const productId = product._id;
              const discount = origPrice ? Math.round(((origPrice - price) / origPrice) * 100) : null;

              return (
                <div className="cart-item" key={item._id || idx}>
                  <div
                    className="cart-item-img-wrap"
                    onClick={() => productId && navigate(`/products/${productId}`)}
                  >
                    <img
                      src={getProductImage(product)}
                      alt={product.title || "Product"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80";
                      }}
                    />
                    {discount && <span className="cart-discount-tag">-{discount}%</span>}
                  </div>

                  <div className="cart-info">
                    <div className="cart-info-top">
                      <div>
                        {product.brand?.name && (
                          <span className="cart-item-brand">{product.brand.name}</span>
                        )}
                        <h3
                          className="cart-item-title"
                          onClick={() => productId && navigate(`/products/${productId}`)}
                        >
                          {product.title}
                        </h3>
                      </div>
                      <button
                        className="cart-remove-icon-btn"
                        onClick={() => removeItem(productId)}
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="cart-price-row">
                      <span className="current-price">₹{price.toLocaleString()}</span>
                      {origPrice && (
                        <span className="original-price"><del>₹{origPrice.toLocaleString()}</del></span>
                      )}
                    </div>

                    <div className="cart-item-bottom">
                      <div className="qty-control">
                        <button
                          onClick={() => updateQuantity(productId, -1)}
                          disabled={qty <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{qty}</span>
                        <button
                          onClick={() => updateQuantity(productId, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-subtotal">
                        <span className="subtotal-label">Subtotal:</span>
                        <span className="subtotal-val">₹{(price * qty).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= SUMMARY ================= */}
          <div className="cart-summary-wrapper">
            <div className="cart-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Items ({totalQty}):</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Estimated Delivery:</span>
                <span>
                  {isFreeShipping ? (
                    <strong style={{ color: "#16a34a" }}>FREE</strong>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              {promoApplied && (
                <div className="summary-row promo-discount-row">
                  <span>Promo Discount (10%):</span>
                  <span style={{ color: "#16a34a" }}>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              {/* Promo code input */}
              <form onSubmit={handleApplyPromo} className="cart-promo-form">
                <input
                  type="text"
                  placeholder="Promo Code (ONECART10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                />
                <button type="submit" disabled={promoApplied}>
                  {promoApplied ? "Applied" : "Apply"}
                </button>
              </form>

              <div className="summary-divider"></div>

              <div className="summary-row grand-total-row">
                <span>Total Amount:</span>
                <span className="grand-total-price">₹{finalTotal.toLocaleString()}</span>
              </div>
              <p className="summary-tax-note">Includes all applicable GST & taxes</p>

              <button className="checkout-btn" onClick={proceedToCheckout}>
                Proceed to Checkout →
              </button>

              {/* Trust Indicators */}
              <div className="cart-trust-badges">
                <div className="trust-item">
                  <span className="trust-icon">🔒</span>
                  <span>100% Secure Checkout via Razorpay</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">⚡</span>
                  <span>Fast Tracked Dispatch</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">🔄</span>
                  <span>7-Day Return & Exchange Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
