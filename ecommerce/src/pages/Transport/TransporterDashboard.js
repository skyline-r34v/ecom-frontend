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
      <div className="transport-container">
        <h2 className="transport-title">Transporter Dashboard</h2>

        <CreateTransportForm refresh={fetchDeliveries} />

        <div className="transport-list-container">
          {deliveries.map((d) => (
            <div key={d._id} className="delivery-card-wrapper">
              <DeliveryCard delivery={d} role="transporter" refresh={fetchDeliveries} />

              {!d.driver && (
                <AssignDriver transportId={d._id} refresh={fetchDeliveries} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}