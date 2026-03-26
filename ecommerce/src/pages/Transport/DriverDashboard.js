import React, { useEffect, useState } from "react";
import api from "../../api";
import DeliveryCard from "./DeliveryCard";

export default function DriverDashboard() {
  const [deliveries, setDeliveries] = useState([]);

  const fetchDeliveries = async () => {
    try {
      const res = await api.get("/transports/driver/deliveries");
      setDeliveries(res.data.deliveries);
    } catch (err) {
      alert("Error fetching deliveries");
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return (
    <div>
      <h2>Driver Dashboard</h2>

      {deliveries.map((d) => (
        <DeliveryCard
          key={d._id}
          delivery={d}
          role="delivery"
          refresh={fetchDeliveries}
        />
      ))}
    </div>
  );
}