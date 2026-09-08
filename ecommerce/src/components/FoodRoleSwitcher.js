import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUser,
  FaStore,
  FaMotorcycle,
  FaShieldAlt,
  FaBell,
  FaKey,
  FaPlayCircle,
  FaQuestionCircle,
  FaTimes,
  FaUtensils,
  FaMobileAlt
} from "react-icons/fa";
import useFoodDeliveryStore from "../store/foodDeliveryStore";

export default function FoodRoleSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();

  const setActiveRole = useFoodDeliveryStore((state) => state.setActiveRole);
  const notifications = useFoodDeliveryStore((state) => state.notifications);
  const orders = useFoodDeliveryStore((state) => state.orders);
  const activeDriverRequests = useFoodDeliveryStore((state) => state.activeDriverRequests);
  const restaurants = useFoodDeliveryStore((state) => state.restaurants);
  const drivers = useFoodDeliveryStore((state) => state.drivers);
  const selectedRestaurantId = useFoodDeliveryStore((state) => state.selectedRestaurantId);
  const setSelectedRestaurant = useFoodDeliveryStore((state) => state.setSelectedRestaurant);
  const selectedDriverId = useFoodDeliveryStore((state) => state.selectedDriverId);
  const setSelectedDriver = useFoodDeliveryStore((state) => state.setSelectedDriver);
  const customerPersonas = useFoodDeliveryStore((state) => state.customerPersonas);
  const selectedCustomerId = useFoodDeliveryStore((state) => state.selectedCustomerId);
  const setSelectedCustomer = useFoodDeliveryStore((state) => state.setSelectedCustomer);
  const simulateFullOrderLifecycle = useFoodDeliveryStore((state) => state.simulateFullOrderLifecycle);

  // Modals & States
  const [showNotifs, setShowNotifs] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const activeOrdersCount = orders.filter(
    (o) => o.orderStatus !== "DELIVERED" && o.orderStatus !== "RESTAURANT_REJECTED" && o.orderStatus !== "ADMIN_CANCELLED"
  ).length;
  const pendingRequestsCount = Object.keys(activeDriverRequests).length;

  const handleRoleSelect = (role, path) => {
    setActiveRole(role);
    navigate(path);
  };

  const isPathActive = (path) => {
    if (
      path === "/food" &&
      (location.pathname === "/food" ||
        location.pathname.startsWith("/food/restaurant-menu") ||
        location.pathname.startsWith("/food/track") ||
        location.pathname === "/food/checkout")
    ) {
      return true;
    }
    return location.pathname === path;
  };

  const handleRunLiveDemo = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    simulateFullOrderLifecycle(null, (stepText, orderId) => {
      setSimulationStatus({ stepText, orderId });

      if (stepText.includes("STEP 1")) {
        setActiveRole("CUSTOMER");
        navigate(`/food/track/${orderId}`);
      } else if (stepText.includes("STEP 2") || stepText.includes("STEP 3") || stepText.includes("STEP 4")) {
        setActiveRole("RESTAURANT");
        navigate("/food/restaurant");
      } else if (stepText.includes("STEP 5") || stepText.includes("STEP 6") || stepText.includes("STEP 7") || stepText.includes("STEP 8")) {
        setActiveRole("DRIVER");
        navigate("/food/driver");
      } else if (stepText.includes("ORDER COMPLETED")) {
        setTimeout(() => {
          setIsSimulating(false);
          setSimulationStatus(null);
          navigate(`/food/track/${orderId}`);
        }, 3000);
      }
    });
  };

  return (
    <>
      <div className="role-quick-switcher">
        {/* Brand & Live Pulse */}
        <div className="role-switcher-brand">
          <span className="live-pulse-dot" />
          <span>OneKart Food Cloud</span>
          <span className="role-switcher-badge">Swiggy-Grade Core</span>
        </div>

        {/* Role Navigation Switcher Buttons */}
        <div className="role-buttons-group">
          <button
            className={`role-btn ${isPathActive("/food") ? "active" : ""}`}
            onClick={() => handleRoleSelect("CUSTOMER", "/food")}
          >
            <FaUser size={12} />
            <span>1. Customer</span>
          </button>

          <button
            className={`role-btn ${isPathActive("/food/restaurant") ? "active" : ""}`}
            onClick={() => handleRoleSelect("RESTAURANT", "/food/restaurant")}
          >
            <FaStore size={12} />
            <span>2. Restaurant</span>
          </button>

          <button
            className={`role-btn ${isPathActive("/food/driver") ? "active" : ""}`}
            onClick={() => handleRoleSelect("DRIVER", "/food/driver")}
          >
            <FaMotorcycle size={12} />
            <span>3. Delivery Partner</span>
            {pendingRequestsCount > 0 && (
              <span
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "50%",
                  padding: "1px 5px",
                  fontSize: "10px",
                  fontWeight: 900
                }}
              >
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            className={`role-btn ${isPathActive("/food/admin") ? "active" : ""}`}
            onClick={() => handleRoleSelect("ADMIN", "/food/admin")}
          >
            <FaShieldAlt size={12} />
            <span>4. Admin Dispatch</span>
            {activeOrdersCount > 0 && (
              <span
                style={{
                  background: "var(--food-primary)",
                  color: "#fff",
                  borderRadius: "50%",
                  padding: "1px 6px",
                  fontSize: "10px",
                  fontWeight: 800
                }}
              >
                {activeOrdersCount}
              </span>
            )}
          </button>
        </div>

        {/* Action Buttons: Quick Login, Live Demo Simulation, Guide & Live Sync */}
        <div className="role-sim-controls">
          {/* Quick Login & Switch Persona Modal Button */}
          <button
            onClick={() => setShowLoginModal(true)}
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
              border: "none",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(14, 165, 233, 0.4)"
            }}
          >
            <FaKey size={11} />
            <span>Quick Login</span>
          </button>

          {/* 1-Click Auto Run Simulation Wizard */}
          <button
            onClick={handleRunLiveDemo}
            disabled={isSimulating}
            style={{
              background: isSimulating ? "#475569" : "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "20px",
              cursor: isSimulating ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
            }}
          >
            <FaPlayCircle size={12} />
            <span>{isSimulating ? "Simulating..." : "Auto-Run Demo"}</span>
          </button>

          {/* System Guide */}
          <button
            onClick={() => setShowGuideModal(true)}
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#e2e8f0",
              padding: "6px 10px",
              borderRadius: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12px",
              fontWeight: 600
            }}
          >
            <FaQuestionCircle size={12} />
            <span>Guide</span>
          </button>

          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px"
              }}
            >
              <FaBell size={12} />
              <span>{notifications.length}</span>
            </button>

            {showNotifs && (
              <div
                style={{
                  position: "absolute",
                  top: "36px",
                  right: "0",
                  width: "320px",
                  maxHeight: "380px",
                  background: "#1e293b",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                  padding: "12px",
                  zIndex: 99999,
                  overflowY: "auto"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    paddingBottom: "6px"
                  }}
                >
                  <strong style={{ fontSize: "13px" }}>Live Notifications</strong>
                  <span style={{ fontSize: "11px", color: "var(--food-primary)" }}>Real-Time Stream</span>
                </div>
                {notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.04)",
                      marginBottom: "6px",
                      fontSize: "12px"
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#fff", marginBottom: "2px" }}>{n.title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "11px", lineHeight: "1.3" }}>{n.message}</div>
                    <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>{n.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulation Floating HUD Banner */}
      {isSimulating && simulationStatus && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0f172a",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: "40px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            gap: "14px",
            border: "2px solid #10b981",
            animation: "pulse 2s infinite"
          }}
        >
          <span className="live-pulse-dot" style={{ background: "#10b981" }} />
          <strong style={{ fontSize: "14px", color: "#10b981" }}>Live Demo in Progress:</strong>
          <span style={{ fontSize: "13px" }}>{simulationStatus.stepText}</span>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Order: #{simulationStatus.orderId}</span>
        </div>
      )}

      {/* Quick Login & Persona Switcher Modal */}
      {showLoginModal && (
        <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "750px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>🔑 Quick Login & Persona Switcher</h3>
                <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0" }}>
                  Switch instantly into any user persona across the 4 roles to test features.
                </p>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Grid of 4 Roles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Role 1: Customer */}
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <div style={{ background: "#fff3ed", padding: "8px", borderRadius: "8px", color: "#ff5200" }}>
                    <FaUser size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: "14px" }}>Customer Personas</strong>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Order food & track live</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {customerPersonas?.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomer(c.id);
                        setActiveRole("CUSTOMER");
                        setShowLoginModal(false);
                        navigate("/food");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        background: selectedCustomerId === c.id ? "#ffedd5" : "#fff",
                        border: selectedCustomerId === c.id ? "1px solid #ff5200" : "1px solid #e2e8f0",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={c.avatar} alt={c.name} style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "13px" }}>{c.name}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{c.tier}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: "12px", color: "#ff5200", fontWeight: 700 }}>Log In →</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role 2: Restaurant Vendor */}
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <div style={{ background: "#ecfdf5", padding: "8px", borderRadius: "8px", color: "#10b981" }}>
                    <FaStore size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: "14px" }}>Restaurant Outlets</strong>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Accept, cook & add food items</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "170px", overflowY: "auto" }}>
                  {restaurants.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedRestaurant(r.id);
                        setActiveRole("RESTAURANT");
                        setShowLoginModal(false);
                        navigate("/food/restaurant");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        background: selectedRestaurantId === r.id ? "#d1fae5" : "#fff",
                        border: selectedRestaurantId === r.id ? "1px solid #10b981" : "1px solid #e2e8f0",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <img src={r.image} alt={r.name} style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "13px" }}>{r.name}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{r.cuisine.split("•")[0]}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 700 }}>Merchant Log In →</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role 3: Delivery Partner */}
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <div style={{ background: "#eff6ff", padding: "8px", borderRadius: "8px", color: "#2563eb" }}>
                    <FaMotorcycle size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: "14px" }}>Delivery Heroes</strong>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Accept requests & verify OTPs</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {drivers.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => {
                        setSelectedDriver(d.id);
                        setActiveRole("DRIVER");
                        setShowLoginModal(false);
                        navigate("/food/driver");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        background: selectedDriverId === d.id ? "#dbeafe" : "#fff",
                        border: selectedDriverId === d.id ? "1px solid #2563eb" : "1px solid #e2e8f0",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={d.avatar} alt={d.name} style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "13px" }}>{d.name}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{d.vehicleType.split(" ")[0]} • {d.rating}★</div>
                        </div>
                      </div>
                      <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: 700 }}>Rider Log In →</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role 4: Admin Dispatch */}
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <div style={{ background: "#f5f3ff", padding: "8px", borderRadius: "8px", color: "#7c3aed" }}>
                      <FaShieldAlt size={16} />
                    </div>
                    <div>
                      <strong style={{ fontSize: "14px" }}>Admin Dispatch Console</strong>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>City-wide fleet radar & overrides</div>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>
                    Access the live supervisor map, monitor driver telemetry, perform emergency manual reassignments, and approve rider wallet payouts.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveRole("ADMIN");
                    setShowLoginModal(false);
                    navigate("/food/admin");
                  }}
                  style={{
                    background: "#7c3aed",
                    color: "#fff",
                    border: "none",
                    padding: "10px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    width: "100%",
                    marginTop: "12px"
                  }}
                >
                  Enter Dispatch Center →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Guide Modal */}
      {showGuideModal && (
        <div className="modal-backdrop" onClick={() => setShowGuideModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "700px", maxHeight: "85vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>📖 How OneKart Food & Dispatch System Works</h3>
              <button
                onClick={() => setShowGuideModal(false)}
                style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "#fff3ed", padding: "14px", borderRadius: "12px", border: "1px solid #fed7aa" }}>
                <strong style={{ color: "#c2410c", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                  <FaUtensils /> 1. How to Add New Food Items (Restaurant Portal)
                </strong>
                <p style={{ fontSize: "13px", color: "#7c2d12", margin: "6px 0 0", lineHeight: "1.4" }}>
                  Go to <strong>2. Restaurant</strong> → Click <strong>"Menu Management"</strong> tab → Click <strong>"+ Add Food Item"</strong>. You can choose from popular 1-click presets (Pizza, Biryani, Burgers, Shakes) or enter custom pricing, category, veg/non-veg flag, and photo URL.
                </p>
              </div>

              <div style={{ background: "#ecfdf5", padding: "14px", borderRadius: "12px", border: "1px solid #a7f3d0" }}>
                <strong style={{ color: "#065f46", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                  <FaMobileAlt /> 2. How to Order (Customer Flow like Swiggy)
                </strong>
                <p style={{ fontSize: "13px", color: "#064e3b", margin: "6px 0 0", lineHeight: "1.4" }}>
                  Go to <strong>1. Customer</strong> → Browse restaurants → Click any dish to customize portion size or add toppings → Proceed to Checkout → Select delivery instructions & optional rider tip → Place Order → Watch real-time GPS tracking!
                </p>
              </div>

              <div style={{ background: "#eff6ff", padding: "14px", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
                <strong style={{ color: "#1e40af", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                  <FaMotorcycle /> 3. Dual-OTP Security & Dispatch Workflow
                </strong>
                <p style={{ fontSize: "13px", color: "#1e3a8a", margin: "6px 0 0", lineHeight: "1.4" }}>
                  When food is ready, the system automatically finds the closest online rider and sends a 20-second incoming radar alert. Once accepted:
                  <br />• <strong>Pickup OTP:</strong> Driver reaches restaurant and inputs Restaurant's 4-digit OTP (e.g. <code>4821</code>).
                  <br />• <strong>Delivery OTP:</strong> Driver reaches customer and inputs Customer's 4-digit OTP (e.g. <code>7294</code>) to complete and receive wallet payout.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="btn-driver-accept"
              style={{ marginTop: "20px", width: "100%" }}
            >
              Got it, let's explore!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
