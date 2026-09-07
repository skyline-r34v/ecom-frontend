import React, { useEffect, useState } from "react";
import useCartStore from "../Profile/cartStore";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { 
  FaShippingFast, 
  FaLock, 
  FaUndoAlt, 
  FaRegStar, 
  FaHeadset,
  FaHeart
} from "react-icons/fa";

/* MOCK/STATIC DATA FOR NEW SECTIONS */
const heroBanners = [
  { img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070", title: "Everything You Love. All in One Place.", subtitle: "Discover trending products, trusted brands, exclusive deals and everyday essentials.", label: "NEW SEASON COLLECTION" },
  { img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070", title: "Upgrade Your Everyday.", subtitle: "Explore our latest electronics and smart home devices.", label: "TECH WEEK" },
  { img: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=2071", title: "Weekend Mega Sale.", subtitle: "Up to 50% off on top fashion and accessories.", label: "FLASH DEALS" }
];


const collections = [
  { title: "Apple Essentials", img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000" },
  { title: "Streetwear", img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000" },
  { title: "Smart Home", img: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1000" },
  { title: "Fitness Gear", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000" }
];

const reviews = [
  { name: "Rahul S.", text: "This is one of the best shopping experiences I've had. Fast delivery and excellent product quality." },
  { name: "Priya M.", text: "Amazing platform! I found exactly what I was looking for, and the checkout was seamless." },
  { name: "Vikram K.", text: "Great discounts during the flash sale. Will definitely shop here again." }
];

export default function ShopHome() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [timeLeft, setTimeLeft] = useState(12800); // Mock countdown

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  useEffect(() => {
    api.get("/categories/with-subcategories").then((res) => setCategories(res.data.data || []));
    api.post("/categories/list", { page: 1, size: 20 }).then((res) => setAllCategories(res.data.data || []));
    api.post("/brands/list", { page: 1, size: 20 }).then((res) => setBrands(res.data.data || []));
  }, []);

  useEffect(() => {
    api.post("/products/list", { page: 1, size: 50 }).then((res) => setProducts(res.data.data || []));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setSlideIndex((p) => (p + 1) % heroBanners.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    if (wishlist.includes(id)) setWishlist((prev) => prev.filter((x) => x !== id));
    else setWishlist((prev) => [...prev, id]);
  };

  const syncCart = useCartStore((state) => state.syncCart);

  const handleAddToCart = async (e, p) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Login required to add items to cart");
        navigate("/login");
        return;
      }
      const res = await api.post("/users/cart", {
        productId: p._id,
        quantity: 1
      });
      if (res.data.success) {
        syncCart(res.data.cart);
        alert("Item added to cart successfully 🛒");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to add product to cart");
    }
  };

  const handleBuyNow = (e, p) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to continue");
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
  };

  // Helper to render a consistent product card
  const ProductCard = ({ p, badge }) => (
    <div className="product-card" onClick={() => navigate(`/products/${p._id}`)}>
      <div className="card-top">
        {badge && <span className="product-badge">{badge}</span>}
        <button className={`wishlist-icon ${wishlist.includes(p._id) ? "active" : ""}`} onClick={(e) => toggleWishlist(e, p._id)}>
          <FaHeart />
        </button>
      </div>
      <div className="img-container">
        <img src={p.images?.[0] || "https://via.placeholder.com/200"} alt={p.title} />
      </div>
      <div className="card-details">
        <span className="brand-name">{p.category?.name || "BRAND"}</span>
        <h3 className="product-title">{p.title}</h3>
        <div className="product-rating">
          ★★★★★ <span>({p.reviews?.length || Math.floor(Math.random() * 500) + 10})</span>
        </div>
        <div className="price-row">
          <span className="current-price">₹{p.discountPrice || p.price}</span>
          {p.discountPrice && <del className="original-price">₹{p.price}</del>}
          {p.discountPrice && <span className="discount-pct">{Math.round(((p.price - p.discountPrice)/p.price)*100)}% OFF</span>}
        </div>
        <div className="product-card-actions">
          <button className="add-to-cart-btn" onClick={(e) => handleAddToCart(e, p)}>
            Add to Cart
          </button>
          <button className="buy-now-btn" onClick={(e) => handleBuyNow(e, p)}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>

      {/* AMAZON STYLE CATEGORY GRID */}
      <div className="amazon-home-container">
        {/* Optional top gradient for authentic look */}
        <div className="amazon-hero-bg"></div>
        
        <div className="amazon-grid-layout">
          {/* Row 1: Dynamic Categories */}
          {allCategories.slice(0, 4).map((cat, index) => (
            <div className={`amazon-category-card ${index === 2 ? "black-bg" : ""}`} key={cat._id || index}>
              <h2 className={`amazon-card-title ${index === 2 ? "text-white" : ""}`}>{cat.name}</h2>
              {index === 2 && <p className="text-white subtitle">Shop top deals</p>}
              <div className={`amazon-card-image-single ${index === 2 ? "banner-img" : ""}`}>
                <img src={cat.image || "https://via.placeholder.com/400"} alt={cat.name} />
              </div>
              <a 
                href="#" 
                className={`amazon-card-link ${index === 2 ? "text-white" : ""}`} 
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/products?category=${cat._id}`);
                }}
              >
                Shop now
              </a>
            </div>
          ))}

          {/* Row 2: Wide Cards with Dynamic Products */}
          {products.length > 0 && (
            <>
              <div className="amazon-category-card wide-card">
                <h2 className="amazon-card-title">Customers' Most-Loved Products</h2>
                <div className="wide-scroll-container">
                  {products.slice(0, 10).map((p) => (
                    <ProductCard key={p._id} p={p} />
                  ))}
                </div>
              </div>

              <div className="amazon-category-card wide-card">
                <h2 className="amazon-card-title">Deals you might like</h2>
                <div className="wide-scroll-container">
                  {products.slice(10, 20).map((p) => (
                    <ProductCard key={p._id} p={p} badge="DEAL" />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 6. SHOP BY CATEGORY */}
      <section className="section-container">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-grid">
          {allCategories.slice(0, 8).map(cat => (
            <div className="cat-card" key={cat._id} onClick={() => navigate(`/products?category=${cat._id}`)}>
              <div className="cat-img">
                <img src={cat.image} alt={cat.name} />
              </div>
              <h4>{cat.name}</h4>
              <p>Shop Now →</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FEATURED BRANDS */}
      <section className="section-container bg-light">
        <div className="section-header">
          <h2 className="section-title">Shop Your Favorite Brands</h2>
          <button className="view-all-btn">View All Brands</button>
        </div>
        <div className="brands-grid">
          {brands.map((brand, i) => (
            <div className="brand-card" key={brand._id || i} onClick={() => navigate(`/products?brand=${brand._id}`)} style={{ cursor: 'pointer' }}>
              <img src={brand.logo} alt={brand.name} />
            </div>
          ))}
        </div>
      </section>

      {/* 8. FLASH SALE */}
      <section className="section-container flash-sale-container">
        <div className="flash-header">
          <div>
            <h2 className="section-title text-white">🔥 Today's Best Deals</h2>
            <p className="text-white-muted">Limited-time offers you don't want to miss.</p>
          </div>
          <div className="timer-box">
            <span>00</span>:<span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
          </div>
        </div>
        <div className="product-scroll-row">
          {products.slice(0, 5).map(p => <ProductCard key={p._id} p={p} badge="-33%" />)}
        </div>
      </section>

      {/* 9. TRENDING RIGHT NOW */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title">Trending Right Now</h2>
          <button className="view-all-btn" onClick={() => navigate("/products")}>View All Products →</button>
        </div>
        <div className="product-grid">
          {products.slice(5, 13).map(p => <ProductCard key={p._id} p={p} badge="TRENDING" />)}
        </div>
      </section>

      {/* 10. RECOMMENDED FOR YOU */}
      <section className="section-container bg-light">
        <h2 className="section-title">Recommended For You</h2>
        <p className="section-subtitle">Based on your recent browsing</p>
        <div className="product-scroll-row">
          {products.slice(13, 18).map(p => <ProductCard key={p._id} p={p} />)}
        </div>
      </section>

      {/* 12. PROMOTIONAL BANNER */}
      <section className="promo-banner-full">
        <img src="https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=2070" alt="Promo" />
        <div className="promo-banner-content">
          <h2>Upgrade Your Lifestyle</h2>
          <p>Premium products. Incredible prices.</p>
          <button onClick={() => navigate("/products")}>Explore Collection</button>
        </div>
      </section>

      {/* 11 & 13. BESTSELLERS & NEW ARRIVALS */}
      <section className="section-container split-sections">
        <div className="split-col">
          <h2 className="section-title">Customer Favorites</h2>
          <div className="product-grid split-grid">
            {products.slice(0, 4).map(p => <ProductCard key={p._id} p={p} badge="BESTSELLER" />)}
          </div>
        </div>
        <div className="split-col">
          <h2 className="section-title">✨ Fresh Arrivals</h2>
          <div className="product-grid split-grid">
            {products.slice(4, 8).map(p => <ProductCard key={p._id} p={p} badge="NEW" />)}
          </div>
        </div>
      </section>

      {/* 14. SHOP BY COLLECTION */}
      <section className="section-container">
        <h2 className="section-title">Shop by Collection</h2>
        <div className="collections-grid">
          {collections.map((c, i) => (
            <div className="collection-card" key={i}>
              <img src={c.img} alt={c.title} />
              <div className="collection-overlay">
                <h3>{c.title}</h3>
                <span>Shop Collection →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 15. CUSTOMER REVIEWS */}
      <section className="section-container bg-light">
        <h2 className="section-title text-center">What Our Customers Say</h2>
        <div className="reviews-grid">
          {reviews.map((r, i) => (
            <div className="review-card" key={i}>
              <div className="stars">★★★★★</div>
              <p>"{r.text}"</p>
              <div className="reviewer">
                <div className="avatar">{r.name[0]}</div>
                <div>
                  <h4>{r.name}</h4>
                  <span>Verified Buyer ✓</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 16. APP DOWNLOAD */}
      <section className="app-download-section">
        <div className="app-content">
          <h2>Shop Faster With Our App</h2>
          <p>Get exclusive deals, personalized recommendations and faster shopping right from your phone.</p>
          <div className="app-buttons">
            <button className="store-btn">App Store</button>
            <button className="store-btn">Google Play</button>
          </div>
        </div>
      </section>

      {/* 17. NEWSLETTER */}
      <section className="newsletter-section">
        <div className="newsletter-box">
          <h2>Get the Best Deals First</h2>
          <p>Subscribe to receive exclusive offers, new arrivals and personalized recommendations.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      {/* 18. MEGA FOOTER */}
      <footer className="mega-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>OneKart</h3>
            <p>About Us</p>
            <p>Contact Us</p>
            <p>Careers</p>
            <p>Our Stores</p>
          </div>
          <div className="footer-col">
            <h3>CUSTOMER SERVICE</h3>
            <p>Help Center</p>
            <p>Shipping Information</p>
            <p>Returns & Refunds</p>
            <p>Track Order</p>
          </div>
          <div className="footer-col">
            <h3>SHOP</h3>
            <p>All Products</p>
            <p>New Arrivals</p>
            <p>Best Sellers</p>
            <p>Deals</p>
          </div>
          <div className="footer-col">
            <h3>POLICIES</h3>
            <p>Privacy Policy</p>
            <p>Terms & Conditions</p>
            <p>Refund Policy</p>
            <p>Cookie Policy</p>
          </div>
          <div className="footer-col">
            <h3>CONNECT</h3>
            <p>Instagram</p>
            <p>Facebook</p>
            <p>YouTube</p>
            <p>LinkedIn</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 OneKart. All Rights Reserved.</p>
          <div className="payment-methods">
            <span>UPI</span>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Net Banking</span>
            <span className="secure-badge">Secure Payments 🔒</span>
          </div>
        </div>
      </footer>
    </>
  );
}
