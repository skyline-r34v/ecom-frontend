import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrder();
  }, [id]);

  const cancelOrder = async () => {
    await api.post(`/orders/${id}/cancel`, {
      reason: "Cancelled by user",
    });
    alert("Order Cancelled");
  };

  const requestReturn = async () => {
    await api.post(`/orders/${id}/return`);
    alert("Return Requested");
  };

  if (!order) return <p>Loading...</p>;

  return (
    <div>
      <h2>Order Details</h2>
      <p>Status: {order.orderStatus}</p>
      <p>Total: ₹{order.pricing.grandTotal}</p>

      {order.items.map((item) => (
        <div key={item.product}>
          <img src={item.thumbnail} width={80} alt="" />
          <p>{item.title} × {item.quantity}</p>
        </div>
      ))}

      {order.orderStatus === "PLACED" && (
        <button onClick={cancelOrder}>Cancel Order</button>
      )}

      {order.orderStatus === "DELIVERED" && (
        <button onClick={requestReturn}>Request Return</button>
      )}
    </div>
  );
}
