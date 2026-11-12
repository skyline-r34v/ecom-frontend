import React from "react";
import api from "../../api";

export default function DeliveryCard({ delivery, role, refresh }) {
  const updateStatus = async (status) => {
    try {
      await api.put("/transports/update-status", {
        transportId: delivery._id,
        status,
      });

      refresh();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PICKED_UP":
        return "status-pill picked";
      case "OUT_FOR_DELIVERY":
        return "status-pill out";
      case "DELIVERED":
        return "status-pill delivered";
      default:
        return "status-pill pending";
    }
  };

  return (
    <div className="delivery-card">
      <div className="delivery-card-header">
        <div>
          <span className="delivery-label">Order Reference</span>
          <h4 className="delivery-order-id">
            #{delivery.order?._id ? delivery.order._id.slice(-8).toUpperCase() : delivery._id?.slice(-8).toUpperCase()}
          </h4>
        </div>
        <span className={getStatusClass(delivery.status)}>
          {delivery.status?.replace(/_/g, " ") || "SCHEDULED"}
        </span>
      </div>

      <div className="delivery-card-body">
        <div className="delivery-meta-row">
          <span className="meta-key">Tracking Code:</span>
          <code className="meta-tracking">{delivery.trackingNumber || "TRK-" + delivery._id?.slice(-6).toUpperCase()}</code>
        </div>
        {delivery.driver && (
          <div className="delivery-meta-row">
            <span className="meta-key">Assigned Driver:</span>
            <span className="meta-driver">
              {typeof delivery.driver === "object" ? delivery.driver?.name || delivery.driver?._id : delivery.driver}
            </span>
          </div>
        )}
      </div>

      {role === "delivery" && (
        <div className="delivery-actions-row">
          <button
            type="button"
            className="action-btn pickup"
            onClick={() => updateStatus("PICKED_UP")}
          >
            📦 Picked Up
          </button>
          <button
            type="button"
            className="action-btn out"
            onClick={() => updateStatus("OUT_FOR_DELIVERY")}
          >
            🚚 Out for Delivery
          </button>
          <button
            type="button"
            className="action-btn delivered"
            onClick={() => updateStatus("DELIVERED")}
          >
            ✓ Delivered
          </button>
        </div>
      )}
    </div>
  );
}