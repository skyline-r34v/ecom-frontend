import React, { useState, useEffect } from "react";
import {
  FaMotorcycle,
  FaHome,
  FaBoxOpen,
  FaWallet,
  FaUser,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaStore,
  FaMoneyBillWave,
  FaComments,
  FaPaperPlane,
  FaUserPlus
} from "react-icons/fa";
import useFoodDeliveryStore from "../../../store/foodDeliveryStore";
import FoodRoleSwitcher from "../../../components/FoodRoleSwitcher";
import LiveMap from "../Components/LiveMap";

export default function DriverApp() {
  const drivers = useFoodDeliveryStore((state) => state.drivers);
  const selectedDriverId = useFoodDeliveryStore((state) => state.selectedDriverId);
  const setSelectedDriver = useFoodDeliveryStore((state) => state.setSelectedDriver);
  const orders = useFoodDeliveryStore((state) => state.orders);
  const activeDriverRequests = useFoodDeliveryStore((state) => state.activeDriverRequests);
  const withdrawals = useFoodDeliveryStore((state) => state.withdrawals);
  const orderChats = useFoodDeliveryStore((state) => state.orderChats);

  // Store actions
  const toggleDriverOnline = useFoodDeliveryStore((state) => state.toggleDriverOnline);
  const driverRespondRequest = useFoodDeliveryStore((state) => state.driverRespondRequest);
  const driverArrivedAtRestaurant = useFoodDeliveryStore((state) => state.driverArrivedAtRestaurant);
  const verifyPickupOTP = useFoodDeliveryStore((state) => state.verifyPickupOTP);
  const driverArrivedAtCustomer = useFoodDeliveryStore((state) => state.driverArrivedAtCustomer);
  const verifyDeliveryOTP = useFoodDeliveryStore((state) => state.verifyDeliveryOTP);
  const requestDriverWithdrawal = useFoodDeliveryStore((state) => state.requestDriverWithdrawal);
  const registerNewDriver = useFoodDeliveryStore((state) => state.registerNewDriver);
  const sendOrderChatMessage = useFoodDeliveryStore((state) => state.sendOrderChatMessage);

  const currentDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];

  const [activeTab, setActiveTab] = useState("HOME"); // "HOME" | "DELIVERIES" | "EARNINGS" | "WALLET" | "PROFILE"
  const [pickupOTPInput, setPickupOTPInput] = useState(["", "", "", ""]);
  const [deliveryOTPInput, setDeliveryOTPInput] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [completionCelebration, setCompletionCelebration] = useState(null);

  // Driver Onboarding Modal
  const [showDriverRegModal, setShowDriverRegModal] = useState(false);
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverPhone, setNewDriverPhone] = useState("+91 98");
  const [newDriverVehicle, setNewDriverVehicle] = useState("Motorcycle (Hero Splendor)");
  const [newDriverPlate, setNewDriverPlate] = useState("MH-02-");

  // In-App Chat State
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [chatMessageText, setChatMessageText] = useState("");

  // Wallet withdrawal state
  const [withdrawAmount, setWithdrawAmount] = useState(1000);
  const [withdrawUpi, setWithdrawUpi] = useState("amit@okhdfcbank");
  const [withdrawMsg, setWithdrawMsg] = useState("");

  // Check if current driver has an assigned active order
  const activeOrder = orders.find(
    (o) =>
      o.deliveryPartnerId === currentDriver.id &&
      o.orderStatus !== "DELIVERED" &&
      o.orderStatus !== "RESTAURANT_REJECTED" &&
      o.orderStatus !== "ADMIN_CANCELLED"
  );

  // Check if there is an incoming delivery request for THIS driver
  const incomingReqEntry = Object.values(activeDriverRequests).find(
    (req) => req.driverId === currentDriver.id
  );
  const incomingOrder = incomingReqEntry ? orders.find((o) => o.id === incomingReqEntry.orderId) : null;

  // Countdown timer for incoming request
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (!incomingReqEntry) {
      setTimeLeft(20);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((incomingReqEntry.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        driverRespondRequest(incomingReqEntry.orderId, currentDriver.id, false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [incomingReqEntry, currentDriver.id, driverRespondRequest]);

  // Handle Pickup OTP Input
  const handlePickupDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...pickupOTPInput];
    newDigits[index] = value.slice(-1);
    setPickupOTPInput(newDigits);

    if (value && index < 3) {
      const nextInput = document.getElementById(`pickup-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyPickup = () => {
    const fullOtp = pickupOTPInput.join("");
    if (fullOtp.length < 4) {
      setOtpError("Please enter complete 4-digit OTP provided by restaurant");
      return;
    }
    const res = verifyPickupOTP(activeOrder.id, fullOtp);
    if (!res.success) {
      setOtpError(res.message);
    } else {
      setOtpError("");
      setPickupOTPInput(["", "", "", ""]);
    }
  };

  // Handle Delivery OTP Input
  const handleDeliveryDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...deliveryOTPInput];
    newDigits[index] = value.slice(-1);
    setDeliveryOTPInput(newDigits);

    if (value && index < 3) {
      const nextInput = document.getElementById(`delivery-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyDelivery = () => {
    const fullOtp = deliveryOTPInput.join("");
    if (fullOtp.length < 4) {
      setOtpError("Please enter complete 4-digit OTP given by customer");
      return;
    }
    const res = verifyDeliveryOTP(activeOrder.id, fullOtp);
    if (!res.success) {
      setOtpError(res.message);
    } else {
      setOtpError("");
      setDeliveryOTPInput(["", "", "", ""]);
      setCompletionCelebration({
        orderId: activeOrder.id,
        earnings: activeOrder.driverEarnings || 85
      });
    }
  };

  const handleWithdrawalSubmit = (e) => {
    e.preventDefault();
    const res = requestDriverWithdrawal(currentDriver.id, Number(withdrawAmount), withdrawUpi);
    setWithdrawMsg(res.message);
  };

  const handleRegisterDriverSubmit = (e) => {
    e.preventDefault();
    if (!newDriverName.trim()) return;

    registerNewDriver({
      name: newDriverName.trim(),
      phone: newDriverPhone.trim(),
      vehicleType: newDriverVehicle,
      vehicleNumber: newDriverPlate.trim().toUpperCase(),
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300"
    });

    setNewDriverName("");
    setShowDriverRegModal(false);
  };

  const handleSendChat = (textToSend) => {
    const message = textToSend || chatMessageText;
    if (!message.trim() || !activeOrder) return;
    sendOrderChatMessage(activeOrder.id, "DRIVER", message.trim());
    setChatMessageText("");
  };

  // Driver Trip History
  const driverCompletedTrips = orders.filter(
    (o) => o.deliveryPartnerId === currentDriver.id && o.orderStatus === "DELIVERED"
  );

  const currentChats = activeOrder ? orderChats[activeOrder.id] || [] : [];

  return (
    <div style={{ background: "#020617", minHeight: "100vh" }}>
      <FoodRoleSwitcher />

      {/* Driver Simulation Switcher Top Bar */}
      <div style={{ background: "#0f172a", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "13px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>Rider Profile:</span>
          <select
            value={currentDriver.id}
            onChange={(e) => setSelectedDriver(e.target.value)}
            style={{ background: "#1e293b", color: "#fff", border: "1px solid #475569", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", outline: "none" }}
          >
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.vehicleType.split("(")[0]}) - {d.status}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowDriverRegModal(true)}
          style={{
            background: "var(--food-primary)",
            color: "#fff",
            border: "none",
            padding: "4px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <FaUserPlus /> Register New Rider
        </button>
      </div>

      {/* Mobile-First Driver App Viewport */}
      <div className="driver-app-frame">
        {/* Top bar with Online/Offline Master Switch */}
        <header className="driver-app-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={currentDriver.avatar}
              alt={currentDriver.name}
              style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: "2px solid #10b981" }}
            />
            <div>
              <strong style={{ fontSize: "14px", display: "block" }}>{currentDriver.name}</strong>
              <small style={{ color: "#94a3b8", fontSize: "11px" }}>⭐ {currentDriver.rating} Rating</small>
            </div>
          </div>

          <button
            className={`driver-online-switch ${currentDriver.status === "ONLINE" ? "online" : "offline"}`}
            onClick={() => toggleDriverOnline(currentDriver.id, currentDriver.status !== "ONLINE")}
          >
            <span style={{ fontSize: "10px" }}>{currentDriver.status === "ONLINE" ? "🟢 ONLINE" : "🔴 OFFLINE"}</span>
          </button>
        </header>

        {/* App Main Scrollable Body */}
        <div className="driver-app-body">
          {/* TAB 1: HOME & ACTIVE WORKFLOW */}
          {activeTab === "HOME" && (
            <div>
              {/* Daily Stats Summary */}
              <div className="driver-stats-grid">
                <div className="driver-stat-box">
                  <span>Today's Earnings</span>
                  <h3 style={{ color: "#10b981" }}>₹{currentDriver.todayEarnings}</h3>
                </div>
                <div className="driver-stat-box">
                  <span>Completed Trips</span>
                  <h3>{currentDriver.todayDeliveries}</h3>
                </div>
              </div>

              {/* 1. INCOMING DELIVERY REQUEST CARD (WITH 20-SEC COUNTDOWN) */}
              {incomingOrder && (
                <div className="incoming-request-modal">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className="live-pulse-dot" />
                      <strong style={{ color: "var(--food-primary)", fontSize: "14px", textTransform: "uppercase" }}>
                        New Delivery Request
                      </strong>
                    </div>
                    <span style={{ background: "#ef4444", color: "#fff", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 800 }}>
                      ⏱ {timeLeft}s remaining
                    </span>
                  </div>

                  {/* Countdown Bar */}
                  <div className="countdown-bar-wrapper">
                    <div
                      className="countdown-bar-fill"
                      style={{ width: `${(timeLeft / 20) * 100}%` }}
                    />
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "10px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>Est. Earnings</span>
                      <strong style={{ color: "#10b981", fontSize: "18px" }}>₹{incomingOrder.driverEarnings}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#cbd5e1" }}>
                      <span>Trip Distance: {incomingOrder.distanceKm} km</span>
                      <span>Est. Time: 25 mins</span>
                    </div>
                  </div>

                  <div className="req-route-row">
                    <FaStore color="#ff5200" style={{ marginTop: "2px" }} />
                    <div>
                      <strong style={{ color: "#fff" }}>{incomingOrder.restaurantName}</strong>
                      <div style={{ color: "#94a3b8", fontSize: "11px" }}>{incomingOrder.restaurantAddress}</div>
                    </div>
                  </div>

                  <div className="req-route-row">
                    <FaMapMarkerAlt color="#3b82f6" style={{ marginTop: "2px" }} />
                    <div>
                      <strong style={{ color: "#fff" }}>Drop: {incomingOrder.customerName}</strong>
                      <div style={{ color: "#94a3b8", fontSize: "11px" }}>{incomingOrder.deliveryAddress}</div>
                    </div>
                  </div>

                  <div className="req-actions-row">
                    <button
                      className="btn-driver-reject"
                      onClick={() => driverRespondRequest(incomingOrder.id, currentDriver.id, false)}
                    >
                      ✕ Reject
                    </button>
                    <button
                      className="btn-driver-accept"
                      onClick={() => driverRespondRequest(incomingOrder.id, currentDriver.id, true)}
                    >
                      ✓ ACCEPT DELIVERY
                    </button>
                  </div>
                </div>
              )}

              {/* 2. ACTIVE DELIVERY STEP-BY-STEP WORKFLOW */}
              {activeOrder ? (
                <div style={{ background: "#1e293b", borderRadius: "16px", padding: "18px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 800, textTransform: "uppercase" }}>
                        Active Trip #{activeOrder.id}
                      </span>
                      <strong style={{ display: "block", fontSize: "15px" }}>₹{activeOrder.driverEarnings} Payout</strong>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => setShowChatDrawer(!showChatDrawer)}
                        style={{
                          background: "#3b82f6",
                          color: "#fff",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <FaComments /> Chat ({currentChats.length})
                      </button>
                    </div>
                  </div>

                  {/* Interactive Map for Active Navigation */}
                  <div style={{ height: "180px", borderRadius: "12px", overflow: "hidden", marginBottom: "16px" }}>
                    <LiveMap order={activeOrder} mode="ORDER_TRACK" height="180px" />
                  </div>

                  {/* STEP 1: Heading to Restaurant */}
                  {activeOrder.orderStatus === "DELIVERY_PARTNER_ASSIGNED" && (
                    <div>
                      <div style={{ background: "rgba(255, 82, 0, 0.15)", border: "1px solid #ff5200", padding: "12px", borderRadius: "10px", marginBottom: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff7a38", fontWeight: 700, fontSize: "13px" }}>
                          <FaStore /> Pickup from {activeOrder.restaurantName}
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#cbd5e1" }}>{activeOrder.restaurantAddress}</p>
                      </div>

                      <button
                        onClick={() => driverArrivedAtRestaurant(activeOrder.id)}
                        className="btn-driver-accept"
                        style={{ width: "100%", padding: "14px", fontSize: "15px" }}
                      >
                        📍 I HAVE ARRIVED AT RESTAURANT
                      </button>
                    </div>
                  )}

                  {/* STEP 2: At Restaurant -> Secure Pickup OTP Verification */}
                  {activeOrder.orderStatus === "DRIVER_AT_RESTAURANT" && (
                    <div>
                      <div style={{ textAlign: "center", marginBottom: "12px" }}>
                        <h4 style={{ margin: "0 0 4px", fontSize: "15px" }}>Enter 4-Digit Pickup OTP</h4>
                        <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                          Ask restaurant staff at the counter for the OTP ({activeOrder.pickupOTP})
                        </p>
                      </div>

                      <div className="otp-inputs-row">
                        {[0, 1, 2, 3].map((idx) => (
                          <input
                            key={idx}
                            id={`pickup-otp-${idx}`}
                            type="text"
                            maxLength="1"
                            value={pickupOTPInput[idx]}
                            onChange={(e) => handlePickupDigitChange(idx, e.target.value)}
                            className="otp-box-digit"
                          />
                        ))}
                      </div>

                      {otpError && (
                        <div style={{ color: "#f87171", fontSize: "12px", textAlign: "center", marginBottom: "10px" }}>
                          {otpError}
                        </div>
                      )}

                      <button
                        onClick={handleVerifyPickup}
                        className="btn-driver-accept"
                        style={{ width: "100%", padding: "14px", fontSize: "15px" }}
                      >
                        ✓ VERIFY PICKUP & START TRIP
                      </button>
                    </div>
                  )}

                  {/* STEP 3: Food Picked Up -> Heading to Customer */}
                  {activeOrder.orderStatus === "PICKED_UP" && (
                    <div>
                      <div style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid #3b82f6", padding: "12px", borderRadius: "10px", marginBottom: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#60a5fa", fontWeight: 700, fontSize: "13px" }}>
                            <FaMapMarkerAlt /> Deliver to {activeOrder.customerName}
                          </div>
                          <a href={`tel:${activeOrder.customerPhone}`} style={{ color: "#34d399", fontSize: "14px" }}>
                            <FaPhoneAlt />
                          </a>
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#cbd5e1" }}>{activeOrder.deliveryAddress}</p>
                      </div>

                      <button
                        onClick={() => driverArrivedAtCustomer(activeOrder.id)}
                        className="btn-driver-accept"
                        style={{ width: "100%", padding: "14px", fontSize: "15px" }}
                      >
                        🔔 I HAVE ARRIVED AT CUSTOMER
                      </button>
                    </div>
                  )}

                  {/* STEP 4: Arrived at Customer -> Customer Delivery OTP Verification */}
                  {activeOrder.orderStatus === "ARRIVED_AT_CUSTOMER" && (
                    <div>
                      <div style={{ textAlign: "center", marginBottom: "12px" }}>
                        <h4 style={{ margin: "0 0 4px", fontSize: "15px" }}>Enter Customer Delivery OTP</h4>
                        <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                          Ask customer for their 4-digit verification code ({activeOrder.deliveryOTP})
                        </p>
                      </div>

                      <div className="otp-inputs-row">
                        {[0, 1, 2, 3].map((idx) => (
                          <input
                            key={idx}
                            id={`delivery-otp-${idx}`}
                            type="text"
                            maxLength="1"
                            value={deliveryOTPInput[idx]}
                            onChange={(e) => handleDeliveryDigitChange(idx, e.target.value)}
                            className="otp-box-digit"
                          />
                        ))}
                      </div>

                      {otpError && (
                        <div style={{ color: "#f87171", fontSize: "12px", textAlign: "center", marginBottom: "10px" }}>
                          {otpError}
                        </div>
                      )}

                      <button
                        onClick={handleVerifyDelivery}
                        className="btn-driver-accept"
                        style={{ width: "100%", padding: "14px", fontSize: "15px", background: "#10b981" }}
                      >
                        ✓ VERIFY DELIVERY & COMPLETE
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                !incomingOrder && (
                  <div style={{ background: "#1e293b", padding: "30px 20px", borderRadius: "16px", textAlign: "center", border: "1px dashed rgba(255,255,255,0.15)" }}>
                    <FaMotorcycle size={36} color="#64748b" />
                    <h4 style={{ margin: "12px 0 4px", color: "#fff" }}>
                      {currentDriver.status === "ONLINE" ? "You are Online & Ready" : "You are Offline"}
                    </h4>
                    <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                      {currentDriver.status === "ONLINE"
                        ? "Waiting for nearby orders from restaurants in Bandra/Juhu/Powai..."
                        : "Toggle 'GO ONLINE' above to start receiving delivery requests."}
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB 2: DELIVERIES TRIP HISTORY */}
          {activeTab === "DELIVERIES" && (
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px" }}>Trip History</h3>
              {driverCompletedTrips.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>No trips completed yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {driverCompletedTrips.map((trip) => (
                    <div
                      key={trip.id}
                      style={{
                        background: "#1e293b",
                        borderRadius: "12px",
                        padding: "14px",
                        border: "1px solid rgba(255,255,255,0.08)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <strong style={{ color: "#fff", fontSize: "14px" }}>Order #{trip.id}</strong>
                        <strong style={{ color: "#10b981", fontSize: "15px" }}>+₹{trip.driverEarnings}</strong>
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {trip.restaurantName} → {trip.deliveryAddress.split(",")[0]}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                        Distance: {trip.distanceKm} km • ✓ Delivered
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EARNINGS ANALYTICS */}
          {activeTab === "EARNINGS" && (
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px" }}>Earnings Breakdown</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px" }}>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>This Week</span>
                  <h3 style={{ margin: "4px 0 0", color: "#fff" }}>₹{currentDriver.weekEarnings}</h3>
                </div>
                <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px" }}>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>This Month</span>
                  <h3 style={{ margin: "4px 0 0", color: "#fff" }}>₹{currentDriver.monthEarnings}</h3>
                </div>
              </div>

              <div style={{ background: "#1e293b", padding: "16px", borderRadius: "12px", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>All-Time Completed Deliveries</span>
                <h2 style={{ margin: "4px 0 0", color: "#ff5200" }}>{currentDriver.totalDeliveries} Trips</h2>
              </div>
            </div>
          )}

          {/* TAB 4: WALLET & WITHDRAWAL REQUEST */}
          {activeTab === "WALLET" && (
            <div>
              <div style={{ background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: "16px", padding: "20px", color: "#fff", marginBottom: "20px" }}>
                <span style={{ fontSize: "12px", opacity: 0.9 }}>Available Wallet Balance</span>
                <h1 style={{ fontSize: "32px", fontWeight: 900, margin: "4px 0 12px" }}>₹{currentDriver.walletBalance}</h1>
                <small style={{ fontSize: "11px", opacity: 0.85 }}>Direct Payout via UPI or Bank IMPS</small>
              </div>

              <div style={{ background: "#1e293b", borderRadius: "16px", padding: "18px", marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "15px" }}>Request Payout to Bank / UPI</h4>
                <form onSubmit={handleWithdrawalSubmit}>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Withdrawal Amount (₹)</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      style={{ width: "100%", padding: "10px", background: "#0f172a", border: "1px solid #334155", color: "#fff", outline: "none", borderRadius: "8px" }}
                    />
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>UPI ID</label>
                    <input
                      type="text"
                      value={withdrawUpi}
                      onChange={(e) => setWithdrawUpi(e.target.value)}
                      style={{ width: "100%", padding: "10px", background: "#0f172a", border: "1px solid #334155", color: "#fff", outline: "none", borderRadius: "8px" }}
                    />
                  </div>
                  <button type="submit" className="btn-driver-accept" style={{ width: "100%", padding: "12px" }}>
                    💳 Request Immediate Payout
                  </button>
                </form>
                {withdrawMsg && <p style={{ fontSize: "12px", color: "#34d399", marginTop: "10px" }}>{withdrawMsg}</p>}
              </div>

              <h4 style={{ fontSize: "14px", margin: "0 0 10px" }}>Withdrawal Ledger</h4>
              {withdrawals.filter((w) => w.driverId === currentDriver.id).map((w) => (
                <div key={w.id} style={{ background: "#1e293b", padding: "10px 14px", borderRadius: "8px", marginBottom: "6px", display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <div>
                    <strong>₹{w.amount}</strong> to {w.upiId}
                  </div>
                  <span style={{ color: w.status === "COMPLETED" ? "#10b981" : "#f59e0b", fontWeight: 700 }}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: PROFILE & VEHICLE */}
          {activeTab === "PROFILE" && (
            <div>
              <div style={{ background: "#1e293b", borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "16px" }}>
                <img
                  src={currentDriver.avatar}
                  alt={currentDriver.name}
                  style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover", border: "3px solid #ff5200", marginBottom: "8px" }}
                />
                <h3 style={{ margin: "0 0 2px" }}>{currentDriver.name}</h3>
                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 700 }}>✓ Verified Delivery Partner</span>
              </div>

              <div style={{ background: "#1e293b", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <div><strong>Phone:</strong> <span style={{ color: "#94a3b8" }}>{currentDriver.phone}</span></div>
                <div><strong>Vehicle Type:</strong> <span style={{ color: "#94a3b8" }}>{currentDriver.vehicleType}</span></div>
                <div><strong>Vehicle Plate:</strong> <span style={{ color: "#94a3b8" }}>{currentDriver.vehicleNumber}</span></div>
                <div><strong>Joined Date:</strong> <span style={{ color: "#94a3b8" }}>{currentDriver.joinedDate}</span></div>
                <div><strong>Overall Rating:</strong> <span style={{ color: "#f59e0b" }}>⭐ {currentDriver.rating} / 5.0</span></div>
              </div>
            </div>
          )}
        </div>

        {/* IN-APP CHAT DRAWER */}
        {showChatDrawer && activeOrder && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: "70px",
              background: "#0f172a",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              padding: "16px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", marginBottom: "12px" }}>
              <div>
                <strong style={{ fontSize: "14px" }}>Chat with {activeOrder.customerName}</strong>
                <small style={{ display: "block", color: "#94a3b8", fontSize: "11px" }}>Order #{activeOrder.id}</small>
              </div>
              <button onClick={() => setShowChatDrawer(false)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "16px", cursor: "pointer" }}>✕</button>
            </div>

            {/* Quick canned replies */}
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "8px", marginBottom: "8px" }}>
              {["I have reached the building gate", "On my way to deliver", "Waiting at restaurant counter", "Please share landmark"].map((txt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendChat(txt)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#cbd5e1",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "10px",
                    whiteSpace: "nowrap",
                    cursor: "pointer"
                  }}
                >
                  {txt}
                </button>
              ))}
            </div>

            {/* Messages log */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
              {currentChats.length === 0 ? (
                <p style={{ textAlign: "center", color: "#64748b", fontSize: "12px", marginTop: "40px" }}>No messages yet. Send a quick update to the customer!</p>
              ) : (
                currentChats.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.sender === "DRIVER" ? "flex-end" : "flex-start",
                      background: msg.sender === "DRIVER" ? "var(--food-primary)" : "#1e293b",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: "12px",
                      maxWidth: "75%",
                      fontSize: "12px"
                    }}
                  >
                    <div>{msg.text}</div>
                    <small style={{ fontSize: "9px", opacity: 0.8, display: "block", textAlign: "right", marginTop: "2px" }}>{msg.time}</small>
                  </div>
                ))
              )}
            </div>

            {/* Input box */}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={chatMessageText}
                onChange={(e) => setChatMessageText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSendChat(); }}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "#1e293b", border: "1px solid #334155", color: "#fff", outline: "none", fontSize: "12px" }}
              />
              <button
                onClick={() => handleSendChat()}
                style={{ background: "var(--food-primary)", border: "none", color: "#fff", padding: "10px 14px", borderRadius: "8px", cursor: "pointer" }}
              >
                <FaPaperPlane size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <nav className="driver-bottom-nav">
          <button
            className={`driver-nav-item ${activeTab === "HOME" ? "active" : ""}`}
            onClick={() => setActiveTab("HOME")}
          >
            <FaHome />
            <span>Home</span>
          </button>
          <button
            className={`driver-nav-item ${activeTab === "DELIVERIES" ? "active" : ""}`}
            onClick={() => setActiveTab("DELIVERIES")}
          >
            <FaBoxOpen />
            <span>Trips</span>
          </button>
          <button
            className={`driver-nav-item ${activeTab === "EARNINGS" ? "active" : ""}`}
            onClick={() => setActiveTab("EARNINGS")}
          >
            <FaMoneyBillWave />
            <span>Earnings</span>
          </button>
          <button
            className={`driver-nav-item ${activeTab === "WALLET" ? "active" : ""}`}
            onClick={() => setActiveTab("WALLET")}
          >
            <FaWallet />
            <span>Wallet</span>
          </button>
          <button
            className={`driver-nav-item ${activeTab === "PROFILE" ? "active" : ""}`}
            onClick={() => setActiveTab("PROFILE")}
          >
            <FaUser />
            <span>Profile</span>
          </button>
        </nav>
      </div>

      {/* DRIVER ONBOARDING & REGISTRATION MODAL */}
      {showDriverRegModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px"
          }}
        >
          <div style={{ background: "#1e293b", borderRadius: "20px", padding: "26px", maxWidth: "440px", width: "100%", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Join as Delivery Partner</h3>
              <button onClick={() => setShowDriverRegModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "16px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleRegisterDriverSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kadam"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#0f172a", border: "1px solid #334155", color: "#fff", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Mobile Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98200 99887"
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#0f172a", border: "1px solid #334155", color: "#fff", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Vehicle Type</label>
                <select
                  value={newDriverVehicle}
                  onChange={(e) => setNewDriverVehicle(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#0f172a", border: "1px solid #334155", color: "#fff", outline: "none" }}
                >
                  <option value="Motorcycle (Hero Splendor)">Motorcycle (Petrol)</option>
                  <option value="Electric Scooter (Ather 450X)">Electric Scooter (EV)</option>
                  <option value="Scooter (Honda Activa 6G)">Scooter (Activa/Jupiter)</option>
                  <option value="Electric Bicycle (Eco Ride)">Electric Bicycle</option>
                </select>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Vehicle Number Plate</label>
                <input
                  type="text"
                  required
                  placeholder="MH-02-CD-5544"
                  value={newDriverPlate}
                  onChange={(e) => setNewDriverPlate(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#0f172a", border: "1px solid #334155", color: "#fff", outline: "none" }}
                />
              </div>

              <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid #10b981", padding: "10px", borderRadius: "8px", fontSize: "11px", color: "#34d399", marginBottom: "16px" }}>
                🎁 ₹500 Onboarding bonus will be credited immediately to your driver wallet!
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowDriverRegModal(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "transparent", color: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: "10px", borderRadius: "8px", border: "none", background: "#10b981", color: "#fff", fontWeight: 800, cursor: "pointer" }}
                >
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Celebration Modal */}
      {completionCelebration && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px"
          }}
        >
          <div
            style={{
              background: "#1e293b",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "380px",
              width: "100%",
              textAlign: "center",
              color: "#fff",
              border: "1px solid #10b981",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }}
          >
            <div style={{ fontSize: "52px", marginBottom: "8px" }}>🎉</div>
            <h2 style={{ fontSize: "22px", fontWeight: 900, margin: "0 0 6px" }}>Trip Completed!</h2>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 16px" }}>
              Order #{completionCelebration.orderId} successfully delivered.
            </p>

            <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              <span style={{ fontSize: "12px", color: "#34d399" }}>Earnings Credited</span>
              <h1 style={{ color: "#10b981", fontSize: "32px", fontWeight: 900, margin: "4px 0 0" }}>
                +₹{completionCelebration.earnings}
              </h1>
            </div>

            <button
              onClick={() => setCompletionCelebration(null)}
              className="btn-driver-accept"
              style={{ width: "100%", padding: "12px", fontSize: "15px" }}
            >
              Continue Driving
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
