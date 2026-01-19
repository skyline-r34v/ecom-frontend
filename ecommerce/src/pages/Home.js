import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import "../styles/home.css";

/* ================= HERO BANNERS ================= */
const banners = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
];

/* ================= RATING ================= */
const Rating = ({ reviews = [] }) => {
  if (!reviews.length)
    return <div className="fk-rating no-rating">No ratings</div>;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const fullStars = Math.floor(avg);

  return (
    <div className="fk-rating">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < fullStars ? "" : "star-muted"}>⭐</span>
      ))}
      <span className="rating-text">{avg.toFixed(1)} ({reviews.length})</span>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]); // ✅ already existing brand data
  const [slideIndex, setSlideIndex] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([]);


  const categoryParam = params.get("category");
  const searchParam = params.get("search");

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    api.get("/categories/with-subcategories")
      .then(res => setCategories(res.data.data || []))
      .catch(console.error);

    api.post("/categories/list", { page: 1, size: 20 })
      .then(res => setAllCategories(res.data.data || []))
      .catch(console.error);

    api.post("/brands/list",{ page: 1, size: 20 }) // your existing brand API
      .then(res => setBrands(res.data.data || []))
      .catch(console.error);
  }, []);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    setLoadingProducts(true);
    api.post("/products/list", {
      page: 1,
      size: 50,
      category: categoryParam || undefined,
      search: searchParam || undefined,
    })
      .then(res => setProducts(res.data.data || []))
      .finally(() => setLoadingProducts(false));
  }, [categoryParam, searchParam]);

  /* ================= HERO SLIDER ================= */
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  /* ================= GROUP PRODUCTS ================= */
  const productsByCategory = products.reduce((acc, p) => {
    const name = p.category?.name || "Others";
    if (!acc[name]) acc[name] = [];
    acc[name].push(p);
    return acc;
  }, {});

  /* ================= WISHLIST ================= */
  const toggleWishlist = async (id) => {
    try {
      if (wishlist.includes(id)) {
        await api.delete(`/users/wishlist/${id}`);
        setWishlist(prev => prev.filter(x => x !== id));
      } else {
        await api.post("/users/wishlist", { productId: id });
        setWishlist(prev => [...prev, id]);
      }
    } catch {
      alert("Wishlist failed");
    }
  };

  return (
    <div className="onekart-home">
      <Navbar search={search} setSearch={setSearch} />

      {/* ================= CATEGORY HOVER ================= */}
      <section className="category-hover-bar">
        <div className="category-hover-container">
          {categories.map(cat => (
            <div key={cat._id} className="category-hover-item">
              <span
                className="category-name"
                onClick={() => navigate(`/products?category=${cat._id}`)}
              >
                {cat.name}
              </span>
              {cat.subCategories?.length > 0 && (
                <div className="subcategory-dropdown">
                  {cat.subCategories.map(sub => (
                    <div
                      key={sub._id}
                      className="subcategory-item"
                      onClick={() => navigate(`/products?subcategory=${sub._id}`)}
                    >
                      {sub.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================= HERO ================= */}
      <section className="hero-slider">
        <div className="hero-track" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
          {banners.map((img, i) => (
            <div key={i} className="hero-slide">
              <img src={img} alt="banner" />
              <div className="hero-content">
                <span className="badge">OneKart Deals</span>
                <h1>Everything you need. One Cart.</h1>
                <p>Shop electronics, fashion & home essentials</p>
                <div className="hero-actions">
                  <button onClick={() => navigate("/products")}>Shop Now</button>
                  <button className="ghost" onClick={() => navigate("/cart")}>Go to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SHOP BY CATEGORY ================= */}
      <section className="all-category-list">
        <h2 className="section-title">Shop by Category</h2>
        <div className="all-category-grid">
          {allCategories.map(cat => (
            <div
              key={cat._id}
              className="all-category-card"
              onClick={() => navigate(`/products?category=${cat._id}`)}
            >
              <img src={cat.image || "https://via.placeholder.com/80"} alt={cat.name} />
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SHOP BY BRAND ================= */}
      <section className="brand-section">
        <h2 className="section-title">Shop by Brand</h2>
        <div className="brand-grid">
          {brands.map(brand => (
            <div
              key={brand._id}
              className="brand-card"
              onClick={() => navigate(`/products?brand=${brand._id}`)}
            >
              <img src={brand.logo || "https://via.placeholder.com/80"} alt={brand.name} />
              <span>{brand.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      {loadingProducts ? (
        <p style={{ padding: 40 }}>Loading products...</p>
      ) : (
        Object.keys(productsByCategory).map(catName => (
          <section className="product-row" key={catName}>
            <div className="row-head">
              <h2>{catName}</h2>
              <button
                className="link"
                onClick={() => navigate(`/products?category=${productsByCategory[catName][0]?.category?._id}`)}
              >
                View All
              </button>
            </div>

            <div className="home-product-grid">
              {productsByCategory[catName].slice(0, 5).map(p => (
                <div key={p._id} className="fk-card" onClick={() => navigate(`/products/${p._id}`)}>
                  <div className="fk-img-box">
                    <img src={p.images?.[0] || p.thumbnail || "https://via.placeholder.com/180"} alt={p.title} />
                  </div>

                  <div className="fk-info">
                    <p className="fk-title">{p.title}</p>
                    <Rating reviews={p.reviews} />
                    <div className="fk-price">₹{p.discountPrice || p.price}{p.discountPrice && <del>₹{p.price}</del>}</div>
                  </div>

                  <div className="fk-card-actions">
                    <button className="fk-cart-btn" onClick={e => { e.stopPropagation(); alert("Added to cart"); }}>
                      ADD TO CART
                    </button>
                    <button
                      className={`fk-wishlist-btn ${wishlist.includes(p._id) ? "active" : ""}`}
                      onClick={e => { e.stopPropagation(); toggleWishlist(p._id); }}
                    >❤️</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      <footer className="onekart-footer">© 2025 OneKart • One Cart. Endless Choice.</footer>
    </div>
  );
}
