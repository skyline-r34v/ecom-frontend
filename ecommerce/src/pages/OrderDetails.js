import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import "../styles/orderDetails.css";
import Navbar from "../components/Navbar";

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
        pickingAddress: order?.pickingAddress,
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

  const handleReturn = async () => {
    try {
      await api.post(`/orders/${id}/return`, {
        pickingAddress: order?.pickingAddress,
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) return <p className="loading">Loading...</p>;

  if (!order) return <p className="loading">Order not found</p>;

  return (
    <div>
      <Navbar />
      <div className="order-page">

        {/* HEADER */}
        <div className="order-top">
          <div>
            <h1>Order Details</h1>

            <p className="order-date">
              Ordered on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className={`status-badge ${order.orderStatus.toLowerCase()}`}>
            {order.orderStatus}
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="summary-card">
          <div>
            <span>Order ID</span>
            <h4>{order._id}</h4>
          </div>

          <div>
            <span>Total Amount</span>
            <h3>₹{order.pricing?.grandTotal}</h3>
          </div>

          <div>
            <span>Payment</span>
            <h4>{order.payment?.method}</h4>
          </div>

          <div>
            <span>Payment Status</span>
            <h4>{order.payment?.status}</h4>
          </div>
        </div>

        {/* ITEMS */}
        <div className="section">
          <h2>Ordered Items</h2>

          <div className="items-list">
            {order.items?.map((item, index) => (
              <div className="item-card" key={index}>
                <img src={item.thumbnail} alt={item.title} />

                <div className="item-details">
                  <h3>{item.title}</h3>

                  <p>Quantity: {item.quantity}</p>

                  <p>Price: ₹{item.price}</p>

                  <p className="subtotal">
                    Subtotal: ₹{item.subtotal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADDRESS SECTION */}
        <div className="address-grid">
          {/* SHIPPING */}
          <div className="address-card">
            <h2>Shipping Address</h2>

            <p>{order.shippingAddress?.fullName}</p>

            <p>{order.shippingAddress?.phone}</p>

            <p>{order.shippingAddress?.street}</p>

            <p>
              {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.state}
            </p>

            <p>{order.shippingAddress?.postalCode}</p>

            <p>{order.shippingAddress?.country}</p>
          </div>

          {/* PICKUP */}
          <div className="address-card">
            <h2>Pickup Address</h2>

            <p>{order.pickingAddress?.street}</p>

            <p>
              {order.pickingAddress?.city},{" "}
              {order.pickingAddress?.state}
            </p>

            <p>{order.pickingAddress?.postalCode}</p>

            <p>{order.pickingAddress?.country}</p>
          </div>
        </div>

        {/* PRICE BREAKDOWN */}
        <div className="pricing-card">
          <h2>Price Details</h2>

          <div className="price-row">
            <span>Items Total</span>
            <span>₹{order.pricing?.itemsTotal}</span>
          </div>

          <div className="price-row">
            <span>Shipping Fee</span>
            <span>₹{order.pricing?.shippingFee}</span>
          </div>

          <div className="price-row">
            <span>Tax</span>
            <span>₹{order.pricing?.tax}</span>
          </div>

          <div className="price-row">
            <span>Discount</span>
            <span>- ₹{order.pricing?.discount}</span>
          </div>

          <div className="price-row total">
            <span>Grand Total</span>
            <span>₹{order.pricing?.grandTotal}</span>
          </div>
        </div>

        {/* CANCEL REASON */}
        {order.cancellationReason && (
          <div className="cancelled-box">
            <h3>Cancellation Reason</h3>

            <p>{order.cancellationReason}</p>
          </div>
        )}

        {/* ACTIONS */}
        <div className="actions">
          {order.orderStatus === "PLACED" && (
            <div className="cancel-section">
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="">Select cancellation reason</option>

                {reasonOptions.map((reason, index) => (
                  <option key={index} value={reason}>
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
    </div>

  );
}