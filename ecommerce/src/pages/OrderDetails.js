import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import "../styles/orderDetails.css";

export default function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const reasonOptions = [
    "Changed my mind",
    "Ordered by mistake",
    "Found a better price",
    "Other",
  ];

  // ================= FETCH ORDER =================
  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => {
        setOrder(res.data.data || res.data);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load order");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ================= CANCEL ORDER =================
  const handleCancel = async () => {
    let reason = cancelReason;

    if (!reason) {
      alert("Please select a reason");
      return;
    }

    if (reason === "Other") {
      if (!customReason.trim()) {
        alert("Please write your reason");
        return;
      }
      reason = customReason.trim();
    }

    try {
      await api.post(`/orders/${id}/cancel`, {
        reason,
        pickingAddress: order?.detail?.pickUpaddresses,
      });

      alert("Order cancelled");

      setOrder((prev) => ({
        ...prev,
        orderStatus: "CANCELLED",
        cancellationReason: reason,
      }));
    } catch (err) {
      console.error(err);
      alert("Unable to cancel order");
    }
  };

  // ================= RETURN ORDER =================
  const handleReturn = async () => {
    try {
      await api.post(`/orders/${id}/return`, {
        pickingAddress: order?.detail?.pickUpaddresses,
      });

      alert("Return requested");

      setOrder((prev) => ({
        ...prev,
        orderStatus: "RETURN_REQUESTED",
      }));
    } catch (err) {
      console.error(err);
      alert("Unable to request return");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="order-container">
      <h2 className="order-title">Order Details</h2>

      {/* ORDER INFO */}
      <div className="order-info">
        <p>
          <strong>Order ID:</strong> {order._id}
        </p>

        <p>
          <strong>Status:</strong> {order.orderStatus}
        </p>

        {order.cancellationReason && (
          <p>
            <strong>Cancellation Reason:</strong> {order.cancellationReason}
          </p>
        )}

        <p>
          <strong>Total:</strong> ₹{order.pricing?.grandTotal}
        </p>
      </div>

      <hr />

      {/* PRODUCTS */}
      <h3>Items</h3>

      {order.items?.map((item) => (
        <div key={item.product} className="order-item">
          <img src={item.thumbnail} alt={item.title} />

          <div>
            <p>{item.title}</p>
            <p>Qty: {item.quantity}</p>
            <p>₹{item.price}</p>
          </div>
        </div>
      ))}

      <hr />

      {/* PICKUP ADDRESS */}
      {order?.detail?.pickUpaddresses && (
        <div className="pickup-address">
          <h3>Pickup Address</h3>

          <p>{order.detail.pickUpaddresses.street}</p>
          <p>{order.detail.pickUpaddresses.city}</p>
          <p>{order.detail.pickUpaddresses.state}</p>
          <p>{order.detail.pickUpaddresses.country}</p>
          <p>{order.detail.pickUpaddresses.postalCode}</p>
        </div>
      )}

      <hr />

      {/* ACTION BUTTONS */}
      <div className="order-actions">
        {order.orderStatus === "PLACED" && (
          <div className="cancel-container">
            <select
              className="cancel-select"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            >
              <option value="">Select Reason</option>

              {reasonOptions.map((reason, idx) => (
                <option key={idx} value={reason}>
                  {reason}
                </option>
              ))}
            </select>

            {cancelReason === "Other" && (
              <input
                type="text"
                placeholder="Write your reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="cancel-input"
              />
            )}

            <button className="cancel-btn" onClick={handleCancel}>
              Cancel Order
            </button>
          </div>
        )}

        {order.orderStatus === "DELIVERED" && (
          <button className="return-btn" onClick={handleReturn}>
            Request Return
          </button>
        )}
      </div>
    </div>
  );
}