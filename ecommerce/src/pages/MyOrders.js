import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/myorder.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.post("/orders/my")
      .then((res) => setOrders(res.data.data || []))
      .catch((err) => console.error(err));
  }, []);

  const getStatusClass = (status) => `status-badge status-${status}`;

  return (
    <div className="myorders-container">
      <h2 className="myorders-title">My Orders</h2>

      {orders.length === 0 && <p className="no-orders">No orders found</p>}

      {orders.map((order) => (
        <div
          key={order._id}
          className="order-card"
          onClick={() => navigate(`/orders/${order._id}`)}
        >
          <div className="order-info">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Total:</strong> ₹{order.pricing?.grandTotal}</p>
          </div>
          <div className={getStatusClass(order.orderStatus)}>
            {order.orderStatus.replace("_", " ")}
          </div>
        </div>
      ))}
    </div>
  );
}
