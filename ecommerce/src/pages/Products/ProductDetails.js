import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/productDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= WISHLIST =================
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ================= PAYMENT =================
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  // ================= FETCH PRODUCT =================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const data = res.data.message;

        setProduct(data);
        setActiveImage(data.thumbnail);

        // if backend sends wishlist status
        if (data.isWishlisted) {
          setIsWishlisted(true);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Unable to load product details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // ================= ADD TO CART =================
  const handleAddToCart = async () => {
    try {
      const res = await api.post("/users/cart", {
        productId: id,
        quantity: 1,
      });

      if (res.data.success) {
        alert("Product added to cart ✅");
        navigate("/cart");
      } else {
        alert(res.data.message);
      }
    } catch {
      alert("Failed to add product to cart");
    }
  };

  // ================= WISHLIST TOGGLE =================
  const toggleWishlist = async () => {
    try {
      if (isWishlisted) {
        await api.delete(`/users/wishlist/${id}`);
        setIsWishlisted(false);
        alert("Removed from wishlist 💔");
      } else {
        await api.post("/users/wishlist", { productId: id });
        setIsWishlisted(true);
        alert("Added to wishlist ❤️");
      }
    } catch {
      alert("Wishlist action failed");
    }
  };

  // ================= BUY NOW =================
  const handleBuyNow = () => setIsPaymentOpen(true);

  // ================= PAY NOW =================
  const handlePayNow = () => {
    alert(
      `Payment successful! ₹${
        (product.discountPrice ?? product.price) * quantity
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
    <div className="product-details-page">
      {/* ================= PRODUCT CARD ================= */}
      <div className="product-card">
        {/* ================= IMAGE PANEL ================= */}
        <div className="image-panel">
          <span className={`stock-badge ${product.isActive ? "in" : "out"}`}>
            {product.isActive ? "Available" : "Unavailable"}
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

        {/* ================= INFO PANEL ================= */}
        <div className="info-panel">
          <div className="title-row">
            <h1>{product.title}</h1>

            {/* ❤️ LIKE / WISHLIST */}
            <button
              className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
              onClick={toggleWishlist}
            >
              {isWishlisted ? "❤️" : "❤️"}
            </button>
          </div>

          <p className="slug">Slug: {product.slug}</p>
          <p><strong>Brand:</strong> {product.brand}</p>
          <p><strong>Category:</strong> {product.category?.name}</p>

          <div className="rating">
            ⭐⭐⭐⭐☆ <span>(4.3 / 5 · 124 reviews)</span>
          </div>

          <div className="price">
            ₹{product.discountPrice}
            <del> ₹{product.price}</del>
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
            <p><strong>Stock:</strong> {detail?.stock}</p>
            <p><strong>Warranty:</strong> {detail?.warranty}</p>
            <p><strong>Shipping:</strong> {detail?.shippingInfo}</p>
            <p><strong>Return Policy:</strong> {detail?.returnPolicy}</p>
          </div>
        </div>
      </div>

      {/* ================= PAYMENT DRAWER ================= */}
      {isPaymentOpen && (
        <div className="drawer-backdrop" onClick={() => setIsPaymentOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <h2>Complete Your Order</h2>

            <div className="drawer-product">
              <img src={activeImage} alt={product.title} />
              <div className="drawer-product-info">
                <h3>{product.title}</h3>
                <p>Price: ₹{product.discountPrice}</p>
                <div className="quantity-selector">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)}>+</button>
                </div>
              </div>
            </div>

            <button className="checkout-btn" onClick={handlePayNow}>
              Pay Now ₹{(product.discountPrice ?? product.price) * quantity}
            </button>

            <button className="close-drawer" onClick={() => setIsPaymentOpen(false)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ================= DESCRIPTION ================= */}
      {detail?.description && (
        <section className="details-section">
          <h3>Product Description</h3>
          <p>{detail.description}</p>
        </section>
      )}

      {/* ================= SPECIFICATIONS ================= */}
      {detail?.specifications && (
        <section className="details-section">
          <h3>Specifications</h3>
          <table className="spec-table">
            <tbody>
              {Object.entries(detail.specifications).map(([key, value]) => (
                <tr key={key}>
                  <td className="spec-key">{key}</td>
                  <td className="spec-value">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ================= CATEGORY ================= */}
      <section className="details-section">
        <h3>Category Details</h3>
        <ul>
          <li><strong>Name:</strong> {product.category?.name}</li>
          <li><strong>Description:</strong> {product.category?.description}</li>
          <li><strong>Active:</strong> {product.category?.isActive ? "Yes" : "No"}</li>
        </ul>

        {product.category?.image && (
          <img
            src={product.category.image}
            alt={product.category.name}
            className="category-image"
          />
        )}
      </section>

      {/* ================= CREATED BY ================= */}
      <section className="details-section">
        <h3>Created By</h3>
        <ul>
          <li><strong>Name:</strong> {product.createdBy?.name}</li>
          <li><strong>Email:</strong> {product.createdBy?.email}</li>
          <li><strong>Role:</strong> {product.createdBy?.role}</li>
        </ul>
      </section>
    </div>
  );
}
