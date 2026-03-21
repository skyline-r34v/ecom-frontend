import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import "../styles/home.css";

/* HERO BANNERS */

const banners = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  "https://images.unsplash.com/photo-1595341888016-a392ef81b7de",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
];

/* RATING */

const Rating = ({ reviews = [] }) => {
  if (!reviews.length) return <div className="fk-rating">No ratings</div>;

  const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  const full = Math.floor(avg);

  return (
    <div className="fk-rating">
      {[...Array(5)].map((_, i) => (
        <span key={i}>{i < full ? "⭐" : "☆"}</span>
      ))}
      <span className="rating-text">
        {avg.toFixed(1)} ({reviews.length})
      </span>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);

  const [slideIndex, setSlideIndex] = useState(0);
  const [wishlist, setWishlist] = useState([]);

  /* FLASH SALE TIMER */
  const [timeLeft, setTimeLeft] = useState(3600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((p) => (p > 0 ? p - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const categoryParam = params.get("category");
  const searchParam = params.get("search");

  /* FETCH DATA */

  useEffect(() => {
    api.get("/categories/with-subcategories").then((res) => {
      setCategories(res.data.data || []);
    });

    api.post("/categories/list", { page: 1, size: 20 }).then((res) => {
      setAllCategories(res.data.data || []);
    });

    api.post("/brands/list", { page: 1, size: 20 }).then((res) => {
      setBrands(res.data.data || []);
    });
  }, []);

  useEffect(() => {
    api
      .post("/products/list", {
        page: 1,
        size: 50,
        category: categoryParam || undefined,
        search: searchParam || undefined,
      })
      .then((res) => setProducts(res.data.data || []));
  }, [categoryParam, searchParam]);

  /* HERO AUTO SLIDE */

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((p) => (p + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  /* GROUP PRODUCTS */

  const productsByCategory = products.reduce((acc, p) => {
    const name = p.category?.name || "Products";
    if (!acc[name]) acc[name] = [];
    acc[name].push(p);
    return acc;
  }, {});

  /* WISHLIST */

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist((prev) => prev.filter((x) => x !== id));
    } else {
      setWishlist((prev) => [...prev, id]);
    }
  };

  return (
    <div className="onekart-home">
      <Navbar />

      {/* ✅ CATEGORY DROPDOWN NAVBAR */}
      <div className="navbar-categories">
        {categories.map((cat) => (
          <div key={cat._id} className="nav-item">
            <span
              className="nav-link"
              onClick={() => navigate(`/products?category=${cat._id}`)}
            >
              {cat.name}
            </span>

            {/* ✅ FIXED: subCategories */}
            {cat.subCategories?.length > 0 && (
              <div className="dropdown">
                {cat.subCategories.map((sub) => (
                  <p
                    key={sub._id}
                    onClick={() =>
                      navigate(`/products?subcategory=${sub._id}`)
                    }
                  >
                    {sub.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* HERO */}

      <section className="hero-slider">
        <div
          className="hero-track"
          style={{ transform: `translateX(-${slideIndex * 100}%)` }}
        >
          {banners.map((img, i) => (
            <div key={i} className="hero-slide">
              <img src={img} alt="banner" />
              <div className="hero-content">
                <h1>Step Into Comfort</h1>
                <p>Discover premium sneakers</p>
                <button onClick={() => navigate("/products")}>
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY SLIDER */}

      <section className="category-row">
        <h2>Shop By Category</h2>
        <div className="category-slider">
          {allCategories.map((cat) => (
            <div
              key={cat._id}
              className="category-small-card"
              onClick={() => navigate(`/products?category=${cat._id}`)}
            >
              <img src={cat.image} alt={cat.name} />
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BRANDS */}

      <section className="brands-row">
        <h2>Top Brands</h2>
        <div className="brand-slider">
          {brands.map((brand) => (
            <div
              key={brand._id}
              className="brand-logo"
              onClick={() => navigate(`/products?brand=${brand._id}`)}
            >
              <img src={brand.logo} alt={brand.name} />
            </div>
          ))}
        </div>
      </section>

      {/* FLASH SALE */}

      <section className="flash-sale">
        <div className="flash-head">
          <h2>⚡ Flash Sale</h2>
          <div className="countdown">
            {hours}:{minutes}:{seconds}
          </div>
        </div>

        <div className="deal-grid">
          {products.slice(0, 6).map((p) => (
            <div
              key={p._id}
              className="deal-card"
              onClick={() => navigate(`/products/${p._id}`)}
            >
              <img src={p.images?.[0]} alt={p.title} />
              <p>{p.title}</p>
              <div className="price">₹{p.discountPrice || p.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT ROWS */}

      {Object.keys(productsByCategory).map((catName) => (
        <section className="product-row" key={catName}>
          <div className="row-head">
            <h2>{catName}</h2>
          </div>

          <div className="home-product-grid">
            {productsByCategory[catName].map((p) => (
              <div
                key={p._id}
                className="fk-card"
                onClick={() => navigate(`/products/${p._id}`)}
              >
                <div className="fk-img-box">
                  <img src={p.images?.[0]} alt={p.title} />
                </div>

                <button
                  className={`fk-wishlist-btn ${
                    wishlist.includes(p._id) ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(p._id);
                  }}
                >
                  {wishlist.includes(p._id) ? "❤️" : "🤍"}
                </button>

                <p className="fk-title">{p.title}</p>

                <Rating reviews={p.reviews} />

                <div className="fk-price">
                  ₹{p.discountPrice || p.price}
                </div>

                <button
                  className="fk-cart-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert("Added to cart");
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* FOOTER */}

      <footer className="onekart-footer">
        <div className="footer-grid">
          <div>
            <h4>About</h4>
            <p>Premium footwear marketplace</p>
          </div>

          <div>
            <h4>Support</h4>
            <p>Help Center</p>
            <p>Returns</p>
          </div>

          <div>
            <h4>Company</h4>
            <p>About Us</p>
            <p>Careers</p>
          </div>

          <div>
            <h4>Follow</h4>
            <p>Instagram</p>
            <p>Facebook</p>
          </div>
        </div>

        <div className="footer-bottom">© 2025 OneKart</div>
      </footer>
    </div>
  );
}