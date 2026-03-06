import React, { useEffect, useState } from "react";
import api from "../../../api";
import { useNavigate } from "react-router-dom";
import "../../../styles/AdminOrders.css";

export default function AdminOrders() {

  const navigate = useNavigate();

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

      const orderArray = res.data.data || [];
      const meta = res.data.meta || {};

      setOrders(Array.isArray(orderArray) ? orderArray : []);
      setTotalPages(meta.totalPages || 1);

    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  return (
    <div className="orders-container">

      <div className="orders-header">

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h2>Orders</h2>

      </div>

      <div className="orders-card">

        {loading && <p className="loading">Loading orders...</p>}

        {!loading && orders.length === 0 && (
          <p className="empty">No orders found</p>
        )}

        {!loading && orders.length > 0 && (

          <table className="orders-table">

            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.user}</td>

                  <td>
                    <span className={`status ${order.orderStatus}`}>
                      {order.orderStatus}
                    </span>
                  </td>

                  <td>₹{order.pricing?.grandTotal}</td>
                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

      <div className="pagination">

        <button
          onClick={() => setPage((prev) => prev - 1)}
          disabled={page === 1}
        >
          Previous
        </button>

        <span>
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