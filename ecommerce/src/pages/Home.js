import React, { useEffect, useState } from "react";
import {
  FaBars,
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import "../styles/home.css";

const banners = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
];

export default function Home() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // ================= AUTH =================
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // ================= STATE =================
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState("");

  const categoryParam = params.get("category");
  const searchParam = params.get("search");

  // ================= LOGOUT HANDLER =================
  const handleLogout = () => {
    localStorage.clear(); // clears token, user, etc.
    navigate("/");   // or "/" if you prefer
  };

  // ================= FETCH CATEGORIES =================
  useEffect(() => {
    api
      .get("/categories/with-subcategories")
      .then((res) => setCategories(res.data.data || []))
      .catch(console.error);

    api
      .post("/categories/list", { page: 1, size: 20 })
      .then((res) => setAllCategories(res.data.data || []))
      .catch(console.error);
  }, []);

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    setLoadingProducts(true);
    api
      .post("/products/list", {
        page: 1,
        size: 20,
        category: categoryParam || undefined,
        search: searchParam || undefined,
      })
      .then((res) => setProducts(res.data.data || []))
      .finally(() => setLoadingProducts(false));
  }, [categoryParam, searchParam]);

  // ================= HERO SLIDER =================
  useEffect(() => {
    const timer = setInterval(
      () => setSlideIndex((prev) => (prev + 1) % banners.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="noon-home">
      {/* ================= NAVBAR ================= */}
      <header className="noon-navbar">
        <FaBars className="menu-icon" />
        <div className="logo" onClick={() => navigate("/")}>
          OneKart
        </div>

        <div className="nav-search">
          <FaSearch />
          <input
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              navigate(`/products?search=${search}`)
            }
          />
        </div>

        <div className="nav-actions">
          {isLoggedIn && (
            <>
              <FaUser
                title="Profile"
                onClick={() => navigate("/profile")}
              />
              <FaShoppingCart
                title="Cart"
                onClick={() => navigate("/cart")}
              />
              <FaSignOutAlt
                title="Logout"
                onClick={handleLogout}
                className="logout-icon"
              />
            </>
          )}
        </div>
      </header>

      {/* ================= CATEGORY DROPDOWN ================= */}
      <div className="categories-dropdown-container">
        {categories.map((cat) => (
          <div key={cat._id} className="dropdown-main">
            <span className="category-name">{cat.name}</span>
            {cat.subCategories?.length > 0 && (
              <div className="sub-dropdown">
                {cat.subCategories.map((sub) => (
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

      {/* ================= HERO SLIDER ================= */}
      <section className="hero-slider">
        <div
          className="hero-track"
          style={{ transform: `translateX(-${slideIndex * 100}%)` }}
        >
          {banners.map((img, i) => (
            <div key={i} className="hero-slide">
              <img src={img} alt="banner" />
              <div className="hero-content">
                <h1>Smart Deals, Better Prices</h1>
                <p>Buy & sell trusted pre-owned products</p>
                <button onClick={() => navigate("/products")}>
                  Explore Deals
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CATEGORY STRIP ================= */}
      <section className="category-strip">
        <div className="category-scroll">
          {allCategories.map((cat) => (
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

      {/* ================= PRODUCTS ================= */}
      <section className="product-row">
        <h2>Recommended for you</h2>
        {loadingProducts ? (
          <p>Loading products...</p>
        ) : (
          <div className="row-scroll">
            {products.map((p) => {
              const productImg =
                (p.images && p.images[0]) ||
                p.thumbnail ||
                "https://via.placeholder.com/180";

              return (
                <div
                  key={p._id}
                  className="noon-product"
                  onClick={() =>
                    navigate(`/products/${p._id}`)
                  }
                >
                  <img src={productImg} alt={p.title} />
                  <p>{p.title}</p>
                  <strong>₹{p.discountPrice || p.price}</strong>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="noon-footer">
        © 2025 OneKart • Buy Smart • Sell Fast
      </footer>
    </div>
  );
}
