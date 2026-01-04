import React, { useState } from "react";
import api from "../api";
import "../styles/rating.css";

export default function RateProduct({ productId, onSuccess }) {
  const userId = localStorage.getItem("userId");

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!userId) {
    return (
      <div className="rate-box">
        <p className="login-msg">Please login to rate this product</p>
      </div>
    );
  }

  const submitReview = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    try {
      setLoading(true);
      await api.post("/reviews/add", {
        productId,
        rating,
        comment,
      });

      alert("Thank you for rating ⭐");
      setRating(0);
      setComment("");
      onSuccess && onSuccess();
    } catch (err) {
      alert("You already rated this product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rate-box">
      <h3>Rate this product</h3>

      <div className="star-picker">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={
              (hover || rating) >= star ? "star active" : "star"
            }
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
          >
            ⭐
          </span>
        ))}
      </div>

      <textarea
        placeholder="Write a review (optional)"
        value={comment}
        onChange={e => setComment(e.target.value)}
      />

      <button onClick={submitReview} disabled={loading}>
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}
