import React from "react";

const orders = [
  {
    _id: "ORD123",
    user: "Ankita",
    status: "PLACED",
    total: 2499,
  },
  {
    _id: "ORD124",
    user: "Rahul",
    status: "SHIPPED",
    total: 1599,
  },
];

export default function AdminOrders() {
  return (
    <div style={{ padding: 30 }}>
      <h2>Admin Orders</h2>

      {orders.map((order) => (
        <div
          key={order._id}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 10,
          }}
        >
          <p><b>Order:</b> {order._id}</p>
          <p><b>User:</b> {order.user}</p>
          <p><b>Status:</b> {order.status}</p>
          <p><b>Total:</b> ₹{order.total}</p>

          <select>
            <option>PLACED</option>
            <option>CONFIRMED</option>
            <option>SHIPPED</option>
            <option>DELIVERED</option>
            <option>CANCELLED</option>
          </select>
        </div>
      ))}
    </div>
  );
}
