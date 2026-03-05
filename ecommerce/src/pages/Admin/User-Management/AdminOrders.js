import React, { useEffect, useState } from "react";
import api from "../../../api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await api.post("/orders/all", {
        page,
        size,
      });

      // 🔥 FIX: extract correct fields
      const orderArray = res.data.data || [];
      const meta = res.data.meta || {};

      setOrders(Array.isArray(orderArray) ? orderArray : []);
      setTotalPages(meta.totalPages || 1);

    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]); // prevent crash
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  return (
    <div style={{ padding: 30 }}>
      <h2>Admin Orders</h2>

      {loading && <p>Loading...</p>}

      {!loading && orders.length === 0 && <p>No orders found</p>}

      {Array.isArray(orders) &&
        orders.map((order) => (
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
            <p><b>Status:</b> {order.orderStatus}</p>
            <p><b>Total:</b> ₹{order.pricing?.grandTotal}</p>
          </div>
        ))}

      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => setPage((prev) => prev - 1)}
          disabled={page === 1}
        >
          Previous
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}