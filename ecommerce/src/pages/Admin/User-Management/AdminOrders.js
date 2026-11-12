import React, { useEffect, useState } from "react";
import api from "../../../api";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import "../../../styles/AdminOrders.css";

export default function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Derived metrics
  const totalVolume = orders.reduce((sum, o) => sum + (o.pricing?.grandTotal || 0), 0);
  const pendingCount = orders.filter((o) => o.orderStatus === "PLACED" || o.orderStatus === "SHIPPED").length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "DELIVERED").length;

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      order._id?.toLowerCase().includes(term) ||
      (typeof order.user === "string" && order.user.toLowerCase().includes(term)) ||
      order.orderStatus?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="admin-orders-page-wrapper">
      <Navbar />

      <div className="orders-container">
        {/* TOP BAR */}
        <div className="orders-top-bar">
          <div className="orders-header-title">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <div>
              <h2>Order Management</h2>
              <p>Monitor, track, and manage all customer purchases across the platform</p>
            </div>
          </div>
          <button className="refresh-orders-btn" onClick={fetchOrders} disabled={loading}>
            {loading ? "Refreshing..." : "↻ Refresh Data"}
          </button>
        </div>

        {/* METRICS ROW */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="stat-label">Total Loaded Orders</span>
            <div className="stat-value">{orders.length}</div>
            <span className="stat-sub">Page {page} of {totalPages}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Pending Dispatch</span>
            <div className="stat-value highlight-gold">{pendingCount}</div>
            <span className="stat-sub">Requires fulfillment</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Completed Deliveries</span>
            <div className="stat-value highlight-green">{deliveredCount}</div>
            <span className="stat-sub">Successfully fulfilled</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Batch Revenue</span>
            <div className="stat-value highlight-blue">₹{totalVolume.toLocaleString()}</div>
            <span className="stat-sub">Current view gross</span>
          </div>
        </div>

        {/* FILTER & SEARCH BAR */}
        <div className="orders-card">
          <div className="orders-card-toolbar">
            <input
              type="text"
              placeholder="Filter by Order ID or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="orders-search-input"
            />
            <span className="results-count">
              Showing <strong>{filteredOrders.length}</strong> orders
            </span>
          </div>

          {loading && (
            <div className="table-loading-state">
              <div className="orders-spinner"></div>
              <p>Fetching platform orders...</p>
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="empty-table-state">
              <p>No orders found matching your search.</p>
            </div>
          )}

          {!loading && filteredOrders.length > 0 && (
            <div className="table-scroll-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order Reference</th>
                    <th>Customer ID</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Grand Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <span className="order-id-cell">
                          #{order._id?.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="user-id-cell">
                          {typeof order.user === "object" ? order.user?._id?.slice(-6) : String(order.user).slice(-6)}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${order.orderStatus?.toLowerCase()}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td>
                        <span className="payment-method-chip">
                          {order.payment?.method || "ONLINE"}
                        </span>
                      </td>
                      <td>
                        <strong className="order-total-cell">
                          ₹{order.pricing?.grandTotal?.toLocaleString() || "0"}
                        </strong>
                      </td>
                      <td>
                        <button
                          className="table-view-btn"
                          onClick={() => navigate(`/orders/${order._id}`)}
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <div className="pagination">
          <button
            onClick={() => setPage((prev) => prev - 1)}
            disabled={page === 1}
          >
            ← Previous
          </button>

          <span className="pagination-info">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= totalPages}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}