import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/productDetails.css";
import Navbar from "../../components/Navbar";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const data = res.data.data;
        setProduct(data);
        setActiveImage(data.thumbnail);
        setIsWishlisted(data.isWishlisted || false);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
        else setError("Unable to load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);


  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Login required to add items to cart");
        navigate("/login");
        return;
      }

      const res = await api.post("/users/cart", {
        productId: id,
        quantity
      });

      if (res.data.success) {
        alert("Item added to cart successfully 🛒");
      }

    } catch (err) {
      console.error(err);
      alert("Unable to add product to cart");
    }
  };

  const toggleWishlist = async () => {
    try {
      // /wishlists/create toggles: adds if not in list, removes if already there
      await api.post("/wishlists/create", { productId: id });
      if (isWishlisted) {
        setIsWishlisted(false);
        alert("Removed from wishlist 💔");
      } else {
        setIsWishlisted(true);
        alert("Added to wishlist ❤️");
      }
    } catch {
      alert("Wishlist action failed");
    }
  };

  const handleBuyNow = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to continue");
      navigate("/login");
      return;
    }

    const data = {
      buyNow: true,
      product: product,
      quantity: quantity
    };

    // store for refresh safety
    localStorage.setItem("checkoutData", JSON.stringify(data));

    navigate("/checkout", {
      state: data
    });
  };

  const handlePayNow = () => {
    alert(
      `Payment successful! ₹${(product.discountPrice ?? product.price) * quantity
      } paid via ${paymentMethod}`
    );
    setIsPaymentOpen(false);
    navigate("/");
  };

  if (loading) return <h2 className="state-msg">Loading product details...</h2>;
  if (error) return <h2 className="state-msg">{error}</h2>;
  if (!product) return <h2 className="state-msg">Product not found</h2>;

  const { detail } = product;

  return (
    <div>
      <Navbar />
      <div className="product-details-page">

        <div className="product-details-card">
          {/* ================= IMAGE PANEL ================= */}
          <div className="image-panel">
            <span
              className={`stock-badge ${(detail?.stock ?? 0) > 0 ? "in" : "out"
                }`}
            >
              {(detail?.stock ?? 0) > 0 ? "In Stock" : "Out of Stock"}
            </span>

            <img src={activeImage} alt={product.title} className="main-image" />

            <div className="image-gallery">
              {[product.thumbnail, ...(product.images || [])]
                .filter(Boolean)
                .map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`product-${index}`}
                    className={activeImage === img ? "active" : ""}
                    onClick={() => setActiveImage(img)}
                  />
                ))}
            </div>
          </div>

          <div className="info-panel">

            <div className="title-row">
              <h1>{product.title}</h1>
              <button
                className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
                onClick={toggleWishlist}
              >
                {isWishlisted ? "❤️" : "🤍"}
              </button>
            </div>

            <p><strong>Brand:</strong> {product.brand?.name || "No Brand"}</p>
            <p><strong>Category:</strong> {product.category?.name || "Uncategorized"}</p>

            {/* Ratings */}
            <div className="rating">
              {product.reviews?.length
                ? `⭐ ${(
                  product.reviews.reduce((a, r) => a + r.rating, 0) /
                  product.reviews.length
                ).toFixed(1)} (${product.reviews.length} reviews)`
                : "No Ratings"}
            </div>

            {/* Price */}
            <div className="price">
              ₹{product.discountPrice ?? product.price}
              {product.discountPrice && <del> ₹{product.price}</del>}
            </div>

            <p className="short-desc">{detail?.description}</p>

            <div className="cta-group">
              <button
                className="add-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.isActive}
              >
                Add to Cart
              </button>
              <button
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={!product.isActive}
              >
                Buy Now
              </button>
            </div>

            <div className="meta">
              <p><strong>Status:</strong> {product.isActive ? "Available" : "Unavailable"}</p>
              <p><strong>Stock:</strong> {detail?.stock ?? "N/A"}</p>
              <p><strong>Warranty:</strong> {detail?.warranty ?? "N/A"}</p>
              <p><strong>Shipping:</strong> {detail?.shippingInfo ?? "N/A"}</p>
              <p><strong>Return Policy:</strong> {detail?.returnPolicy ?? "N/A"}</p>
            </div>
          </div>
        </div>

        {isPaymentOpen && (
          <div className="drawer-backdrop" onClick={() => setIsPaymentOpen(false)}>
            <div className="drawer" onClick={(e) => e.stopPropagation()}>
              <h2>Complete Your Order</h2>

              <div className="drawer-product">
                <img src={activeImage} alt={product.title} />
                <div className="drawer-product-info">
                  <h3>{product.title}</h3>
                  <p>Price: ₹{product.discountPrice ?? product.price}</p>
                  <div className="quantity-selector">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)}>+</button>
                  </div>
                </div>
              </div>

              <div className="payment-options">
                <h4>Select Payment Method</h4>
                <label>
                  <input
                    type="radio"
                    value="credit-card"
                    checked={paymentMethod === "credit-card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  /> Credit Card
                </label>
                <label>
                  <input
                    type="radio"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  /> UPI
                </label>
                <label>
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  /> Cash on Delivery
                </label>
              </div>

              <button className="checkout-btn" onClick={handlePayNow}>
                Pay Now ₹{(product.discountPrice ?? product.price) * quantity}
              </button>
              <button className="close-drawer" onClick={() => setIsPaymentOpen(false)}>✕</button>
            </div>
          </div>
        )}

        {/* ================= DESCRIPTION & SPECIFICATIONS ================= */}
        {detail?.description && (
          <section className="details-section">
            <h3>Product Description</h3>
            <p>{detail.description}</p>
          </section>
        )}

        {detail?.specifications && (
          <section className="details-section">
            <h3>Specifications</h3>
            <table className="spec-table">
              <tbody>
                {Array.isArray(detail.specifications) 
                  ? detail.specifications.map((spec, index) => (
                      <tr key={spec._id || index}>
                        <td className="spec-key">{spec.key}</td>
                        <td className="spec-value">{spec.value}</td>
                      </tr>
                    ))
                  : Object.entries(detail.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td className="spec-key">{key}</td>
                        <td className="spec-value">{value}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </section>
        )}

        {/* CATEGORY & CREATOR */}
        <section className="details-section">
          <h3>Category Details</h3>
          <ul>
            <li><strong>Name:</strong> {product.category?.name}</li>
            <li><strong>Description:</strong> {product.category?.description}</li>
            <li><strong>Active:</strong> {product.category?.isActive ? "Yes" : "No"}</li>
          </ul>
          {product.category?.image && (
            <img src={product.category.image} alt={product.category.name} className="category-image" />
          )}
        </section>

        <section className="details-section">
          <h3>Created By</h3>
          <ul>
            <li><strong>Name:</strong> {product.createdBy?.name}</li>
            <li><strong>Email:</strong> {product.createdBy?.email}</li>
            <li><strong>Role:</strong> {product.createdBy?.role}</li>
          </ul>
        </section>
      </div>
    </div>

  );
}