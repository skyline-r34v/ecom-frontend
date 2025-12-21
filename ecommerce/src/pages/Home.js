import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/home.css";
import { FaSearch, FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

/* HERO SLIDES */
const heroSlides = [
  {
    title: "Buy & Sell Smarter",
    desc: "India’s trusted marketplace for pre-owned products 🚀",
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  },
  {
    title: "Earn From What You Don’t Use",
    desc: "Turn old items into instant cash 💸",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  },
  {
    title: "Safe. Simple. Sustainable.",
    desc: "Verified users • Secure deals • Zero hassle 🔐",
    img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
  },
];

/* CATEGORIES */
const categories = [
  { name: "Mobiles", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9" },
  { name: "Clothes", img: "https://images.unsplash.com/photo-1521334884684-d80222895322" },
  { name: "Furniture", img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7" },
  { name: "Electronics", img: "https://images.unsplash.com/photo-1518770660439-4636190af475" },
  { name: "Books", img: "https://images.unsplash.com/photo-1516979187457-637abb4f9353" },
  { name: "Toys", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab" },
];

export default function Home() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const sliderRef = useRef(null);

  /* Auto slide hero */
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  /* Scroll categories */
  const scrollCategories = (direction) => {
    const slider = sliderRef.current;
    const scrollAmount = 300;
    if (direction === 1) slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
    else slider.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="home-container">
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-slider">
          {heroSlides.map((slide, i) => (
            <div
              key={i}
              className={`hero-slide ${i === index ? "active" : ""}`}
              style={{ backgroundImage: `url(${slide.img})` }}
            >
              <div className="hero-content">
                <h1>{slide.title}</h1>
                <p>{slide.desc}</p>
                <div className="hero-buttons">
                  <button onClick={() => navigate("/products")}>Explore</button>
                  <button className="secondary-btn" onClick={() => navigate("/register")}>
                    Start Selling
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hero-dots">
          {heroSlides.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </section>

      {/* SEARCH */}
      <section className="search-section">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input placeholder="Search mobiles, furniture, clothes, electronics..." />
        </div>
      </section>

      {/* CATEGORIES SLIDER */}
      <section className="categories">
        <h2>Popular Categories</h2>
        <div className="category-slider-wrapper">
          <button className="slide-btn left" onClick={() => scrollCategories(-1)}>&#10094;</button>
          <div className="category-slider" ref={sliderRef}>
            {categories.map((cat, i) => (
              <div
                key={i}
                className="category-card"
                onClick={() => navigate(`/category/${cat.name.toLowerCase()}`)}
              >
                <img src={cat.img} alt={cat.name} />
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
          <button className="slide-btn right" onClick={() => scrollCategories(1)}>&#10095;</button>
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="products">
        <h2>Trending Products</h2>
        <div className="product-grid">
          {[
            ["iPhone 12", "₹35,000", "Like New", "https://images.unsplash.com/photo-1523275335684-37898b6baf30"],
            ["Sofa Set", "₹8,500", "Used", "https://images.unsplash.com/photo-1503602642458-232111445657"],
            ["DSLR Camera", "₹22,000", "Excellent", "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f"],
            ["Winter Jacket", "₹1,200", "Used", "https://images.unsplash.com/photo-1517841905240-472988babdf9"],
          ].map((p, i) => (
            <div key={i} className="product-card">
              <span className="badge">Trending</span>
              <img src={p[3]} alt={p[0]} />
              <div className="product-info">
                <h3>{p[0]}</h3>
                <p className={`condition ${p[2] === "Used" ? "used" : ""}`}>{p[2]}</p>
                <p className="price">{p[1]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Start Selling in Minutes</h2>
        <p>Post your product • Chat with buyers • Get paid</p>
        <button onClick={() => navigate("/register")}>Post Your First Item</button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-links">
            <h4>Company</h4>
            <p>About</p>
            <p>Careers</p>
            <p>Blog</p>
          </div>
          <div className="footer-links">
            <h4>Help</h4>
            <p>Support</p>
            <p>FAQs</p>
            <p>Contact</p>
          </div>
          <div className="footer-links">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <FaFacebookF />
              <FaInstagram />
              <FaTwitter />
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 ReUseHub • Buy Smart • Sell Fast</p>
        </div>
      </footer>
    </div>
  );
}
