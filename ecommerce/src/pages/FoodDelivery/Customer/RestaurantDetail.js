import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaClock,
  FaBicycle,
  FaArrowLeft,
  FaShoppingBag,
  FaSearch,
  FaTimes,
  FaCheck,
  FaHeart
} from "react-icons/fa";
import useFoodDeliveryStore from "../../../store/foodDeliveryStore";
import FoodRoleSwitcher from "../../../components/FoodRoleSwitcher";
import Navbar from "../../../components/Navbar";

const DEFAULT_ADDONS = [
  { id: "addon-cheese", name: "Extra Melted Cheese / Paneer", price: 40, icon: "🧀" },
  { id: "addon-peri", name: "Peri Peri Dust & Spicy Seasoning", price: 25, icon: "🌶️" },
  { id: "addon-dip", name: "Garlic Truffle Mayo Dip", price: 35, icon: "🥫" },
  { id: "addon-drink", name: "Chilled Soda / Beverage (250ml)", price: 40, icon: "🥤" }
];

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const restaurants = useFoodDeliveryStore((state) => state.restaurants);
  const foodCart = useFoodDeliveryStore((state) => state.foodCart);
  const addToFoodCart = useFoodDeliveryStore((state) => state.addToFoodCart);
  const updateCartItemQty = useFoodDeliveryStore((state) => state.updateCartItemQty);
  const orders = useFoodDeliveryStore((state) => state.orders);
  const openFoodCartDrawer = useFoodDeliveryStore((state) => state.openFoodCartDrawer);
  const favoriteRestaurantIds = useFoodDeliveryStore((state) => state.favoriteRestaurantIds || []);
  const toggleFavoriteRestaurant = useFoodDeliveryStore((state) => state.toggleFavoriteRestaurant);

  const restaurant = restaurants.find((r) => r.id === id) || restaurants[0];
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuSearch, setMenuSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);

  // Swiggy-Style Customizer Modal State
  const [customizingItem, setCustomizingItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState("Regular");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [cookingNotes, setCookingNotes] = useState("");
  const [customQty, setCustomQty] = useState(1);

  // Active Order Live Tracking
  const activeOrder = orders.find(
    (o) =>
      o.orderStatus !== "DELIVERED" &&
      o.orderStatus !== "RESTAURANT_REJECTED" &&
      o.orderStatus !== "ADMIN_CANCELLED"
  );

  if (!restaurant) {
    return (
      <div className="food-portal-container">
        <FoodRoleSwitcher />
        <Navbar />
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Restaurant not found</h2>
          <button onClick={() => navigate("/food")} className="btn-driver-accept" style={{ marginTop: "20px" }}>
            ← Back to Food Home
          </button>
        </div>
      </div>
    );
  }

  const filteredItems = (restaurant.items || []).filter((item) => {
    const matchesCat = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.desc.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesVeg = vegOnly ? item.isVeg : true;
    return matchesCat && matchesSearch && matchesVeg;
  });

  const cartItemCount = foodCart.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = foodCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getItemQuantity = (itemId) => {
    const found = (foodCart?.items || []).filter((i) => i.id === itemId || i.originalId === itemId);
    return found.reduce((sum, i) => sum + i.quantity, 0);
  };

  const isNewlyAdded = (item) => {
    const initialSeedIds = [
      "item-101", "item-102", "item-103", "item-104", "item-105",
      "item-201", "item-202", "item-203", "item-204",
      "item-301", "item-302", "item-303", "item-304",
      "item-401", "item-501"
    ];
    return !initialSeedIds.includes(item.id);
  };

  const handleOpenCustomizer = (item) => {
    setCustomizingItem(item);
    setSelectedSize("Regular");
    setSelectedAddons([]);
    setCookingNotes("");
    setCustomQty(1);
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const calculateCustomizedPrice = () => {
    if (!customizingItem) return 0;
    let base = customizingItem.price;
    if (selectedSize === "Medium") base += 60;
    if (selectedSize === "Large") base += 120;
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    return (base + addonsTotal) * customQty;
  };

  const handleConfirmCustomizedAdd = () => {
    if (!customizingItem) return;

    let base = customizingItem.price;
    if (selectedSize === "Medium") base += 60;
    if (selectedSize === "Large") base += 120;
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = base + addonsTotal;

    const customName =
      selectedSize !== "Regular" || selectedAddons.length > 0
        ? `${customizingItem.name} (${selectedSize}${selectedAddons.length ? ` + ${selectedAddons.map((a) => a.name.split(" ")[0]).join(", ")}` : ""})`
        : customizingItem.name;

    const itemToAdd = {
      ...customizingItem,
      name: customName,
      price: unitPrice,
      customizations: {
        size: selectedSize,
        addons: selectedAddons.map((a) => a.name),
        notes: cookingNotes
      }
    };

    addToFoodCart(restaurant, itemToAdd, customQty);
    setCustomizingItem(null);
  };

  return (
    <div className="food-portal-container">
      <FoodRoleSwitcher />
      <Navbar />

      <main className="food-main-layout">
        {/* Back navigation */}
        <button
          onClick={() => navigate("/food")}
          style={{
            background: "transparent",
            border: "none",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: "16px"
          }}
        >
          <FaArrowLeft /> Back to Restaurants
        </button>

        {/* Restaurant Header Banner */}
        <div className="rest-header-banner">
          <img src={restaurant.image} alt={restaurant.name} />
          <div className="rest-header-info">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h1>{restaurant.name}</h1>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "6px" }}>{restaurant.cuisine}</p>
                <p style={{ color: "#94a3b8", fontSize: "13px" }}>{restaurant.address}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => toggleFavoriteRestaurant(restaurant.id)}
                  style={{
                    background: favoriteRestaurantIds.includes(restaurant.id) ? "#ffe4e6" : "#f1f5f9",
                    color: favoriteRestaurantIds.includes(restaurant.id) ? "#e11d48" : "#64748b",
                    border: favoriteRestaurantIds.includes(restaurant.id) ? "1px solid #fecdd3" : "1px solid #cbd5e1",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <FaHeart size={14} color={favoriteRestaurantIds.includes(restaurant.id) ? "#e11d48" : "#94a3b8"} />
                  <span>{favoriteRestaurantIds.includes(restaurant.id) ? "Favorited" : "Favorite"}</span>
                </button>

                <div style={{ background: "#16a34a", color: "#fff", padding: "6px 14px", borderRadius: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: 900, display: "flex", alignItems: "center", gap: "4px" }}>
                    <FaStar size={14} /> {restaurant.rating}
                  </div>
                  <small style={{ fontSize: "10px", opacity: 0.9 }}>{restaurant.reviewCount}+ ratings</small>
                </div>
              </div>
            </div>

            <div className="rest-badges-row">
              <div className="rest-badge-item">
                <FaClock color="#ff5200" />
                <span>{restaurant.prepTime}</span>
              </div>
              <div className="rest-badge-item">
                <FaBicycle color="#16a34a" />
                <span>₹{restaurant.deliveryFee} Delivery Fee</span>
              </div>
              <div className="rest-badge-item" style={{ background: "#fff3ed", borderColor: "#ffedd5", color: "#ff5200" }}>
                🏷️ {restaurant.offer}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Controls & Categories */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
            background: "#fff",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0"
          }}
        >
          {/* Categories Pill Scroller */}
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", flex: 1 }}>
            <button
              className={`cat-pill ${activeCategory === "All" ? "active" : ""}`}
              onClick={() => setActiveCategory("All")}
            >
              All Items ({restaurant.items.length})
            </button>
            {restaurant.categories.map((cat) => (
              <button
                key={cat}
                className={`cat-pill ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Veg toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: "10px", top: "10px", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search menu..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                style={{
                  padding: "8px 12px 8px 32px",
                  borderRadius: "20px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none"
                }}
              />
            </div>
            <button
              className={`cat-pill ${vegOnly ? "active" : ""}`}
              onClick={() => setVegOnly(!vegOnly)}
              style={{ borderColor: "#16a34a", color: vegOnly ? "#fff" : "#16a34a" }}
            >
              <span className="veg-indicator" />
              <span>Veg Only</span>
            </button>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="section-header-row">
          <h2>{activeCategory} ({filteredItems.length})</h2>
        </div>

        <div className="menu-items-grid">
          {filteredItems.map((item) => {
            const qty = getItemQuantity(item.id);
            const isNew = isNewlyAdded(item);
            const isOutOfStock = item.inStock === false;

            return (
              <div key={item.id} className="menu-item-card" style={{ opacity: isOutOfStock ? 0.7 : 1 }}>
                <div className="menu-item-left">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                    {item.isVeg ? <span className="veg-indicator" /> : <span className="nonveg-indicator" />}
                    {isNew && (
                      <span style={{ fontSize: "10px", fontWeight: 900, background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "4px" }}>
                        ✨ NEW DISH
                      </span>
                    )}
                    {item.isBestseller && (
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#d97706" }}>
                        ⭐ BESTSELLER
                      </span>
                    )}
                    {isOutOfStock && (
                      <span style={{ fontSize: "10px", fontWeight: 800, background: "#fee2e2", color: "#dc2626", padding: "2px 6px", borderRadius: "4px" }}>
                        SOLD OUT
                      </span>
                    )}
                  </div>
                  <h4>{item.name}</h4>
                  <div className="menu-item-price">
                    ₹{item.price}{" "}
                    {item.originalPrice && (
                      <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "12px", marginLeft: "6px" }}>
                        ₹{item.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="menu-item-desc">{item.desc}</p>
                </div>

                <div className="menu-item-right">
                  <img src={item.image} alt={item.name} />

                  {isOutOfStock ? (
                    <div
                      style={{
                        background: "#f1f5f9",
                        color: "#94a3b8",
                        border: "1px solid #e2e8f0",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        textAlign: "center"
                      }}
                    >
                      Out of Stock
                    </div>
                  ) : qty === 0 ? (
                    <button
                      className="add-btn-clean"
                      onClick={() => handleOpenCustomizer(item)}
                    >
                      + ADD
                    </button>
                  ) : (
                    <div className="add-qty-pill">
                      <button onClick={() => updateCartItemQty(item.id, -1)}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => updateCartItemQty(item.id, 1)}>+</button>
                    </div>
                  )}
                  {!isOutOfStock && (
                    <span style={{ fontSize: "10px", color: "#64748b", marginTop: "4px", textAlign: "center" }}>
                      Customisable
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* SWIGGY-STYLE FOOD ITEM CUSTOMIZATION MODAL */}
      {customizingItem && (
        <div className="modal-backdrop" onClick={() => setCustomizingItem(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", padding: "24px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {customizingItem.isVeg ? <span className="veg-indicator" /> : <span className="nonveg-indicator" />}
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>{customizingItem.name}</h3>
                </div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#ff5200", marginTop: "4px" }}>
                  Base: ₹{customizingItem.price}
                </div>
              </div>
              <button
                onClick={() => setCustomizingItem(null)}
                style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
              >
                <FaTimes />
              </button>
            </div>

            {/* 1. Size Selection */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>
                1. Select Portion / Size
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {[
                  { label: "Regular", extra: 0 },
                  { label: "Medium", extra: 60 },
                  { label: "Large", extra: 120 }
                ].map((s) => (
                  <div
                    key={s.label}
                    onClick={() => setSelectedSize(s.label)}
                    style={{
                      border: selectedSize === s.label ? "2px solid #ff5200" : "1px solid #cbd5e1",
                      background: selectedSize === s.label ? "#fff3ed" : "#fff",
                      borderRadius: "10px",
                      padding: "10px",
                      textAlign: "center",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "13px" }}>{s.label}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{s.extra === 0 ? "Standard" : `+₹${s.extra}`}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Extra Add-ons */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>
                2. Extra Add-ons & Toppings
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {DEFAULT_ADDONS.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: isChecked ? "1.5px solid #16a34a" : "1px solid #e2e8f0",
                        background: isChecked ? "#f0fdf4" : "#fff",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px" }}>{addon.icon}</span>
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>{addon.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#166534" }}>+₹{addon.price}</span>
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "4px",
                            border: isChecked ? "none" : "1px solid #cbd5e1",
                            background: isChecked ? "#16a34a" : "#fff",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px"
                          }}
                        >
                          {isChecked && <FaCheck />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Cooking Instructions */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", marginBottom: "6px" }}>
                3. Special Cooking Request (Optional)
              </div>
              <input
                type="text"
                placeholder="e.g. Less spicy, crispy, extra mint dip..."
                value={cookingNotes}
                onChange={(e) => setCookingNotes(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none"
                }}
              />
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
              <div className="add-qty-pill" style={{ height: "42px", padding: "0 12px" }}>
                <button onClick={() => setCustomQty(Math.max(1, customQty - 1))}>−</button>
                <span style={{ fontWeight: 800, fontSize: "15px" }}>{customQty}</span>
                <button onClick={() => setCustomQty(customQty + 1)}>+</button>
              </div>

              <button
                onClick={handleConfirmCustomizedAdd}
                style={{
                  flex: 1,
                  background: "var(--food-primary)",
                  color: "#fff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "15px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>Add Item</span>
                <span>₹{calculateCustomizedPrice()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
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

      {/* Floating Active Order Live Mini-Tracker */}
      {activeOrder && cartItemCount === 0 && (
        <div
          onClick={() => navigate(`/food/track/${activeOrder.id}`)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "linear-gradient(135deg, #1e293b, #0f172a)",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: "30px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            border: "1px solid var(--food-primary)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            zIndex: 9999
          }}
        >
          <span className="live-pulse-dot" />
          <span style={{ fontSize: "13px", fontWeight: 700 }}>
            🛵 Order #{activeOrder.id} ({activeOrder.orderStatus.replace(/_/g, " ")})
          </span>
          <span style={{ fontSize: "12px", color: "#ff5200", fontWeight: 800 }}>Track →</span>
        </div>
      )}
    </div>
  );
}
