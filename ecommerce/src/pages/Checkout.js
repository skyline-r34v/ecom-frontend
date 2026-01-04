import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import "../styles/checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");

  const { cartItems = [], total = 0 } = location.state || {};

  const [addresses, setAddresses] = useState([]); // all saved addresses
  const [selectedAddressId, setSelectedAddressId] = useState(null); // selected address
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [addingNew, setAddingNew] = useState(false);

  const [payment, setPayment] = useState({ method: "COD" });
  const userName=localStorage.getItem("")
  // Fetch user profile and addresses
  useEffect(() => {
    api
      .post("/users/profile", { userId })
      .then((res) => {
        const user = res.data.data;
        if (user) {
          const userAddresses = user.addresses || [];
          setAddresses(userAddresses);

          const defaultAddress = userAddresses.find((a) => a.isDefault) || userAddresses[0];
          if (defaultAddress) setSelectedAddressId(defaultAddress._id);
        }
      })
      .catch(console.error);
  }, [userId]);

  // Handle selecting an existing address
  const handleSelectAddress = (id) => {
    setSelectedAddressId(id);
  };

  // Handle adding a new address
  const handleNewAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const addNewAddress = async () => {
    try {
      const res = await api.post("/users/address/add", { userId, address: newAddress });
      if (res.data.success) {
        const updatedAddresses = [...addresses, res.data.address];
        setAddresses(updatedAddresses);
        setSelectedAddressId(res.data.address._id);
        setAddingNew(false);
        setNewAddress({
          fullName: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
        });
      }
    } catch (error) {
      alert("Failed to add address");
    }
  };

  const placeOrder = async () => {
    try {
      const shippingAddress = addresses.find((a) => a._id === selectedAddressId);
      if (!shippingAddress) return alert("Please select an address");

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

          {/* List of existing addresses */}
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`address-card ${selectedAddressId === addr._id ? "selected" : ""}`}
              onClick={() => handleSelectAddress(addr._id)}
            >
              <p><b>{addr.fullName}</b> - {addr.phone}</p>
              <p>{addr.addressLine1}, {addr.addressLine2}</p>
              <p>{addr.city}, {addr.state}, {addr.postalCode}</p>
              <p>{addr.country}</p>
            </div>
          ))}

          {/* Add new address toggle */}
          {addingNew ? (
            <div className="new-address-form">
              {Object.keys(newAddress).map((key) => (
                <input
                  key={key}
                  name={key}
                  placeholder={key.replace(/([A-Z])/g, " $1")}
                  value={newAddress[key]}
                  onChange={handleNewAddressChange}
                />
              ))}
              <button className="checkout-btn" onClick={addNewAddress}>
                Save Address
              </button>
            </div>
          ) : (
            <button className="checkout-btn" onClick={() => setAddingNew(true)}>
              + Add New Address
            </button>
          )}

          {/* Payment method */}
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
