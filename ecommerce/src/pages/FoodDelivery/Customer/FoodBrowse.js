import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaSearch, FaStar, FaClock, FaBicycle, FaUtensils, FaPizzaSlice, FaHamburger, FaIceCream, FaFire, FaLeaf, FaShoppingBag, FaHeart } from "react-icons/fa";
import useFoodDeliveryStore from "../../../store/foodDeliveryStore";
import FoodRoleSwitcher from "../../../components/FoodRoleSwitcher";
import Navbar from "../../../components/Navbar";

const FOOD_CATEGORIES = [
  { id: "all", name: "All Dishes", icon: <FaUtensils /> },
  { id: "favorites", name: "❤️ Favorites", icon: <FaHeart /> },
  { id: "pizza", name: "Pizzas", icon: <FaPizzaSlice /> },
  { id: "burger", name: "Burgers", icon: <FaHamburger /> },
  { id: "biryani", name: "Biryani & Kebabs", icon: <FaFire /> },
  { id: "healthy", name: "Healthy Bowls", icon: <FaLeaf /> },
  { id: "desserts", name: "Desserts & Shakes", icon: <FaIceCream /> }
];

export default function FoodBrowse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurants = useFoodDeliveryStore((state) => state.restaurants);
  const foodCart = useFoodDeliveryStore((state) => state.foodCart);
  const orders = useFoodDeliveryStore((state) => state.orders);
  const addToFoodCart = useFoodDeliveryStore((state) => state.addToFoodCart);
  const registerNewRestaurant = useFoodDeliveryStore((state) => state.registerNewRestaurant);
  const openFoodCartDrawer = useFoodDeliveryStore((state) => state.openFoodCartDrawer);
  const favoriteRestaurantIds = useFoodDeliveryStore((state) => state.favoriteRestaurantIds || []);
  const toggleFavoriteRestaurant = useFoodDeliveryStore((state) => state.toggleFavoriteRestaurant);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [vegOnly, setVegOnly] = useState(false);

  // Onboarding Modal State
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [newRestName, setNewRestName] = useState("");
  const [newRestCuisine, setNewRestCuisine] = useState("North Indian • Tandoor • Biryani");
  const [newRestAddress, setNewRestAddress] = useState("Andheri West, Mumbai");
  const [newRestDeliveryFee, setNewRestDeliveryFee] = useState(35);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get("search");
    if (q !== null && q !== undefined) setSearchQuery(q);
  }, [searchParams]);

  const filteredRestaurants = restaurants.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesName = r.name.toLowerCase().includes(q);
    const matchesCuisine = r.cuisine.toLowerCase().includes(q);
    const matchesCategory = (r.categories || []).some((c) => c.toLowerCase().includes(q));
    const matchesDishes = (r.items || []).some(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.desc && item.desc.toLowerCase().includes(q))
    );

    const matchesSearch = !q || matchesName || matchesCuisine || matchesCategory || matchesDishes;
    const matchesCategoryFilter =
      selectedCategory === "all"
        ? true
        : selectedCategory === "favorites"
        ? favoriteRestaurantIds.includes(r.id)
        : (r.categories || []).some((c) => c.toLowerCase().includes(selectedCategory.toLowerCase())) ||
          (r.items || []).some((i) => i.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesVeg = vegOnly ? r.isPureVeg || (r.items || []).some((i) => i.isVeg) : true;

    return matchesSearch && matchesCategoryFilter && matchesVeg;
  });

  const cartItemCount = (foodCart?.items || []).reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = (foodCart?.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Check if customer has an active ongoing order
  const activeOrder = orders.find(
    (o) =>
      o.orderStatus !== "DELIVERED" &&
      o.orderStatus !== "RESTAURANT_REJECTED" &&
      o.orderStatus !== "ADMIN_CANCELLED"
  );

  const handleOnboardSubmit = (e) => {
    e.preventDefault();
    if (!newRestName.trim()) return;

    registerNewRestaurant({
      name: newRestName.trim(),
      cuisine: newRestCuisine.trim(),
      address: newRestAddress.trim(),
      deliveryFee: Number(newRestDeliveryFee),
      isPureVeg: false,
      image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800"
    });

    setNewRestName("");
    setShowOnboardModal(false);
  };

  return (
    <div className="food-portal-container">
      <FoodRoleSwitcher />
      <Navbar />

      <main className="food-main-layout">
        {/* Active Order Live Banner if any */}
        {activeOrder && (
          <div
            style={{
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              color: "#fff",
              borderRadius: "14px",
              padding: "16px 24px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              border: "1px solid var(--food-primary)",
              boxShadow: "0 4px 20px rgba(255, 82, 0, 0.2)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="live-pulse-dot" />
              <div>
                <strong style={{ fontSize: "15px", display: "block" }}>
                  Active Order #{activeOrder.id} • {activeOrder.restaurantName}
                </strong>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                  Status: <span style={{ color: "#34d399", fontWeight: 700 }}>{activeOrder.orderStatus.replace(/_/g, " ")}</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/food/track/${activeOrder.id}`)}
              style={{
                background: "var(--food-primary)",
                border: "none",
                color: "#fff",
                padding: "8px 18px",
                borderRadius: "20px",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              Track Live Map →
            </button>
          </div>
        )}

        {/* Hero Section */}
        <section className="food-hero-banner">
          <div className="food-hero-content">
            <h1>Craving Delicious Food? We Deliver in 25 Mins.</h1>
            <p>Explore top-rated restaurants, authentic wood-fired pizzas, gourmet burgers, and biryanis.</p>
            <div className="hero-search-box">
              <FaSearch color="#94a3b8" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines or dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={() => {}}>Search</button>
            </div>
          </div>
        </section>

        {/* Categories Strip */}
        <div className="food-category-strip">
          {FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`cat-pill ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}

          <button
            className={`cat-pill ${vegOnly ? "active" : ""}`}
            onClick={() => setVegOnly(!vegOnly)}
            style={{ marginLeft: "auto", borderColor: "#16a34a", color: vegOnly ? "#fff" : "#16a34a" }}
          >
            <span className="veg-indicator" />
            <span>Pure Veg Only</span>
          </button>
        </div>

        {/* Restaurants List */}
        <div className="section-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2>Top Restaurants Near You ({filteredRestaurants.length})</h2>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 600 }}>Sorted by: Proximity & Ratings</span>
          </div>

          <button
            onClick={() => setShowOnboardModal(true)}
            style={{
              background: "#fff",
              border: "1.5px solid var(--food-primary, #ff5200)",
              color: "var(--food-primary, #ff5200)",
              padding: "8px 16px",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            + Register New Restaurant
          </button>
        </div>

        <div className="restaurant-grid-layout">
          {filteredRestaurants.map((rest) => (
            <div
              key={rest.id}
              className="rest-card-interactive"
              onClick={() => navigate(`/food/restaurant-menu/${rest.id}`)}
            >
              <div className="rest-card-cover" style={{ position: "relative" }}>
                <img src={rest.image} alt={rest.name} />
                <span className="rest-offer-tag">🏷️ {rest.offer}</span>
                <span className="rest-rating-badge">
                  <FaStar size={11} /> {rest.rating}
                </span>

                <button
                  type="button"
                  className="rest-fav-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteRestaurant(rest.id);
                  }}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: favoriteRestaurantIds.includes(rest.id) ? "#fff" : "rgba(0,0,0,0.5)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: favoriteRestaurantIds.includes(rest.id) ? "#e11d48" : "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    zIndex: 3
                  }}
                  title={favoriteRestaurantIds.includes(rest.id) ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <FaHeart size={14} />
                </button>
              </div>

              <div className="rest-card-details">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0 }}>{rest.name}</h3>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>
                    {rest.items?.length || 0} Dishes
                  </span>
                </div>
                <p className="rest-cuisine-text">{rest.cuisine}</p>

                {searchQuery.trim() && rest.items?.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase().trim())) && (
                  <div style={{ fontSize: "11px", color: "#ea580c", background: "#fff3ed", padding: "3px 8px", borderRadius: "6px", marginBottom: "8px", fontWeight: 700 }}>
                    🍽️ Matched Dish: {rest.items.find((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))?.name}
                  </div>
                )}

                <div className="rest-meta-footer">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaClock size={12} color="#64748b" />
                    <span>{rest.prepTime}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaBicycle size={13} color="#16a34a" />
                    <span>₹{rest.deliveryFee} delivery</span>
                  </div>
                </div>

                {/* 1-Click Quick Add Signature Dish to Food Cart */}
                {rest.items && rest.items.length > 0 && (
                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "10px",
                      borderTop: "1px dashed #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px"
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", flex: 1 }}>
                      <img
                        src={rest.items[0].image}
                        alt={rest.items[0].name}
                        style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }}
                      />
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {rest.items[0].name}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--food-primary, #ff5200)", fontWeight: 700 }}>
                          ₹{rest.items[0].price}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      title={`Add ${rest.items[0].name} to cart`}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToFoodCart(rest, rest.items[0]);
                      }}
                      style={{
                        background: "#fff3ed",
                        border: "1.5px solid #ff5200",
                        color: "#ff5200",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontWeight: 800,
                        fontSize: "12px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        boxShadow: "0 2px 6px rgba(255, 82, 0, 0.15)"
                      }}
                    >
                      + ADD
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Onboard New Restaurant Modal */}
      {showOnboardModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px"
          }}
        >
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>Register New Restaurant Outlet</h3>
              <button onClick={() => setShowOnboardModal(false)} style={{ background: "transparent", border: "none", fontSize: "16px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleOnboardSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "4px" }}>Restaurant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Spice Darbar"
                  value={newRestName}
                  onChange={(e) => setNewRestName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "4px" }}>Cuisines</label>
                <input
                  type="text"
                  placeholder="e.g. Biryani • Mughlai • Kebabs"
                  value={newRestCuisine}
                  onChange={(e) => setNewRestCuisine(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "4px" }}>Address / Area</label>
                <input
                  type="text"
                  placeholder="e.g. Bandra West, Mumbai"
                  value={newRestAddress}
                  onChange={(e) => setNewRestAddress(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "4px" }}>Delivery Fee (₹)</label>
                <input
                  type="number"
                  placeholder="35"
                  value={newRestDeliveryFee}
                  onChange={(e) => setNewRestDeliveryFee(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: "12px", borderRadius: "10px", border: "none", background: "#16a34a", color: "#fff", fontWeight: 800, cursor: "pointer" }}
                >
                  Register Outlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar if items exist */}
      {cartItemCount > 0 && (
        <div
          className="floating-cart-bar"
          onClick={() => openFoodCartDrawer()}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div className="floating-cart-info">
            <strong style={{ fontSize: "15px" }}>
              {cartItemCount} {cartItemCount === 1 ? "Item" : "Items"} • ₹{cartSubtotal}
            </strong>
            <span style={{ fontSize: "12px", color: "#cbd5e1" }}>From {foodCart.restaurantName}</span>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              className="floating-cart-btn"
              onClick={(e) => {
                e.stopPropagation();
                openFoodCartDrawer();
              }}
              style={{ background: "#fff", color: "var(--food-primary, #ff5200)" }}
            >
              <FaShoppingBag />
              <span>View Cart</span>
            </button>
            <button
              className="floating-cart-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/food/checkout");
              }}
            >
              <span>Checkout →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
