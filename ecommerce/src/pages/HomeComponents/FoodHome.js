import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import "../../styles/foodHome.css";
import {
  FaSearch,
  FaStar,
  FaHeart,
  FaRegHeart,
  FaUtensils,
  FaClock,
  FaMotorcycle,
  FaShieldAlt,
  FaFire,
  FaTag,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaMinus,
  FaCheck,
  FaMapMarkerAlt,
  FaShoppingCart
} from "react-icons/fa";
import {
  foodCategories,
  restaurants,
  foodDishes
} from "../../data/foodData";
import useCartStore from "../Profile/cartStore";

export default function FoodHome() {
  const navigate = useNavigate();
  const categoryScrollRef = useRef(null);
  const dishesSectionRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [favorites, setFavorites] = useState({});
  const [copiedCode, setCopiedCode] = useState(null);

  // Cart Store
  const products = useCartStore((state) => state.products);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const cartCount = useCartStore((state) => state.cartCount());
  const totalPrice = useCartStore((state) => state.totalPrice());

  // Quantity map for fast lookup on dish cards
  const qtyMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[p._id] = p.quantity || 0;
    });
    return map;
  }, [products]);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const distance = direction === "left" ? -320 : 320;
      categoryScrollRef.current.scrollBy({ left: distance, behavior: "smooth" });
    }
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    message.success(favorites[id] ? "Removed from favorites" : "Saved to favorites ❤️");
  };

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    message.success(`Coupon code "${code}" copied!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleCategoryClick = (catId, catName) => {
    const newCat = selectedCategory === catId ? "ALL" : catId;
    setSelectedCategory(newCat);
    message.info(newCat === "ALL" ? "Showing all dishes" : `Showing ${catName} dishes 🍽️`);
    
    // Smooth scroll down to dishes section
    if (dishesSectionRef.current) {
      dishesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAddDish = (dish) => {
    addItem(dish, 1);
    message.success(`Added ${dish.name} (₹${dish.price}) to cart! 🛒`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      if (dishesSectionRef.current) {
        dishesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      message.info(`Showing food results for "${searchTerm}"...`);
    }
  };

  // Filter restaurants based on active pill
  const filteredRestaurants = restaurants.filter((r) => {
    if (activeFilter === "FAST") return r.time.includes("20");
    if (activeFilter === "RATED") return parseFloat(r.rating) >= 4.8;
    if (activeFilter === "VEG") return r.isVeg === true;
    if (activeFilter === "OFFERS") return r.offer.includes("50%") || r.offer.includes("BUY 1");
    return true;
  });

  // Filter dishes based on selected category and search term
  const displayedDishes = useMemo(() => {
    let list = foodDishes;

    if (selectedCategory !== "ALL") {
      list = list.filter((d) => d.categoryId.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.rest.toLowerCase().includes(q) ||
          d.desc?.toLowerCase().includes(q) ||
          d.categoryName.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCategory, searchTerm]);

  // Active category display info
  const activeCategoryObj = foodCategories.find((c) => c.id === selectedCategory);

  return (
    <div className="food-home-wrapper">
      {/* 1. CULINARY HERO SECTION */}
      <section className="food-hero-section">
        <div className="food-hero-badge">
          <FaFire /> <span>30-MIN EXPRESS DELIVERY • LIVE TRACKING</span>
        </div>
        <h1 className="food-hero-title">
          Good Food. <span className="highlight-gold">Delivered Fast.</span>
        </h1>
        <p className="food-hero-subtitle">
          Discover top-rated local kitchens, artisanal bakeries, and gourmet restaurants delivered hot & fresh to your doorstep.
        </p>

        {/* Hero Search & Location Bar */}
        <form className="food-hero-search-box" onSubmit={handleSearchSubmit}>
          <div className="food-location-picker" title="Change delivery location">
            <FaMapMarkerAlt />
            <span>New Delhi, Central</span>
          </div>
          <input
            type="text"
            className="food-hero-input"
            placeholder="Search for pizza, biryani, burgers or restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="food-hero-find-btn">
            <FaSearch size={13} />
            <span>Find Food</span>
          </button>
        </form>

        {/* Value Highlights */}
        <div className="food-hero-chips">
          <div className="food-chip-item">
            <FaMotorcycle /> <span>Fast & Contactless Delivery</span>
          </div>
          <div className="food-chip-item">
            <FaShieldAlt /> <span>100% Hygienic Packaging</span>
          </div>
          <div className="food-chip-item">
            <FaTag /> <span>Up to 50% Off Top Menus</span>
          </div>
          <div className="food-chip-item">
            <FaStar /> <span>4.5+ Verified Ratings</span>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES CAROUSEL ("What are you craving?") */}
      <section className="food-section-container">
        <div className="food-section-header">
          <div>
            <div className="food-section-eyebrow">
              <FaUtensils size={11} /> <span>EXPLORE CUISINES</span>
            </div>
            <h2 className="food-section-title">What are you craving?</h2>
            <p className="food-section-subtitle">
              Click any craving to instantly filter matching dishes below
            </p>
          </div>
          <div className="food-scroll-arrows">
            <button
              type="button"
              className="food-nav-arrow-btn"
              onClick={() => scrollCategories("left")}
              aria-label="Scroll cuisines left"
              title="Previous"
            >
              <FaChevronLeft size={13} />
            </button>
            <button
              type="button"
              className="food-nav-arrow-btn"
              onClick={() => scrollCategories("right")}
              aria-label="Scroll cuisines right"
              title="Next"
            >
              <FaChevronRight size={13} />
            </button>
          </div>
        </div>

        <div className="food-categories-scroll-wrapper">
          <div className="food-categories-scroll" ref={categoryScrollRef}>
            {foodCategories.map((c) => {
              const isSelected = selectedCategory === c.id;
              return (
                <div
                  className={`food-cat-card ${isSelected ? "active" : ""}`}
                  key={c.id}
                  onClick={() => handleCategoryClick(c.id, c.name)}
                  title={`View ${c.name} dishes`}
                >
                  <div className="food-cat-avatar-wrap">
                    <img src={c.img} alt={c.name} className="food-cat-avatar-img" loading="lazy" />
                  </div>
                  <span className="food-cat-label">{c.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. PROMOTIONS & DEALS */}
      <section className="food-section-container" style={{ paddingTop: 0 }}>
        <div className="food-section-header">
          <div>
            <div className="food-section-eyebrow">
              <FaFire size={11} /> <span>EXCLUSIVE PROMOS</span>
            </div>
            <h2 className="food-section-title">🔥 Best Offers Near You</h2>
            <p className="food-section-subtitle">Handpicked voucher discounts and free delivery deals for today</p>
          </div>
        </div>

        <div className="food-offers-grid">
          <div
            className="food-offer-card"
            style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" }}
            onClick={() => handleCopyCode("ONECART50")}
          >
            <div className="food-offer-header">
              <h3>50% OFF</h3>
              <p>On your first 3 food orders up to ₹100</p>
            </div>
            <div className="food-offer-footer">
              <span className="food-offer-code">CODE: ONECART50</span>
              <button className="food-offer-btn">
                {copiedCode === "ONECART50" ? "Copied! ✓" : "Copy Code"}
              </button>
            </div>
          </div>

          <div
            className="food-offer-card"
            style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
            onClick={() => handleCopyCode("FREEDEL")}
          >
            <div className="food-offer-header">
              <h3>FREE DELIVERY</h3>
              <p>On all restaurant orders above ₹199</p>
            </div>
            <div className="food-offer-footer">
              <span className="food-offer-code">CODE: FREEDEL</span>
              <button className="food-offer-btn">
                {copiedCode === "FREEDEL" ? "Copied! ✓" : "Copy Code"}
              </button>
            </div>
          </div>

          <div
            className="food-offer-card"
            style={{ background: "linear-gradient(135deg, #10b981 0%, #047857 100%)" }}
            onClick={() => handleCopyCode("BOGOFEAST")}
          >
            <div className="food-offer-header">
              <h3>BUY 1 GET 1</h3>
              <p>On artisan pizzas & gourmet burgers</p>
            </div>
            <div className="food-offer-footer">
              <span className="food-offer-code">CODE: BOGOFEAST</span>
              <button className="food-offer-btn">
                {copiedCode === "BOGOFEAST" ? "Copied! ✓" : "Copy Code"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RESTAURANTS NEAR YOU */}
      <section className="food-section-container bg-white">
        <div className="food-section-header">
          <div>
            <div className="food-section-eyebrow">
              <FaMapMarkerAlt size={11} /> <span>LOCAL DINING</span>
            </div>
            <h2 className="food-section-title">Top Restaurants Near You</h2>
            <p className="food-section-subtitle">Click any restaurant to view its full gourmet menu & order</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="food-filters-bar">
          <button
            className={`food-filter-tab ${activeFilter === "ALL" ? "active" : ""}`}
            onClick={() => setActiveFilter("ALL")}
          >
            🔥 All Restaurants ({restaurants.length})
          </button>
          <button
            className={`food-filter-tab ${activeFilter === "FAST" ? "active" : ""}`}
            onClick={() => setActiveFilter("FAST")}
          >
            ⚡ Under 30 Mins
          </button>
          <button
            className={`food-filter-tab ${activeFilter === "RATED" ? "active" : ""}`}
            onClick={() => setActiveFilter("RATED")}
          >
            ⭐ Rating 4.8+
          </button>
          <button
            className={`food-filter-tab ${activeFilter === "VEG" ? "active" : ""}`}
            onClick={() => setActiveFilter("VEG")}
          >
            🥗 Pure Veg
          </button>
          <button
            className={`food-filter-tab ${activeFilter === "OFFERS" ? "active" : ""}`}
            onClick={() => setActiveFilter("OFFERS")}
          >
            🏷️ Great Offers
          </button>
        </div>

        {/* Restaurant Cards Grid */}
        <div className="restaurants-grid">
          {filteredRestaurants.map((r) => (
            <div
              className="restaurant-card"
              key={r.id}
              onClick={() => navigate(`/restaurant/${r.id}`)}
              title={`View ${r.name} menu & dishes`}
            >
              <div className="rest-img-wrapper">
                <img src={r.img} alt={r.name} className="rest-img-photo" loading="lazy" />
                <span className="rest-floating-offer">{r.offer}</span>
                <span className="rest-floating-time">
                  <FaClock size={10} /> {r.time}
                </span>
                <button
                  type="button"
                  className={`rest-fav-btn ${favorites[r.id] ? "active" : ""}`}
                  onClick={(e) => toggleFavorite(e, r.id)}
                  title="Save to favorites"
                >
                  {favorites[r.id] ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>

              <div className="rest-info">
                <div className="rest-header">
                  <h3>{r.name}</h3>
                  <span className="rest-rating-badge">
                    <FaStar size={10} /> {r.rating}
                  </span>
                </div>
                <p className="rest-cuisine">{r.cuisine}</p>
                <div className="rest-footer-meta">
                  <span>{r.priceForTwo}</span>
                  <span>•</span>
                  <span className="delivery-fee">
                    {r.fee === "FREE" ? "FREE Delivery" : `Delivery: ${r.fee}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CATEGORY & POPULAR DISHES */}
      <section className="food-section-container" ref={dishesSectionRef}>
        <div className="food-section-header">
          <div>
            <div className="food-section-eyebrow">
              <FaStar size={11} />{" "}
              <span>
                {selectedCategory !== "ALL"
                  ? `${activeCategoryObj?.name.toUpperCase()} SPECIALS`
                  : "POPULAR BESTSELLERS"}
              </span>
            </div>
            <h2 className="food-section-title">
              {selectedCategory !== "ALL"
                ? `${activeCategoryObj?.icon || "🍽️"} ${activeCategoryObj?.name} Dishes Near You`
                : "Popular Dishes Near You"}
            </h2>
            <p className="food-section-subtitle">
              {selectedCategory !== "ALL"
                ? `Showing ${displayedDishes.length} freshly prepared ${activeCategoryObj?.name} specialties`
                : "Most-ordered dishes with top customer reviews"}
            </p>
          </div>

          {selectedCategory !== "ALL" && (
            <button
              type="button"
              className="food-dish-cat-btn active"
              onClick={() => setSelectedCategory("ALL")}
              style={{ alignSelf: "center" }}
            >
              ✕ Clear Filter (Show All)
            </button>
          )}
        </div>

        {/* Quick Category Switcher Pills */}
        <div className="food-dish-cat-bar">
          <button
            type="button"
            className={`food-dish-cat-btn ${selectedCategory === "ALL" ? "active" : ""}`}
            onClick={() => setSelectedCategory("ALL")}
          >
            🔥 All Dishes ({foodDishes.length})
          </button>
          {foodCategories.map((c) => {
            const count = foodDishes.filter((d) => d.categoryId === c.id).length;
            return (
              <button
                type="button"
                key={c.id}
                className={`food-dish-cat-btn ${selectedCategory === c.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(c.id)}
              >
                {c.icon} {c.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Dishes Grid */}
        <div className="dishes-grid">
          {displayedDishes.map((d) => {
            const currentQty = qtyMap[d.id] || 0;

            return (
              <div className="dish-card" key={d.id}>
                <div className="dish-info">
                  <span
                    className={`dish-veg-badge ${d.veg ? "veg" : "nonveg"}`}
                    title={d.veg ? "Pure Vegetarian" : "Non-Vegetarian"}
                  />
                  <h4 className="dish-name">{d.name}</h4>
                  <p
                    className="dish-rest-name"
                    onClick={() => navigate(`/restaurant/${d.restaurantId}`)}
                    title={`View ${d.rest} restaurant menu`}
                  >
                    📍 {d.rest}
                  </p>
                  <div className="dish-price-row">
                    <span className="dish-price">₹{d.price}</span>
                    <span className="dish-rating">⭐ {d.rating}</span>
                  </div>
                  {d.desc && <p className="dish-desc-snippet">{d.desc}</p>}
                </div>

                <div className="dish-img-side">
                  <img src={d.img} alt={d.name} className="dish-photo" loading="lazy" />

                  {currentQty > 0 ? (
                    <div className="food-dish-qty-ctrl">
                      <button
                        type="button"
                        className="food-dish-qty-btn"
                        onClick={() => updateQuantity(d.id, -1)}
                        title="Reduce"
                      >
                        <FaMinus size={8} />
                      </button>
                      <span className="food-dish-qty-num">{currentQty}</span>
                      <button
                        type="button"
                        className="food-dish-qty-btn"
                        onClick={() => updateQuantity(d.id, 1)}
                        title="Add more"
                      >
                        <FaPlus size={8} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="add-dish-btn"
                      onClick={() => handleAddDish(d)}
                    >
                      <FaPlus size={10} style={{ marginRight: 4 }} /> ADD
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 6. TRUST & SAFETY BANNER */}
        <div className="food-trust-banner">
          <div className="food-trust-left">
            <h3>Safe & Hygienic Delivery Guaranteed</h3>
            <p>
              Every meal is prepared in sanitized kitchens, sealed in tamper-proof packaging, and delivered with temperature-monitored contactless handoff.
            </p>
            <div className="food-trust-badges">
              <div className="food-trust-chip">
                <FaCheck /> <span>Tamper-Evident Seals</span>
              </div>
              <div className="food-trust-chip">
                <FaCheck /> <span>Live Rider GPS Tracking</span>
              </div>
              <div className="food-trust-chip">
                <FaCheck /> <span>100% Verified Restaurants</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FLOATING CART BAR (WHEN CART HAS ITEMS) */}
      {cartCount > 0 && (
        <aside className="rest-floating-cart-bar">
          <div className="rest-float-left">
            <div className="rest-float-icon">
              <FaShoppingCart />
            </div>
            <div className="rest-float-summary">
              <h4>
                {cartCount} {cartCount === 1 ? "Dish" : "Dishes"} in Cart
              </h4>
              <p>Total: ₹{totalPrice.toLocaleString()} • Express dispatch</p>
            </div>
          </div>

          <button
            type="button"
            className="rest-float-checkout-btn"
            onClick={() => navigate("/cart")}
          >
            <span>Proceed to Cart</span>
            <FaChevronRight size={12} />
          </button>
        </aside>
      )}

      {/* 8. FOOTER */}
      <footer className="food-footer">
        <div className="food-footer-inner">
          <div className="food-footer-grid">
            <div className="food-footer-brand">
              <h2>OneCart <span>Food</span></h2>
              <p>
                Delivering culinary delight across 50+ cities. Fast, hot, hygienic meals prepared with passion by your favorite local restaurants.
              </p>
            </div>
            <div className="food-footer-col">
              <h4>ABOUT US</h4>
              <ul>
                <li onClick={() => navigate("/about")}>About OneCart</li>
                <li onClick={() => navigate("/careers")}>Careers</li>
                <li onClick={() => navigate("/partner-registration")}>Partner With Us</li>
                <li onClick={() => navigate("/ride")}>Ride With Us</li>
              </ul>
            </div>
            <div className="food-footer-col">
              <h4>HELP & SUPPORT</h4>
              <ul>
                <li onClick={() => navigate("/help")}>Help Center</li>
                <li onClick={() => navigate("/safety")}>Food Safety</li>
                <li onClick={() => navigate("/terms")}>Terms & Conditions</li>
                <li onClick={() => navigate("/privacy")}>Privacy Policy</li>
              </ul>
            </div>
            <div className="food-footer-col">
              <h4>AVAILABLE CITIES</h4>
              <ul>
                <li>Delhi NCR</li>
                <li>Mumbai</li>
                <li>Bengaluru</li>
                <li>Hyderabad</li>
              </ul>
            </div>
          </div>
          <div className="food-footer-bottom">
            <p>© 2026 OneCart Food Technologies Ltd. All Rights Reserved.</p>
            <p>Made with ❤️ for food lovers everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
