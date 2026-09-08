import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaMotorcycle, FaArrowLeft } from "react-icons/fa";
import useFoodDeliveryStore from "../../../store/foodDeliveryStore";
import FoodRoleSwitcher from "../../../components/FoodRoleSwitcher";
import Navbar from "../../../components/Navbar";

export default function CustomerOrdersList() {
  const navigate = useNavigate();
  const orders = useFoodDeliveryStore((state) => state.orders);

  return (
    <div className="food-portal-container">
      <FoodRoleSwitcher />
      <Navbar />

      <main className="food-main-layout" style={{ maxWidth: "880px" }}>
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
          <FaArrowLeft /> Back to Food Home
        </button>

        <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "24px" }}>My Food Orders ({orders.length})</h1>

        {orders.length === 0 ? (
          <div style={{ background: "#fff", padding: "40px", borderRadius: "16px", textAlign: "center", border: "1px dashed #cbd5e1" }}>
            <FaUtensils size={36} color="#94a3b8" />
            <p style={{ margin: "14px 0 0", color: "#64748b", fontWeight: 600 }}>You haven't placed any food orders yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {orders.map((order) => {
              const isDelivered = order.orderStatus === "DELIVERED";
              const isCancelled = order.orderStatus.includes("CANCEL") || order.orderStatus.includes("REJECT");
              const isActive = !isDelivered && !isCancelled;

              return (
                <div
                  key={order.id}
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "20px",
                    border: isActive ? "2px solid var(--food-primary)" : "1px solid #e2e8f0",
                    boxShadow: "var(--food-shadow-sm)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "14px" }}>
                    <div>
                      <strong style={{ fontSize: "16px", color: "#1e293b" }}>{order.restaurantName}</strong>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
                        Order #{order.id} • {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          background: isDelivered ? "#f0fdf4" : isCancelled ? "#fef2f2" : "#eff6ff",
                          color: isDelivered ? "#166534" : isCancelled ? "#dc2626" : "var(--food-primary)",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 800
                        }}
                      >
                        {order.orderStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: "13px", color: "#475569", marginBottom: "14px" }}>
                    {order.items.map((i, idx) => (
                      <span key={idx} style={{ marginRight: "12px" }}>
                        <strong>{i.quantity}x</strong> {i.name}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Total Paid:</span>{" "}
                      <strong style={{ fontSize: "15px", color: "#1e293b" }}>₹{order.grandTotal}</strong>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => navigate(`/food/track/${order.id}`)}
                        style={{
                          background: isActive ? "var(--food-primary)" : "#1e293b",
                          color: "#fff",
                          border: "none",
                          padding: "8px 18px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <FaMotorcycle /> {isActive ? "Live Track Map →" : "View Order Details"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
