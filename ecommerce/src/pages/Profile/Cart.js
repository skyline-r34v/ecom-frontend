import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import useCartStore from "../Profile/cartStore";
import "../../styles/cart.css";

const Cart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Read cart items directly from Zustand store (populated when Add to Cart was clicked)
  const cartItems = useCartStore((state) => state.cartItems);
  const syncCart = useCartStore((state) => state.syncCart);

  /* ================= FETCH CART FROM BACKEND ================= */
  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      navigate("/login");
      return;
    }

    try {
      const res = await api.post("/users/cart", {});
      console.log("Cart fetch response:", res.data); // Debug

      if (res.data?.success) {
        syncCart(res.data.cart); // Sync into Zustand store
      } else {
        setError(res.data?.message || "Failed to load cart");
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
      if (err.response?.status === 401) {
        navigate("/login");
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
        alert(res.data?.message || "Failed to update quantity");
      }
    } catch (err) {
      console.error("Update cart error:", err);
      alert("Unable to update cart");
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
        // Fallback: remove locally from store
        syncCart({
          items: cartItems.filter(
            (item) => item.product?._id !== productId
          ),
        });
      }
    } catch (err) {
      console.error("Remove error:", err);
      // Fallback: remove locally
      syncCart({
        items: cartItems.filter(
          (item) => item.product?._id !== productId
        ),
      });
    }
  };

  /* ================= STATES ================= */
  if (loading)
    return (
      <div className="empty-cart">
        <p>Loading your cart...</p>
      </div>
    );

  if (error)
    return (
      <div className="empty-cart">
        <p style={{ color: "red" }}>{error}</p>
        <button className="continue-shopping" onClick={fetchCart}>
          Retry
        </button>
      </div>
    );

  if (!cartItems || cartItems.length === 0)
    return (
      <div className="empty-cart">
        <p>Your cart is empty.</p>
        <button
          className="continue-shopping"
          onClick={() => navigate("/products")}
        >
          Continue Shopping
        </button>
      </div>
    );

  /* ================= HELPERS ================= */
  const getProduct = (item) => item.product || item;
  const getQty = (item) => item.quantity || 1;
  const getPrice = (item) => {
    const p = getProduct(item);
    return p.discountPrice ?? p.price ?? 0;
  };

  /* ================= TOTALS ================= */
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + getPrice(item) * getQty(item),
    0
  );
  const totalQty = cartItems.reduce((sum, item) => sum + getQty(item), 0);

  /* ================= CHECKOUT ================= */
  const proceedToCheckout = () => {
    navigate("/checkout", {
      state: { cartItems, total: totalPrice },
    });
  };

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      <div className="cart-layout">
        {/* ================= ITEMS ================= */}
        <div className="cart-items">
          {cartItems.map((item, idx) => {
            const product = getProduct(item);
            const qty = getQty(item);
            const price = getPrice(item);
            const productId = product._id;

            return (
              <div className="cart-item" key={item._id || idx}>
                <img
                  src={product.thumbnail || product.images?.[0]}
                  alt={product.title || "Product"}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/120x120?text=No+Image";
                  }}
                />

                <div className="cart-info">
                  <h3>{product.title}</h3>
                  <p>Price: ₹{price}</p>

                  <div className="qty-control">
                    <button
                      onClick={() => updateQuantity(productId, -1)}
                      disabled={qty <= 1}
                    >
                      -
                    </button>
                    <span>{qty}</span>
                    <button onClick={() => updateQuantity(productId, 1)}>
                      +
                    </button>
                  </div>

                  <p style={{ marginTop: "10px" }}>
                    Subtotal: ₹{price * qty}
                  </p>

                  <button
                    className="remove-btn"
                    onClick={() => removeItem(productId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="cart-summary">
          <h2>Summary</h2>

          <div className="summary-row">
            <span>Total Items:</span>
            <span>{totalQty}</span>
          </div>

          <div className="summary-row">
            <span>Total Price:</span>
            <span>₹{totalPrice}</span>
          </div>

          <button className="checkout-btn" onClick={proceedToCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
