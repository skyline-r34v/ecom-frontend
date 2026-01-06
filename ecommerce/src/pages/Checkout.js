import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import "../styles/checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("name");
  const mobile = localStorage.getItem("mobile");

  const { cartItems = [], total = 0 } = location.state || {};

  /* ===================== STATE ===================== */
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addingNew, setAddingNew] = useState(false);

  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [payment, setPayment] = useState({ method: "COD" });

  /* ===================== FETCH ADDRESSES ===================== */
  useEffect(() => {
    if (!userId) return;

    api
      .post("/users/profile", { userId })
      .then((res) => {
        const user = res.data?.data;
        const userAddresses = Array.isArray(user?.addresses)
          ? user.addresses
          : [];

        setAddresses(userAddresses);

        const defaultAddress =
          userAddresses.find((a) => a?.isDefault) || userAddresses[0];

        if (defaultAddress?._id) {
          setSelectedAddressId(defaultAddress._id);
        }
      })
      .catch(console.error);
  }, [userId]);

  /* ===================== HANDLERS ===================== */
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

      if (res.data?.success && res.data?.address) {
        setAddresses((prev) => [...prev, res.data.address]);
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
    } catch (error) {
      alert("Failed to add address");
    }
  };

  const placeOrder = async () => {
    try {
      const selectedAddr = addresses.find(
        (a) => a?._id === selectedAddressId
      );

      if (!selectedAddr) {
        return alert("Please select an address");
      }

      const shippingAddress = {
        ...selectedAddr,
        fullName: userName || selectedAddr.fullName,
        phone: mobile || selectedAddr.phone,
      };

      const res = await api.post("/orders/create", {
        shippingAddress,
        payment,
        items: cartItems,
        total,
      });

      if (res.data?.success) {
        navigate("/orders");
      }
    } catch (error) {
      console.error(error);
      alert("Order failed");
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      <div className="checkout-layout">
        {/* ================= ORDER SUMMARY ================= */}
        <div className="checkout-summary">
          <h3>Order Summary</h3>

          {cartItems
            .filter((item) => item && item.product)
            .map((item, index) => (
              <div
                key={item.product?._id || index}
                className="summary-item"
              >
                <img
                  src={item.product?.thumbnail}
                  alt={item.product?.title}
                />

                <div className="summary-info">
                  <h4>{item.product?.title}</h4>

                  <p>
                    <b>Brand:</b> {item.product?.brand || "N/A"}
                  </p>
                  <p>
                    <b>Category:</b> {item.product?.category || "N/A"}
                  </p>
                  <p>
                    <b>Price:</b> ₹
                    {item.product?.discountPrice ??
                      item.product?.price}
                  </p>
                  <p>
                    <b>Quantity:</b> {item.quantity}
                  </p>
                  <p className="subtotal">
                    <b>Subtotal:</b> ₹
                    {(item.product?.discountPrice ??
                      item.product?.price) * item.quantity}
                  </p>
                </div>
              </div>
            ))}

          <div className="summary-total">
            <span>Total</span>
            <span>₹ {total}</span>
          </div>
        </div>

        {/* ================= SHIPPING ADDRESS ================= */}
        <div className="checkout-form">
          <h3>Shipping Address</h3>

          {addresses
            .filter((addr) => addr && addr._id)
            .map((addr) => (
              <div
                key={addr._id}
                className={`address-card ${
                  selectedAddressId === addr._id ? "selected" : ""
                }`}
                onClick={() => handleSelectAddress(addr._id)}
              >
                <p>
                  <b>{addr.fullName}</b> - {addr.phone}
                </p>
                <p>{addr.street}</p>
                <p>
                  {addr.city}, {addr.state}, {addr.postalCode}
                </p>
                <p>{addr.country}</p>
              </div>
            ))}

          {/* ================= ADD NEW ADDRESS ================= */}
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
            onChange={(e) =>
              setPayment({ method: e.target.value })
            }
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
