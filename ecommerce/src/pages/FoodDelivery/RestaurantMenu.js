import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import {
  FaStar,
  FaClock,
  FaMapMarkerAlt,
  FaMotorcycle,
  FaSearch,
  FaArrowLeft,
  FaShoppingCart,
  FaCheckCircle,
  FaTag,
  FaPlus,
  FaMinus,
  FaChevronRight,
  FaFire
} from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { getRestaurantById, getDishesByRestaurant } from "../../data/foodData";
import useCartStore from "../Profile/cartStore";
import "../../styles/restaurantMenu.css";

export default function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const restaurant = useMemo(() => getRestaurantById(id), [id]);
  const allDishes = useMemo(() => getDishesByRestaurant(id), [id]);

  // Filters State
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Cart store
  const products = useCartStore((state) => state.products);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const cartCount = useCartStore((state) => state.cartCount());
  const totalPrice = useCartStore((state) => state.totalPrice());

  // Quantity lookup map for this restaurant's dishes
  const qtyMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[p._id] = p.quantity || 0;
    });
    return map;
  }, [products]);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return allDishes.filter((dish) => {
      // Veg filter
      if (vegOnly && !dish.veg) return false;

      // Category filter
      if (activeCategory !== "ALL") {
        if (activeCategory === "Bestsellers" && !dish.isBestseller) return false;
        if (activeCategory !== "Bestsellers" && dish.menuGroup !== activeCategory) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = dish.name.toLowerCase().includes(q);
        const matchDesc = dish.desc?.toLowerCase().includes(q);
        const matchCat = dish.categoryName?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }

      return true;
    });
  }, [allDishes, activeCategory, searchQuery, vegOnly]);

  const handleCopyCoupon = () => {
    if (restaurant?.couponCode) {
      navigator.clipboard?.writeText(restaurant.couponCode);
      setCopiedCoupon(true);
      message.success(`Coupon code "${restaurant.couponCode}" copied!`);
      setTimeout(() => setCopiedCoupon(false), 3000);
    }
  };

  const handleAdd = (dish) => {
    addItem(dish, 1);
    message.success(`Added ${dish.name} (₹${dish.price}) to cart!`);
  };

  const handleIncrement = (dishId) => {
    updateQuantity(dishId, 1);
  };

  const handleDecrement = (dishId) => {
    updateQuantity(dishId, -1);
  };

  // If restaurant not found
  if (!restaurant) {
    return (
      <div className="rest-menu-wrapper">
        <Navbar />
        <div className="rest-empty-state">
          <FaFire size={48} color="#ef4444" />
          <h3>Restaurant Not Found</h3>
          <p>We couldn't find the requested dining kitchen or menu.</p>
          <button
            type="button"
            className="rest-back-btn"
            style={{ background: "#ef4444", color: "#fff" }}
            onClick={() => navigate("/")}
          >
            <FaArrowLeft /> Back to Food Delivery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rest-menu-wrapper">
      <Navbar />

      {/* 1. HERO COVER & HEADER BANNER */}
      <section
        className="rest-menu-hero"
        style={{ backgroundImage: `url(${restaurant.coverImg})` }}
      >
        <div className="rest-menu-hero-overlay" />

        {/* Top Nav Row */}
        <div className="rest-menu-top-nav">
          <button
            type="button"
            className="rest-back-btn"
            onClick={() => navigate("/")}
          >
            <FaArrowLeft /> Back to Restaurants
          </button>

          <div className="rest-breadcrumb">
            <span className="link" onClick={() => navigate("/")}>OneCart</span>
            <FaChevronRight size={10} />
            <span className="link" onClick={() => navigate("/")}>Food Delivery</span>
            <FaChevronRight size={10} />
            <span className="active">{restaurant.name}</span>
          </div>
        </div>

        {/* Restaurant Header Details */}
        <div className="rest-header-content">
          <div className="rest-avatar-wrap">
            <img
              src={restaurant.img}
              alt={restaurant.name}
              className="rest-avatar-img"
            />
          </div>

          <div className="rest-meta-info">
            <div className="rest-title-row">
              <h1 className="rest-menu-title">{restaurant.name}</h1>
              <span className="rest-verified-badge">
                <FaCheckCircle size={12} /> Verified Kitchen
              </span>
            </div>

            <p className="rest-menu-cuisine">{restaurant.cuisine} • {restaurant.tagline}</p>

            <div className="rest-menu-location">
              <FaMapMarkerAlt size={13} color="#ef4444" />
              <span>{restaurant.address} • Open: {restaurant.opensAt}</span>
            </div>

            {/* Stats Chips Row */}
            <div className="rest-stats-row">
              <span className="rest-stat-chip rating">
                <FaStar size={11} /> {restaurant.rating} ({restaurant.reviewCount})
              </span>
              <span className="rest-stat-chip">
                <FaClock size={11} /> {restaurant.time}
              </span>
              <span className="rest-stat-chip">
                <FaMotorcycle size={12} /> {restaurant.distance}
              </span>
              <span className="rest-stat-chip">
                {restaurant.priceForTwo}
              </span>
              <span className={`rest-stat-chip ${restaurant.fee === "FREE" ? "free" : ""}`}>
                {restaurant.fee === "FREE" ? "⚡ FREE Delivery" : `🛵 ${restaurant.fee} Delivery`}
              </span>
            </div>
          </div>
        </div>

        {/* Coupon Deals Banner */}
        <div className="rest-coupon-banner">
          <div className="rest-coupon-text">
            <FaTag size={14} color="#f59e0b" />
            <span>
              {restaurant.offer} • USE CODE: <strong>{restaurant.couponCode}</strong>
            </span>
          </div>
          <button
            type="button"
            className="rest-coupon-btn"
            onClick={handleCopyCoupon}
          >
            {copiedCoupon ? "Copied! ✓" : "Copy Coupon"}
          </button>
        </div>
      </section>

      {/* 2. MENU FILTERS & CATEGORIES */}
      <main className="rest-menu-container">
        <div className="rest-filters-card">
          <div className="rest-search-filter-row">
            <div className="rest-menu-search">
              <FaSearch size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder={`Search dishes in ${restaurant.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              type="button"
              className={`rest-veg-toggle ${vegOnly ? "active" : ""}`}
              onClick={() => setVegOnly(!vegOnly)}
            >
              <span className="rest-veg-dot" />
              <span>Pure Veg Only</span>
            </button>
          </div>

          {/* Category Pill Tabs */}
          <div className="rest-category-pills">
            <button
              type="button"
              className={`rest-cat-pill ${activeCategory === "ALL" ? "active" : ""}`}
              onClick={() => setActiveCategory("ALL")}
            >
              🔥 All Items ({allDishes.length})
            </button>
            {restaurant.menuCategories?.map((cat, idx) => {
              const count = allDishes.filter((d) =>
                cat === "Bestsellers" ? d.isBestseller : d.menuGroup === cat
              ).length;
              return (
                <button
                  type="button"
                  key={idx}
                  className={`rest-cat-pill ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat} {count > 0 ? `(${count})` : ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. DISHES MENU GRID */}
        <div className="rest-menu-section-header">
          <h2 className="rest-menu-section-title">
            {activeCategory === "ALL" ? "Full Menu Selection" : activeCategory}
          </h2>
          <span className="rest-menu-section-count">
            Showing {filteredDishes.length} {filteredDishes.length === 1 ? "dish" : "dishes"}
          </span>
        </div>

        {filteredDishes.length === 0 ? (
          <div className="rest-empty-state">
            <FaSearch size={36} color="#94a3b8" />
            <h3>No matching dishes found</h3>
            <p>Try clearing your search query or toggling off the Veg Only filter.</p>
            <button
              type="button"
              className="rest-cat-pill active"
              onClick={() => {
                setSearchQuery("");
                setVegOnly(false);
                setActiveCategory("ALL");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="rest-dishes-grid">
            {filteredDishes.map((dish) => {
              const currentQty = qtyMap[dish.id] || 0;

              return (
                <div className="rest-dish-card" key={dish.id}>
                  <div className="rest-dish-content">
                    <div className="rest-dish-top">
                      <span
                        className={`rest-dish-veg-badge ${dish.veg ? "veg" : "nonveg"}`}
                        title={dish.veg ? "Pure Vegetarian" : "Non-Vegetarian"}
                      />
                      {dish.isBestseller && (
                        <span className="rest-bestseller-tag">★ Bestseller</span>
                      )}
                    </div>

                    <h3 className="rest-dish-name">{dish.name}</h3>

                    <div className="rest-dish-price-rating">
                      <span className="rest-dish-price">₹{dish.price}</span>
                      <span className="rest-dish-rating">
                        <FaStar size={10} /> {dish.rating} ({dish.reviews})
                      </span>
                    </div>

                    <p className="rest-dish-desc">{dish.desc}</p>
                  </div>

                  {/* Right Side: Image + Action Button */}
                  <div className="rest-dish-action-side">
                    <div className="rest-dish-img-wrap">
                      <img
                        src={dish.img}
                        alt={dish.name}
                        className="rest-dish-img"
                        loading="lazy"
                      />
                    </div>

                    {currentQty > 0 ? (
                      <div className="rest-qty-selector">
                        <button
                          type="button"
                          className="rest-qty-btn"
                          onClick={() => handleDecrement(dish.id)}
                          title="Decrease quantity"
                        >
                          <FaMinus size={9} />
                        </button>
                        <span className="rest-qty-num">{currentQty}</span>
                        <button
                          type="button"
                          className="rest-qty-btn"
                          onClick={() => handleIncrement(dish.id)}
                          title="Increase quantity"
                        >
                          <FaPlus size={9} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="rest-add-btn"
                        onClick={() => handleAdd(dish)}
                      >
                        <FaPlus size={9} /> ADD
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 4. STICKY BOTTOM FLOATING CART BAR */}
      {cartCount > 0 && (
        <aside className="rest-floating-cart-bar">
          <div className="rest-float-left">
            <div className="rest-float-icon">
              <FaShoppingCart />
            </div>
            <div className="rest-float-summary">
              <h4>
                {cartCount} {cartCount === 1 ? "Item" : "Items"} in Cart
              </h4>
              <p>Total: ₹{totalPrice.toLocaleString()} • Ready for swift dispatch</p>
            </div>
          </div>

          <button
            type="button"
            className="rest-float-checkout-btn"
            onClick={() => navigate("/cart")}
          >
            <span>View Cart & Checkout</span>
            <FaChevronRight size={12} />
          </button>
        </aside>
      )}
    </div>
  );
}
