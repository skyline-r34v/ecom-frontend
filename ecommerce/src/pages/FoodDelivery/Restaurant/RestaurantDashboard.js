import React, { useState } from "react";
import {
  FaBell,
  FaUtensils,
  FaCheckCircle,
  FaMotorcycle,
  FaClock,
  FaKey,
  FaToggleOn,
  FaToggleOff,
  FaBoxOpen,
  FaPlus,
  FaTrash,
  FaStore
} from "react-icons/fa";
import useFoodDeliveryStore from "../../../store/foodDeliveryStore";
import FoodRoleSwitcher from "../../../components/FoodRoleSwitcher";
import Navbar from "../../../components/Navbar";

const FOOD_IMAGE_PRESETS = [
  { label: "Pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600" },
  { label: "Burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600" },
  { label: "Biryani", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600" },
  { label: "Pasta", url: "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?q=80&w=600" },
  { label: "Salad / Healthy", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600" },
  { label: "Dessert", url: "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?q=80&w=600" }
];

const POPULAR_DISH_PRESETS = [
  {
    name: "Paneer Butter Masala Delight",
    desc: "Cottage cheese simmered in rich creamy tomato and butter gravy with kasuri methi",
    price: 289,
    originalPrice: 340,
    category: "Main Course",
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600"
  },
  {
    name: "Farmhouse Loaded Pizza",
    desc: "Crunchy bell peppers, grilled corn, black olives, onions and gooey mozzarella",
    price: 369,
    originalPrice: 429,
    category: "Pizzas",
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600"
  },
  {
    name: "Hyderabadi Dum Chicken Biryani",
    desc: "Aromatic basmati rice slow-cooked on dum with saffron and tender spices",
    price: 399,
    originalPrice: 480,
    category: "Biryanis",
    isVeg: false,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600"
  },
  {
    name: "Crispy Peri-Peri Zinger Burger",
    desc: "Crunchy spiced fried fillet with pickled jalapeños, lettuce and peri-peri aioli",
    price: 249,
    originalPrice: 299,
    category: "Gourmet Burgers",
    isVeg: false,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600"
  },
  {
    name: "Molten Chocolate Lava Cake",
    desc: "Warm dark chocolate cake with a gooey molten truffle center",
    price: 189,
    originalPrice: 220,
    category: "Dessert",
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?q=80&w=600"
  }
];

export default function RestaurantDashboard() {
  const restaurants = useFoodDeliveryStore((state) => state.restaurants);
  const authenticatedRestaurantId = useFoodDeliveryStore((state) => state.authenticatedRestaurantId);
  const restaurantLogin = useFoodDeliveryStore((state) => state.restaurantLogin);
  const restaurantLogout = useFoodDeliveryStore((state) => state.restaurantLogout);
  const orders = useFoodDeliveryStore((state) => state.orders);

  // Store actions
  const restaurantAcceptOrder = useFoodDeliveryStore((state) => state.restaurantAcceptOrder);
  const restaurantRejectOrder = useFoodDeliveryStore((state) => state.restaurantRejectOrder);
  const restaurantStartPreparing = useFoodDeliveryStore((state) => state.restaurantStartPreparing);
  const restaurantReadyForPickup = useFoodDeliveryStore((state) => state.restaurantReadyForPickup);
  const toggleRestaurantItemStock = useFoodDeliveryStore((state) => state.toggleRestaurantItemStock);
  const addNewFoodItem = useFoodDeliveryStore((state) => state.addNewFoodItem);
  const deleteFoodItem = useFoodDeliveryStore((state) => state.deleteFoodItem);
  const registerNewRestaurant = useFoodDeliveryStore((state) => state.registerNewRestaurant);
  const deleteRestaurant = useFoodDeliveryStore((state) => state.deleteRestaurant);

  // Merchant Login Form State
  const [selectedLoginRestId, setSelectedLoginRestId] = useState(restaurants[0]?.id || "rest-1");
  const [merchantEmail, setMerchantEmail] = useState("manager@pizzapalace.com");
  const [merchantPass, setMerchantPass] = useState("••••••••");
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);

  const currentRest = restaurants.find((r) => r.id === authenticatedRestaurantId);

  const [activeTab, setActiveTab] = useState("NEW"); // "NEW" | "PREPARING" | "READY" | "COMPLETED" | "MENU"
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("Kitchen overloaded with peak hour orders");
  const [customPrepTime, setCustomPrepTime] = useState(25);

  // Add Food Item Modal State
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemOriginalPrice, setItemOriginalPrice] = useState("");
  const [itemCategory, setItemCategory] = useState(currentRest?.categories?.[0] || "Main Course");
  const [newCustomCategory, setNewCustomCategory] = useState("");
  const [itemIsVeg, setItemIsVeg] = useState(true);
  const [itemIsBestseller, setItemIsBestseller] = useState(false);
  const [itemImage, setItemImage] = useState(FOOD_IMAGE_PRESETS[0].url);

  // Restaurant Onboarding Modal State
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showKitchenGuideModal, setShowKitchenGuideModal] = useState(false);
  const [newRestName, setNewRestName] = useState("");
  const [newRestCuisine, setNewRestCuisine] = useState("North Indian • Tandoor • Biryani");
  const [newRestAddress, setNewRestAddress] = useState("Andheri West, Mumbai");
  const [newRestDeliveryFee, setNewRestDeliveryFee] = useState(35);

  const handleMerchantLogin = (e) => {
    if (e) e.preventDefault();
    restaurantLogin(selectedLoginRestId);
  };

  const handleQuickPresetLogin = (rest) => {
    setSelectedLoginRestId(rest.id);
    restaurantLogin(rest.id);
  };

  const handleOnboardRestaurant = (e) => {
    if (e) e.preventDefault();
    if (!newRestName.trim()) return;

    const newRest = registerNewRestaurant({
      name: newRestName.trim(),
      cuisine: newRestCuisine.trim(),
      address: newRestAddress.trim(),
      deliveryFee: Number(newRestDeliveryFee),
      isPureVeg: false,
      image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800"
    });

    setNewRestName("");
    setShowOnboardModal(false);
    if (newRest) {
      restaurantLogin(newRest.id);
    }
  };

  // If NOT authenticated, render Merchant Partner Login screen
  if (!authenticatedRestaurantId || !currentRest) {
    return (
      <div className="food-portal-container">
        <FoodRoleSwitcher />
        <Navbar />

        <div style={{ maxWidth: "560px", margin: "40px auto", padding: "0 20px" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: "24px",
              padding: "36px 32px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0"
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "#fff3ed",
                  color: "#ff5200",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  fontSize: "24px"
                }}
              >
                <FaStore />
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", margin: "0 0 6px" }}>
                Merchant Partner Sign In
              </h2>
              <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                Log in to your specific restaurant outlet to manage kitchen orders and dishes.
              </p>
            </div>

            {/* Quick 1-Click Outlet Switcher Buttons */}
            <div style={{ marginBottom: "22px", background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#475569", marginBottom: "10px", textTransform: "uppercase" }}>
                ⚡ Quick 1-Click Outlet Credentials:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {restaurants.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleQuickPresetLogin(r)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      background: selectedLoginRestId === r.id ? "#fff3ed" : "#fff",
                      border: selectedLoginRestId === r.id ? "1.5px solid #ff5200" : "1px solid #cbd5e1",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img src={r.image} alt={r.name} style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "13px" }}>{r.name}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{r.address.split(",")[0]} • {r.items?.length || 0} Dishes</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#ff5200", fontWeight: 800 }}>Log In →</span>
                      <button
                        type="button"
                        title={`Delete ${r.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRestaurantToDelete(r);
                        }}
                        style={{
                          background: "#fee2e2",
                          border: "none",
                          color: "#dc2626",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          fontWeight: 700
                        }}
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleMerchantLogin}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                  Select Restaurant Outlet *
                </label>
                <select
                  value={selectedLoginRestId}
                  onChange={(e) => setSelectedLoginRestId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    fontWeight: 600,
                    outline: "none"
                  }}
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.cuisine.split("•")[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                  Merchant Manager Email
                </label>
                <input
                  type="email"
                  value={merchantEmail}
                  onChange={(e) => setMerchantEmail(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                />
              </div>

              <div style={{ marginBottom: "22px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                  Password / Kitchen PIN
                </label>
                <input
                  type="password"
                  value={merchantPass}
                  onChange={(e) => setMerchantPass(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  background: "var(--food-primary)",
                  color: "#fff",
                  border: "none",
                  padding: "14px",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "15px",
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(255, 82, 0, 0.35)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <span>Enter Kitchen Console →</span>
              </button>
            </form>

            <div style={{ marginTop: "20px", textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
              <button
                onClick={() => setShowOnboardModal(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                + Register New Restaurant Outlet (Become a Partner)
              </button>
            </div>
          </div>
        </div>

        {/* REGISTER NEW RESTAURANT MODAL */}
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
            <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "480px", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>Onboard New Restaurant</h3>
                <button onClick={() => setShowOnboardModal(false)} style={{ background: "transparent", border: "none", fontSize: "16px", cursor: "pointer" }}>✕</button>
              </div>

              <form onSubmit={handleOnboardRestaurant}>
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

        {/* DELETE RESTAURANT CONFIRMATION MODAL (LOGIN VIEW) */}
        {restaurantToDelete && (
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
            <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "440px", width: "100%", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "24px" }}>
                <FaTrash />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
                Delete Restaurant Outlet?
              </h3>
              <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 20px", lineHeight: 1.5 }}>
                Are you sure you want to permanently delete <strong>{restaurantToDelete.name}</strong>?
                <br />
                This will remove all its dishes ({restaurantToDelete.items?.length || 0} items) and delist it from the customer app.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setRestaurantToDelete(null)}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteRestaurant(restaurantToDelete.id);
                    setRestaurantToDelete(null);
                  }}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#dc2626", color: "#fff", fontWeight: 800, cursor: "pointer" }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Filter orders strictly belonging to THIS authenticated restaurant only
  const restOrders = orders.filter((o) => o.restaurantId === currentRest.id);

  const newOrders = restOrders.filter((o) => o.orderStatus === "PLACED");
  const preparingOrders = restOrders.filter((o) => o.orderStatus === "RESTAURANT_ACCEPTED" || o.orderStatus === "FOOD_PREPARING");
  const readyOrders = restOrders.filter(
    (o) =>
      o.orderStatus === "READY_FOR_PICKUP" ||
      o.orderStatus === "DELIVERY_PARTNER_ASSIGNED" ||
      o.orderStatus === "DRIVER_AT_RESTAURANT" ||
      o.orderStatus === "PICKED_UP" ||
      o.orderStatus === "ON_THE_WAY"
  );
  const completedOrders = restOrders.filter((o) => o.orderStatus === "DELIVERED");

  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.itemTotal || 0), 0);

  const handleAccept = (orderId) => {
    restaurantAcceptOrder(orderId, customPrepTime);
  };

  const handleReject = () => {
    if (!rejectModalOrder) return;
    restaurantRejectOrder(rejectModalOrder.id, rejectReason);
    setRejectModalOrder(null);
  };

  const handleSaveNewItem = (e) => {
    e.preventDefault();
    if (!itemName.trim() || !itemPrice) return;

    const finalCategory = newCustomCategory.trim() ? newCustomCategory.trim() : itemCategory;

    addNewFoodItem(currentRest.id, {
      name: itemName.trim(),
      desc: itemDesc.trim() || "Freshly prepared chef specialty.",
      price: Number(itemPrice),
      originalPrice: itemOriginalPrice ? Number(itemOriginalPrice) : null,
      category: finalCategory,
      isVeg: itemIsVeg,
      isBestseller: itemIsBestseller,
      image: itemImage
    });

    // Reset form
    setItemName("");
    setItemDesc("");
    setItemPrice("");
    setItemOriginalPrice("");
    setNewCustomCategory("");
    setShowAddItemModal(false);
  };

  return (
    <div className="food-portal-container">
      <FoodRoleSwitcher />
      <Navbar />

      <main className="vendor-portal-container">
        {/* Vendor Header for Authenticated Outlet Only */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
            background: "#fff",
            padding: "20px 24px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "var(--food-shadow-sm)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img
              src={currentRest.image}
              alt={currentRest.name}
              style={{ width: "60px", height: "60px", borderRadius: "12px", objectFit: "cover" }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={{ fontSize: "22px", fontWeight: 800, margin: 0 }}>{currentRest.name}</h1>
                <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                  ● Kitchen Active (Logged In)
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
                {currentRest.address} • {currentRest.cuisine}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowKitchenGuideModal(true)}
              style={{
                background: "rgba(255, 82, 0, 0.1)",
                color: "var(--food-primary)",
                border: "1px solid rgba(255, 82, 0, 0.3)",
                padding: "8px 14px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              📖 Kitchen Guide
            </button>

            <button
              onClick={() => setShowOnboardModal(true)}
              style={{
                background: "#f1f5f9",
                color: "#1e293b",
                border: "1px solid #cbd5e1",
                padding: "8px 14px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <FaStore /> + Add Outlet
            </button>

            <button
              onClick={() => setRestaurantToDelete(currentRest)}
              style={{
                background: "#fff1f2",
                color: "#e11d48",
                border: "1px solid #fecdd3",
                padding: "8px 14px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <FaTrash size={11} /> Delete Outlet
            </button>

            <button
              onClick={() => restaurantLogout()}
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                padding: "8px 14px",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="vendor-top-stats">
          <div className="vendor-stat-card">
            <span>Today's Orders</span>
            <h3>{restOrders.length}</h3>
          </div>
          <div className="vendor-stat-card">
            <span>Today's Sales Revenue</span>
            <h3 style={{ color: "#16a34a" }}>₹{totalRevenue}</h3>
          </div>
          <div className="vendor-stat-card">
            <span>Pending New Requests</span>
            <h3 style={{ color: newOrders.length > 0 ? "var(--food-primary)" : "#1e293b" }}>
              {newOrders.length} {newOrders.length > 0 && "🚨"}
            </h3>
          </div>
          <div className="vendor-stat-card">
            <span>Active Menu Items</span>
            <h3>{currentRest.items.length} Dishes</h3>
          </div>
        </div>

        {/* Tabs */}
        <div className="vendor-tabs-bar">
          <button
            className={`vendor-tab-btn ${activeTab === "NEW" ? "active" : ""}`}
            onClick={() => setActiveTab("NEW")}
          >
            <FaBell /> New Orders <span className="vendor-tab-badge">{newOrders.length}</span>
          </button>
          <button
            className={`vendor-tab-btn ${activeTab === "PREPARING" ? "active" : ""}`}
            onClick={() => setActiveTab("PREPARING")}
          >
            <FaUtensils /> In Kitchen <span className="vendor-tab-badge">{preparingOrders.length}</span>
          </button>
          <button
            className={`vendor-tab-btn ${activeTab === "READY" ? "active" : ""}`}
            onClick={() => setActiveTab("READY")}
          >
            <FaMotorcycle /> Ready & Dispatched <span className="vendor-tab-badge">{readyOrders.length}</span>
          </button>
          <button
            className={`vendor-tab-btn ${activeTab === "COMPLETED" ? "active" : ""}`}
            onClick={() => setActiveTab("COMPLETED")}
          >
            <FaCheckCircle /> Completed ({completedOrders.length})
          </button>
          <button
            className={`vendor-tab-btn ${activeTab === "MENU" ? "active" : ""}`}
            onClick={() => setActiveTab("MENU")}
          >
            <FaBoxOpen /> Food Menu & Add Dishes ({currentRest.items.length})
          </button>
        </div>

        {/* Tab 1: NEW ORDERS */}
        {activeTab === "NEW" && (
          <div>
            {newOrders.length === 0 ? (
              <div style={{ background: "#fff", padding: "40px", borderRadius: "14px", textAlign: "center", border: "1px dashed #cbd5e1" }}>
                <FaBell size={32} color="#94a3b8" />
                <p style={{ margin: "12px 0 0", color: "#64748b", fontWeight: 600 }}>No new incoming orders right now.</p>
                <small style={{ color: "#94a3b8" }}>When a customer places an order from {currentRest.name}, real-time alerts will trigger here.</small>
              </div>
            ) : (
              newOrders.map((order) => (
                <div key={order.id} className="vendor-order-card" style={{ borderLeft: "5px solid var(--food-primary)" }}>
                  <div className="vendor-order-header">
                    <div>
                      <strong style={{ fontSize: "16px", color: "var(--food-primary)" }}>Order #{order.id}</strong>
                      <span style={{ marginLeft: "12px", color: "#64748b", fontSize: "13px" }}>
                        Placed: {new Date(order.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "16px" }}>₹{order.grandTotal} ({order.paymentMethod})</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 8px", fontSize: "14px" }}>Customer: {order.customerName} ({order.customerPhone})</h4>
                      <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#64748b" }}>Delivery: {order.deliveryAddress}</p>

                      <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <strong>Items:</strong>
                        {order.items.map((i, idx) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "4px" }}>
                            <span>{i.quantity} × {i.name}</span>
                            <span>₹{i.price * i.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <FaClock color="#64748b" />
                        <label style={{ fontSize: "12px", fontWeight: 700 }}>Est. Prep Time (mins):</label>
                        <select
                          value={customPrepTime}
                          onChange={(e) => setCustomPrepTime(Number(e.target.value))}
                          style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontWeight: 700 }}
                        >
                          <option value={15}>15 mins</option>
                          <option value={20}>20 mins</option>
                          <option value={25}>25 mins</option>
                          <option value={35}>35 mins</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleAccept(order.id)}
                        className="btn-driver-accept"
                        style={{ width: "100%", padding: "12px", fontSize: "14px" }}
                      >
                        ✓ Accept & Start Cooking
                      </button>
                      <button
                        onClick={() => setRejectModalOrder(order)}
                        className="btn-driver-reject"
                        style={{ width: "100%", padding: "10px", fontSize: "13px" }}
                      >
                        ✕ Reject Order
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: IN KITCHEN (PREPARING) */}
        {activeTab === "PREPARING" && (
          <div>
            {preparingOrders.length === 0 ? (
              <div style={{ background: "#fff", padding: "40px", borderRadius: "14px", textAlign: "center", border: "1px dashed #cbd5e1" }}>
                <FaUtensils size={32} color="#94a3b8" />
                <p style={{ margin: "12px 0 0", color: "#64748b", fontWeight: 600 }}>No orders currently cooking.</p>
              </div>
            ) : (
              preparingOrders.map((order) => (
                <div key={order.id} className="vendor-order-card">
                  <div className="vendor-order-header">
                    <div>
                      <strong style={{ fontSize: "16px" }}>Order #{order.id}</strong>
                      <span style={{ marginLeft: "12px", background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                        🍳 {order.orderStatus === "FOOD_PREPARING" ? "Cooking in Progress" : "Accepted"}
                      </span>
                    </div>
                    <div style={{ fontWeight: 800 }}>Prep Target: {order.prepTimeEst}</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 6px" }}>For {order.customerName}</h4>
                      <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", fontSize: "13px" }}>
                        {order.items.map((i, idx) => (
                          <div key={idx} style={{ margin: "2px 0" }}>
                            <strong>{i.quantity}x</strong> {i.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {order.orderStatus === "RESTAURANT_ACCEPTED" && (
                        <button
                          onClick={() => restaurantStartPreparing(order.id)}
                          style={{
                            background: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            padding: "10px",
                            borderRadius: "8px",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          🍳 Mark as Food Cooking
                        </button>
                      )}

                      <button
                        onClick={() => restaurantReadyForPickup(order.id)}
                        style={{
                          background: "#16a34a",
                          color: "#fff",
                          border: "none",
                          padding: "12px",
                          borderRadius: "8px",
                          fontWeight: 800,
                          fontSize: "14px",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)"
                        }}
                      >
                        📦 Food Ready for Pickup (Dispatch Driver)
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: READY & DISPATCHED */}
        {activeTab === "READY" && (
          <div>
            {readyOrders.length === 0 ? (
              <div style={{ background: "#fff", padding: "40px", borderRadius: "14px", textAlign: "center", border: "1px dashed #cbd5e1" }}>
                <FaMotorcycle size={32} color="#94a3b8" />
                <p style={{ margin: "12px 0 0", color: "#64748b", fontWeight: 600 }}>No orders currently awaiting pickup or on delivery.</p>
              </div>
            ) : (
              readyOrders.map((order) => (
                <div key={order.id} className="vendor-order-card">
                  <div className="vendor-order-header">
                    <div>
                      <strong style={{ fontSize: "16px" }}>Order #{order.id}</strong>
                      <span style={{ marginLeft: "12px", background: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                        {order.orderStatus.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="pickup-otp-pill">
                      <FaKey size={11} style={{ marginRight: "4px" }} />
                      Pickup OTP: <strong style={{ letterSpacing: "1px", fontSize: "15px" }}>{order.pickupOTP}</strong>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
                    <div>
                      <p style={{ margin: "0 0 6px", fontSize: "13px" }}>
                        <strong>Customer:</strong> {order.customerName} • {order.deliveryAddress}
                      </p>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                      </div>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <strong style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>Delivery Partner:</strong>
                      {order.deliveryPartnerId ? (
                        <div style={{ fontSize: "13px" }}>
                          <div>🛵 {order.driverName} ({order.driverPhone})</div>
                          <small style={{ color: "#16a34a", fontWeight: 700 }}>
                            {order.orderStatus === "DRIVER_AT_RESTAURANT"
                              ? "📍 Driver is at your counter!"
                              : "En route to restaurant / customer"}
                          </small>
                        </div>
                      ) : (
                        <span style={{ color: "#d97706", fontSize: "13px", fontWeight: 600 }}>
                          🔍 Searching closest driver...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: COMPLETED ORDERS */}
        {activeTab === "COMPLETED" && (
          <div>
            {completedOrders.map((order) => (
              <div key={order.id} className="vendor-order-card" style={{ opacity: 0.9 }}>
                <div className="vendor-order-header">
                  <div>
                    <strong>Order #{order.id}</strong>
                    <span style={{ marginLeft: "10px", color: "#16a34a", fontWeight: 700, fontSize: "13px" }}>
                      ✓ Delivered
                    </span>
                  </div>
                  <strong style={{ color: "#16a34a" }}>₹{order.grandTotal}</strong>
                </div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  Customer: {order.customerName} • Driver: {order.driverName} • Delivered on {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: MENU MANAGEMENT & ADD NEW FOOD */}
        {activeTab === "MENU" && (
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>Menu Items & Catalog ({currentRest.items.length})</h3>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0" }}>Add new dishes, manage stock and pricing in real time</p>
              </div>

              <button
                onClick={() => setShowAddItemModal(true)}
                style={{
                  background: "var(--food-primary)",
                  color: "#fff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(255, 82, 0, 0.3)"
                }}
              >
                <FaPlus /> Add New Food Item
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {currentRest.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid #f1f5f9",
                    background: item.isOutOfStock ? "#fef2f2" : "#f8fafc",
                    flexWrap: "wrap",
                    gap: "12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <img src={item.image} alt={item.name} style={{ width: "60px", height: "55px", borderRadius: "8px", objectFit: "cover" }} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className={item.isVeg ? "veg-indicator" : "nonveg-indicator"} />
                        <strong style={{ fontSize: "15px" }}>{item.name}</strong>
                        {item.isBestseller && (
                          <span style={{ fontSize: "10px", background: "#fef3c7", color: "#b45309", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>
                            BESTSELLER
                          </span>
                        )}
                      </div>
                      <p style={{ margin: "2px 0", fontSize: "12px", color: "#64748b", maxWidth: "450px" }}>{item.desc}</p>
                      <div style={{ fontSize: "13px", color: "#1e293b", fontWeight: 700 }}>
                        ₹{item.price}{" "}
                        {item.originalPrice && <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "12px", fontWeight: 500 }}>₹{item.originalPrice}</span>}{" "}
                        • <span style={{ color: "#64748b", fontWeight: 500 }}>{item.category}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <button
                      onClick={() => toggleRestaurantItemStock(currentRest.id, item.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "transparent",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: item.isOutOfStock ? "#dc2626" : "#16a34a",
                        cursor: "pointer"
                      }}
                    >
                      {item.isOutOfStock ? (
                        <>
                          <FaToggleOff size={22} color="#dc2626" /> Out of Stock
                        </>
                      ) : (
                        <>
                          <FaToggleOn size={22} color="#16a34a" /> In Stock
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => deleteFoodItem(currentRest.id, item.id)}
                      style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "6px" }}
                      title="Delete Item"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ADD NEW FOOD ITEM MODAL */}
      {showAddItemModal && (
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
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "520px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>Add Food Item to {currentRest.name}</h3>
              <button onClick={() => setShowAddItemModal(false)} style={{ background: "transparent", border: "none", fontSize: "16px", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>

            {/* 1-Click Popular Preset Chips */}
            <div style={{ marginBottom: "16px", background: "#fff3ed", padding: "12px", borderRadius: "12px", border: "1px solid #fed7aa" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#c2410c", marginBottom: "8px" }}>
                ⚡ 1-Click Popular Dish Presets (Click to Auto-fill):
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {POPULAR_DISH_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setItemName(p.name);
                      setItemDesc(p.desc);
                      setItemPrice(p.price);
                      setItemOriginalPrice(p.originalPrice);
                      setItemCategory(p.category);
                      setItemIsVeg(p.isVeg);
                      setItemIsBestseller(p.isBestseller);
                      setItemImage(p.image);
                    }}
                    style={{
                      background: itemName === p.name ? "#ea580c" : "#fff",
                      color: itemName === p.name ? "#fff" : "#1e293b",
                      border: "1px solid #fdba74",
                      padding: "5px 10px",
                      borderRadius: "16px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {p.isVeg ? "🟢" : "🔴"} {p.name.split(" ")[0]} (₹{p.price})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveNewItem}>
              {/* Dish Name */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "4px" }}>Dish / Food Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Truffle Mushroom Risotto"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "4px" }}>Description & Ingredients</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Creamy arborio rice with wild mushrooms, black truffle oil and freshly shaved parmesan"
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                />
              </div>

              {/* Pricing Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "4px" }}>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="299"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "4px" }}>Original Price (optional)</label>
                  <input
                    type="number"
                    placeholder="399"
                    value={itemOriginalPrice}
                    onChange={(e) => setItemOriginalPrice(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                  />
                </div>
              </div>

              {/* Category */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "4px" }}>Category</label>
                <select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", marginBottom: "6px" }}
                >
                  {currentRest.categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter new custom category..."
                  value={newCustomCategory}
                  onChange={(e) => setNewCustomCategory(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px dashed #cbd5e1", fontSize: "12px", outline: "none" }}
                />
              </div>

              {/* Veg / Non-Veg & Bestseller toggles */}
              <div style={{ display: "flex", gap: "20px", marginBottom: "14px", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="vegType"
                    checked={itemIsVeg}
                    onChange={() => setItemIsVeg(true)}
                  />
                  <span className="veg-indicator" /> Pure Veg
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="vegType"
                    checked={!itemIsVeg}
                    onChange={() => setItemIsVeg(false)}
                  />
                  <span className="nonveg-indicator" /> Non-Veg
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer", marginLeft: "auto" }}>
                  <input
                    type="checkbox"
                    checked={itemIsBestseller}
                    onChange={(e) => setItemIsBestseller(e.target.checked)}
                  />
                  ⭐ Bestseller
                </label>
              </div>

              {/* Image Preset Select & Custom URL */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "6px" }}>Select Dish Photo Preset or URL</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px", marginBottom: "8px" }}>
                  {FOOD_IMAGE_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setItemImage(preset.url)}
                      style={{
                        border: itemImage === preset.url ? "2px solid var(--food-primary)" : "1px solid #cbd5e1",
                        borderRadius: "8px",
                        overflow: "hidden",
                        cursor: "pointer"
                      }}
                    >
                      <img src={preset.url} alt={preset.label} style={{ width: "100%", height: "45px", objectFit: "cover" }} />
                      <div style={{ fontSize: "9px", fontWeight: 700, textAlign: "center", padding: "1px", background: "#f8fafc" }}>
                        {preset.label}
                      </div>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or paste custom image URL..."
                  value={itemImage}
                  onChange={(e) => setItemImage(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none" }}
                />
              </div>

              {/* Live Preview Card */}
              {itemName && (
                <div style={{ marginBottom: "16px", background: "#f1f5f9", padding: "12px", borderRadius: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Customer View Preview</span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", background: "#fff", padding: "10px", borderRadius: "10px" }}>
                    <div>
                      {itemIsVeg ? <span className="veg-indicator" /> : <span className="nonveg-indicator" />}
                      <strong style={{ fontSize: "14px", marginLeft: "6px" }}>{itemName}</strong>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#ff5200", marginTop: "2px" }}>₹{itemPrice || 0}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{itemDesc || "Chef specialty"}</div>
                    </div>
                    <img src={itemImage} alt="preview" style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover" }} />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: "12px", borderRadius: "10px", border: "none", background: "var(--food-primary)", color: "#fff", fontWeight: 800, cursor: "pointer" }}
                >
                  Publish to Menu →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER NEW RESTAURANT MODAL */}
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
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "480px", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>Onboard New Restaurant</h3>
              <button onClick={() => setShowOnboardModal(false)} style={{ background: "transparent", border: "none", fontSize: "16px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleOnboardRestaurant}>
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

      {/* Reject Order Reason Modal */}
      {rejectModalOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px"
          }}
        >
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", maxWidth: "420px", width: "100%" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: 800 }}>Reject Order #{rejectModalOrder.id}?</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>
              Please select or enter the reason for rejecting this customer order.
            </p>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "16px", fontSize: "13px" }}
            >
              <option value="Kitchen overloaded with peak hour orders">Kitchen overloaded with peak hour orders</option>
              <option value="Item ingredient out of stock">Item ingredient out of stock</option>
              <option value="Closing for kitchen maintenance">Closing for kitchen maintenance</option>
              <option value="Delivery radius too far for current staff">Delivery radius too far for current staff</option>
            </select>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setRejectModalOrder(null)}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", fontWeight: 800, cursor: "pointer" }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KITCHEN & VENDOR OPERATIONS GUIDE MODAL */}
      {showKitchenGuideModal && (
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
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "600px", width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>📖 Merchant Kitchen Operations Guide</h3>
              <button onClick={() => setShowKitchenGuideModal(false)} style={{ background: "transparent", border: "none", fontSize: "16px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "#fff3ed", padding: "12px", borderRadius: "10px", border: "1px solid #fed7aa" }}>
                <strong style={{ color: "#c2410c" }}>1. Accepting Orders & Prep Timers:</strong>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#7c2d12" }}>
                  When customer places order, audio chime plays. Select estimated preparation time (15–35 mins) and click "Accept Order & Start Prep".
                </p>
              </div>

              <div style={{ background: "#ecfdf5", padding: "12px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                <strong style={{ color: "#065f46" }}>2. Dispatching & Releasing Pickup OTP:</strong>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#064e3b" }}>
                  Once the dish is packed, click "Mark Ready for Pickup". The system pings the nearest delivery partner. Give your 4-digit <strong>Pickup OTP (e.g. 4821)</strong> to the driver when they arrive.
                </p>
              </div>

              <div style={{ background: "#eff6ff", padding: "12px", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
                <strong style={{ color: "#1e40af" }}>3. Menu Stock & Adding Dishes:</strong>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#1e3a8a" }}>
                  Use the <strong>"Menu Management"</strong> tab to toggle items in/out of stock. Click <strong>"+ Add New Food Item"</strong> to use 1-click popular presets or create new custom dishes with pricing & photos.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowKitchenGuideModal(false)}
              className="btn-driver-accept"
              style={{ marginTop: "20px", width: "100%" }}
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* DELETE RESTAURANT CONFIRMATION MODAL (AUTHENTICATED VIEW) */}
      {restaurantToDelete && (
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
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "440px", width: "100%", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "24px" }}>
              <FaTrash />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
              Delete Restaurant Outlet?
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 20px", lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>{restaurantToDelete.name}</strong>?
              <br />
              This will remove all menu items ({restaurantToDelete.items?.length || 0} dishes) and immediately log you out.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setRestaurantToDelete(null)}
                style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteRestaurant(restaurantToDelete.id);
                  setRestaurantToDelete(null);
                }}
                style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#dc2626", color: "#fff", fontWeight: 800, cursor: "pointer" }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
