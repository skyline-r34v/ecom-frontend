import React, { useState } from "react";
import api from "../../api";

export default function AssignDriver({ transportId, refresh }) {
  const [driverId, setDriverId] = useState("");

  const handleAssign = async () => {
    try {
      await api.post("/transports/assign-driver", {
        transportId,
        driverId,
      });

      alert("Driver Assigned");
      setDriverId("");
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div>
      <input
        placeholder="Driver ID"
        value={driverId}
        onChange={(e) => setDriverId(e.target.value)}
      />
      <button onClick={handleAssign}>Assign Driver</button>
    </div>
  );
}