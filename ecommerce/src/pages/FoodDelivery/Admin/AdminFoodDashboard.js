import React, { useState } from "react";
import {
  FaShieldAlt,
  FaMotorcycle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaUserCheck,
  FaSearch,
  FaExchangeAlt,
  FaBan,
  FaTrash,
  FaPlus
} from "react-icons/fa";
import useFoodDeliveryStore, { calculateDistanceKm } from "../../../store/foodDeliveryStore";
import FoodRoleSwitcher from "../../../components/FoodRoleSwitcher";
import LiveMap from "../Components/LiveMap";
import Navbar from "../../../components/Navbar";

export default function AdminFoodDashboard() {
  const restaurants = useFoodDeliveryStore((state) => state.restaurants);
  const drivers = useFoodDeliveryStore((state) => state.drivers);
  const orders = useFoodDeliveryStore((state) => state.orders);
  const withdrawals = useFoodDeliveryStore((state) => state.withdrawals);

  // Store actions
  const adminApproveWithdrawal = useFoodDeliveryStore((state) => state.adminApproveWithdrawal);
  const adminManualAssignDriver = useFoodDeliveryStore((state) => state.adminManualAssignDriver);
  const adminCancelOrder = useFoodDeliveryStore((state) => state.adminCancelOrder);
  const deleteRestaurant = useFoodDeliveryStore((state) => state.deleteRestaurant);
  const registerNewRestaurant = useFoodDeliveryStore((state) => state.registerNewRestaurant);

  const [activeTab, setActiveTab] = useState("DISPATCH"); // "DISPATCH" | "ORDERS" | "DRIVERS" | "RESTAURANTS" | "WITHDRAWALS"
  const [assignModalOrder, setAssignModalOrder] = useState(null);
  const [selectedDriverForInspect, setSelectedDriverForInspect] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [restSearch, setRestSearch] = useState("");
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [showAddRestModal, setShowAddRestModal] = useState(false);
  const [newRestName, setNewRestName] = useState("");
  const [newRestCuisine, setNewRestCuisine] = useState("North Indian • Tandoor • Biryani");
  const [newRestAddress, setNewRestAddress] = useState("Andheri West, Mumbai");
  const [newRestDeliveryFee, setNewRestDeliveryFee] = useState(35);

  // Key Metrics
  const activeOrders = orders.filter(
    (o) =>
      o.orderStatus !== "DELIVERED" &&
      o.orderStatus !== "RESTAURANT_REJECTED" &&
      o.orderStatus !== "ADMIN_CANCELLED"
  );
  const unassignedOrders = activeOrders.filter(
    (o) => o.orderStatus === "READY_FOR_PICKUP" && !o.deliveryPartnerId
  );
  const onlineDrivers = drivers.filter((d) => d.status === "ONLINE");
  const busyDrivers = drivers.filter((d) => d.status === "BUSY" || d.status === "ON_DELIVERY");
  const offlineDrivers = drivers.filter((d) => d.status === "OFFLINE");
  const totalGMV = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "PENDING");

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.restaurantName.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="food-portal-container">
      <FoodRoleSwitcher />
      <Navbar />

      <main className="admin-dispatch-container">
        {/* Admin Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FaShieldAlt color="var(--food-primary)" size={24} />
              <h1 style={{ fontSize: "26px", fontWeight: 800, margin: 0 }}>Fleet Dispatch & Operations Command</h1>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#64748b" }}>
              Real-time multi-agent dispatching, live driver GPS telemetry & manual overrides
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ background: "#dcfce7", color: "#166534", padding: "8px 16px", borderRadius: "8px", fontWeight: 700, fontSize: "13px" }}>
              ● Dispatch Engine Active
            </span>
          </div>
        </div>

        {/* Top KPIs Grid */}
        <div className="admin-kpis-grid">
          <div className="admin-kpi-card">
            <div className="kpi-icon-box" style={{ background: "#eff6ff", color: "#3b82f6" }}>
              <FaMotorcycle />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Active Deliveries</span>
              <strong style={{ fontSize: "22px" }}>{activeOrders.length}</strong>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon-box" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <FaUserCheck />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Available Riders</span>
              <strong style={{ fontSize: "22px", color: "#16a34a" }}>{onlineDrivers.length} Free</strong>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon-box" style={{ background: "#fef2f2", color: "#ef4444" }}>
              <FaExchangeAlt />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Busy On Route</span>
              <strong style={{ fontSize: "22px", color: "#ef4444" }}>{busyDrivers.length} Riders</strong>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon-box" style={{ background: "#fff7ed", color: "#ea580c" }}>
              <FaExclamationTriangle />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Unassigned Orders</span>
              <strong style={{ fontSize: "22px", color: unassignedOrders.length > 0 ? "#ea580c" : "#1e293b" }}>
                {unassignedOrders.length}
              </strong>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon-box" style={{ background: "#f8fafc", color: "#1e293b" }}>
              <FaMoneyBillWave />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Total Platform GMV</span>
              <strong style={{ fontSize: "22px" }}>₹{totalGMV}</strong>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="vendor-tabs-bar" style={{ marginBottom: "24px" }}>
          <button
            className={`vendor-tab-btn ${activeTab === "DISPATCH" ? "active" : ""}`}
            onClick={() => setActiveTab("DISPATCH")}
          >
            🗺️ Live Dispatch Map & Fleet
          </button>
          <button
            className={`vendor-tab-btn ${activeTab === "ORDERS" ? "active" : ""}`}
            onClick={() => setActiveTab("ORDERS")}
          >
            📦 All Orders & Overrides ({orders.length})
          </button>
          <button
            className={`vendor-tab-btn ${activeTab === "DRIVERS" ? "active" : ""}`}
            onClick={() => setActiveTab("DRIVERS")}
          >
            🛵 Driver Partners ({drivers.length})
          </button>
          <button
            className={`vendor-tab-btn ${activeTab === "RESTAURANTS" ? "active" : ""}`}
            onClick={() => setActiveTab("RESTAURANTS")}
          >
            🏪 Restaurants ({restaurants.length})
          </button>
          <button
            className={`vendor-tab-btn ${activeTab === "WITHDRAWALS" ? "active" : ""}`}
            onClick={() => setActiveTab("WITHDRAWALS")}
          >
            💳 Payout Requests <span className="vendor-tab-badge">{pendingWithdrawals.length}</span>
          </button>
        </div>

        {/* TAB 1: LIVE DISPATCH MAP & FLEET */}
        {activeTab === "DISPATCH" && (
          <div>
            {/* Alert if unassigned orders exist */}
            {unassignedOrders.length > 0 && (
              <div
                style={{
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FaExclamationTriangle color="#ea580c" size={20} />
                  <div>
                    <strong style={{ color: "#9a3412", fontSize: "15px" }}>
                      {unassignedOrders.length} Order(s) Need Delivery Partner Assignment
                    </strong>
                    <span style={{ display: "block", fontSize: "12px", color: "#c2410c" }}>
                      Food is ready at restaurant. Dispatch nearest driver manually or wait for auto-search.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setAssignModalOrder(unassignedOrders[0])}
                  style={{
                    background: "#ea580c",
                    color: "#fff",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Dispatch Now →
                </button>
              </div>
            )}

            <div className="admin-map-split">
              {/* Interactive Fleet Map */}
              <div className="admin-live-map-card">
                <div style={{ padding: "12px 18px", background: "#0f172a", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "14px" }}>Live City Fleet (Mumbai Metro)</strong>
                  <div style={{ display: "flex", gap: "14px", fontSize: "12px" }}>
                    <span style={{ color: "#10b981" }}>● {onlineDrivers.length} Online</span>
                    <span style={{ color: "#ef4444" }}>● {busyDrivers.length} On Delivery</span>
                    <span style={{ color: "#64748b" }}>● {offlineDrivers.length} Offline</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <LiveMap
                    mode="FLEET_OVERVIEW"
                    allDrivers={drivers}
                    allRestaurants={restaurants}
                    allOrders={orders}
                    height="100%"
                    onSelectDriver={(d) => setSelectedDriverForInspect(d)}
                  />
                </div>
              </div>

              {/* Fleet List & Inspector Panel */}
              <div className="admin-fleet-list">
                <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 16px" }}>Delivery Fleet Status</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {drivers.map((driver) => {
                    const isBusy = driver.status === "BUSY" || driver.status === "ON_DELIVERY";
                    const isOnline = driver.status === "ONLINE";

                    return (
                      <div
                        key={driver.id}
                        className="fleet-driver-row"
                        style={{
                          background: selectedDriverForInspect?.id === driver.id ? "#f1f5f9" : "transparent",
                          padding: "10px",
                          borderRadius: "10px",
                          cursor: "pointer"
                        }}
                        onClick={() => setSelectedDriverForInspect(driver)}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img
                            src={driver.avatar}
                            alt={driver.name}
                            style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }}
                          />
                          <div>
                            <strong style={{ fontSize: "14px", display: "block" }}>{driver.name}</strong>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>
                              {driver.vehicleType.split("(")[0]} • ⭐ {driver.rating}
                            </span>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              background: isBusy ? "#fef2f2" : isOnline ? "#f0fdf4" : "#f1f5f9",
                              color: isBusy ? "#dc2626" : isOnline ? "#16a34a" : "#64748b",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 800
                            }}
                          >
                            {driver.status}
                          </span>
                          <small style={{ display: "block", color: "#64748b", marginTop: "2px" }}>
                            ₹{driver.todayEarnings} earned
                          </small>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Inspect Driver Detail Box */}
                {selectedDriverForInspect && (
                  <div style={{ marginTop: "20px", background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <strong style={{ fontSize: "13px" }}>Rider Telemetry Profile</strong>
                      <button onClick={() => setSelectedDriverForInspect(null)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>✕</button>
                    </div>
                    <p style={{ margin: "2px 0", fontSize: "12px" }}><strong>Phone:</strong> {selectedDriverForInspect.phone}</p>
                    <p style={{ margin: "2px 0", fontSize: "12px" }}><strong>Plate:</strong> {selectedDriverForInspect.vehicleNumber}</p>
                    <p style={{ margin: "2px 0", fontSize: "12px" }}><strong>Wallet Balance:</strong> ₹{selectedDriverForInspect.walletBalance}</p>
                    <p style={{ margin: "2px 0", fontSize: "12px" }}><strong>Total Lifetime Deliveries:</strong> {selectedDriverForInspect.totalDeliveries}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL ORDERS & OVERRIDES */}
        {activeTab === "ORDERS" && (
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>Order Audit Ledger</h3>

              <div style={{ position: "relative" }}>
                <FaSearch style={{ position: "absolute", left: "10px", top: "10px", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Search order ID, restaurant, customer..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{ padding: "8px 12px 8px 32px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px", width: "260px" }}
                />
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                    <th style={{ padding: "10px" }}>Order ID</th>
                    <th style={{ padding: "10px" }}>Restaurant</th>
                    <th style={{ padding: "10px" }}>Customer</th>
                    <th style={{ padding: "10px" }}>Assigned Driver</th>
                    <th style={{ padding: "10px" }}>Total</th>
                    <th style={{ padding: "10px" }}>Status</th>
                    <th style={{ padding: "10px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 10px" }}>
                        <strong>#{order.id}</strong>
                      </td>
                      <td style={{ padding: "12px 10px" }}>{order.restaurantName}</td>
                      <td style={{ padding: "12px 10px" }}>
                        {order.customerName}
                        <small style={{ display: "block", color: "#94a3b8" }}>{order.customerPhone}</small>
                      </td>
                      <td style={{ padding: "12px 10px" }}>
                        {order.driverName ? (
                          <span>🛵 {order.driverName}</span>
                        ) : (
                          <span style={{ color: "#ea580c", fontWeight: 700 }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 10px", fontWeight: 700 }}>₹{order.grandTotal}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <span
                          style={{
                            background: order.orderStatus === "DELIVERED" ? "#f0fdf4" : order.orderStatus.includes("CANCEL") ? "#fef2f2" : "#eff6ff",
                            color: order.orderStatus === "DELIVERED" ? "#166534" : order.orderStatus.includes("CANCEL") ? "#dc2626" : "#2563eb",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 800
                          }}
                        >
                          {order.orderStatus.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {order.orderStatus !== "DELIVERED" && !order.orderStatus.includes("CANCEL") && (
                            <>
                              <button
                                onClick={() => setAssignModalOrder(order)}
                                style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                                title="Reassign / Manual Dispatch"
                              >
                                Dispatch
                              </button>
                              <button
                                onClick={() => adminCancelOrder(order.id, "Admin Operational Override")}
                                style={{ background: "#ef4444", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                                title="Force Cancel Order"
                              >
                                <FaBan />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DRIVER PARTNERS */}
        {activeTab === "DRIVERS" && (
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "20px" }}>Registered Delivery Partners ({drivers.length})</h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {drivers.map((d) => (
                <div key={d.id} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", background: "#f8fafc" }}>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                    <img src={d.avatar} alt={d.name} style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                    <div>
                      <strong style={{ fontSize: "15px" }}>{d.name}</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{d.phone}</div>
                      <div style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 700 }}>⭐ {d.rating} Rating</div>
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", color: "#475569", display: "flex", flexDirection: "column", gap: "4px", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
                    <div><strong>Vehicle:</strong> {d.vehicleType} ({d.vehicleNumber})</div>
                    <div><strong>Wallet Balance:</strong> ₹{d.walletBalance}</div>
                    <div><strong>Today's Trips:</strong> {d.todayDeliveries}</div>
                    <div><strong>Status:</strong> <span style={{ color: d.status === "ONLINE" ? "#16a34a" : "#ef4444", fontWeight: 700 }}>{d.status}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WITHDRAWAL / PAYOUT APPROVALS */}
        {activeTab === "WITHDRAWALS" && (
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px" }}>Driver Wallet Withdrawal Requests</h3>

            {withdrawals.length === 0 ? (
              <p style={{ color: "#64748b" }}>No withdrawal requests.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                    <th style={{ padding: "10px" }}>Payout ID</th>
                    <th style={{ padding: "10px" }}>Driver Name</th>
                    <th style={{ padding: "10px" }}>Amount</th>
                    <th style={{ padding: "10px" }}>Destination UPI</th>
                    <th style={{ padding: "10px" }}>Date</th>
                    <th style={{ padding: "10px" }}>Status</th>
                    <th style={{ padding: "10px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 10px", fontWeight: 700 }}>#{w.id}</td>
                      <td style={{ padding: "12px 10px" }}>{w.driverName}</td>
                      <td style={{ padding: "12px 10px", fontWeight: 800, color: "#16a34a" }}>₹{w.amount}</td>
                      <td style={{ padding: "12px 10px" }}>{w.upiId}</td>
                      <td style={{ padding: "12px 10px", color: "#64748b" }}>{w.date}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{ background: w.status === "COMPLETED" ? "#f0fdf4" : "#fef3c7", color: w.status === "COMPLETED" ? "#166534" : "#b45309", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 800 }}>
                          {w.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 10px" }}>
                        {w.status === "PENDING" && (
                          <button
                            onClick={() => adminApproveWithdrawal(w.id)}
                            style={{ background: "#16a34a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: 700, cursor: "pointer", fontSize: "12px" }}
                          >
                            Approve Payout
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 5: RESTAURANT PARTNER MANAGEMENT & DELETION */}
        {activeTab === "RESTAURANTS" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ position: "relative", minWidth: "280px" }}>
                <FaSearch style={{ position: "absolute", left: "12px", top: "12px", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Search restaurant by name, cuisine, area..."
                  value={restSearch}
                  onChange={(e) => setRestSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
              </div>

              <button
                onClick={() => setShowAddRestModal(true)}
                style={{
                  background: "var(--food-primary)",
                  color: "#fff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <FaPlus /> + Onboard New Restaurant Outlet
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {restaurants
                .filter(
                  (r) =>
                    r.name.toLowerCase().includes(restSearch.toLowerCase()) ||
                    r.cuisine.toLowerCase().includes(restSearch.toLowerCase()) ||
                    r.address.toLowerCase().includes(restSearch.toLowerCase())
                )
                .map((rest) => (
                  <div
                    key={rest.id}
                    style={{
                      background: "#fff",
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      padding: "16px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", gap: "14px", marginBottom: "12px" }}>
                        <img
                          src={rest.image}
                          alt={rest.name}
                          style={{ width: "60px", height: "60px", borderRadius: "10px", objectFit: "cover" }}
                        />
                        <div>
                          <strong style={{ fontSize: "16px", display: "block" }}>{rest.name}</strong>
                          <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>{rest.cuisine}</span>
                          <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>{rest.address}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "14px" }}>
                        <span>⭐ {rest.rating} ({rest.reviewCount || 0}+)</span>
                        <span>🍴 {rest.items?.length || 0} Dishes</span>
                        <span>🛵 ₹{rest.deliveryFee} Fee</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <a
                        href={`/food/restaurant-menu/${rest.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          flex: 1,
                          textAlign: "center",
                          padding: "8px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          color: "#1e293b",
                          fontWeight: 700,
                          fontSize: "12px",
                          textDecoration: "none"
                        }}
                      >
                        View Menu ↗
                      </a>
                      <button
                        onClick={() => setRestaurantToDelete(rest)}
                        style={{
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: "1px solid #fecaca",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          fontWeight: 700,
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <FaTrash size={11} /> Delete / Delist
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Manual Driver Assignment Modal */}
      {assignModalOrder && (
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
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Manual Dispatch for Order #{assignModalOrder.id}</h3>
              <button onClick={() => setAssignModalOrder(null)} style={{ background: "transparent", border: "none", fontSize: "16px", cursor: "pointer" }}>✕</button>
            </div>

            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>
              Pickup: <strong>{assignModalOrder.restaurantName}</strong> • Delivery: <strong>{assignModalOrder.customerName}</strong>
            </p>

            <h4 style={{ fontSize: "14px", margin: "0 0 10px" }}>Select Available Driver (Sorted by Distance):</h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "260px", overflowY: "auto", marginBottom: "16px" }}>
              {drivers.map((driver) => {
                const dist = calculateDistanceKm(driver.lat, driver.lng, assignModalOrder.restaurantLat, assignModalOrder.restaurantLng);
                const isOnline = driver.status === "ONLINE";

                return (
                  <div
                    key={driver.id}
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: isOnline ? "#f8fafc" : "#fff1f2"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img src={driver.avatar} alt={driver.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                      <div>
                        <strong style={{ fontSize: "14px" }}>{driver.name}</strong>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {dist} km away • {driver.status}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        adminManualAssignDriver(assignModalOrder.id, driver.id);
                        setAssignModalOrder(null);
                      }}
                      style={{
                        background: isOnline ? "var(--food-primary)" : "#64748b",
                        color: "#fff",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer"
                      }}
                    >
                      Assign
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Onboard New Restaurant Modal */}
      {showAddRestModal && (
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
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>Onboard New Restaurant</h3>
              <button onClick={() => setShowAddRestModal(false)} style={{ background: "transparent", border: "none", fontSize: "16px", cursor: "pointer" }}>✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newRestName.trim()) return;
                registerNewRestaurant({
                  name: newRestName.trim(),
                  cuisine: newRestCuisine.trim(),
                  address: newRestAddress.trim(),
                  deliveryFee: Number(newRestDeliveryFee),
                  isPureVeg: false,
                  image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800"
                });
                setNewRestName("");
                setShowAddRestModal(false);
              }}
            >
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "4px" }}>Restaurant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Spice Darbar"
                  value={newRestName}
                  onChange={(e) => setNewRestName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "4px" }}>Cuisines</label>
                <input
                  type="text"
                  placeholder="e.g. Biryani • Mughlai • Kebabs"
                  value={newRestCuisine}
                  onChange={(e) => setNewRestCuisine(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "4px" }}>Address / Area</label>
                <input
                  type="text"
                  placeholder="e.g. Bandra West, Mumbai"
                  value={newRestAddress}
                  onChange={(e) => setNewRestAddress(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "4px" }}>Delivery Fee (₹)</label>
                <input
                  type="number"
                  placeholder="35"
                  value={newRestDeliveryFee}
                  onChange={(e) => setNewRestDeliveryFee(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddRestModal(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: "12px", borderRadius: "10px", border: "none", background: "#16a34a", color: "#fff", fontWeight: 800, cursor: "pointer" }}
                >
                  Register Outlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Restaurant Confirmation Modal */}
      {restaurantToDelete && (
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
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "440px", width: "100%", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "24px" }}>
              <FaTrash />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
              Delete Restaurant Outlet?
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 20px", lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>{restaurantToDelete.name}</strong>?
              <br />
              This will remove all menu items ({restaurantToDelete.items?.length || 0} dishes) and delist it from the platform.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setRestaurantToDelete(null)}
                style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteRestaurant(restaurantToDelete.id);
                  setRestaurantToDelete(null);
                }}
                style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#dc2626", color: "#fff", fontWeight: 800, cursor: "pointer" }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
