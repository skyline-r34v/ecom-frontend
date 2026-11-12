import React, { useState } from "react";
import api from "../../api";

export default function AssignDriver({ transportId, refresh }) {
  const [driverId, setDriverId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!driverId.trim()) {
      alert("Please provide a Driver ID");
      return;
    }
    try {
      setLoading(true);
      await api.post("/transports/assign-driver", {
        transportId,
        driverId: driverId.trim(),
      });

      alert("Driver assigned successfully");
      setDriverId("");
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || "Error assigning driver");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assign-driver-box">
      <span className="assign-driver-label">Assign Delivery Driver:</span>
      <div className="assign-driver-input-row">
        <input
          placeholder="Enter Driver ID..."
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
        />
        <button onClick={handleAssign} disabled={loading}>
          {loading ? "Assigning..." : "Assign"}
        </button>
      </div>
    </div>
  );
}