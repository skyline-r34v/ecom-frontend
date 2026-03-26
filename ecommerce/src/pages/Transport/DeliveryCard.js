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

  return (
    <div style={{ border: "1px solid gray", padding: 10, margin: 10 }}>
      <p><b>Order:</b> {delivery.order?._id}</p>
      <p><b>Status:</b> {delivery.status}</p>
      <p><b>Tracking:</b> {delivery.trackingNumber}</p>

      {role === "delivery" && (
        <div>
          <button onClick={() => updateStatus("PICKED_UP")}>Picked Up</button>
          <button onClick={() => updateStatus("OUT_FOR_DELIVERY")}>
            Out for Delivery
          </button>
          <button onClick={() => updateStatus("DELIVERED")}>
            Delivered
          </button>
        </div>
      )}
    </div>
  );
}