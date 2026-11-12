import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import "../../styles/checkout.css";
import Navbar from "../../components/Navbar";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("name");
  const mobile = localStorage.getItem("mobile");

  /* ===================== HANDLE BOTH FLOWS ===================== */

  const savedData = JSON.parse(localStorage.getItem("checkoutData"));

  const {
    cartItems = [],
    buyNow = savedData?.buyNow || false,
    product = savedData?.product || null,
    quantity = savedData?.quantity || 1
  } = location.state || {};

  /* ===================== FINAL ITEMS ===================== */

  let finalItems = [];

  if (buyNow && product) {
    finalItems = [
      {
        product,
        quantity
      }
    ];
  } else {
    finalItems = cartItems;
  }

  const itemsTotal = finalItems.reduce(
    (sum, item) =>
      sum +
      (item.product?.discountPrice ?? item.product?.price) *
      item.quantity,
    0
  );

  const shippingFee = 50;
  const tax = Number((itemsTotal * 0.18).toFixed(2));

  const grandTotal = Number(
    (itemsTotal + shippingFee + tax).toFixed(2)
  );

  /* ===================== STATE ===================== */

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addingNew, setAddingNew] = useState(false);

  const [newAddress, setNewAddress] = useState({
    label: "",
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false
  });

  const [payment, setPayment] = useState({ method: "COD" });
  const [loadingPayment, setLoadingPayment] = useState(false);

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
    const { name, value, type, checked } = e.target;

    setNewAddress({
      ...newAddress,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const addNewAddress = async () => {
    try {
      if (!newAddress.label || !newAddress.street || !newAddress.city) {
        return alert("Please fill required fields");
      }

      const updatedAddresses = [...addresses, newAddress];

      const res = await api.post("/users/profile", {
        userId,
        addresses: updatedAddresses
      });

      if (res.data?.success) {
        const updated = res.data.data.addresses;

        setAddresses(updated);

        const addedAddress = updated[updated.length - 1];

        setSelectedAddressId(addedAddress._id);

        setAddingNew(false);

        setNewAddress({
          label: "",
          fullName: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
          isDefault: false
        });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add address");
    }
  };

  /* ===================== RAZORPAY ===================== */

  const handleRazorpayPayment = async () => {
    try {
      if (!finalItems.length) {
        return alert("No items to checkout");
      }

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Please refresh.");
        return;
      }

      setLoadingPayment(true);

      const selectedAddr = addresses.find(
        (a) => a?._id === selectedAddressId
      );

      if (!selectedAddr) {
        return alert("Please select an address");
      }

      const shippingAddress = {
        ...selectedAddr,
        fullName: userName || selectedAddr.fullName,
        phone: mobile || selectedAddr.phone
      };

      const defaultPickup = {
        street: "OneCart Central Fulfillment Hub, Sector 18",
        city: "Gurugram",
        state: "Haryana",
        postalCode: "122015",
        country: "India"
      };

      const pickingAddress =
        finalItems?.[0]?.productDetail?.pickUpaddresses ||
        finalItems?.[0]?.product?.detail?.pickUpaddresses ||
        finalItems?.[0]?.pickingAddress ||
        defaultPickup;

      const { data } = await api.post("/payments/create-order", {
        amount: grandTotal
      });

      const order = data.order;

      const options = {
        key: "rzp_live_SUNPDgjWZkSH6U",
        amount: order.amount,
        currency: "INR",
        name: "OneCart",
        description: "Order Payment",
        order_id: order.id,

        handler: async function (response) {
          try {
            const verifyRes = await api.post("/payments/verify-payment", {
              ...response,
              orderData: {
                userId,
                items: finalItems,
                shippingAddress,
                pickingAddress
              }
            });

            if (verifyRes.data.success) {
              alert("Payment successful 🎉");
              localStorage.removeItem("checkoutData");
              navigate("/my-orders");
            } else {
              alert("Payment verification failed");
            }

          } catch (err) {
            console.error(err);
            alert("Verification error");
          }
        },

        prefill: {
          name: userName,
          contact: mobile
        },

        theme: {
          color: "#1d4ed8"
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error(response.error);
        alert("Payment failed ❌");
      });

      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Payment failed");
    } finally {
      setLoadingPayment(false);
    }
  };

  /* ===================== PLACE ORDER ===================== */

  const placeOrder = async () => {
    try {
      const selectedAddr = addresses.find(
        (a) => a?._id === selectedAddressId
      );

      if (!selectedAddr) {
        return alert("Please select a delivery address");
      }

      const shippingAddress = {
        ...selectedAddr,
        fullName: userName || selectedAddr.fullName,
        phone: mobile || selectedAddr.phone
      };

      const defaultPickup = {
        street: "OneCart Central Fulfillment Hub, Sector 18",
        city: "Gurugram",
        state: "Haryana",
        postalCode: "122015",
        country: "India"
      };

      const pickingAddress =
        finalItems?.[0]?.productDetail?.pickUpaddresses ||
        finalItems?.[0]?.product?.detail?.pickUpaddresses ||
        finalItems?.[0]?.pickingAddress ||
        defaultPickup;

      const res = await api.post("/orders/create", {
        items: finalItems,
        shippingAddress,
        pickingAddress,
        payment
      });

      if (res.data?.success) {
        localStorage.removeItem("checkoutData");
        navigate("/my-orders");
      } else {
        alert(res.data?.message || "Failed to place order");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Order placement failed");
    }
  };

  return (
    <div className="checkout-page-wrapper">
      <Navbar />

      <div className="checkout-container">
        {/* Title & Step Header */}
        <div className="checkout-header">
          <h1 className="checkout-title">Secure Checkout</h1>
          <p className="checkout-subtitle">Review your order details and delivery destination</p>
        </div>

        <div className="checkout-layout">
          {/* ================= LEFT COLUMN: ADDRESS & PAYMENT ================= */}
          <div className="checkout-form">
            {/* 1. SHIPPING ADDRESS */}
            <div className="checkout-section-card">
              <div className="section-card-header">
                <div className="section-step-badge">1</div>
                <div>
                  <h3>Delivery Address</h3>
                  <p>Where should we deliver your order?</p>
                </div>
              </div>

              {/* Saved Addresses List */}
              <div className="address-grid-list">
                {addresses.length === 0 && !addingNew && (
                  <div className="no-address-alert">
                    <p>No saved addresses found. Please add a shipping address below to proceed.</p>
                  </div>
                )}

                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <div
                      key={addr._id}
                      className={`address-card ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectAddress(addr._id)}
                    >
                      <div className="address-card-top">
                        <span className="address-radio-pill">
                          <span className={`radio-dot ${isSelected ? "active" : ""}`}></span>
                          <strong>{addr.label || "Address"}</strong>
                        </span>
                        {addr.isDefault && <span className="default-address-chip">Default</span>}
                      </div>

                      <div className="address-card-body">
                        <p className="address-recipient"><strong>{addr.fullName || userName}</strong></p>
                        <p className="address-text">{addr.street}</p>
                        <p className="address-text">{addr.city}, {addr.state} - {addr.postalCode}</p>
                        <p className="address-phone">📞 {addr.phone || mobile || "No phone provided"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Address Form / Toggle Button */}
              {!addingNew ? (
                <button
                  type="button"
                  className="add-address-trigger-btn"
                  onClick={() => setAddingNew(true)}
                >
                  + Add New Delivery Address
                </button>
              ) : (
                <div className="new-address-form-box">
                  <h4>Add New Shipping Address</h4>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Address Label *</label>
                      <input
                        type="text"
                        name="label"
                        placeholder="e.g. Home, Office"
                        value={newAddress.label}
                        onChange={handleNewAddressChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Recipient full name"
                        value={newAddress.fullName}
                        onChange={handleNewAddressChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Mobile Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="10-digit mobile number"
                        value={newAddress.phone}
                        onChange={handleNewAddressChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal PIN Code *</label>
                      <input
                        type="text"
                        name="postalCode"
                        placeholder="6-digit PIN code"
                        value={newAddress.postalCode}
                        onChange={handleNewAddressChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Street Address / Flat / Building *</label>
                    <input
                      type="text"
                      name="street"
                      placeholder="House No, Apartment, Road name, Area"
                      value={newAddress.street}
                      onChange={handleNewAddressChange}
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={handleNewAddressChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={handleNewAddressChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button
                      type="button"
                      className="save-address-btn"
                      onClick={addNewAddress}
                    >
                      Save & Use Address
                    </button>
                    <button
                      type="button"
                      className="cancel-address-btn"
                      onClick={() => setAddingNew(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. PAYMENT METHOD */}
            <div className="checkout-section-card">
              <div className="section-card-header">
                <div className="section-step-badge">2</div>
                <div>
                  <h3>Payment Option</h3>
                  <p>Choose your preferred payment method</p>
                </div>
              </div>

              <div className="payment-options-grid">
                <div
                  className={`payment-option-card ${payment.method === "COD" ? "active" : ""}`}
                  onClick={() => setPayment({ method: "COD" })}
                >
                  <div className="payment-card-left">
                    <span className={`radio-dot ${payment.method === "COD" ? "active" : ""}`}></span>
                    <div>
                      <strong>Cash on Delivery (COD)</strong>
                      <p>Pay cash or UPI upon delivery</p>
                    </div>
                  </div>
                  <span className="payment-badge-chip">Convenient</span>
                </div>

                <div
                  className={`payment-option-card ${payment.method === "RAZORPAY" ? "active" : ""}`}
                  onClick={() => setPayment({ method: "RAZORPAY" })}
                >
                  <div className="payment-card-left">
                    <span className={`radio-dot ${payment.method === "RAZORPAY" ? "active" : ""}`}></span>
                    <div>
                      <strong>Pay Online (Razorpay)</strong>
                      <p>UPI, Credit/Debit Cards, NetBanking, Wallets</p>
                    </div>
                  </div>
                  <span className="payment-badge-chip secure">100% Secure</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: ORDER SUMMARY ================= */}
          <div className="checkout-summary-wrapper">
            <div className="checkout-summary">
              <h3>Order Summary ({finalItems.length} {finalItems.length === 1 ? "item" : "items"})</h3>

              <div className="summary-items-scroll">
                {finalItems.map((item, index) => {
                  const p = item.product || {};
                  const price = p.discountPrice ?? p.price ?? 0;
                  const qty = item.quantity || 1;

                  return (
                    <div key={p._id || index} className="summary-item">
                      <img
                        src={p.thumbnail || p.images?.[0]}
                        alt={p.title || "Product"}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&q=80";
                        }}
                      />
                      <div className="summary-info">
                        <h4>{p.title}</h4>
                        <div className="summary-qty-price">
                          <span>Qty: {qty}</span>
                          <span className="item-price-each">₹{price.toLocaleString()}</span>
                        </div>
                        <p className="subtotal">
                          Subtotal: ₹{(price * qty).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="summary-total">
                <div>
                  <span>Items Subtotal</span>
                  <span>₹{itemsTotal.toLocaleString()}</span>
                </div>

                <div>
                  <span>Express Shipping</span>
                  <span>
                    {shippingFee === 0 ? (
                      <strong style={{ color: "#16a34a" }}>FREE</strong>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div>
                  <span>Estimated Tax (18% GST)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>

                <div className="summary-total-divider"></div>

                <div className="grand-total-row">
                  <strong>Total Payable</strong>
                  <strong className="grand-total-val">₹{grandTotal.toLocaleString()}</strong>
                </div>
              </div>

              <button
                className="checkout-place-order-btn"
                disabled={loadingPayment || !selectedAddressId}
                onClick={() => {
                  if (payment.method === "COD") {
                    placeOrder();
                  } else {
                    handleRazorpayPayment();
                  }
                }}
              >
                {loadingPayment
                  ? "Processing Payment..."
                  : payment.method === "COD"
                  ? "Confirm & Place Order"
                  : `Pay ₹${grandTotal.toLocaleString()} Online`}
              </button>

              {!selectedAddressId && (
                <p className="select-address-warning">⚠️ Please select a delivery address to place your order</p>
              )}

              <div className="checkout-guarantee">
                <div className="guarantee-row">
                  <span>🛡️</span>
                  <span>Guaranteed safe checkout with 256-bit encryption</span>
                </div>
                <div className="guarantee-row">
                  <span>📦</span>
                  <span>Real-time delivery updates via SMS & email</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}