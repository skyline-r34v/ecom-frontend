import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import "../styles/checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = localStorage.getItem("userId");

  const { cartItems = [], total = 0 } = location.state || {};

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [payment, setPayment] = useState({ method: "COD" });

  useEffect(() => {
    api
      .post("/users/profile", { userId })
      .then((res) => {
        const user = res.data.data;
        if (user) {
          const defaultAddress =
            user.addresses.find((a) => a.isDefault) || user.addresses[0] || {};
          setShippingAddress({
            fullName: user.name || "",
            phone: user.phone || "",
            addressLine1: defaultAddress.street || "",
            addressLine2: "",
            city: defaultAddress.city || "",
            state: defaultAddress.state || "",
            postalCode: defaultAddress.postalCode || "",
            country: defaultAddress.country || "India",
          });
        }
      })
      .catch(console.error);
  }, [userId]);

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const placeOrder = async () => {
    try {
      const res = await api.post("/orders/create", {
        shippingAddress,
        payment,
        items: cartItems,
        total,
      });
      if (res.data.success) navigate("/orders");
    } catch (error) {
      alert("Order failed");
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      <div className="checkout-layout">
        {/* ================= PRODUCT SUMMARY ================= */}
        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {cartItems.map((item) => (
            <div key={item._id} className="summary-item">
              <img src={item.product.thumbnail} alt={item.product.title} />
              <div className="summary-info">
                <h4>{item.product.title}</h4>
                <p><b>Brand:</b> {item.product.brand || "N/A"}</p>
                <p><b>Category:</b> {item.product.category || "N/A"}</p>
                <p><b>Price:</b> ₹{item.product.discountPrice ?? item.product.price}</p>
                <p><b>Quantity:</b> {item.quantity}</p>
                <p className="subtotal">
                  <b>Subtotal:</b> ₹{(item.product.discountPrice ?? item.product.price) * item.quantity}
                </p>
              </div>
            </div>
          ))}
          <div className="summary-total">
            <span>Total</span>
            <span>₹ {total}</span>
          </div>
        </div>

        {/* ================= SHIPPING FORM ================= */}
        <div className="checkout-form">
          <h3>Shipping Address</h3>
          {Object.keys(shippingAddress).map((key) => (
            <input
              key={key}
              name={key}
              placeholder={key.replace(/([A-Z])/g, " $1")}
              value={shippingAddress[key]}
              onChange={handleChange}
            />
          ))}
          <select
            className="checkout-select"
            value={payment.method}
            onChange={(e) => setPayment({ method: e.target.value })}
          >
            <option value="COD">Cash on Delivery</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="WALLET">Wallet</option>
          </select>
          <button className="checkout-btn" onClick={placeOrder}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
