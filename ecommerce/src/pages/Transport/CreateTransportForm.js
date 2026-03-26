import React, { useState } from "react";
import api from "../../api";

export default function CreateTransportForm({ refresh }) {
  const [orderId, setOrderId] = useState("");
  const [pickupScheduledAt, setPickupScheduledAt] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/transports/create", {
        orderId,
        pickupScheduledAt,
      });

      alert("Transport Created");
      setOrderId("");
      setPickupScheduledAt("");
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Transport</h3>

      <input
        placeholder="Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
      />

      <input
        type="datetime-local"
        value={pickupScheduledAt}
        onChange={(e) => setPickupScheduledAt(e.target.value)}
      />

      <button type="submit">Create</button>
    </form>
  );
}