import React, { useEffect, useState } from "react";
import api from "../../api";
import DeliveryCard from "./DeliveryCard";
import Navbar from "../../components/Navbar";

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
      <Navbar />
      <div className="transport-container">
        <h2 className="transport-title">Driver Dashboard</h2>

        <div className="transport-list-container">
          {deliveries.map((d) => (
            <DeliveryCard
              key={d._id}
              delivery={d}
              role="delivery"
              refresh={fetchDeliveries}
            />
          ))}
        </div>
      </div>
    </div>
  );
}