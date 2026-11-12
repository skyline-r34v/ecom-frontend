import React, { useEffect, useState, useRef, useCallback } from "react";
import useCartStore from "../Profile/cartStore";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import api from "../../api";
import "../../styles/home.css";
import { 
  getProductImage, 
  isLifestyleProduct, 
  sanitizeProduct 
} from "../../utils/productUtils";
import heroHeadphonesImg from "../../assets/hero-headphones.jpg";
import { 
  FaShippingFast, 
  FaUndoAlt, 
  FaHeart,
  FaFire,
  FaBolt,
  FaStar,
  FaShoppingCart,
  FaArrowRight,
  FaShieldAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTag,
  FaCopy,
  FaCheck
} from "react-icons/fa";

/* ==========================================================================
   FEATURED BRANDS SHOWCASE (8 PREMIUM BRANDS)
   ========================================================================== */
const showcaseBrands = [
  {
    name: "Apple",
    category: "Mobiles, Laptops & More",
    count: "42+ Products",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    productImg: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600",
    bgTint: "rgba(224, 242, 254, 0.75)",
    search: "Apple"
  },
  {
    name: "Samsung",
    category: "Mobiles, TVs & More",
    count: "36+ Products",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Samsung_wordmark.svg",
    productImg: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600",
    bgTint: "rgba(219, 234, 254, 0.7)",
    search: "Samsung"
  },
  {
    name: "boAt",
    category: "Audio, Wearables & More",
    count: "28+ Products",
    logo: (
      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "20px", letterSpacing: "-0.5px", color: "#0f172a", display: "inline-flex", alignItems: "center" }}>
        bo<span style={{ color: "#e11d48", fontSize: "22px", lineHeight: "1", margin: "0 1px" }}>▲</span>t
      </span>
    ),
    productImg: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600",
    bgTint: "rgba(241, 245, 249, 0.9)",
    search: "Audio"
  },
  {
    name: "realme",
    category: "Mobiles, Accessories & More",
    count: "24+ Products",
    logo: (
      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.5px", color: "#0f172a" }}>
        realme
      </span>
    ),
    productImg: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600",
    bgTint: "rgba(254, 249, 195, 0.75)",
    search: "Phone"
  },
  {
    name: "Sony",
    category: "Audio, Cameras & More",
    count: "18+ Products",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
    productImg: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600",
    bgTint: "rgba(240, 249, 255, 0.85)",
    search: "Sony"
  },
  {
    name: "Nike",
    category: "Footwear, Apparel & More",
    count: "31+ Products",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    productImg: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600",
    bgTint: "rgba(224, 231, 255, 0.75)",
    search: "Nike"
  },
  {
    name: "Adidas",
    category: "Sportswear & Accessories",
    count: "27+ Products",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    productImg: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?q=80&w=600",
    bgTint: "rgba(241, 245, 249, 0.9)",
    search: "Adidas"
  },
  {
    name: "HP",
    category: "Laptops, Printers & More",
    count: "16+ Products",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg",
    productImg: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600",
    bgTint: "rgba(224, 242, 254, 0.8)",
    search: "Laptop"
  }
];


// Memoized Product Card: Defined outside component to prevent re-creation and DOM image flickering/blinking
const ProductCard = React.memo(({ p, badge, isWishlisted, onToggleWishlist, onAddToCart, onBuyNow, onNavigate }) => {
  const imageSrc = getProductImage(p);
  const isLifestyle = isLifestyleProduct(p);
  const discountPct = p.discountPrice && p.price > p.discountPrice 
    ? Math.round(((p.price - p.discountPrice) / p.price) * 100) 
    : null;

  return (
    <div 
      className="product-card" 
      onClick={() => onNavigate(`/products/${p._id || p.id}`)}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onNavigate(`/products/${p._id || p.id}`); }}
      aria-label={`View ${p.title}`}
    >
      <div className="card-top">
        {discountPct ? (
          <span className="product-badge discount">
            {badge || `-${discountPct}%`}
          </span>
        ) : badge ? (
          <span className="product-badge">{badge}</span>
        ) : (
          <span className="product-badge featured">POPULAR</span>
        )}
        <button
          type="button"
          className={`wishlist-icon ${isWishlisted ? "active" : ""}`}
          onClick={(e) => onToggleWishlist(e, p._id || p.id)}
          title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FaHeart />
        </button>
      </div>

      <div className={`img-container ${isLifestyle ? "lifestyle-wrap" : "isolated-wrap"}`}>
        <img
          src={imageSrc}
          alt={p.title}
          className={isLifestyle ? "product-img-cover" : "product-img-contain"}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800";
          }}
        />
      </div>

      <div className="card-details">
        <span className="brand-name">{p.category?.name || "ONECART EXCLUSIVE"}</span>
        <h3 className="product-title" title={p.title}>{p.title}</h3>

        <div className="product-rating">
          <span className="stars-row">
            <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar />
          </span>
          <span className="rating-score">{p.rating || 4.9}</span>
          <span className="review-count">({p.reviews?.length || 48})</span>
        </div>

        <div className="price-row">
          <span className="current-price">₹{(p.discountPrice || p.price || 999).toLocaleString()}</span>
          {p.discountPrice && p.price > p.discountPrice && (
            <del className="original-price">₹{p.price.toLocaleString()}</del>
          )}
          {discountPct && (
            <span className="discount-pct">{discountPct}% OFF</span>
          )}
        </div>

        <div className="product-card-actions">
          <button 
            type="button" 
            className="add-to-cart-btn" 
            onClick={(e) => onAddToCart(e, p)}
            aria-label={`Add ${p.title} to cart`}
          >
            <FaShoppingCart size={13} /> <span>Add to Cart</span>
          </button>
          <button 
            type="button" 
            className="buy-now-btn" 
            onClick={(e) => onBuyNow(e, p)}
            aria-label={`Buy ${p.title} now`}
          >
            <FaBolt size={13} /> <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
});

// Isolated Flash Sale Countdown: Confines 1-second ticks strictly to the timer so the main page never re-renders
const FlashSaleCountdown = React.memo(() => {
  const [timeLeft, setTimeLeft] = useState(14500);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="timer-wrapper">
      <span className="timer-label">Ends In:</span>
      <div className="timer-box" role="timer" aria-live="polite">
        <span className="time-unit">{hours}</span>
        <span className="colon">:</span>
        <span className="time-unit">{minutes}</span>
        <span className="colon">:</span>
        <span className="time-unit">{seconds}</span>
      </div>
    </div>
  );
});

export default function ShopHome() {
  const navigate = useNavigate();
  const categoryScrollRef = useRef(null);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const distance = direction === "left" ? -340 : 340;
      categoryScrollRef.current.scrollBy({ left: distance, behavior: "smooth" });
    }
  };

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlistIds") || "[]");
    } catch {
      return [];
    }
  });

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    message.success(`Coupon code "${code}" copied! Apply at checkout 🎁`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const syncCart = useCartStore((state) => state.syncCart);

  // Fetch categories, products, and brands dynamically from backend API
  useEffect(() => {
    api.post("/categories/list", { page: 1, size: 50 })
      .then((res) => {
        const fetched = res.data?.data || [];
        setCategories(Array.isArray(fetched) ? fetched : []);
        if (Array.isArray(fetched) && fetched.length > 0) {
          localStorage.setItem("cachedNavCategories", JSON.stringify(fetched));
          window.dispatchEvent(new Event("categoriesUpdated"));
        }
      })
      .catch(() => setCategories([]));

    api.post("/products/list", { page: 1, size: 50 })
      .then((res) => {
        const fetched = (res.data?.data || []).map(sanitizeProduct);
        setProducts(Array.isArray(fetched) ? fetched : []);
      })
      .catch(() => setProducts([]));

    api.post("/brands/list", { page: 1, size: 50 })
      .then((res) => {
        const fetched = res.data?.data || [];
        setBrands(Array.isArray(fetched) ? fetched : []);
      })
      .catch(() => setBrands([]));
  }, []);

  const toggleWishlist = useCallback((e, id) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("wishlistIds", JSON.stringify(updated));
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  }, []);

  const handleAddToCart = useCallback(async (e, p) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.warning("Please sign in to add items to your cart 🛒");
        navigate("/login");
        return;
      }
      const res = await api.post("/users/cart", {
        productId: p._id,
        quantity: 1
      });
      if (res.data?.success) {
        syncCart(res.data.cart);
        message.success(`"${p.title}" added to your cart! 🎉`);
      } else {
        message.error(res.data?.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
      message.error("Unable to add product to cart");
    }
  }, [navigate, syncCart]);

  const handleBuyNow = useCallback((e, p) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      message.warning("Please sign in to proceed to checkout");
      navigate("/login");
      return;
    }
    const data = {
      buyNow: true,
      product: p,
      quantity: 1
    };
    localStorage.setItem("checkoutData", JSON.stringify(data));
    navigate("/checkout", { state: data });
  }, [navigate]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 4000);
      setNewsletterEmail("");
    }
  };

  // Filter products by tab
  const filteredProducts = products.filter((p) => {
    if (activeTab === "ALL") return true;
    const catName = (p.category?.name || "").toLowerCase();
    const catSlug = (p.category?.slug || "").toLowerCase();
    if (activeTab === "ELECTRONICS") return catName.includes("elect") || catSlug.includes("elect");
    if (activeTab === "FASHION") return catName.includes("fash") || catSlug.includes("fash");
    if (activeTab === "HOME") return catName.includes("home") || catSlug.includes("home");
    if (activeTab === "BEAUTY") return catName.includes("beauty") || catSlug.includes("beauty");
    if (activeTab === "SPORTS") return catName.includes("sport") || catSlug.includes("sport") || catName.includes("fit");
    if (activeTab === "WATCHES") return catName.includes("watch") || catSlug.includes("watch");
    if (activeTab === "BOOKS") return catName.includes("book") || catSlug.includes("book") || catName.includes("station");
    if (activeTab === "TOYS") return catName.includes("toy") || catSlug.includes("toy") || catName.includes("baby");
    if (activeTab === "GOURMET") return catName.includes("gourmet") || catSlug.includes("gourmet") || catName.includes("grocer");
    if (activeTab === "AUTO") return catName.includes("auto") || catSlug.includes("auto");
    return true;
  });


  return (
    <>
      {/* 1. HERO SHOWCASE - EXACT MATCH TO REFERENCE DESIGN */}
      <section className="shop-ref-hero" id="hero-showcase">
        <div className="hero-ref-container">
          {/* Left Column: Pure Typography, Clean CTAs & Trust Perks */}
          <div className="hero-ref-content">
            <div className="hero-ref-badge">
              <span className="hero-badge-pulse" aria-hidden="true">
                <span className="hero-badge-pulse-ring" />
                <span className="hero-badge-pulse-core" />
              </span>
              <span>NEW SEASON COLLECTION</span>
              <span className="hero-badge-sparkle" aria-hidden="true">✨</span>
            </div>

            <h1 className="hero-ref-title">
              Style Your <br />
              <span className="hero-ref-highlight">Everyday</span>
            </h1>

            <div className="hero-ref-subtitle">
              <span className="hero-ref-subtitle-lead">
                Discover the latest trends in fashion, electronics, home &amp; more.
              </span>
              <div className="hero-ref-subtitle-accent">
                <span className="hero-subtitle-dot" aria-hidden="true" />
                <span>Premium quality</span>
                <span className="hero-subtitle-sep">•</span>
                <span>Unbeatable prices</span>
              </div>
            </div>

            <div className="hero-ref-btn-row">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="hero-ref-btn-primary"
                id="hero-shop-now-btn"
              >
                <span>Shop Now</span>
                <FaArrowRight className="hero-btn-arrow" size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("categories-showcase-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  else navigate("/category");
                }}
                className="hero-ref-btn-secondary"
                id="hero-explore-categories-btn"
              >
                Explore Categories
              </button>
            </div>

            {/* Inline Trust Line matching reference */}
            <div className="hero-ref-trust-row">
              <div className="hero-ref-trust-item">
                <div className="hero-ref-trust-icon"><FaShippingFast size={14} /></div>
                <div className="hero-ref-trust-text">
                  <strong>Free Express Delivery</strong>
                  <small>On orders above ₹499</small>
                </div>
              </div>

              <div className="hero-ref-trust-item">
                <div className="hero-ref-trust-icon"><FaShieldAlt size={14} /></div>
                <div className="hero-ref-trust-text">
                  <strong>100% Genuine</strong>
                  <small>Brand New Products</small>
                </div>
              </div>

              <div className="hero-ref-trust-item">
                <div className="hero-ref-trust-icon"><FaUndoAlt size={13} /></div>
                <div className="hero-ref-trust-text">
                  <strong>7-Day Returns</strong>
                  <small>Hassle Free</small>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Slider Navigation Dots on Right Edge */}
          <div className="hero-ref-slider-dots" aria-hidden="true">
            <span className="hero-ref-dot active" />
            <span className="hero-ref-dot" />
            <span className="hero-ref-dot" />
            <span className="hero-ref-dot" />
          </div>

          {/* Floating Product Badge on Bottom-Right */}
          <div
            className="hero-ref-floating-card"
            onClick={() => navigate("/products?search=headphones")}
            tabIndex={0}
            role="button"
            aria-label="Shop Premium Headphones"
          >
            <div className="hero-ref-floating-thumb">
              <img src={heroHeadphonesImg} alt="Premium Headphones" />
            </div>
            <div className="hero-ref-floating-info">
              <strong>Premium Headphones</strong>
              <small>Crystal Clear Sound</small>
              <span className="hero-ref-floating-cta">
                Shop Now <FaArrowRight size={10} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MEESHO-STYLE TRUST STRIP & ARCH CATEGORIES (DYNAMIC FROM BACKEND) */}
      <section className="meesho-categories-section" id="categories-showcase-section">
        <div className="meesho-categories-container">
          {/* Trust Strip directly matching reference */}
          <div className="meesho-trust-strip">
            <div className="meesho-trust-item">
              <span className="meesho-trust-icon">📦</span>
              <span className="meesho-trust-text">7 Days Easy Return</span>
            </div>
            <div className="meesho-trust-divider" />
            <div className="meesho-trust-item">
              <span className="meesho-trust-icon">💵</span>
              <span className="meesho-trust-text">Cash on Delivery</span>
            </div>
            <div className="meesho-trust-divider" />
            <div className="meesho-trust-item">
              <span className="meesho-trust-icon">🛍️</span>
              <span className="meesho-trust-text">Lowest Prices</span>
            </div>
          </div>

          {/* Arched Category Cards from Backend */}
          <div className="meesho-categories-wrapper">
            {categories.length > 7 && (
              <button
                type="button"
                className="meesho-category-arrow left"
                onClick={() => scrollCategories("left")}
                aria-label="Previous categories"
              >
                <FaChevronLeft size={13} />
              </button>
            )}

            <div className="meesho-categories-row" ref={categoryScrollRef}>
              {categories.map((cat, i) => (
                <div
                  className="meesho-category-card"
                  key={cat._id || cat.id || i}
                  onClick={() => navigate(`/products?category=${cat._id || cat.id}`)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Shop ${cat.name}`}
                >
                  <div className="meesho-category-arch">
                    <img
                      src={cat.image || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400"}
                      alt={cat.name}
                      className="meesho-category-img"
                      loading="lazy"
                    />
                  </div>
                  <span className="meesho-category-name">{cat.name}</span>
                </div>
              ))}
            </div>

            {categories.length > 7 && (
              <button
                type="button"
                className="meesho-category-arrow right"
                onClick={() => scrollCategories("right")}
                aria-label="Next categories"
              >
                <FaChevronRight size={13} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. FLASH DEALS / LIVE COUNTDOWN (DIRECTLY AFTER CATEGORIES) */}
      <section className="section-container" id="flash-sale-section">
        <div className="flash-sale-container">
          <div className="flash-header">
            <div className="flash-title-group">
              <div className="flash-icon-box" aria-hidden="true"><FaFire /></div>
              <div>
                <div className="section-eyebrow" style={{ background: "rgba(217, 119, 6, 0.1)", borderColor: "rgba(217, 119, 6, 0.2)", color: "#b45309" }}>
                  <span className="eyebrow-dot" style={{ background: "#d97706", boxShadow: "0 0 8px rgba(217, 119, 6, 0.6)" }} />
                  <span>LIMITED TIME DROP</span>
                </div>
                <h2 className="section-title">⚡ Flash Deals of the <span className="highlight-text">Day</span></h2>
                <p className="flash-subtitle">
                  Unbeatable limited-time prices. Deals expire once timer hits zero!
                </p>
              </div>
            </div>

            <div className="flash-header-actions">
              <FlashSaleCountdown />

              <button 
                type="button" 
                className="flash-view-all-btn"
                onClick={() => navigate("/products")}
                aria-label="View all flash deals in catalog"
              >
                View All Deals →
              </button>
            </div>
          </div>

          {/* Subtle real countdown progress bar */}
          <div className="flash-progress-track" title="Flash Sale Time Remaining">
            <div className="flash-progress-fill" style={{ width: "75%" }} />
          </div>

          <div className="product-scroll-row" tabIndex={0} aria-label="Flash sale product carousel">
            {products
              .filter((p) => p.discountPrice && p.price > p.discountPrice)
              .slice(0, 8)
              .map((p) => {
                const discountPct = Math.round(((p.price - p.discountPrice) / p.price) * 100);
                return (
                  <ProductCard 
                    key={p._id || p.id} 
                    p={p} 
                    badge={`-${discountPct}% FLASH`} 
                    isWishlisted={wishlist.includes(p._id || p.id)}
                    onToggleWishlist={toggleWishlist}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onNavigate={navigate}
                  />
                );
              })}
          </div>
        </div>
      </section>

      {/* 4. EXCLUSIVE MEMBER VOUCHERS & PROMOS */}
      <section className="shop-vouchers-section">
        <div className="shop-vouchers-container">
          <div className="section-header" style={{ marginBottom: "20px" }}>
            <div>
              <div className="section-eyebrow" style={{ background: "rgba(36, 91, 219, 0.08)", borderColor: "rgba(36, 91, 219, 0.2)", color: "var(--brand-primary)" }}>
                <span className="eyebrow-dot" style={{ background: "var(--brand-primary)", boxShadow: "0 0 8px rgba(36, 91, 219, 0.6)" }} />
                <span>EXCLUSIVE MEMBER SAVINGS</span>
              </div>
              <h2 className="section-title major-showcase-title">🔥 Daily <span className="highlight-text">Vouchers</span> & Deals</h2>
              <p className="section-subtitle major-showcase-subtitle">Tap any coupon below to copy code and claim your instant discount at checkout</p>
            </div>
          </div>

          <div className="shop-vouchers-grid">
            <div
              className="shop-voucher-card voucher-card-royal"
              onClick={() => handleCopyCode("ONECART500")}
              tabIndex={0}
              role="button"
              aria-label="Copy coupon code ONECART500"
            >
              <div className="voucher-decor-shape" />
              <div className="voucher-chip">TECH & AUDIO</div>
              <div className="voucher-content">
                <h3 className="voucher-discount">₹500 OFF</h3>
                <p className="voucher-detail">Instant flat discount on flagship electronics & audio above ₹4,999</p>
              </div>
              <div className="voucher-footer">
                <span className="voucher-code-pill">CODE: ONECART500</span>
                <span className="voucher-action-btn">
                  {copiedCode === "ONECART500" ? <><FaCheck /> Copied! ✓</> : <><FaCopy /> Copy Code</>}
                </span>
              </div>
            </div>

            <div
              className="shop-voucher-card voucher-card-amber"
              onClick={() => handleCopyCode("FREEDEL")}
              tabIndex={0}
              role="button"
              aria-label="Copy coupon code FREEDEL"
            >
              <div className="voucher-decor-shape" />
              <div className="voucher-chip">ZERO DELIVERY FEE</div>
              <div className="voucher-content">
                <h3 className="voucher-discount">FREE DELIVERY</h3>
                <p className="voucher-detail">Priority express air shipping on all orders above ₹499 across India</p>
              </div>
              <div className="voucher-footer">
                <span className="voucher-code-pill">CODE: FREEDEL</span>
                <span className="voucher-action-btn">
                  {copiedCode === "FREEDEL" ? <><FaCheck /> Copied! ✓</> : <><FaCopy /> Copy Code</>}
                </span>
              </div>
            </div>

            <div
              className="shop-voucher-card voucher-card-emerald"
              onClick={() => handleCopyCode("FLAT20")}
              tabIndex={0}
              role="button"
              aria-label="Copy coupon code FLAT20"
            >
              <div className="voucher-decor-shape" />
              <div className="voucher-chip">TRENDING FASHION</div>
              <div className="voucher-content">
                <h3 className="voucher-discount">EXTRA 20% OFF</h3>
                <p className="voucher-detail">Valid on designer apparel, running shoes & luxury watches</p>
              </div>
              <div className="voucher-footer">
                <span className="voucher-code-pill">CODE: FLAT20</span>
                <span className="voucher-action-btn">
                  {copiedCode === "FLAT20" ? <><FaCheck /> Copied! ✓</> : <><FaCopy /> Copy Code</>}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. POPULAR PRODUCTS WITH INTERACTIVE FILTER TABS */}
      <section className="section-container bg-light trending-showcase-section" id="trending-collections">
        {/* Ambient background lighting */}
        <div className="trending-ambient-orb orb-1" aria-hidden="true" />
        <div className="trending-ambient-orb orb-2" aria-hidden="true" />
        <div className="trending-ambient-orb orb-3" aria-hidden="true" />

        <div className="section-header">
          <div>
            <div className="section-eyebrow trending-eyebrow">
              <span className="eyebrow-dot" />
              <span>POPULAR PICKS</span>
            </div>
            <h2 className="section-title major-showcase-title">Trending <span className="highlight-text trending-gradient-text">Collections</span></h2>
            <p className="section-subtitle major-showcase-subtitle">Explore top-rated products loved by thousands of verified shoppers</p>
          </div>
          <button className="view-all-btn trending-view-all" onClick={() => navigate("/products")}>
            <span>View All Products</span>
            <FaArrowRight size={12} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs-wrapper">
          <button
            className={`filter-pill-tab ${activeTab === "ALL" ? "active" : ""}`}
            onClick={() => setActiveTab("ALL")}
          >
            🔥 All
          </button>
          <button
            className={`filter-pill-tab ${activeTab === "ELECTRONICS" ? "active" : ""}`}
            onClick={() => setActiveTab("ELECTRONICS")}
          >
            📱 Electronics
          </button>
          <button
            className={`filter-pill-tab ${activeTab === "FASHION" ? "active" : ""}`}
            onClick={() => setActiveTab("FASHION")}
          >
            👗 Fashion
          </button>
          <button
            className={`filter-pill-tab ${activeTab === "HOME" ? "active" : ""}`}
            onClick={() => setActiveTab("HOME")}
          >
            🏠 Home & Kitchen
          </button>
          <button
            className={`filter-pill-tab ${activeTab === "BEAUTY" ? "active" : ""}`}
            onClick={() => setActiveTab("BEAUTY")}
          >
            💄 Beauty
          </button>
          <button
            className={`filter-pill-tab ${activeTab === "SPORTS" ? "active" : ""}`}
            onClick={() => setActiveTab("SPORTS")}
          >
            🏋️ Sports & Gym
          </button>
          <button
            className={`filter-pill-tab ${activeTab === "WATCHES" ? "active" : ""}`}
            onClick={() => setActiveTab("WATCHES")}
          >
            ⌚ Luxury Watches
          </button>
          <button
            className={`filter-pill-tab ${activeTab === "BOOKS" ? "active" : ""}`}
            onClick={() => setActiveTab("BOOKS")}
          >
            📚 Books & Pens
          </button>
          <button
            className={`filter-pill-tab ${activeTab === "TOYS" ? "active" : ""}`}
            onClick={() => setActiveTab("TOYS")}
          >
            🧸 Toys & Baby
          </button>
          <button
            className={`filter-pill-tab ${activeTab === "GOURMET" ? "active" : ""}`}
            onClick={() => setActiveTab("GOURMET")}
          >
            ☕ Gourmet & Grocery
          </button>
          <button
            className={`filter-pill-tab ${activeTab === "AUTO" ? "active" : ""}`}
            onClick={() => setActiveTab("AUTO")}
          >
            🚗 Automotive
          </button>
        </div>

        <div className="product-grid">
          {filteredProducts.slice(0, 10).map((p) => (
            <ProductCard 
              key={p._id || p.id} 
              p={p} 
              isWishlisted={wishlist.includes(p._id || p.id)}
              onToggleWishlist={toggleWishlist}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onNavigate={navigate}
            />
          ))}
        </div>
      </section>

      {/* 8. FEATURED BRANDS (UPGRADED SHOWCASE & TRUST BANNER) */}
      <section className="section-container brands-showcase-section" id="official-brands">
        <div className="section-header">
          <div>
            <div className="section-eyebrow brand-eyebrow-pill">
              <FaTag size={10} style={{ marginRight: 6 }} />
              <span>TOP BRANDS</span>
            </div>
            <h2 className="section-title major-showcase-title">Shop Official <span className="highlight-text">Brands</span></h2>
            <p className="section-subtitle major-showcase-subtitle">Your favorite brands, all in one place. Find genuine products from the world's most trusted names.</p>
          </div>
          <button className="view-all-btn" onClick={() => navigate("/brands")}>
            <span>View All Brands</span>
            <FaArrowRight size={12} />
          </button>
        </div>

        {/* 8 Brand Showcase Cards (4 cols x 2 rows on desktop) */}
        {/* Brand Showcase Cards */}
        <div className="brand-cards-grid">
          {(brands.length > 0 ? brands : showcaseBrands).map((brand, i) => (
            <div
              className="brand-showcase-card"
              key={brand._id || i}
              onClick={() => navigate(brand._id ? `/products?brand=${brand._id}` : `/products?search=${brand.search || brand.name}`)}
              title={`Explore ${brand.name} collection`}
            >
              <div className="brand-card-info">
                <div className="brand-logo-slot">
                  {brand.logo ? (
                    typeof brand.logo === "string" ? (
                      <img src={brand.logo} alt={`${brand.name} logo`} className="brand-logo-img" />
                    ) : (
                      brand.logo
                    )
                  ) : (
                    <span style={{ fontWeight: 800, fontSize: "16px", color: "#245bdb" }}>
                      {brand.name?.slice(0, 2)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="brand-text-block">
                  <h3 className="brand-name-title">{brand.name}</h3>
                  <p className="brand-category-tag" title={brand.category || brand.description || "Official Brand"}>
                    {brand.category || brand.description || "Official Brand"}
                  </p>
                  <span className="brand-item-count">{brand.count || "Verified Partner"}</span>
                </div>
              </div>

              <div className="brand-card-visual">
                <div 
                  className="brand-backdrop-circle" 
                  style={{ background: brand.bgTint || 'rgba(239, 246, 255, 0.85)' }} 
                />
                {brand.productImg ? (
                  <img 
                    src={brand.productImg} 
                    alt={`${brand.name} flagship`} 
                    className="brand-product-img" 
                    loading="lazy"
                  />
                ) : (
                  <div style={{ width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                    🏷️
                  </div>
                )}
                <div className="brand-arrow-circle" aria-hidden="true">
                  <FaArrowRight size={11} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Brand Authenticity & Trust Banner */}
        <div className="brand-guarantee-banner">
          <div className="brand-guarantee-content">
            <div className="brand-guarantee-badge-wrap">
              <div className="brand-guarantee-shield-icon">
                <FaShieldAlt size={24} />
              </div>
              <div className="brand-guarantee-text">
                <h3 className="brand-guarantee-title">Trusted Brands. Genuine Products.</h3>
                <p className="brand-guarantee-subtitle">
                  Shop with confidence. 100% original products sourced directly from authorized brand partners with official brand warranty & instant dispatch.
                </p>
              </div>
            </div>
            <button 
              className="brand-guarantee-cta-btn" 
              onClick={() => navigate("/products")}
            >
              <span>Shop Now</span>
              <FaArrowRight size={12} />
            </button>
          </div>
          <div className="brand-guarantee-visual">
            <img 
              src="/images/brand_showcase_banner.jpg" 
              alt="Official Flagship Devices and Apparel" 
              className="brand-guarantee-img"
            />
          </div>
        </div>
      </section>

      {/* 9. PROMOTIONAL FULL BANNER */}
      <section className="promo-banner-full">
        <img
          src="https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=2070"
          alt="Promotional Showcase"
        />
        <div className="promo-banner-content">
          <h2>Upgrade Your Lifestyle Today.</h2>
          <p>Join over 500,000 smart shoppers discovering top-tier essentials with verified fast delivery.</p>
          <button onClick={() => navigate("/products")}>Start Shopping Now →</button>
        </div>
      </section>


      {/* 12. NEWSLETTER */}
      <section className="newsletter-section">
        <div className="newsletter-box">
          <h2>Get Secret Offers & Updates First</h2>
          <p>Subscribe to our weekly curated catalog to receive exclusive promo codes and flash notifications.</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
            />
            <button type="submit">
              {isSubscribed ? "Subscribed! ✓" : "Subscribe"}
            </button>
          </form>
        </div>
      </section>

      {/* 13. MEGA FOOTER */}
      <footer className="mega-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h3 style={{ fontSize: '20px', letterSpacing: '-0.5px' }}>🛍️ OneCart</h3>
            <p>OneCart is your premier destination for electronics, fashion, smart living, and gourmet essentials with rapid dispatch and guaranteed authentic products.</p>
            <p style={{ marginTop: '12px', color: '#64748b' }}>📍 Registered HQ: Mumbai, India</p>
          </div>
          <div className="footer-col">
            <h3>CUSTOMER CARE</h3>
            <p onClick={() => navigate("/profile")}>Help Center</p>
            <p onClick={() => navigate("/my-orders")}>Track Your Order</p>
            <p>Shipping Policy</p>
            <p>Returns & Refunds</p>
            <p>Report an Issue</p>
          </div>
          <div className="footer-col">
            <h3>SHOPPING</h3>
            <p onClick={() => navigate("/products")}>All Products</p>
            <p onClick={() => navigate("/products?sort=new")}>New Arrivals</p>
            <p onClick={() => navigate("/products?sort=bestseller")}>Bestsellers</p>
            <p onClick={() => navigate("/brands")}>Brand Directory</p>
            <p onClick={() => navigate("/wishlist")}>Your Wishlist</p>
          </div>
          <div className="footer-col">
            <h3>POLICIES</h3>
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
            <p>Security & Encryption</p>
            <p>Authenticity Guarantee</p>
            <p>Cookie Settings</p>
          </div>
          <div className="footer-col">
            <h3>CONNECT</h3>
            <p>Instagram: @onecart</p>
            <p>Twitter: @onecart_in</p>
            <p>LinkedIn: OneCart Commerce</p>
            <p>YouTube: OneCart Unboxing</p>
            <p>Careers: Join Our Team</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 OneCart E-Commerce Platforms Inc. All Rights Reserved.</p>
          <div className="payment-methods">
            <span>UPI Instant</span>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>RuPay</span>
            <span>Net Banking</span>
            <span className="secure-badge">🔒 256-Bit SSL Encrypted</span>
          </div>
        </div>
      </footer>
    </>
  );
}
