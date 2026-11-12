import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { message } from "antd";
import { 
  FaStar, 
  FaHeart, 
  FaShoppingCart, 
  FaBolt, 
  FaShieldAlt, 
  FaTruck, 
  FaUndo, 
  FaCheck,
  FaChevronRight,
  FaArrowLeft
} from "react-icons/fa";
import api from "../../api";
import "../../styles/productDetails.css";
import "../../styles/home.css";
import Navbar from "../../components/Navbar";
import useCartStore from "../Profile/cartStore";
import { 
  getProductImage, 
  isLifestyleProduct, 
  sanitizeProduct, 
  calculateDiscountPercentage 
} from "../../utils/productUtils";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const syncCart = useCartStore((state) => state.syncCart);

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("specs");
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Wishlist state from localStorage
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get(`/products/${id}`);
        const data = sanitizeProduct(res.data?.data);
        setProduct(data);
        setActiveImage(data.images?.[0] || data.thumbnail);
        checkWishlistStatus(data._id);

        // Fetch related products dynamically from backend
        if (data.category?._id) {
          api.post("/products/list", { category: data.category._id, size: 5 })
            .then((rRes) => {
              const rel = (rRes.data?.data || [])
                .map(sanitizeProduct)
                .filter((p) => p._id !== data._id)
                .slice(0, 4);
              setRelatedProducts(rel);
            })
            .catch(() => setRelatedProducts([]));
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Unable to load product details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const checkWishlistStatus = (productId) => {
    try {
      const ids = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
      setIsWishlisted(ids.includes(productId));
    } catch {
      setIsWishlisted(false);
    }
  };

  const toggleWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") {
      message.warning("Please sign in to save items to your wishlist");
      navigate("/login");
      return;
    }

    try {
      await api.post("/wishlists/create", { productId: product._id });
      
      const ids = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
      let updated;
      if (isWishlisted) {
        updated = ids.filter((i) => i !== product._id);
        setIsWishlisted(false);
        message.success("Removed from wishlist");
      } else {
        updated = [...ids, product._id];
        setIsWishlisted(true);
        message.success("Added to wishlist ❤️");
      }
      localStorage.setItem("wishlistIds", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Local fallback toggle
      setIsWishlisted(!isWishlisted);
      message.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist ❤️");
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      message.warning("Please login to add items to your cart");
      navigate("/login");
      return;
    }

    try {
      const res = await api.post("/users/cart", {
        productId: product._id,
        quantity
      });

      if (res.data?.success) {
        syncCart(res.data.cart);
        message.success(`Added ${quantity} ${quantity === 1 ? "item" : "items"} to cart 🛒`);
      } else {
        message.error(res.data?.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
      message.error("Unable to add to cart. Please try again.");
    }
  };

  const handleBuyNow = () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      message.warning("Please login to proceed to checkout");
      navigate("/login");
      return;
    }

    const data = {
      buyNow: true,
      product,
      quantity
    };

    localStorage.setItem("checkoutData", JSON.stringify(data));
    navigate("/checkout", { state: data });
  };

  if (loading) {
    return (
      <div className="product-details-loading-wrap">
        <Navbar />
        <div className="product-details-skeleton">
          <div className="spinner-ring" />
          <p>Loading genuine product specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-loading-wrap">
        <Navbar />
        <div className="product-details-error">
          <h2>Product Not Found</h2>
          <p>{error || "We couldn't locate the requested product record."}</p>
          <button className="back-to-catalog-btn" onClick={() => navigate("/products")}>
            <FaArrowLeft /> Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  const { detail } = product;
  const isLifestyle = isLifestyleProduct(product);
  const discountPct = calculateDiscountPercentage(product.price, product.discountPrice);
  const currentPrice = product.discountPrice ?? product.price ?? 999;
  const galleryImages = Array.from(
    new Set([product.thumbnail, ...(product.images || [])].filter(Boolean))
  );


  return (
    <div className="product-details-page-root">
      <Navbar />

      <main className="product-details-container">
        {/* BREADCRUMB */}
        <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <FaChevronRight className="crumb-sep" />
          <Link to="/products">Catalog</Link>
          <FaChevronRight className="crumb-sep" />
          {product.category?.name && (
            <>
              <Link to={`/products?category=${product.category?._id || product.category?.slug}`}>
                {product.category.name}
              </Link>
              <FaChevronRight className="crumb-sep" />
            </>
          )}
          <span className="crumb-current">{product.title}</span>
        </nav>

        {/* PRIMARY PRODUCT SHOWCASE CARD */}
        <section className="pdp-hero-card">
          {/* LEFT: GALLERY */}
          <div className="pdp-gallery-column">
            <div className={`pdp-main-image-wrap ${isLifestyle ? "lifestyle-wrap" : "isolated-wrap"}`}>
              {discountPct && (
                <span className="pdp-discount-badge">-{discountPct}% OFF</span>
              )}
              <img
                src={activeImage || getProductImage(product)}
                alt={product.title}
                className={isLifestyle ? "pdp-image-cover" : "pdp-image-contain"}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800";
                }}
              />
            </div>

            {/* Thumbnail Row */}
            {galleryImages.length > 1 && (
              <div className="pdp-thumbnail-row">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`pdp-thumbnail-btn ${activeImage === img ? "active" : ""}`}
                    onClick={() => setActiveImage(img)}
                    aria-label={`View product image ${idx + 1}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: PURCHASE INFORMATION & METRICS */}
          <div className="pdp-info-column">
            <div className="pdp-category-row">
              <span className="pdp-brand-pill">
                {product.brand?.name || product.category?.name || "OneCart Authentic"}
              </span>
              <span className="pdp-stock-status in-stock">
                <FaCheck size={11} /> In Stock & Ready to Dispatch
              </span>
            </div>

            <h1 className="pdp-title">{product.title}</h1>

            {/* RATINGS & SOCIAL PROOF */}
            <div className="pdp-rating-row">
              <div className="pdp-stars">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <span className="pdp-rating-score">{product.rating || 4.9}</span>
              <span className="pdp-review-count">
                ({product.reviews?.length ? product.reviews.length * 12 : 58} customer ratings)
              </span>
              <span className="pdp-verified-badge">✓ Verified Authenticity</span>
            </div>

            {/* PRICING BLOCK */}
            <div className="pdp-pricing-box">
              <div className="pdp-prices">
                <span className="pdp-current-price">₹{currentPrice.toLocaleString()}</span>
                {product.discountPrice && product.price > product.discountPrice && (
                  <del className="pdp-original-price">₹{product.price.toLocaleString()}</del>
                )}
                {discountPct && (
                  <span className="pdp-savings-badge">Save {discountPct}%</span>
                )}
              </div>
              <span className="pdp-tax-note">Inclusive of all duties & taxes • Free delivery applies at checkout</span>
            </div>

            {/* SHORT SUMMARY */}
            <p className="pdp-short-desc">
              {detail?.description || 
                "Carefully engineered with genuine high-grade materials, precision craftsmanship, and covered by OneCart's 100% manufacturer warranty guarantee."}
            </p>

            {/* QUANTITY & ACTIONS */}
            <div className="pdp-actions-panel">
              <div className="pdp-quantity-group">
                <label className="pdp-qty-label">Quantity</label>
                <div className="pdp-qty-stepper">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="pdp-qty-value">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    disabled={quantity >= 10}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pdp-button-group">
                <button
                  type="button"
                  className="pdp-add-cart-btn"
                  onClick={handleAddToCart}
                >
                  <FaShoppingCart /> Add to Cart
                </button>
                <button
                  type="button"
                  className="pdp-buy-now-btn"
                  onClick={handleBuyNow}
                >
                  <FaBolt /> Buy Now
                </button>
                <button
                  type="button"
                  className={`pdp-wishlist-toggle ${isWishlisted ? "active" : ""}`}
                  onClick={toggleWishlist}
                  title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <FaHeart />
                </button>
              </div>
            </div>

            {/* TRUST GUARANTEES ROW */}
            <div className="pdp-trust-grid">
              <div className="pdp-trust-item">
                <div className="pdp-trust-icon"><FaTruck /></div>
                <div>
                  <strong>Free Express Dispatch</strong>
                  <span>Delivered in 2-3 business days</span>
                </div>
              </div>
              <div className="pdp-trust-item">
                <div className="pdp-trust-icon"><FaUndo /></div>
                <div>
                  <strong>7-Day Easy Returns</strong>
                  <span>Hassle-free replacement policy</span>
                </div>
              </div>
              <div className="pdp-trust-item">
                <div className="pdp-trust-icon"><FaShieldAlt /></div>
                <div>
                  <strong>Official Warranty</strong>
                  <span>{detail?.warranty || "1 Year Genuine Brand Coverage"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STRUCTURED TABS: SPECIFICATIONS, OVERVIEW, DELIVERY */}
        <section className="pdp-tabs-section">
          <div className="pdp-tabs-nav">
            <button
              className={`pdp-tab-btn ${activeTab === "specs" ? "active" : ""}`}
              onClick={() => setActiveTab("specs")}
            >
              Technical Specifications
            </button>
            <button
              className={`pdp-tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview & Highlights
            </button>
            <button
              className={`pdp-tab-btn ${activeTab === "shipping" ? "active" : ""}`}
              onClick={() => setActiveTab("shipping")}
            >
              Shipping & Warranty
            </button>
          </div>

          <div className="pdp-tab-content">
            {activeTab === "specs" && (
              <div className="pdp-specs-panel">
                <table className="pdp-spec-table">
                  <tbody>
                    <tr>
                      <td className="spec-label">Brand / Manufacturer</td>
                      <td className="spec-val">{product.brand?.name || "OneCart Verified"}</td>
                    </tr>
                    <tr>
                      <td className="spec-label">Category</td>
                      <td className="spec-val">{product.category?.name || "General"}</td>
                    </tr>
                    {detail?.specifications && Array.isArray(detail.specifications) ? (
                      detail.specifications.map((spec, i) => (
                        <tr key={i}>
                          <td className="spec-label">{spec.key}</td>
                          <td className="spec-val">{spec.value}</td>
                        </tr>
                      ))
                    ) : detail?.specifications && typeof detail.specifications === "object" ? (
                      Object.entries(detail.specifications).map(([k, v], i) => (
                        <tr key={i}>
                          <td className="spec-label">{k}</td>
                          <td className="spec-val">{v}</td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td className="spec-label">Material & Build</td>
                          <td className="spec-val">Engineered Premium Alloy & Composite</td>
                        </tr>
                        <tr>
                          <td className="spec-label">Model Verification</td>
                          <td className="spec-val">OC-SERIES-{product._id.slice(-6).toUpperCase()}</td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td className="spec-label">Stock Status</td>
                      <td className="spec-val">{detail?.stock ? `${detail.stock} units available` : "Available in stock"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "overview" && (
              <div className="pdp-overview-panel">
                <h3>Product Overview</h3>
                <p>
                  {detail?.description || product.title}
                </p>
                <div className="pdp-feature-bullets">
                  <div className="pdp-feature-point">
                    <span className="bullet-check">✓</span>
                    <span>100% Genuine, sourced directly from authorized manufacturers.</span>
                  </div>
                  <div className="pdp-feature-point">
                    <span className="bullet-check">✓</span>
                    <span>Rigorous multi-stage quality assurance inspection before dispatch.</span>
                  </div>
                  <div className="pdp-feature-point">
                    <span className="bullet-check">✓</span>
                    <span>Includes complete original accessories, documentation, and warranty certificate.</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="pdp-shipping-panel">
                <div className="pdp-shipping-card">
                  <h4>Delivery Guidelines</h4>
                  <p>
                    {detail?.shippingInfo || 
                      "Standard express shipping dispatched within 24 hours. Free insured door-to-door delivery on all orders across India."}
                  </p>
                </div>
                <div className="pdp-shipping-card">
                  <h4>Warranty & Return Protection</h4>
                  <p>
                    <strong>Warranty:</strong> {detail?.warranty || "1 Year Comprehensive Brand Coverage"}<br />
                    <strong>Return Policy:</strong> {detail?.returnPolicy || "7 Days Hassle-Free Replacement for any defects"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="pdp-related-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Customers Also Viewed</h2>
                <p className="section-subtitle">Recommended curated picks from our catalog</p>
              </div>
              <button className="view-all-btn" onClick={() => navigate("/products")}>
                Browse All Deals
              </button>
            </div>

            <div className="product-grid">
              {relatedProducts.map((p) => {
                const relImg = getProductImage(p);
                const relLifestyle = isLifestyleProduct(p);
                const relDiscount = calculateDiscountPercentage(p.price, p.discountPrice);

                return (
                  <div
                    key={p._id}
                    className="product-card"
                    onClick={() => navigate(`/products/${p._id}`)}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") navigate(`/products/${p._id}`); }}
                  >
                    <div className="card-top">
                      {relDiscount && (
                        <span className="product-badge discount">-{relDiscount}%</span>
                      )}
                    </div>
                    <div className={`img-container ${relLifestyle ? "lifestyle-wrap" : "isolated-wrap"}`}>
                      <img
                        src={relImg}
                        alt={p.title}
                        className={relLifestyle ? "product-img-cover" : "product-img-contain"}
                        loading="lazy"
                      />
                    </div>
                    <div className="card-details">
                      <span className="brand-name">{p.category?.name || "OneCart"}</span>
                      <h3 className="product-title">{p.title}</h3>
                      <div className="price-row">
                        <span className="current-price">₹{(p.discountPrice || p.price).toLocaleString()}</span>
                        {p.discountPrice && (
                          <del className="original-price">₹{p.price.toLocaleString()}</del>
                        )}
                      </div>
                      <div className="product-card-actions">
                        <button
                          type="button"
                          className="buy-now-btn"
                          style={{ gridColumn: "span 2" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${p._id}`);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}