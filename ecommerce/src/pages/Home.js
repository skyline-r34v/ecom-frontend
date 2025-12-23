import React, { useEffect, useState } from "react";
import { FaBars, FaSearch, FaShoppingCart, FaTimes, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/home.css";

// Hero banners
const banners = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
];

// Fetch categories
export const fetchAllCategories = async (searchTerm = "", page = 1, size = 10) => {
  const data = { page, size, search: searchTerm };
  const response = await api.post("/categories/list", data);
  return response.data;
};

export default function Home() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeMainCat, setActiveMainCat] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchAllCategories(searchTerm, 1, 10);
      setCategories(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Initial load
  useEffect(() => {
    loadCategories();
  }, []);

  const handleMainCatClick = (cat) => setActiveMainCat(cat);
  const handleSubCatClick = (sub) => navigate(`/products?category=${sub}`);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="home-container">
      {/* Drawer Overlay */}
      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}

      {/* Side Drawer */}
      <aside className={`side-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h3>Categories</h3>
          <FaTimes onClick={() => setDrawerOpen(false)} />
        </div>
        {categories.map((c, i) => (
          <p key={i} onClick={() => handleMainCatClick(c.name)}>
            {c.name}
          </p>
        ))}
      </aside>

      {/* Navbar */}
      <header className="navbar glass">
        <FaBars className="menu-icon" onClick={() => setDrawerOpen(true)} />
        <div className="logo" onClick={() => navigate("/")}>ReUseHub</div>
        <div className="nav-search">
          <FaSearch />
          <input
            placeholder="Search products, brands & more"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadCategories()}
          />
        </div>
        <div className="nav-actions">
          <FaUser onClick={() => navigate("/profile")} />
          <FaShoppingCart onClick={() => navigate("/cart")} />
        </div>
      </header>

      {/* Category Strip */}
      <section className="category-strip">
        <div className="category-scroll">
          {categories.map((cat, i) => (
            <span
              key={i}
              className={activeMainCat === cat.name ? "active-main-cat" : ""}
              onClick={() => handleMainCatClick(cat.name)}
            >
              {cat.name}
            </span>
          ))}
        </div>
      </section>

      {/* Hero Slider */}
      <section className="hero-slider">
        <div className="hero-track" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
          {banners.map((img, i) => (
            <div className="hero-slide" key={i}>
              <img src={img} alt={`banner-${i}`} />
              <div className="hero-content">
                <h1>Smart Deals, Better Prices</h1>
                <p>Buy & sell trusted pre-owned products</p>
                <button onClick={() => navigate("/products")}>Explore Deals</button>
              </div>
            </div>
          ))}
        </div>
        <div className="hero-dots">
          {banners.map((_, i) => (
            <span
              key={i}
              className={i === slideIndex ? "active" : ""}
              onClick={() => setSlideIndex(i)}
            />
          ))}
        </div>
      </section>

      {/* Hero Subcategory Strip */}
      <section className="hero-subcategory-strip">
        <div className="hero-subcategory-scroll">
          {categories.flatMap((c) =>
            c.sub.map((sub, i) => {
              const productImage =
                products.find((p) => p.category === sub || p.subcategory === sub)?.img ||
                "https://via.placeholder.com/100";
              return (
                <div
                  key={`${c.name}-${i}`}
                  className="hero-subcategory-item"
                  onClick={() => handleSubCatClick(sub)}
                >
                  <img src={productImage} alt={sub} />
                  <span>{sub}</span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Subcategory Strip */}
      {activeMainCat && (
        <section className="subcategory-strip">
          <div className="subcategory-scroll">
            {categories
              .find((c) => c.name === activeMainCat)
              ?.sub.map((sub, i) => (
                <span key={i} onClick={() => handleSubCatClick(sub)}>
                  {sub}
                </span>
              ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="product-row">
        <h2>Featured Products</h2>
        <div className="row-scroll">
          {products.map((p) => (
            <div
              key={p.id}
              className="product-card"
              onClick={() => navigate(`/products/${p.id}`)}
            >
              <img src={p.img} alt={p.name} />
              <p>{p.name}</p>
              <strong>₹{p.price}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        © 2025 ReUseHub • Buy Smart • Sell Fast
      </footer>
    </div>
  );
}
