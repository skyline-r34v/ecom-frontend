import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaTicketAlt,
  FaCreditCard,
  FaShieldAlt,
  FaArrowLeft,
  FaMotorcycle,
  FaHeart,
  FaUtensils
} from "react-icons/fa";
import useFoodDeliveryStore, { COUPONS } from "../../../store/foodDeliveryStore";
import FoodRoleSwitcher from "../../../components/FoodRoleSwitcher";
import Navbar from "../../../components/Navbar";

const DELIVERY_INSTRUCTION_OPTIONS = [
  { id: "door", label: "Leave at door", icon: "🚪" },
  { id: "nobell", label: "Don't ring bell", icon: "🔕" },
  { id: "nocall", label: "Avoid calling", icon: "📞" },
  { id: "guard", label: "Leave with security / guard", icon: "🛡️" },
  { id: "pet", label: "Pet at home", icon: "🐕" }
];

export default function FoodCheckout() {
  const navigate = useNavigate();
  const foodCart = useFoodDeliveryStore((state) => state.foodCart);
  const updateCartItemQty = useFoodDeliveryStore((state) => state.updateCartItemQty);
  const applyCoupon = useFoodDeliveryStore((state) => state.applyCoupon);
  const removeCoupon = useFoodDeliveryStore((state) => state.removeCoupon);
  const placeFoodOrder = useFoodDeliveryStore((state) => state.placeFoodOrder);
  const customerPersonas = useFoodDeliveryStore((state) => state.customerPersonas);
  const selectedCustomerId = useFoodDeliveryStore((state) => state.selectedCustomerId);

  const activeCustomer =
    customerPersonas.find((c) => c.id === selectedCustomerId) || customerPersonas[0];

  // Addresses
  const [customAddress, setCustomAddress] = useState(
    activeCustomer?.savedAddresses?.[0]?.address || "Flat 402, Sea View Apartments, Carter Road, Bandra West, Mumbai - 400050"
  );
  const [customerName, setCustomerName] = useState(activeCustomer?.name || "Rahul Sharma");
  const [customerPhone, setCustomerPhone] = useState(activeCustomer?.phone || "+91 98200 12345");

  // Coupons
  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState(null);

  // Swiggy Delivery Instructions & Tip
  const [selectedInstructions, setSelectedInstructions] = useState(["door"]);
  const [driverTip, setDriverTip] = useState(30);
  const [cookingNote, setCookingNote] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (activeCustomer) {
      setCustomerName(activeCustomer.name);
      setCustomerPhone(activeCustomer.phone);
      if (activeCustomer.savedAddresses?.[0]) {
        setCustomAddress(activeCustomer.savedAddresses[0].address);
      }
    }
  }, [activeCustomer]);

  const itemTotal = foodCart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = foodCart.deliveryFee || 35;
  const taxes = Math.round(itemTotal * 0.05); // 5% GST
  const discount = foodCart.appliedCoupon ? foodCart.appliedCoupon.calculatedDiscount : 0;
  const grandTotal = Math.max(0, itemTotal + deliveryFee + taxes + driverTip - discount);

  const toggleInstruction = (id) => {
    if (selectedInstructions.includes(id)) {
      setSelectedInstructions(selectedInstructions.filter((i) => i !== id));
    } else {
      setSelectedInstructions([...selectedInstructions, id]);
    }
  };

  const handleApplyCoupon = (code) => {
    const res = applyCoupon(code || couponInput);
    setCouponFeedback(res);
  };

  const handlePlaceOrder = () => {
    if (foodCart.items.length === 0) return;
    setIsPlacingOrder(true);

    setTimeout(() => {
      const order = placeFoodOrder({
        customerName,
        customerPhone,
        deliveryAddress: customAddress,
        paymentMethod,
        driverTip,
        deliveryInstructions: selectedInstructions.map(
          (id) => DELIVERY_INSTRUCTION_OPTIONS.find((opt) => opt.id === id)?.label || id
        ),
        cookingInstructions: cookingNote,
        customerLat: 19.0689,
        customerLng: 72.8210
      });

      setIsPlacingOrder(false);
      if (order) {
        navigate(`/food/track/${order.id}`);
      }
    }, 600);
  };

  if (foodCart.items.length === 0) {
    return (
      <div className="food-portal-container">
        <FoodRoleSwitcher />
        <Navbar />
        <div style={{ padding: "60px 20px", textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
          <h2>Your Food Cart is Empty</h2>
          <p style={{ color: "#64748b", margin: "12px 0 24px" }}>
            Explore delicious dishes from top restaurants and add your favorites to cart!
          </p>
          <button
            onClick={() => navigate("/food")}
            style={{
              background: "var(--food-primary)",
              color: "#fff",
              border: "none",
              padding: "12px 28px",
              borderRadius: "30px",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer"
            }}
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="food-portal-container">
      <FoodRoleSwitcher />
      <Navbar />

      <main className="food-main-layout">
        <button
          onClick={() => navigate("/food")}
          style={{
            background: "transparent",
            border: "none",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: "16px"
          }}
        >
          <FaArrowLeft /> Back to Menu
        </button>

        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "24px" }}>Checkout & Place Order</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* 1. Delivery Address Card */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "var(--food-shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <FaMapMarkerAlt color="#ff5200" size={18} />
                <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>Delivery Address</h3>
                <span style={{ fontSize: "11px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px", color: "#64748b", marginLeft: "auto" }}>
                  Logged in as {customerName}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "4px" }}>Recipient Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "4px" }}>Contact Phone</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "4px" }}>Street Address & Apartment</label>
                <textarea
                  rows="2"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", resize: "vertical" }}
                />
              </div>
            </div>

            {/* 2. Swiggy-Style Delivery Instructions */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "var(--food-shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <FaMotorcycle color="#ff5200" size={18} />
                <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>Delivery Instructions for Driver</h3>
              </div>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 14px" }}>
                Select preferences for a seamless doorstep delivery:
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {DELIVERY_INSTRUCTION_OPTIONS.map((opt) => {
                  const isSelected = selectedInstructions.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleInstruction(opt.id)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "20px",
                        border: isSelected ? "1.5px solid #ff5200" : "1px solid #cbd5e1",
                        background: isSelected ? "#fff3ed" : "#fff",
                        color: isSelected ? "#ea580c" : "#334155",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.15s"
                      }}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Items in Order & Chef Notes */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "var(--food-shadow-sm)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px" }}>
                Items from {foodCart.restaurantName} ({foodCart.items.length})
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px" }}>
                {foodCart.items.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className={item.isVeg ? "veg-indicator" : "nonveg-indicator"} />
                      <div>
                        <strong style={{ fontSize: "15px", display: "block" }}>{item.name}</strong>
                        <span style={{ fontSize: "13px", color: "#64748b" }}>₹{item.price} each</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div className="add-qty-pill" style={{ width: "80px", height: "30px" }}>
                        <button onClick={() => updateCartItemQty(item.id, -1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateCartItemQty(item.id, 1)}>+</button>
                      </div>
                      <strong style={{ fontSize: "15px", width: "70px", textAlign: "right" }}>₹{item.price * item.quantity}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chef cooking note */}
              <div>
                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <FaUtensils size={12} /> Cooking / Kitchen Request:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please make biryani spicy, don't include disposable cutlery"
                  value={cookingNote}
                  onChange={(e) => setCookingNote(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* 4. Payment Method */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "var(--food-shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <FaCreditCard color="#ff5200" size={18} />
                <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>Select Payment Method</h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <label
                  style={{
                    border: paymentMethod === "UPI" ? "2px solid var(--food-primary)" : "1px solid #cbd5e1",
                    background: paymentMethod === "UPI" ? "var(--food-primary-light)" : "#fff",
                    borderRadius: "10px",
                    padding: "14px",
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === "UPI"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ display: "none" }}
                  />
                  <div style={{ fontWeight: 800, fontSize: "14px", color: paymentMethod === "UPI" ? "var(--food-primary)" : "#1e293b" }}>
                    ⚡ Instant UPI
                  </div>
                  <small style={{ fontSize: "11px", color: "#64748b" }}>GPay / PhonePe / Paytm</small>
                </label>

                <label
                  style={{
                    border: paymentMethod === "CARD" ? "2px solid var(--food-primary)" : "1px solid #cbd5e1",
                    background: paymentMethod === "CARD" ? "var(--food-primary-light)" : "#fff",
                    borderRadius: "10px",
                    padding: "14px",
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ display: "none" }}
                  />
                  <div style={{ fontWeight: 800, fontSize: "14px", color: paymentMethod === "CARD" ? "var(--food-primary)" : "#1e293b" }}>
                    💳 Card
                  </div>
                  <small style={{ fontSize: "11px", color: "#64748b" }}>Visa / Mastercard</small>
                </label>

                <label
                  style={{
                    border: paymentMethod === "COD" ? "2px solid var(--food-primary)" : "1px solid #cbd5e1",
                    background: paymentMethod === "COD" ? "var(--food-primary-light)" : "#fff",
                    borderRadius: "10px",
                    padding: "14px",
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ display: "none" }}
                  />
                  <div style={{ fontWeight: 800, fontSize: "14px", color: paymentMethod === "COD" ? "var(--food-primary)" : "#1e293b" }}>
                    💵 Pay on Delivery
                  </div>
                  <small style={{ fontSize: "11px", color: "#64748b" }}>Cash / UPI at Doorstep</small>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Bill Summary, Tip, Coupons & Place Order */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Swiggy Tip Delivery Hero Card */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "var(--food-shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <FaHeart color="#ef4444" size={16} />
                <strong style={{ fontSize: "15px" }}>Tip Your Delivery Partner</strong>
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 12px" }}>
                100% of your tip goes directly to your delivery partner.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[
                  { amount: 20, label: "☕ ₹20" },
                  { amount: 30, label: "🍪 ₹30" },
                  { amount: 50, label: "⭐ ₹50" },
                  { amount: 0, label: "None" }
                ].map((t) => (
                  <button
                    key={t.amount}
                    type="button"
                    onClick={() => setDriverTip(t.amount)}
                    style={{
                      padding: "8px 4px",
                      borderRadius: "10px",
                      border: driverTip === t.amount ? "2px solid #ef4444" : "1px solid #cbd5e1",
                      background: driverTip === t.amount ? "#fef2f2" : "#fff",
                      color: driverTip === t.amount ? "#dc2626" : "#334155",
                      fontWeight: 800,
                      fontSize: "13px",
                      cursor: "pointer",
                      textAlign: "center"
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coupons Card */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "var(--food-shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <FaTicketAlt color="#ff5200" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>Apply Coupon</h3>
              </div>

              {foodCart.appliedCoupon ? (
                <div style={{ background: "#f0fdf4", border: "1px dashed #16a34a", padding: "12px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ color: "#166534", fontSize: "14px" }}>{foodCart.appliedCoupon.code} Applied!</strong>
                    <div style={{ fontSize: "12px", color: "#15803d" }}>You saved ₹{foodCart.appliedCoupon.calculatedDiscount}</div>
                  </div>
                  <button onClick={removeCoupon} style={{ background: "transparent", border: "none", color: "#dc2626", fontWeight: 700, cursor: "pointer" }}>
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", textTransform: "uppercase", fontSize: "13px" }}
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      style={{ background: "var(--food-primary)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                    >
                      Apply
                    </button>
                  </div>

                  {couponFeedback && (
                    <div style={{ fontSize: "12px", color: couponFeedback.success ? "#16a34a" : "#dc2626", marginBottom: "8px" }}>
                      {couponFeedback.message}
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {COUPONS.map((c) => (
                      <div
                        key={c.code}
                        onClick={() => handleApplyCoupon(c.code)}
                        style={{ padding: "8px 10px", borderRadius: "8px", border: "1px dashed #cbd5e1", background: "#f8fafc", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      >
                        <div>
                          <strong style={{ fontSize: "12px", color: "var(--food-primary)" }}>{c.code}</strong>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{c.description}</div>
                        </div>
                        <span style={{ fontSize: "11px", color: "#ff5200", fontWeight: 700 }}>APPLY</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Bill Details */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "var(--food-shadow-sm)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px" }}>Bill Details</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                  <span>Item Total</span>
                  <span>₹{itemTotal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                  <span>Delivery Partner Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                  <span>Govt. Taxes & Restaurant GST (5%)</span>
                  <span>₹{taxes}</span>
                </div>
                {driverTip > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#dc2626" }}>
                    <span>Delivery Partner Tip ❤️</span>
                    <span>₹{driverTip}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a", fontWeight: 700 }}>
                    <span>Coupon Discount</span>
                    <span>−₹{discount}</span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", marginBottom: "20px" }}>
                <strong style={{ fontSize: "18px" }}>To Pay</strong>
                <strong style={{ fontSize: "22px", color: "var(--food-primary)" }}>₹{grandTotal}</strong>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                style={{
                  width: "100%",
                  background: isPlacingOrder ? "#94a3b8" : "var(--food-primary)",
                  color: "#fff",
                  border: "none",
                  padding: "16px",
                  borderRadius: "12px",
                  fontWeight: 900,
                  fontSize: "16px",
                  cursor: isPlacingOrder ? "not-allowed" : "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 6px 20px rgba(255, 82, 0, 0.35)"
                }}
              >
                <FaShieldAlt />
                <span>{isPlacingOrder ? "Placing Order..." : `Pay & Place Order • ₹${grandTotal}`}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
