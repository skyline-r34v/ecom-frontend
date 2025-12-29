import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ================= FETCH CART =================
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

  // ================= UPDATE QUANTITY =================
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

  if (loading) return <p>Loading cart...</p>;
  if (!cart || cart.items.length === 0)
    return <p>Your cart is empty.</p>;

  // ================= TOTAL PRICE =================
  const totalPrice = cart.items.reduce(
    (total, item) =>
      total +
      (item.product.discountPrice ?? item.product.price) *
        item.quantity,
    0
  );

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>

      {cart.items.map((item) => (
        <div
          key={item._id}
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          {/* PRODUCT IMAGE */}
          <img
            src={item.product.thumbnail}
            alt={item.product.title}
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />

          {/* PRODUCT INFO */}
          <div style={{ flex: 1 }}>
            <h3>{item.product.title}</h3>
            <p>
              Price: ₹
              {item.product.discountPrice ??
                item.product.price}
            </p>

            {/* QUANTITY CONTROLS */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button onClick={() => updateQuantity(item.product._id, -1)}>
                -
              </button>

              <span>{item.quantity}</span>

              <button onClick={() => updateQuantity(item.product._id, 1)}>
                +
              </button>
            </div>

            <p style={{ marginTop: "10px" }}>
              Subtotal: ₹
              {(item.product.discountPrice ??
                item.product.price) * item.quantity}
            </p>
          </div>
        </div>
      ))}

      {/* TOTAL */}
      <h3>Total Amount: ₹{totalPrice}</h3>

      <button
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/checkout")}   // ✅ FIXED
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default Cart;
