import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/cart.css";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ================= FETCH CART ================= */
  const fetchCart = async () => {
    try {
      const res = await api.post("/users/cart", {});
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (error) {
      console.error("Fetch cart error:", error);
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

      if (res.data.success) {
        setCart(res.data.cart);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Update cart error:", error);
      alert("Unable to update cart");
    }
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = async (productId) => {
    try {
      const res = await api.post("/users/cart", {
        productId,
        quantity: -999, // backend removes item
      });

      if (res.data.success) {
        setCart(res.data.cart);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Remove item error:", error);
      alert("Unable to remove item");
    }
  };

  if (loading) return <p className="empty-cart">Loading cart...</p>;

  if (!cart || cart.items.length === 0)
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

  /* ================= TOTAL PRICE ================= */
  const totalPrice = cart.items.reduce(
    (total, item) =>
      total +
      (item.product.discountPrice ?? item.product.price) *
        item.quantity,
    0
  );

  /* ================= TOTAL QUANTITY ================= */
  const totalQuantity = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  /* ================= CHECKOUT ================= */
  const proceedToCheckout = () => {
    navigate("/checkout", {
      state: {
        cartItems: cart.items,
        total: totalPrice,
      },
    });
  };

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      <div className="cart-layout">
        {/* ================= ITEMS ================= */}
        <div className="cart-items">
          {cart.items.map((item) => (
            <div className="cart-item" key={item._id}>
              <img
                src={item.product.thumbnail}
                alt={item.product.title}
              />

              <div className="cart-info">
                <h3>{item.product.title}</h3>
                <p>
                  Price: ₹
                  {item.product.discountPrice ??
                    item.product.price}
                </p>

                {/* Quantity Controls */}
                <div className="qty-control">
                  <button
                    onClick={() =>
                      updateQuantity(item.product._id, -1)
                    }
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(item.product._id, 1)
                    }
                  >
                    +
                  </button>
                </div>

                <p style={{ marginTop: "10px" }}>
                  Subtotal: ₹
                  {(item.product.discountPrice ??
                    item.product.price) *
                    item.quantity}
                </p>

                <button
                  className="remove-btn"
                  onClick={() =>
                    removeItem(item.product._id)
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="cart-summary">
          <h2>Summary</h2>

          <div className="summary-row">
            <span>Total Items:</span>
            <span>{totalQuantity}</span>
          </div>

          <div className="summary-row">
            <span>Total Price:</span>
            <span>₹{totalPrice}</span>
          </div>

          <button
            className="checkout-btn"
            onClick={proceedToCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
