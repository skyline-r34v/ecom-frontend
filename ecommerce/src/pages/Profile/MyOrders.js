import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../../components/Navbar";
import { getProductImage } from "../../utils/productUtils";
import "../../styles/myorder.css";
import "../../styles/home.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .post("/orders/my")
      .then((res) => setOrders(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PLACED":
        return "status-chip placed";
      case "SHIPPED":
        return "status-chip shipped";
      case "OUT_FOR_DELIVERY":
        return "status-chip out";
      case "DELIVERED":
        return "status-chip delivered";
      case "CANCELLED":
        return "status-chip cancelled";
      case "RETURN_REQUESTED":
        return "status-chip return";
      default:
        return "status-chip";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return order.orderStatus === "PLACED" || order.orderStatus === "SHIPPED" || order.orderStatus === "OUT_FOR_DELIVERY";
    if (filter === "DELIVERED") return order.orderStatus === "DELIVERED";
    if (filter === "CANCELLED") return order.orderStatus === "CANCELLED";
    return true;
  });

  return (
    <div className="myorders-page-wrapper">
      <Navbar />

      <div className="myorders-container">
        {/* Header */}
        <div className="myorders-header">
          <div>
            <div className="section-eyebrow">
              <span className="eyebrow-dot" />
              <span>ORDER MANAGEMENT</span>
            </div>
            <h1 className="myorders-title">
              My Order <span className="highlight-text">History</span>
              <span className="myorders-count-badge">{orders.length} {orders.length === 1 ? "Order" : "Orders"}</span>
            </h1>
            <p className="myorders-sub">
              Track packages in real time, review delivered items, and manage delivery details.
            </p>
          </div>
          <button
            type="button"
            className="continue-shopping-btn"
            onClick={() => navigate("/products")}
          >
            ← Browse More Products
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="orders-filter-tabs">
          {[
            { key: "ALL", label: `All Orders (${orders.length})` },
            { key: "ACTIVE", label: "In Transit / Active" },
            { key: "DELIVERED", label: "Delivered" },
            { key: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`filter-tab-btn ${filter === tab.key ? "active" : ""}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="orders-loading-state">
            <div className="orders-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-orders-icon">📦</div>
            <h3>No Orders Found</h3>
            <p>
              {filter === "ALL"
                ? "You haven't placed any orders yet. Start exploring our collections today!"
                : `No orders found matching the filter "${filter}".`}
            </p>
            <button
              className="explore-now-btn"
              onClick={() => navigate("/products")}
            >
              Start Shopping Now
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const firstItem = order.items?.[0] || {};
              const totalItemsCount = order.items?.reduce(
                (sum, i) => sum + (i.quantity || 1),
                0
              ) || 1;

              return (
                <div
                  key={order._id}
                  className="order-card"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  <div className="order-left">
                    <img
                      src={getProductImage(firstItem)}
                      alt={firstItem.title || "Product"}
                      className="order-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80";
                      }}
                    />
                  </div>

                  <div className="order-center">
                    <div className="order-id-date-row">
                      <span className="order-id-chip">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="order-date-text">
                        Placed on {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <h3 className="order-title">{firstItem.title || "OneCart Purchase"}</h3>

                    <div className="order-meta-info">
                      <span>Items: {totalItemsCount}</span>
                      {order.items?.length > 1 && (
                        <span className="more-items-chip">
                          +{order.items.length - 1} other item(s)
                        </span>
                      )}
                      <span>Payment: <strong>{order.payment?.method || "Online"}</strong></span>
                    </div>
                  </div>

                  <div className="order-right">
                    <div className={getStatusClass(order.orderStatus)}>
                      <span className="status-dot"></span>
                      {order.orderStatus?.replace("_", " ")}
                    </div>

                    <div className="order-price-group">
                      <span className="price-label">Total Amount</span>
                      <h3 className="order-price">
                        ₹{order.pricing?.grandTotal?.toLocaleString() || "0"}
                      </h3>
                    </div>

                    <button
                      className="view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${order._id}`);
                      }}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}