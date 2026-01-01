import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import "../styles/home.css";

const banners = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
];

export default function Home() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState("");

  const categoryParam = params.get("category");
  const searchParam = params.get("search");

  // Fetch categories
  useEffect(() => {
    api.get("/categories/with-subcategories")
      .then(res => setCategories(res.data.data || []))
      .catch(console.error);

    api.post("/categories/list", { page: 1, size: 20 })
      .then(res => setAllCategories(res.data.data || []))
      .catch(console.error);
  }, []);

  // Fetch products
  useEffect(() => {
    setLoadingProducts(true);
    api.post("/products/list", {
      page: 1,
      size: 20,
      category: categoryParam || undefined,
      search: searchParam || undefined,
    })
      .then(res => setProducts(res.data.data || []))
      .finally(() => setLoadingProducts(false));
  }, [categoryParam, searchParam]);

  // Hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="onekart-home">
      <Navbar search={search} setSearch={setSearch} />

      {/* Trust Bar */}
      <div className="trust-bar">
        <span>✔ Secure Payments</span>
        <span>✔ Easy Returns</span>
        <span>✔ Fast Delivery</span>
        <span>✔ Genuine Sellers</span>
      </div>

      {/* Category Dropdown */}
      <div className="categories-dropdown-container">
        {categories.map(cat => (
          <div key={cat._id} className="dropdown-main">
            <span className="category-name">{cat.name}</span>
            {cat.subCategories?.length > 0 && (
              <div className="sub-dropdown">
                {cat.subCategories.map(sub => (
                  <div
                    key={sub._id}
                    className="sub-item"
                    onClick={() =>
                      navigate(`/products?category=${sub._id}`)
                    }
                  >
                    {sub.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="hero-slider">
        <div
          className="hero-track"
          style={{ transform: `translateX(-${slideIndex * 100}%)` }}
        >
          {banners.map((img, i) => (
            <div key={i} className="hero-slide">
              <img src={img} alt="banner" />
              <div className="hero-content">
                <span className="badge">OneKart Deals</span>
                <h1>Everything you need. One Cart.</h1>
                <p>Shop electronics, fashion & home essentials</p>
                <div className="hero-actions">
                  <button onClick={() => navigate("/products")}>
                    Shop Now
                  </button>
                  <button
                    className="ghost"
                    onClick={() => navigate("/cart")}
                  >
                    Go to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Strip */}
      <section className="category-strip">
        <div className="category-scroll">
          {allCategories.map(cat => (
            <div
              key={cat._id}
              className="category-item"
              onClick={() =>
                navigate(`/products?category=${cat._id}`)
              }
            >
              <img
                src={cat.image || "https://via.placeholder.com/60"}
                alt={cat.name}
                className="category-img"
              />
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="product-row">
        <div className="row-head">
          <h2>Top Picks for You</h2>
          <button
            className="link"
            onClick={() => navigate("/products")}
          >
            View All
          </button>
        </div>

        {loadingProducts ? (
          <p>Loading products...</p>
        ) : (
          <div className="home-product-grid">
            {products.map(p => {
              const img =
                (p.images && p.images[0]) ||
                p.thumbnail ||
                "https://via.placeholder.com/180";

              return (
                <div
                  key={p._id}
                  className="fk-card"
                  onClick={() =>
                    navigate(`/products/${p._id}`)
                  }
                >
                  <div className="fk-img-box">
                    <img src={img} alt={p.title} />
                  </div>

                  <div className="fk-info">
                    <p className="fk-title">{p.title}</p>
                    <div className="fk-rating">⭐ 4.4 <span>(1,234)</span></div>
                    <div className="fk-price">
                      ₹{p.discountPrice || p.price}
                      {p.discountPrice && <del>₹{p.price}</del>}
                      {p.discountPrice && (
                        <span className="fk-off">
                          {Math.floor(((p.price - p.discountPrice)/p.price)*100)}% off
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className="fk-cart-btn"
                    onClick={e => {
                      e.stopPropagation();
                      alert("Added to cart");
                    }}
                  >
                    ADD TO CART
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="onekart-footer">
        © 2025 OneKart • One Cart. Endless Choice.
      </footer>
    </div>
  );
}
