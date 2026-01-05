import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import "../styles/checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");

  const { cartItems = [], total = 0 } = location.state || {};

  /* ================= PRICING ================= */
  const SHIPPING_FEE = 50;
  const GST_RATE = 0.18;

  const gstAmount = Math.round(total * GST_RATE);
  const grandTotal = total + SHIPPING_FEE + gstAmount;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
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

  const userName = localStorage.getItem("name");
  const mobile = localStorage.getItem("mobile");

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    api
      .post("/users/profile", { userId })
      .then((res) => {
        const user = res.data.data;
        if (user) {
          const userAddresses = user.addresses || [];
          setAddresses(userAddresses);

          const defaultAddress =
            userAddresses.find((a) => a.isDefault) || userAddresses[0];
          if (defaultAddress) setSelectedAddressId(defaultAddress._id);
        }
      })
      .catch(console.error);
  }, [userId]);

  const handleSelectAddress = (id) => {
    setSelectedAddressId(id);
  };

  const handleNewAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const addNewAddress = async () => {
    try {
      const res = await api.post("/users/profile", {
        userId,
        address: newAddress,
      });

      if (res.data.success) {
        const updated = [...addresses, res.data.address];
        setAddresses(updated);
        setSelectedAddressId(res.data.address._id);
        setAddingNew(false);
        setNewAddress({
          fullName: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
        });
      }
    } catch {
      alert("Failed to add address");
    }
  };

  /* ================= PLACE ORDER ================= */
  const placeOrder = async () => {
    try {
      const selectedAddr = addresses.find(
        (a) => a._id === selectedAddressId
      );

      if (!selectedAddr) {
        return alert("Please select an address");
      }

      const shippingAddress = {
        ...selectedAddr,
        fullName: userName,
        phone: mobile,
      };

      const res = await api.post("/orders/create", {
        shippingAddress,
        payment,
        items: cartItems,
        subtotal: total,
        shippingFee: SHIPPING_FEE,
        gst: gstAmount,
        total: grandTotal,
      });

      if (res.data.success) {
        navigate("/orders");
      }
    } catch (error) {
      console.error(error);
      alert("Order failed");
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      <div className="checkout-layout">
        {/* ================= ORDER SUMMARY ================= */}
        <div className="checkout-summary">
          <h3>Order Summary</h3>

          {cartItems.map((item) => (
            <div key={item._id} className="summary-item">
              <img
                src={item.product.thumbnail}
                alt={item.product.title}
              />
              <div className="summary-info">
                <h4>{item.product.title}</h4>
                <p><b>Brand:</b> {item.product.brand || "N/A"}</p>
                <p><b>Price:</b> ₹{item.product.discountPrice ?? item.product.price}</p>
                <p><b>Qty:</b> {item.quantity}</p>
                <p className="subtotal">
                  <b>Subtotal:</b> ₹
                  {(item.product.discountPrice ?? item.product.price) *
                    item.quantity}
                </p>
              </div>
            </div>
          ))}

          {/* ================= PRICE DETAILS ================= */}
          <div className="price-breakup">
            <div>
              <span>Subtotal</span>
              <span>₹ {total}</span>
            </div>
            <div>
              <span>Shipping Fee</span>
              <span>₹ {SHIPPING_FEE}</span>
            </div>
            <div>
              <span>GST (18%)</span>
              <span>₹ {gstAmount}</span>
            </div>
            <hr />
            <div className="grand-total">
              <span>Grand Total</span>
              <span>₹ {grandTotal}</span>
            </div>
          </div>
        </div>

        {/* ================= SHIPPING ================= */}
        <div className="checkout-form">
          <h3>Shipping Address</h3>

          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`address-card ${
                selectedAddressId === addr._id ? "selected" : ""
              }`}
              onClick={() => handleSelectAddress(addr._id)}
            >
              <p><b>{addr.fullName}</b> - {addr.phone}</p>
              <p>{addr.street}</p>
              <p>{addr.city}, {addr.state} {addr.postalCode}</p>
              <p>{addr.country}</p>
            </div>
          ))}

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
            <button
              className="checkout-btn"
              onClick={() => setAddingNew(true)}
            >
              + Add New Address
            </button>
          )}

          {/* ================= PAYMENT ================= */}
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
