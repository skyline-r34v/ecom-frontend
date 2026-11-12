import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import api from "../../api";
import "./ShopByCategory.css";

/* ==========================================================================
   DEFAULT CURATED CATEGORIES (MATCHING REAL PRODUCTS IN THE STORE)
   8 Categories = Exactly 2 Balanced Rows of 4 Cards on Desktop
   ========================================================================== */
const FEATURED_CATEGORIES = [
  {
    _id: "cat_electronics",
    name: "Electronics & Gadgets",
    slug: "electronics-gadgets",
    description: "Next-gen audio, smart wearables, studio sound & 4K gear.",
    badge: "420+ Products",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800", // Aura Pro Studio Headphones
  },
  {
    _id: "cat_fashion",
    name: "Fashion & Apparel",
    slug: "fashion-apparel",
    description: "Designer streetwear, tailored suits & luxury seasonal wear.",
    badge: "850+ Products",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800", // Milano Tailored Fashion
  },
  {
    _id: "cat_home",
    name: "Home & Living",
    slug: "home-kitchen",
    description: "Artisan espresso machines, modern cookware & ambient decor.",
    badge: "310+ Products",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800", // Barista Touch Espresso Machine
  },
  {
    _id: "cat_beauty",
    name: "Beauty & Personal Care",
    slug: "beauty-skincare",
    description: "Organic botanical serums, anti-aging elixirs & luxury scents.",
    badge: "260+ Products",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800", // Lumière Bio-Active Retinol Serum
  },
  {
    _id: "cat_sports",
    name: "Sports & Fitness",
    slug: "sports-fitness",
    description: "Marathon carbon footwear, dumbbell sets & gym equipment.",
    badge: "190+ Products",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800", // Apex Pro Marathon Running Shoes
  },
  {
    _id: "cat_watches",
    name: "Luxury Watches",
    slug: "luxury-watches",
    description: "Automatic chronographs, sapphire crystal & heritage timepieces.",
    badge: "140+ Products",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800", // Geneva Heritage Automatic Skeleton
  },
  {
    _id: "cat_books",
    name: "Books & Stationery",
    slug: "books-stationery",
    description: "Bestseller novels, leatherbound journals & executive pens.",
    badge: "600+ Products",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800", // International Bestsellers & Stationery
  },
  {
    _id: "cat_toys",
    name: "Toys & Games",
    slug: "toys-baby-care",
    description: "Architecture robotics sets, educational toys & family games.",
    badge: "220+ Products",
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=800", // Creator Robotics & Building Sets
  },
];

export default function ShopByCategory({ categories: propCategories }) {
  const navigate = useNavigate();
  const [liveCategories, setLiveCategories] = useState([]);

  // Fetch live categories from backend API if not passed via props
  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setLiveCategories(propCategories);
      return;
    }

    api.post("/categories/list", { page: 1, size: 20 })
      .then((res) => {
        const fetched = res.data?.data || [];
        setLiveCategories(fetched);
      })
      .catch((err) => {
        setLiveCategories([]);
        console.log("Categories fetch error:", err?.message || err);
      });
  }, [propCategories]);

  // Merge live categories with curated showcase to guarantee 8 premium, high-res cards
  const displayCategories = useMemo(() => {
    return FEATURED_CATEGORIES.map((featured) => {
      // Find matching live category by slug or name
      const matched = liveCategories.find((c) => {
        const nameA = (c.name || "").toLowerCase().trim();
        const nameB = featured.name.toLowerCase().trim();
        const slugA = (c.slug || "").toLowerCase().trim();
        const slugB = featured.slug.toLowerCase().trim();
        return nameA === nameB || slugA === slugB || nameA.includes(nameB) || nameB.includes(nameA);
      });

      if (matched) {
        return {
          ...featured,
          _id: matched._id || featured._id,
          name: matched.name || featured.name,
          slug: matched.slug || featured.slug,
          description: matched.description || featured.description,
          image: matched.image && matched.image.startsWith("http") ? matched.image : featured.image,
        };
      }
      return featured;
    });
  }, [liveCategories]);

  // Navigate to products filtered by category
  const handleCategoryClick = (cat) => {
    if (cat._id) {
      navigate(`/products?category=${cat._id}`);
    } else if (cat.slug) {
      navigate(`/products?category=${cat.slug}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(cat.name)}`);
    }
  };

  return (
    <section className="ascent-shop-category-section" id="shop-by-category">
      <div className="ascent-shop-category-container">
        {/* ===================================================================
            SECTION HEADING
            =================================================================== */}
        <div className="ascent-cat-header">
          <div className="ascent-cat-header-left">
            {/* Small label */}
            <div className="ascent-cat-eyebrow">
              <span className="ascent-cat-eyebrow-dot" />
              <span>EXPLORE OUR COLLECTION</span>
            </div>

            {/* Main heading */}
            <h2 className="ascent-cat-title">
              Shop by <span className="ascent-cat-gradient-text">Category</span>
            </h2>

            {/* Description */}
            <p className="ascent-cat-description">
              Discover products curated for your style, needs, and everyday essentials.
            </p>
          </div>

          {/* Desktop Right Side View All Link */}
          <div className="ascent-cat-header-right">
            <button
              type="button"
              className="ascent-cat-view-all-btn"
              onClick={() => navigate("/category")}
              aria-label="View all product categories"
            >
              <span>View All Categories</span>
              <FaArrowRight className="ascent-cat-arrow" size={13} />
            </button>
          </div>
        </div>

        {/* ===================================================================
            CATEGORY CARDS GRID (4 DESKTOP / 2 TABLET / 2 MOBILE)
            =================================================================== */}
        <div className="ascent-cat-grid">
          {displayCategories.map((cat, index) => (
            <div
              key={cat._id || cat.slug || index}
              className="ascent-cat-card"
              onClick={() => handleCategoryClick(cat)}
              tabIndex={0}
              role="button"
              aria-label={`Explore ${cat.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCategoryClick(cat);
                }
              }}
            >
              {/* High-Resolution Category Image */}
              <div className="ascent-cat-img-wrapper">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="ascent-cat-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800";
                  }}
                />
              </div>

              {/* Scrim Overlay for Crystal-Clear Text Legibility */}
              <div className="ascent-cat-overlay" aria-hidden="true" />

              {/* Top Item Count / Badge Pill */}
              <span className="ascent-cat-badge">{cat.badge || "Curated"}</span>

              {/* Bottom Card Content */}
              <div className="ascent-cat-content">
                <h3 className="ascent-cat-name">{cat.name}</h3>
                {cat.description && (
                  <p className="ascent-cat-desc">{cat.description}</p>
                )}
                <div className="ascent-cat-cta">
                  <span>Explore Collection</span>
                  <span className="ascent-cat-cta-circle" aria-hidden="true">
                    <FaArrowRight size={11} />
                  </span>
                </div>
              </div>

              {/* Bottom Hover Accent Gradient Line */}
              <div className="ascent-cat-accent-line" aria-hidden="true" />
            </div>
          ))}
        </div>

        {/* Mobile View All Categories Action (Shown on mobile screens below the grid) */}
        <div className="ascent-cat-mobile-action">
          <button
            type="button"
            className="ascent-cat-mobile-btn"
            onClick={() => navigate("/category")}
            aria-label="View all product categories"
          >
            <span>View All Categories</span>
            <FaArrowRight size={12} />
          </button>
        </div>
      </div>
    </section>
  );
}
