import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaCheck,
  FaPhoneAlt,
  FaStar,
  FaMotorcycle,
  FaStore,
  FaHome,
  FaArrowLeft,
  FaCopy,
  FaComments,
  FaPaperPlane
} from "react-icons/fa";
import useFoodDeliveryStore from "../../../store/foodDeliveryStore";
import FoodRoleSwitcher from "../../../components/FoodRoleSwitcher";
import LiveMap from "../Components/LiveMap";
import Navbar from "../../../components/Navbar";

const STATUS_STEPS = [
  { key: "PLACED", label: "Order Placed", desc: "Your order has been sent to the kitchen" },
  { key: "RESTAURANT_ACCEPTED", label: "Restaurant Accepted", desc: "Chef confirmed the order" },
  { key: "FOOD_PREPARING", label: "Food Being Prepared", desc: "Fresh ingredients on the stove" },
  { key: "READY_FOR_PICKUP", label: "Food Ready", desc: "Packed & awaiting driver pickup" },
  { key: "DELIVERY_PARTNER_ASSIGNED", label: "Delivery Partner Assigned", desc: "Driver heading to restaurant" },
  { key: "PICKED_UP", label: "Picked Up", desc: "Driver collected the food" },
  { key: "ON_THE_WAY", label: "On the Way", desc: "Driver navigating to your doorstep" },
  { key: "DELIVERED", label: "Delivered", desc: "Food safely delivered. Enjoy!" }
];

export default function CustomerOrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orders = useFoodDeliveryStore((state) => state.orders);
  const submitOrderRating = useFoodDeliveryStore((state) => state.submitOrderRating);
  const orderChats = useFoodDeliveryStore((state) => state.orderChats);
  const sendOrderChatMessage = useFoodDeliveryStore((state) => state.sendOrderChatMessage);

  const order = orders.find((o) => o.id === id) || orders[0];

  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [restStars, setRestStars] = useState(5);
  const [driverStars, setDriverStars] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [copiedOTP, setCopiedOTP] = useState(false);

  // Chat State
  const [showChatModal, setShowChatModal] = useState(false);
  const [customerMsgText, setCustomerMsgText] = useState("");

  if (!order) {
    return (
      <div className="food-portal-container">
        <FoodRoleSwitcher />
        <Navbar />
        <div style={{ padding: "60px 20px", textAlign: "center" }}>
          <h2>Order Not Found</h2>
          <button onClick={() => navigate("/food")} className="btn-driver-accept" style={{ marginTop: "20px" }}>
            ← Back to Food Home
          </button>
        </div>
      </div>
    );
  }

  const getStepIndex = (status) => {
    switch (status) {
      case "PLACED": return 0;
      case "RESTAURANT_ACCEPTED": return 1;
      case "FOOD_PREPARING": return 2;
      case "READY_FOR_PICKUP": return 3;
      case "DELIVERY_PARTNER_ASSIGNED":
      case "DRIVER_AT_RESTAURANT": return 4;
      case "PICKED_UP": return 5;
      case "ON_THE_WAY":
      case "ARRIVED_AT_CUSTOMER": return 6;
      case "DELIVERED": return 7;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.orderStatus);

  const handleCopyOTP = () => {
    navigator.clipboard.writeText(order.deliveryOTP);
    setCopiedOTP(true);
    setTimeout(() => setCopiedOTP(false), 2000);
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    submitOrderRating(order.id, {
      restaurantStars: restStars,
      driverStars: driverStars,
      feedback
    });
    setRatingModalOpen(false);
  };

  const handleSendCustomerChat = (textToSend) => {
    const message = textToSend || customerMsgText;
    if (!message.trim()) return;
    sendOrderChatMessage(order.id, "CUSTOMER", message.trim());
    setCustomerMsgText("");
  };

  const chats = orderChats[order.id] || [];

  return (
    <div className="food-portal-container">
      <FoodRoleSwitcher />
      <Navbar />

      <main className="tracking-page-container">
        {/* Navigation & Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
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
              cursor: "pointer"
            }}
          >
            <FaArrowLeft /> Back to Food
          </button>

          <span style={{ fontSize: "13px", color: "#64748b" }}>
            Order ID: <strong>#{order.id}</strong> • Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Top Header Card with ETA & Delivery OTP */}
        <div className="tracking-header-card">
          <div className="tracking-status-title">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="live-pulse-dot" />
              <span style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", color: "var(--food-primary)" }}>
                {order.orderStatus.replace(/_/g, " ")}
              </span>
            </div>
            <h1>
              {order.orderStatus === "DELIVERED" ? (
                "Order Delivered! 🎉"
              ) : (
                <>
                  Estimated Delivery: <span className="eta-highlight">{order.prepTimeEst || "25-30 mins"}</span>
                </>
              )}
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              {order.restaurantName} → {order.deliveryAddress.split(",")[0]}
            </p>
          </div>

          {/* Secure 4-Digit Delivery OTP Banner */}
          {order.orderStatus !== "DELIVERED" && order.orderStatus !== "RESTAURANT_REJECTED" && (
            <div className="delivery-otp-box">
              <span>Your Delivery OTP</span>
              <strong>{order.deliveryOTP}</strong>
              <div style={{ marginTop: "4px" }}>
                <button
                  onClick={handleCopyOTP}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#78350f",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <FaCopy size={10} /> {copiedOTP ? "Copied!" : "Copy OTP"}
                </button>
              </div>
              <small style={{ fontSize: "10px", color: "#92400e", display: "block" }}>
                Share with delivery partner at doorstep
              </small>
            </div>
          )}
        </div>

        {/* Map & Live Details Grid */}
        <div className="tracking-grid-split">
          {/* Interactive Live Map */}
          <div className="tracking-map-container">
            <LiveMap order={order} mode="ORDER_TRACK" height="100%" />
          </div>

          {/* Right Column: Driver Info & Order Summary */}
          <div className="tracking-details-card">
            {/* Delivery Partner Profile Card */}
            {order.deliveryPartnerId ? (
              <div className="driver-partner-card">
                <img
                  src={order.driverAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300"}
                  alt={order.driverName}
                  className="driver-avatar"
                />
                <div className="driver-info-body">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <h4>{order.driverName}</h4>
                    <span style={{ fontSize: "11px", background: "#fef3c7", color: "#b45309", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                      ⭐ {order.driverRating || 4.9}
                    </span>
                  </div>
                  <p style={{ margin: "2px 0", fontSize: "12px", color: "#64748b" }}>
                    🛵 {order.driverVehicle || "Motorcycle"} ({order.driverVehicleNum || "MH-02-EE-4921"})
                  </p>
                  <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700 }}>
                    ● On route with your food
                  </span>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setShowChatModal(true)}
                    style={{
                      background: "#3b82f6",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                    title="Chat with Driver"
                  >
                    <FaComments size={16} />
                  </button>

                  <a href={`tel:${order.driverPhone}`} className="driver-call-btn" title="Call Delivery Partner">
                    <FaPhoneAlt size={16} />
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px dashed #cbd5e1", textAlign: "center" }}>
                <FaMotorcycle size={28} color="#94a3b8" />
                <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                  Assigning nearest delivery partner shortly...
                </p>
              </div>
            )}

            {/* Restaurant & Customer Address Route Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <FaStore color="#ff5200" size={16} style={{ marginTop: "2px" }} />
                <div>
                  <strong>{order.restaurantName}</strong>
                  <div style={{ color: "#64748b", fontSize: "12px" }}>{order.restaurantAddress}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <FaHome color="#3b82f6" size={16} style={{ marginTop: "2px" }} />
                <div>
                  <strong>Delivery to {order.customerName}</strong>
                  <div style={{ color: "#64748b", fontSize: "12px" }}>{order.deliveryAddress}</div>
                </div>
              </div>
            </div>

            {/* Ordered Items List */}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
              <strong style={{ fontSize: "14px", display: "block", marginBottom: "10px" }}>
                Order Items ({order.items.length})
              </strong>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {order.items.map((i, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span>
                      {i.quantity} × {i.name}
                    </span>
                    <strong>₹{i.price * i.quantity}</strong>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "12px", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 800 }}>
                <span>Total Paid ({order.paymentMethod})</span>
                <span style={{ color: "var(--food-primary)" }}>₹{order.grandTotal}</span>
              </div>
            </div>

            {/* Post-Delivery Rating CTA */}
            {order.orderStatus === "DELIVERED" && !order.rating && (
              <button
                onClick={() => setRatingModalOpen(true)}
                style={{
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <FaStar /> Rate Your Delivery Experience
              </button>
            )}

            {order.rating && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "10px", fontSize: "12px" }}>
                <strong style={{ color: "#166534", display: "block", marginBottom: "2px" }}>
                  ⭐ You rated this order {order.rating.restaurantStars}/5 Stars
                </strong>
                <span style={{ color: "#15803d" }}>"{order.rating.feedback}"</span>
              </div>
            )}
          </div>
        </div>

        {/* Timeline of Order Progress */}
        <div className="order-timeline-card">
          <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "8px" }}>Order Progress Timeline</h3>
          <div className="timeline-stepper">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isActive = idx === currentStepIdx;
              return (
                <div
                  key={step.key}
                  className={`timeline-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                >
                  <div className="step-icon-circle">
                    {isCompleted ? <FaCheck size={12} /> : idx + 1}
                  </div>
                  <div className="step-content">
                    <h5>{step.label}</h5>
                    <p>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* CUSTOMER LIVE CHAT MODAL */}
      {showChatModal && order.deliveryPartnerId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px"
          }}
        >
          <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", maxWidth: "420px", width: "100%", height: "480px", display: "flex", flexDirection: "column", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img src={order.driverAvatar} alt={order.driverName} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <strong style={{ fontSize: "14px", display: "block" }}>{order.driverName}</strong>
                  <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700 }}>Delivery Partner</span>
                </div>
              </div>
              <button onClick={() => setShowChatModal(false)} style={{ background: "transparent", border: "none", fontSize: "16px", cursor: "pointer" }}>✕</button>
            </div>

            {/* Quick canned replies */}
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "6px", marginBottom: "8px" }}>
              {["Please ring the doorbell", "Leave at security desk", "Gate code is #104", "Call when arrived"].map((txt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendCustomerChat(txt)}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    color: "#334155",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                    cursor: "pointer"
                  }}
                >
                  {txt}
                </button>
              ))}
            </div>

            {/* Messages body */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px", paddingRight: "4px" }}>
              {chats.length === 0 ? (
                <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", marginTop: "60px" }}>
                  No messages yet. Send delivery instructions to {order.driverName}!
                </p>
              ) : (
                chats.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.sender === "CUSTOMER" ? "flex-end" : "flex-start",
                      background: msg.sender === "CUSTOMER" ? "var(--food-primary)" : "#f1f5f9",
                      color: msg.sender === "CUSTOMER" ? "#fff" : "#1e293b",
                      padding: "8px 14px",
                      borderRadius: "14px",
                      maxWidth: "75%",
                      fontSize: "13px"
                    }}
                  >
                    <div>{msg.text}</div>
                    <small style={{ fontSize: "9px", opacity: 0.8, display: "block", textAlign: "right", marginTop: "2px" }}>{msg.time}</small>
                  </div>
                ))
              )}
            </div>

            {/* Input form */}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Type instruction..."
                value={customerMsgText}
                onChange={(e) => setCustomerMsgText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSendCustomerChat(); }}
                style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px" }}
              />
              <button
                onClick={() => handleSendCustomerChat()}
                style={{ background: "var(--food-primary)", border: "none", color: "#fff", padding: "10px 16px", borderRadius: "8px", cursor: "pointer" }}
              >
                <FaPaperPlane size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating & Review Modal */}
      {ratingModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px"
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 16px" }}>Rate Your Order Experience</h3>

            <form onSubmit={handleRatingSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                  Food Quality from {order.restaurantName}
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={24}
                      color={star <= restStars ? "#f59e0b" : "#cbd5e1"}
                      style={{ cursor: "pointer" }}
                      onClick={() => setRestStars(star)}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                  Delivery by {order.driverName || "Partner"}
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={24}
                      color={star <= driverStars ? "#f59e0b" : "#cbd5e1"}
                      style={{ cursor: "pointer" }}
                      onClick={() => setDriverStars(star)}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                  Write a quick review
                </label>
                <textarea
                  rows="3"
                  placeholder="How was the food and delivery speed?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setRatingModalOpen(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: "12px", borderRadius: "10px", border: "none", background: "var(--food-primary)", color: "#fff", fontWeight: 800, cursor: "pointer" }}
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
