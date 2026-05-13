import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/myorder.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .post("/orders/my")
      .then((res) => setOrders(res.data.data || []))
      .catch((err) => console.error(err));
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
        return "status placed";

      case "SHIPPED":
        return "status shipped";

      case "DELIVERED":
        return "status delivered";

      case "CANCELLED":
        return "status cancelled";

      default:
        return "status";
    }
  };

  return (
    <div className="myorders-container">
      <div className="myorders-header">
        <h2>My Orders</h2>
        <p>{orders.length} Orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <h3>No Orders Found</h3>
          <p>Your placed orders will appear here.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const firstItem = order.items?.[0];

            return (
              <div
                key={order._id}
                className="order-card"
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                <div className="order-left">
                  <img
                    src={firstItem?.thumbnail}
                    alt={firstItem?.title}
                    className="order-image"
                  />
                </div>

                <div className="order-center">
                  <h3>{firstItem?.title}</h3>

                  <p className="order-id">
                    Order ID: {order._id.slice(-8)}
                  </p>

                  <p className="order-date">
                    Ordered on {formatDate(order.createdAt)}
                  </p>

                  <p className="order-items">
                    Qty: {firstItem?.quantity}
                  </p>

                  {order.items.length > 1 && (
                    <p className="more-items">
                      +{order.items.length - 1} more item(s)
                    </p>
                  )}
                </div>

                <div className="order-right">
                  <div className={getStatusClass(order.orderStatus)}>
                    {order.orderStatus}
                  </div>

                  <h3 className="order-price">
                    ₹{order.pricing?.grandTotal}
                  </h3>

                  <p className="payment-method">
                    {order.payment?.method}
                  </p>

                  <button
                    className="view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/orders/${order._id}`);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}