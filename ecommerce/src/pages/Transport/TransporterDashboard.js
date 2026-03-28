import React, { useEffect, useState } from "react";
import api from "../../api";
import CreateTransportForm from "./CreateTransportForm";
import AssignDriver from "./AssignDriver";
import DeliveryCard from "./DeliveryCard";
import Navbar from "../../components/Navbar";

export default function TransporterDashboard() {
  const [deliveries, setDeliveries] = useState([]);

  const fetchDeliveries = async () => {
    try {
      const res = await api.get("/transports/transporter/deliveries");
      setDeliveries(res.data.deliveries);
    } catch (err) {
      alert("Error fetching data");
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return (
    <div>
      <Navbar />
      <h2>Transporter Dashboard</h2>

      <CreateTransportForm refresh={fetchDeliveries} />

      {deliveries.map((d) => (
        <div key={d._id}>
          <DeliveryCard delivery={d} role="transporter" refresh={fetchDeliveries} />

          {!d.driver && (
            <AssignDriver transportId={d._id} refresh={fetchDeliveries} />
          )}
        </div>
      ))}
    </div>
  );
}