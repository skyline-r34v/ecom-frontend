import React, { useState } from "react";
import api from "../../api";

export default function CreateTransportForm({ refresh }) {
  const [orderId, setOrderId] = useState("");
  const [pickupScheduledAt, setPickupScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      alert("Please enter an Order ID");
      return;
    }
    try {
      setLoading(true);
      await api.post("/transports/create", {
        orderId: orderId.trim(),
        pickupScheduledAt,
      });

      alert("Transport schedule created successfully");
      setOrderId("");
      setPickupScheduledAt("");
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create transport");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transport-form">
      <h3>Schedule New Transport Dispatch</h3>
      <div className="transport-form-grid">
        <div className="transport-form-field">
          <label>Target Order Reference *</label>
          <input
            placeholder="e.g. 64f8a123b098cde4..."
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
        </div>
        <div className="transport-form-field">
          <label>Scheduled Pickup Date & Time</label>
          <input
            type="datetime-local"
            value={pickupScheduledAt}
            onChange={(e) => setPickupScheduledAt(e.target.value)}
          />
        </div>
      </div>
      <button type="submit" className="transport-submit-btn" disabled={loading}>
        {loading ? "Scheduling..." : "+ Create Transport Order"}
      </button>
    </form>
  );
}