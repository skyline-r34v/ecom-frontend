import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

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

  // ================= FETCH USER PROFILE =================
  useEffect(() => {
    api.post("/users/profile", { userId })
      .then((res) => {
        const user = res.data.data;
        if (user) {
          // Pick default address or first one
          const defaultAddress =
            user.addresses.find((a) => a.isDefault) || user.addresses[0] || {};

          setShippingAddress({
            fullName: user.name || "",
            phone: user.phone || "",
            addressLine1: defaultAddress.street || "",
            addressLine2: "", // optional, could be defaultAddress.label
            city: defaultAddress.city || "",
            state: defaultAddress.state || "",
            postalCode: defaultAddress.postalCode || "",
            country: defaultAddress.country || "India",
          });
        }
      })
      .catch((err) => console.error(err));
  }, [userId]);

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const placeOrder = async () => {
    try {
      const res = await api.post("/orders/create", {
        shippingAddress,
        payment,
      });

      if (res.data.success) navigate("/orders");
    } catch (error) {
      alert(error.response?.data?.message || "Order failed");
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      <div className="checkout-form">
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
  );
}
