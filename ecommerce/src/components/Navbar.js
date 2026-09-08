import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
  FaSearch,
  FaMapMarkerAlt,
  FaHeart,
  FaTimes,
  FaTrash,
  FaChevronDown,
  FaHome,
  FaList,
  FaShoppingBag,
  FaUtensils,
  FaBoxOpen,
  FaStore,
  FaMotorcycle,
  FaShieldAlt
} from "react-icons/fa";
import useCartStore from "../pages/Profile/cartStore";
import useFoodDeliveryStore from "../store/foodDeliveryStore";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import useAppStore from "../store/appStore";
import "../styles/navbar.css";

const megaMenuShopData = {
  electronics: ["Mobiles", "Laptops", "Headphones", "Cameras", "Smart Watches"],
  fashion: ["Men", "Women", "Kids", "Shoes", "Accessories"],
  home: ["Furniture", "Kitchen", "Decor", "Lighting", "Storage"],
  beauty: ["Skincare", "Makeup", "Haircare", "Fragrances"],
  sports: ["Fitness", "Running", "Outdoor", "Sports Equipment"]
};

export default function Navbar() {
  const appMode = useAppStore((state) => state.appMode);
  const setAppMode = useAppStore((state) => state.setAppMode);
  const navigate = useNavigate();
  const location = useLocation();

  // True if user is either in food mode or on any food delivery route
  const isFoodMode =
    appMode === "FOOD" ||
    location.pathname.startsWith("/food") ||
    location.pathname === "/food-orders";
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [navCategories, setNavCategories] = useState([]);

  // Shop Zustand Store
  const fetchCartStore = useCartStore((state) => state.fetchCart);
  const syncCart = useCartStore((state) => state.syncCart);
  const products = useCartStore((state) => state.products);

  const shopCartCount = products.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const shopCartTotal = products.reduce((sum, item) => sum + (item.discountPrice ?? item.price ?? 0) * (item.quantity || 0), 0);

  // Food Zustand Store
  const foodCart = useFoodDeliveryStore((state) => state.foodCart);
  const updateCartItemQty = useFoodDeliveryStore((state) => state.updateCartItemQty);
  const restaurants = useFoodDeliveryStore((state) => state.restaurants);
  const isFoodCartDrawerOpen = useFoodDeliveryStore((state) => state.isFoodCartDrawerOpen);
  const openFoodCartDrawer = useFoodDeliveryStore((state) => state.openFoodCartDrawer);
  const closeFoodCartDrawer = useFoodDeliveryStore((state) => state.closeFoodCartDrawer);
  const favoriteRestaurantIds = useFoodDeliveryStore((state) => state.favoriteRestaurantIds || []);

  const foodCartItems = foodCart?.items || [];
  const foodCartCount = foodCartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const foodCartSubtotal = foodCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const favoriteRestaurants = restaurants.filter((r) => favoriteRestaurantIds.includes(r.id));
  const displayedInCartRestaurants = favoriteRestaurants.length > 0 ? favoriteRestaurants : restaurants.slice(0, 3);

  const isDrawerOpen = isCartOpen || (isFoodMode && isFoodCartDrawerOpen);
  const handleOpenCart = () => {
    if (isFoodMode) {
      openFoodCartDrawer();
    }
    setIsCartOpen(true);
  };
  const handleCloseCart = () => {
    setIsCartOpen(false);
    closeFoodCartDrawer();
  };

  // Active counts based on current mode
  const currentCartCount = isFoodMode ? foodCartCount : shopCartCount;

  // Wishlist count — synced from localStorage
  const [wishlistCount, setWishlistCount] = useState(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
      return Array.isArray(ids) ? ids.length : 0;
    } catch { return 0; }
  });

  // Keep wishlistCount in sync whenever Products.js updates localStorage
  useEffect(() => {
    const syncWishlist = () => {
      try {
        const ids = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
        setWishlistCount(Array.isArray(ids) ? ids.length : 0);
      } catch { setWishlistCount(0); }
    };
    window.addEventListener("storage", syncWishlist);
    const interval = setInterval(syncWishlist, 1000);
    return () => {
      window.removeEventListener("storage", syncWishlist);
      clearInterval(interval);
    };
  }, []);

  /* ─── Shop Cart actions from sidebar ─── */
  const handleCartQty = async (productId, change) => {
    try {
      const res = await api.post("/users/cart", { productId, quantity: change });
      if (res.data?.success) syncCart(res.data.cart);
    } catch (err) { console.error(err); }
  };

  const handleCartRemove = async (productId) => {
    try {
      const res = await api.post("/users/cart", { productId, quantity: -999 });
      if (res.data?.success) {
        syncCart(res.data.cart);
      } else {
        syncCart({ items: useCartStore.getState().cartItems.filter(i => i.product?._id !== productId) });
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsSticky(true);
      } else if (window.scrollY < 50) {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      setIsLoggedIn(true);
      fetchCartStore();
    } else {
      setIsLoggedIn(false);
    }
    
    api.post("/categories/list", { page: 1, size: 10 })
      .then((res) => setNavCategories(res.data.data || []))
      .catch((err) => console.log("Category fetch error:", err));
  }, [fetchCartStore]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (isFoodMode) {
        navigate(`/food?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleSwitchMode = (targetMode) => {
    setAppMode(targetMode);
    if (targetMode === "FOOD") {
      if (!location.pathname.startsWith("/food")) {
        navigate("/food");
      }
    } else {
      if (location.pathname.startsWith("/food") || location.pathname === "/food-orders") {
        navigate("/");
      }
    }
  };

  return (
    <>
      <div className={`navbar-wrapper ${isSticky ? "sticky" : ""}`}>
        {/* ==============================================================
            1. MAIN DESKTOP HEADER 
            ============================================================== */}
        <header className="main-header desktop-only">
          <div className="header-left">
            <div
              className="navbar-brand-logo"
              onClick={() => navigate(isFoodMode ? "/food" : "/")}
              style={{ cursor: "pointer" }}
            >
              {isFoodMode ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>OneKart</span>
                  <span
                    style={{
                      background: "var(--food-primary, #ff5200)",
                      color: "#fff",
                      fontSize: "11px",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      fontWeight: 900,
                      letterSpacing: "0.5px"
                    }}
                  >
                    FOOD
                  </span>
                </span>
              ) : (
                "OneKart"
              )}
            </div>
            
            {/* LOCATION */}
            <div className="nav-action-item location-item" onClick={() => setIsLocationModalOpen(true)}>
              <FaMapMarkerAlt className="nav-icon location-icon" style={{ color: isFoodMode ? "var(--food-primary, #ff5200)" : undefined }} />
              <div className="nav-action-text">
                <small>Deliver to</small>
                <strong>Mumbai</strong>
              </div>
            </div>
          </div>

          <div className="header-center">
            <form className="search-bar-container" onSubmit={handleSearch}>
              <div className="search-dropdown">
                <span>{isFoodMode ? "Food" : "All"}</span>
                <FaChevronDown size={10} />
              </div>
              <input
                type="text"
                placeholder={isFoodMode ? "Search food dishes, pizzas, biryani or restaurants..." : "Search products, electronics, brands..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="search-btn-amazon"
                style={{ background: isFoodMode ? "var(--food-primary, #ff5200)" : undefined }}
              >
                <FaSearch />
              </button>
            </form>
          </div>

          <div className="header-right">
            {/* LANGUAGE */}
            <div className="nav-action-item language-item">
              <strong>EN <FaChevronDown size={10}/></strong>
            </div>

            {isLoggedIn ? (
              <>
                {/* ACCOUNT WITH DROPDOWN */}
                <div 
                  className="nav-action-item account-trigger"
                  onMouseEnter={() => setIsAccountDropdownOpen(true)}
                  onMouseLeave={() => setIsAccountDropdownOpen(false)}
                >
                  <div className="nav-action-text">
                    <small>Hello, User</small>
                    <strong>Account & Lists <FaChevronDown size={10}/></strong>
                  </div>

                  {isAccountDropdownOpen && (
                    <div className="account-dropdown">
                      <div className="dropdown-item" onClick={() => navigate("/profile")}><FaUser /> My Profile</div>
                      <div className="dropdown-item" onClick={() => navigate("/food-orders")}><FaUtensils /> Food Delivery Orders</div>
                      <div className="dropdown-item" onClick={() => navigate("/orders")}><FaBoxOpen /> Shopping Orders</div>
                      {!isFoodMode && (
                        <div className="dropdown-item" onClick={() => navigate("/wishlist")}><FaHeart /> Wishlist</div>
                      )}
                      <div className="dropdown-item" onClick={() => setIsLocationModalOpen(true)}><FaMapMarkerAlt /> Saved Addresses</div>
                      <div className="dropdown-item" onClick={handleLogout}><FaSignOutAlt /> Logout</div>
                    </div>
                  )}
                </div>

                {/* WISHLIST (Only shown in shopping mode to avoid cluttering food view) */}
                {!isFoodMode && (
                  <div className="nav-action-item orders-item" onClick={() => navigate("/wishlist")} style={{display: 'flex', alignItems: 'center', gap: '5px', position: 'relative'}}>
                    <div style={{ position: 'relative' }}>
                      <FaHeart size={20} style={{color: wishlistCount > 0 ? '#ef4444' : '#0f1111'}} />
                      {wishlistCount > 0 && (
                        <span style={{
                          position: 'absolute', top: '-6px', right: '-8px',
                          background: '#ef4444', color: '#fff',
                          fontSize: '10px', fontWeight: 800,
                          minWidth: '16px', height: '16px',
                          borderRadius: '8px', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          padding: '0 3px'
                        }}>{wishlistCount}</span>
                      )}
                    </div>
                    <div className="nav-action-text">
                      <small>Your</small>
                      <strong>Wishlist</strong>
                    </div>
                  </div>
                )}

                {/* CART (Displays isolated food cart in food mode, shop cart in shop mode) */}
                <div className="nav-action-item cart-trigger" onClick={handleOpenCart}>
                  <div className="cart-icon-wrapper-amazon">
                    <span
                      className="cart-count-amazon"
                      style={{ background: isFoodMode ? "var(--food-primary, #ff5200)" : undefined }}
                    >
                      {currentCartCount}
                    </span>
                    <FaShoppingCart className="nav-icon cart-icon" size={26} />
                  </div>
                  <strong className="cart-label">{isFoodMode ? "Food Cart" : "Cart"}</strong>
                </div>
              </>
            ) : (
              <div className="nav-action-item account-trigger" onClick={() => navigate("/login")}>
                <div className="nav-action-text">
                  <small>Hello, sign in</small>
                  <strong>Account & Lists <FaChevronDown size={10}/></strong>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ==============================================================
            2. SECONDARY NAVIGATION (DESKTOP)
            ============================================================== */}
        <nav className="secondary-nav desktop-only">
          <div className="navbar-secondary-container">
            {/* SEGMENTED SWITCHER (LEFT ALIGNED) */}
            <div className="nav-item-left-align" style={{ marginRight: '16px', display: 'flex', alignItems: 'center' }}>
              <div className="segmented-switcher-small">
                <button 
                  className={`switch-btn-small ${!isFoodMode ? "active" : ""}`}
                  onClick={() => handleSwitchMode("SHOP")}
                >
                  🛍 Shop
                </button>
                <button 
                  className={`switch-btn-small ${isFoodMode ? "active" : ""}`}
                  onClick={() => handleSwitchMode("FOOD")}
                >
                  🍔 Food
                </button>
              </div>
            </div>

            <div 
              className="nav-item mega-menu-trigger all-menu"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <FaBars size={16} style={{marginRight: '4px'}}/>
              <strong>{isFoodMode ? "All Cuisines" : "All"}</strong>
              
              {/* MEGA MENU (ISOLATED PER MODE) */}
              {isMegaMenuOpen && (
                <div className="mega-menu">
                  {isFoodMode ? (
                    <div className="mega-menu-grid">
                      <div className="mega-col">
                        <h4>Popular Cuisines</h4>
                        <p style={{ cursor: "pointer" }} onClick={() => navigate("/food?category=pizza")}>🍕 Italian Woodfired Pizzas</p>
                        <p style={{ cursor: "pointer" }} onClick={() => navigate("/food?category=burger")}>🍔 Gourmet Burgers</p>
                        <p style={{ cursor: "pointer" }} onClick={() => navigate("/food?category=biryani")}>🍗 Dum Biryani & Kebabs</p>
                        <p style={{ cursor: "pointer" }} onClick={() => navigate("/food?category=healthy")}>🥗 Healthy Bowls & Keto</p>
                      </div>
                      <div className="mega-col">
                        <h4>Sweets & Bakery</h4>
                        <p style={{ cursor: "pointer" }} onClick={() => navigate("/food?category=desserts")}>🍰 Desserts, Cakes & Shakes</p>
                        <p style={{ cursor: "pointer" }} onClick={() => navigate("/food")}>🥑 Pure Vegetarian Outlets</p>
                        <p style={{ cursor: "pointer" }} onClick={() => navigate("/food")}>🔥 Top Rated Outlets (4.8+)</p>
                      </div>
                      <div className="mega-col">
                        <h4>Partner Portals</h4>
                        <p style={{ cursor: "pointer", color: "#c2410c", fontWeight: 700 }} onClick={() => navigate("/food/restaurant")}><FaStore size={12} /> Merchant Kitchen Console</p>
                        <p style={{ cursor: "pointer", color: "#166534", fontWeight: 700 }} onClick={() => navigate("/food/driver")}><FaMotorcycle size={12} /> Delivery Partner Mobile App</p>
                        <p style={{ cursor: "pointer", color: "#1e40af", fontWeight: 700 }} onClick={() => navigate("/food/admin")}><FaShieldAlt size={12} /> Fleet Dispatch Command</p>
                      </div>
                      <div className="mega-col trending-col">
                        <h4>🔥 Active Food Deals</h4>
                        <p style={{ cursor: "pointer" }} onClick={() => navigate("/food")}>50% OFF (Code: WELCOME50)</p>
                        <p style={{ cursor: "pointer" }} onClick={() => navigate("/food")}>Free Delivery (Code: FREEDEL)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mega-menu-grid">
                      <div className="mega-col">
                        <h4>Electronics</h4>
                        {megaMenuShopData.electronics.map(i => <p key={i}>{i}</p>)}
                      </div>
                      <div className="mega-col">
                        <h4>Fashion</h4>
                        {megaMenuShopData.fashion.map(i => <p key={i}>{i}</p>)}
                      </div>
                      <div className="mega-col">
                        <h4>Home & Living</h4>
                        {megaMenuShopData.home.map(i => <p key={i}>{i}</p>)}
                      </div>
                      <div className="mega-col">
                        <h4>Beauty</h4>
                        {megaMenuShopData.beauty.map(i => <p key={i}>{i}</p>)}
                      </div>
                      <div className="mega-col trending-col">
                        <h4>Trending Right Now</h4>
                        <p>Smart Watches</p>
                        <p>Wireless Audio</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* CATEGORIES BAR: STRICTLY SEPARATE */}
            {isFoodMode ? (
              <>
                <div className="nav-item" onClick={() => navigate("/food")}>🍔 All Food</div>
                <div className="nav-item" onClick={() => navigate("/food?category=pizza")}>🍕 Pizzas</div>
                <div className="nav-item" onClick={() => navigate("/food?category=burger")}>🍔 Burgers</div>
                <div className="nav-item" onClick={() => navigate("/food?category=biryani")}>🍗 Biryani & Rolls</div>
                <div className="nav-item" onClick={() => navigate("/food?category=healthy")}>🥗 Healthy Bowls</div>
                <div className="nav-item" onClick={() => navigate("/food?category=desserts")}>🍰 Desserts</div>
                <div className="nav-item" onClick={() => navigate("/food/restaurant")}>🏪 Restaurant Login</div>
                <div className="nav-item" onClick={() => navigate("/food/driver")}>🛵 Driver App</div>
                <div className="nav-item" onClick={() => navigate("/food/admin")}>🛡️ Admin Dispatch</div>
              </>
            ) : (
              <>
                {navCategories.map(cat => (
                  <div key={cat._id} className="nav-item" onClick={() => navigate(`/products?category=${cat._id}`)}>
                    {cat.name}
                  </div>
                ))}
              </>
            )}
          </div>
        </nav>

        {/* ==============================================================
            3. MOBILE NAVIGATION
            ============================================================== */}
        <header className="mobile-header mobile-only">
          <div className="mobile-row-1">
            <FaBars className="menu-icon" />
            <div className="navbar-brand-logo" onClick={() => navigate(isFoodMode ? "/food" : "/")}>
              OneKart {isFoodMode ? "Food 🍔" : ""}
            </div>
            <div className="cart-trigger" onClick={handleOpenCart}>
              <FaShoppingCart className="nav-icon" />
              {currentCartCount > 0 && <span className="icon-badge">{currentCartCount}</span>}
            </div>
          </div>
          
          <div className="mobile-row-2">
            <form className="search-bar-container" onSubmit={handleSearch}>
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder={isFoodMode ? "Search food dishes or restaurants..." : "Search products, electronics..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          
          <div className="mobile-row-3">
            <div className="segmented-switcher full-width">
              <div className={`switch-bg ${isFoodMode ? "food-active" : "shop-active"}`} />
              <button className={`switch-btn ${!isFoodMode ? "active" : ""}`} onClick={() => handleSwitchMode("SHOP")}>
                🛍 SHOP
              </button>
              <button className={`switch-btn ${isFoodMode ? "active" : ""}`} onClick={() => handleSwitchMode("FOOD")}>
                🍔 FOOD
              </button>
            </div>
          </div>
        </header>

        {/* MOBILE BOTTOM STICKY NAV */}
        <nav className="mobile-bottom-nav mobile-only">
          <div className="bottom-nav-item active" onClick={() => navigate(isFoodMode ? "/food" : "/")}>
            <FaHome />
            <span>Home</span>
          </div>
          <div className="bottom-nav-item" onClick={() => navigate(isFoodMode ? "/food" : "/products")}>
            {isFoodMode ? <FaUtensils /> : <FaList />}
            <span>{isFoodMode ? "Menu" : "Categories"}</span>
          </div>
          <div className="bottom-nav-item" onClick={() => navigate(isFoodMode ? "/food-orders" : "/wishlist")} style={{position: 'relative'}}>
            {isFoodMode ? <FaShoppingBag /> : <FaHeart style={{color: wishlistCount > 0 ? '#ef4444' : undefined}} />}
            <span>{isFoodMode ? "Orders" : "Wishlist"}</span>
            {!isFoodMode && wishlistCount > 0 && (
              <span className="bottom-badge" style={{background: '#ef4444'}}>{wishlistCount}</span>
            )}
          </div>
          <div className="bottom-nav-item" onClick={handleOpenCart}>
            <FaShoppingCart />
            <span>Cart</span>
            {currentCartCount > 0 && <span className="bottom-badge">{currentCartCount}</span>}
          </div>
          <div className="bottom-nav-item" onClick={() => navigate("/profile")}>
            <FaUser />
            <span>Account</span>
          </div>
        </nav>
      </div>

      {/* ==============================================================
          4. ISOLATED CART DRAWER (FOOD CART vs SHOP CART)
          ============================================================== */}
      {isDrawerOpen && (
        <div className="cart-drawer-overlay" onClick={handleCloseCart}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            
            {/* --- CASE 1: FOOD DELIVERY CART DRAWER --- */}
            {isFoodMode ? (
              <>
                <div className="cart-drawer-header" style={{ background: "#fff3ed", borderBottom: "1px solid #fed7aa" }}>
                  <div>
                    <h2 style={{ color: "#c2410c", margin: 0, fontSize: "18px", fontWeight: 800 }}>
                      🍔 Food Cart ({foodCartCount})
                    </h2>
                    {foodCart?.restaurantName && (
                      <small style={{ color: "#7c2d12", fontWeight: 600, display: "block", marginTop: "2px" }}>
                        From: {foodCart.restaurantName}
                      </small>
                    )}
                  </div>
                  <button className="close-btn" onClick={handleCloseCart}>
                    <FaTimes />
                  </button>
                </div>

                <div className="cart-drawer-body">
                  {foodCartItems.length === 0 ? (
                    <div className="empty-cart-msg">
                      <FaUtensils size={44} color="#fed7aa" />
                      <p style={{ fontWeight: 800, marginTop: "10px", fontSize: "16px", color: "#1e293b" }}>Your food cart is empty</p>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>Choose a restaurant to start adding delicious dishes!</span>
                      
                      <button
                        className="continue-shopping-btn"
                        style={{ background: "var(--food-primary, #ff5200)", color: "#fff", marginTop: "14px", width: "100%", borderRadius: "10px", fontWeight: 800 }}
                        onClick={() => { handleCloseCart(); navigate("/food"); }}
                      >
                        Browse All Restaurants →
                      </button>

                      {/* Favorite Restaurants in Cart Drawer */}
                      <div style={{ marginTop: "20px", textAlign: "left", width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            ❤️ {favoriteRestaurants.length > 0 ? "Favorite Restaurants" : "Popular Restaurants"}
                          </div>
                          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>
                            {favoriteRestaurants.length > 0 ? `${favoriteRestaurants.length} saved` : "Suggested"}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {displayedInCartRestaurants.map((r) => {
                            const isFav = favoriteRestaurantIds.includes(r.id);
                            return (
                              <div
                                key={r.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "8px 10px",
                                  background: "#f8fafc",
                                  border: isFav ? "1px solid #fecdd3" : "1px solid #e2e8f0",
                                  borderRadius: "10px",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease"
                                }}
                                onClick={() => {
                                  handleCloseCart();
                                  navigate(`/food/restaurant-menu/${r.id}`);
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <img
                                    src={r.image}
                                    alt={r.name}
                                    style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }}
                                  />
                                  <div>
                                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "4px" }}>
                                      {r.name} {isFav && <span style={{ color: "#e11d48", fontSize: "11px" }}>❤️</span>}
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#64748b" }}>{r.cuisine} • ⭐ {r.rating}</div>
                                  </div>
                                </div>
                                <span style={{ fontSize: "11px", color: "#ff5200", fontWeight: 800, background: "#fff3ed", padding: "4px 8px", borderRadius: "6px" }}>
                                  View Menu →
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="cart-items-list">
                      {/* Banner to Add more dishes from the active restaurant */}
                      {foodCart?.restaurantId && (
                        <div
                          style={{
                            background: "#fff3ed",
                            border: "1px dashed #ff5200",
                            padding: "8px 12px",
                            borderRadius: "10px",
                            marginBottom: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <span style={{ fontSize: "12px", color: "#c2410c", fontWeight: 700 }}>
                            Ordering from <strong>{foodCart.restaurantName}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              handleCloseCart();
                              navigate(`/food/restaurant-menu/${foodCart.restaurantId}`);
                            }}
                            style={{
                              background: "#ff5200",
                              color: "#fff",
                              border: "none",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 800,
                              cursor: "pointer"
                            }}
                          >
                            + Add More Dishes
                          </button>
                        </div>
                      )}

                      {foodCartItems.map((item) => (
                        <div key={item.id} className="drawer-cart-item food-layout" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: "60px", height: "60px", borderRadius: "10px", objectFit: "cover" }}
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200"; }}
                          />
                          <div className="item-details" style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ color: item.isVeg ? "#16a34a" : "#dc2626", fontSize: "10px", fontWeight: 800, border: `1px solid ${item.isVeg ? "#16a34a" : "#dc2626"}`, padding: "1px 4px", borderRadius: "3px" }}>
                                {item.isVeg ? "VEG" : "NON-VEG"}
                              </span>
                              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 800 }}>{item.name}</h4>
                            </div>
                            
                            {item.size && (
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Size: {item.size}</div>
                            )}
                            {item.addOns && item.addOns.length > 0 && (
                              <div style={{ fontSize: "11px", color: "#64748b" }}>Add-ons: {item.addOns.join(", ")}</div>
                            )}

                            <p className="item-price" style={{ margin: "4px 0", color: "#ff5200", fontWeight: 800 }}>
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>

                            <div className="qty-controls">
                              <button className="qty-btn" onClick={() => updateCartItemQty(item.id, -1)}>−</button>
                              <span className="qty-value">{item.quantity}</span>
                              <button className="qty-btn" onClick={() => updateCartItemQty(item.id, 1)}>+</button>
                              <button className="remove-cart-btn" onClick={() => updateCartItemQty(item.id, -item.quantity)} title="Remove dish">
                                <FaTrash size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {foodCartItems.length > 0 && (
                  <div className="cart-drawer-footer">
                    <div className="drawer-totals">
                      <span>Food Subtotal</span>
                      <strong>₹{foodCartSubtotal.toLocaleString()}</strong>
                    </div>
                    <div className="drawer-totals">
                      <span>Packaging & Taxes</span>
                      <strong>₹45</strong>
                    </div>
                    <div className="drawer-totals">
                      <span>Delivery Fee</span>
                      <strong style={{ color: "#16a34a" }}>₹35</strong>
                    </div>
                    <div className="drawer-totals grand-total" style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "8px" }}>
                      <span>To Pay</span>
                      <strong style={{ color: "#ff5200" }}>₹{(foodCartSubtotal + 45 + 35).toLocaleString()}</strong>
                    </div>
                    <button
                      className="checkout-btn food-btn"
                      style={{ background: "var(--food-primary, #ff5200)", color: "#fff", fontWeight: 800 }}
                      onClick={() => { handleCloseCart(); navigate("/food/checkout"); }}
                    >
                      Proceed to Food Checkout →
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* --- CASE 2: E-COMMERCE SHOPPING CART DRAWER --- */
              <>
                <div className="cart-drawer-header">
                  <h2>Shopping Cart ({shopCartCount})</h2>
                  <button className="close-btn" onClick={() => setIsCartOpen(false)}>
                    <FaTimes />
                  </button>
                </div>

                <div className="cart-drawer-body">
                  {products.length === 0 ? (
                    <div className="empty-cart-msg">
                      <FaShoppingCart size={48} color="#cbd5e1" />
                      <p>Your shopping cart is empty.</p>
                      <button className="continue-shopping-btn" onClick={() => { handleCloseCart(); navigate("/products"); }}>
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="cart-items-list">
                      {products.map((item, idx) => (
                        <div key={item._id || idx} className="drawer-cart-item">
                          <img
                            src={item.thumbnail || item.images?.[0]}
                            alt={item.title || "Product"}
                            onError={(e) => { e.target.src = "https://via.placeholder.com/60x60?text=?"; }}
                          />
                          <div className="item-details">
                            <h4>{item.title}</h4>
                            <p className="item-price">₹{(item.discountPrice ?? item.price ?? 0).toLocaleString()}</p>

                            <div className="qty-controls">
                              <button
                                className="qty-btn"
                                onClick={() => handleCartQty(item._id, -1)}
                                disabled={item.quantity <= 1}
                              >−</button>
                              <span className="qty-value">{item.quantity}</span>
                              <button
                                className="qty-btn"
                                onClick={() => handleCartQty(item._id, 1)}
                              >+</button>
                              <button
                                className="remove-cart-btn"
                                onClick={() => handleCartRemove(item._id)}
                                title="Remove item"
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {products.length > 0 && (
                  <div className="cart-drawer-footer">
                    <div className="delivery-progress">
                      <p>You're ₹{Math.max(0, 999 - shopCartTotal)} away from <strong>FREE DELIVERY</strong></p>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min(100, (shopCartTotal / 999) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div className="drawer-totals">
                      <span>Subtotal</span>
                      <strong>₹{shopCartTotal.toLocaleString()}</strong>
                    </div>
                    <div className="drawer-totals">
                      <span>Delivery</span>
                      <strong>{shopCartTotal > 999 ? "FREE" : "₹40"}</strong>
                    </div>
                    <div className="drawer-totals grand-total">
                      <span>Total</span>
                      <strong>₹{(shopCartTotal + (shopCartTotal > 999 ? 0 : 40)).toLocaleString()}</strong>
                    </div>

                    <button className="checkout-btn" onClick={() => { handleCloseCart(); navigate("/checkout"); }}>
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      )}

      {/* ==============================================================
          5. LOCATION MODAL
          ============================================================== */}
      {isLocationModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLocationModalOpen(false)}>
          <div className="location-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Delivery Location</h3>
              <button onClick={() => setIsLocationModalOpen(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="location-search">
                <FaSearch />
                <input type="text" placeholder="Search your location..." />
              </div>
              <button className="current-location-btn">
                <FaMapMarkerAlt /> Use my current location
              </button>
              
              <h4>Saved Addresses</h4>
              <div className="saved-address">
                <FaHome className="addr-icon" />
                <div>
                  <strong>Home</strong>
                  <p>123, Marine Drive, Mumbai, 400020</p>
                </div>
              </div>
              <div className="saved-address">
                <FaBoxOpen className="addr-icon" />
                <div>
                  <strong>Work</strong>
                  <p>Tech Park, Andheri East, Mumbai, 400093</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}