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
  FaTicketAlt,
  FaUtensils,
  FaBoxOpen,
  FaCog
} from "react-icons/fa";
import useCartStore from "../pages/Profile/cartStore";
import { useNavigate } from "react-router-dom";
import api from "../api";
import useAppStore from "../store/appStore";
import "../styles/navbar.css";

const megaMenuData = {
  electronics: ["Mobiles", "Laptops", "Headphones", "Cameras", "Smart Watches"],
  fashion: ["Men", "Women", "Kids", "Shoes", "Accessories"],
  home: ["Furniture", "Kitchen", "Decor", "Lighting", "Storage"],
  beauty: ["Skincare", "Makeup", "Haircare", "Fragrances"],
  sports: ["Fitness", "Running", "Outdoor", "Sports Equipment"]
};

const shopCategories = [
  "All Categories", "Electronics", "Fashion", "Beauty", "Home & Living", 
  "Grocery", "Sports", "Accessories", "New Arrivals", "Best Sellers", "Deals"
];

const foodCategories = [
  "All", "Pizza", "Burgers", "Biryani", "Indian", "Chinese", 
  "South Indian", "Desserts", "Healthy", "Coffee", "Offers"
];

export default function Navbar() {
  const appMode = useAppStore((state) => state.appMode);
  const setAppMode = useAppStore((state) => state.setAppMode);
  const navigate = useNavigate();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [navCategories, setNavCategories] = useState([]);

  // Zustand
  const fetchCartStore = useCartStore((state) => state.fetchCart);
  const syncCart = useCartStore((state) => state.syncCart);
  const products = useCartStore((state) => state.products);

  const cartCount = products.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const cartTotal = products.reduce((sum, item) => sum + (item.discountPrice ?? item.price ?? 0) * (item.quantity || 0), 0);

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
    // Also poll every second to catch same-tab updates
    const interval = setInterval(syncWishlist, 1000);
    return () => {
      window.removeEventListener("storage", syncWishlist);
      clearInterval(interval);
    };
  }, []);

  /* ─── Cart actions from sidebar ─── */
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
        // fallback: remove locally
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
      fetchCartStore(); // Use store's fetchCart which also sets cartItems
    } else {
      setIsLoggedIn(false);
    }
    
    api.post("/categories/list", { page: 1, size: 10 })
      .then((res) => setNavCategories(res.data.data || []))
      .catch((err) => console.log("Category fetch error:", err));
  }, []);


  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
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
            <div className="navbar-brand-logo" onClick={() => navigate("/")}>
              OneKart
            </div>
            
            {/* LOCATION */}
            <div className="nav-action-item location-item" onClick={() => setIsLocationModalOpen(true)}>
              <FaMapMarkerAlt className="nav-icon location-icon" />
              <div className="nav-action-text">
                <small>Deliver to</small>
                <strong>Mumbai</strong>
              </div>
            </div>
          </div>

          <div className="header-center">
            <form className="search-bar-container" onSubmit={handleSearch}>
              <div className="search-dropdown">
                <span>All</span>
                <FaChevronDown size={10} />
              </div>
              <input
                type="text"
                placeholder={appMode === "FOOD" ? "Search restaurants, dishes and cuisines..." : "Search Amazon.in"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn-amazon">
                <FaSearch />
              </button>
            </form>
          </div>

          <div className="header-right">
            {/* LANGUAGE (Mock) */}
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
                      <div className="dropdown-item" onClick={() => navigate("/orders")}><FaBoxOpen /> Shopping Orders</div>
                      <div className="dropdown-item" onClick={() => navigate("/food-orders")}><FaUtensils /> Food Orders</div>
                      <div className="dropdown-item" onClick={() => navigate("/wishlist")}><FaHeart /> Wishlist</div>
                      <div className="dropdown-item" onClick={() => setIsLocationModalOpen(true)}><FaMapMarkerAlt /> Saved Addresses</div>
                      <div className="dropdown-item"><FaTicketAlt /> Coupons</div>
                      <div className="dropdown-item" onClick={handleLogout}><FaSignOutAlt /> Logout</div>
                    </div>
                  )}
                </div>

                {/* WISHLIST */}
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

                {/* CART */}
                <div className="nav-action-item cart-trigger" onClick={() => setIsCartOpen(true)}>
                  <div className="cart-icon-wrapper-amazon">
                    <span className="cart-count-amazon">{cartCount}</span>
                    <FaShoppingCart className="nav-icon cart-icon" size={26} />
                  </div>
                  <strong className="cart-label">Cart</strong>
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
            {/* SEGMENTED SWITCHER (LEFT ALIGNED IN CATEGORY LINE) */}
            <div className="nav-item-left-align" style={{ marginRight: '16px', display: 'flex', alignItems: 'center' }}>
              <div className="segmented-switcher-small">
                <button 
                  className={`switch-btn-small ${appMode === "SHOP" ? "active" : ""}`}
                  onClick={() => setAppMode("SHOP")}
                >
                  Shop
                </button>
                <button 
                  className={`switch-btn-small ${appMode === "FOOD" ? "active" : ""}`}
                  onClick={() => setAppMode("FOOD")}
                >
                  Food
                </button>
              </div>
            </div>

            <div 
              className="nav-item mega-menu-trigger all-menu"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <FaBars size={16} style={{marginRight: '4px'}}/>
              <strong>All</strong>
              
              {/* MEGA MENU */}
              {isMegaMenuOpen && (
                <div className="mega-menu">
                  <div className="mega-menu-grid">
                    <div className="mega-col">
                      <h4>Electronics</h4>
                      {megaMenuData.electronics.map(i => <p key={i}>{i}</p>)}
                    </div>
                    <div className="mega-col">
                      <h4>Fashion</h4>
                      {megaMenuData.fashion.map(i => <p key={i}>{i}</p>)}
                    </div>
                    <div className="mega-col">
                      <h4>Home & Living</h4>
                      {megaMenuData.home.map(i => <p key={i}>{i}</p>)}
                    </div>
                    <div className="mega-col">
                      <h4>Beauty</h4>
                      {megaMenuData.beauty.map(i => <p key={i}>{i}</p>)}
                    </div>
                    <div className="mega-col trending-col">
                      <h4>Trending Right Now</h4>
                      <p>Smart Watches</p>
                      <p>Wireless Audio</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {appMode === "SHOP" ? (
              <>
                {navCategories.map(cat => (
                  <div key={cat._id} className="nav-item" onClick={() => navigate(`/products?category=${cat._id}`)}>
                    {cat.name}
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="nav-item">Pizza</div>
                <div className="nav-item">Burgers</div>
                <div className="nav-item">Biryani</div>
                <div className="nav-item">Indian</div>
                <div className="nav-item">Chinese</div>
                <div className="nav-item">South Indian</div>
                <div className="nav-item">Offers</div>
              </>
            )}
          </div>
        </nav>

        {/* ==============================================================
            3. MOBILE NAVIGATION (3 ROWS)
            ============================================================== */}
        <header className="mobile-header mobile-only">
          <div className="mobile-row-1">
            <FaBars className="menu-icon" />
            <div className="navbar-brand-logo" onClick={() => navigate("/")}>OneKart</div>
            <div className="cart-trigger" onClick={() => setIsCartOpen(true)}>
              <FaShoppingCart className="nav-icon" />
              {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
            </div>
          </div>
          
          <div className="mobile-row-2">
            <form className="search-bar-container" onSubmit={handleSearch}>
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder={appMode === "FOOD" ? "Search food or restaurants..." : "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          
          <div className="mobile-row-3">
            <div className="segmented-switcher full-width">
              <div className={`switch-bg ${appMode === "FOOD" ? "food-active" : "shop-active"}`} />
              <button className={`switch-btn ${appMode === "SHOP" ? "active" : ""}`} onClick={() => setAppMode("SHOP")}>
                🛍 SHOP
              </button>
              <button className={`switch-btn ${appMode === "FOOD" ? "active" : ""}`} onClick={() => setAppMode("FOOD")}>
                🍔 FOOD
              </button>
            </div>
          </div>
        </header>

        {/* MOBILE BOTTOM STICKY NAV */}
        <nav className="mobile-bottom-nav mobile-only">
          <div className="bottom-nav-item active" onClick={() => navigate("/")}>
            <FaHome />
            <span>Home</span>
          </div>
          <div className="bottom-nav-item" onClick={() => navigate("/products")}>
            {appMode === "SHOP" ? <FaList /> : <FaSearch />}
            <span>{appMode === "SHOP" ? "Categories" : "Search"}</span>
          </div>
          <div className="bottom-nav-item" onClick={() => navigate(appMode === "SHOP" ? "/wishlist" : "/food-orders")} style={{position: 'relative'}}>
            {appMode === "SHOP" ? <FaHeart style={{color: wishlistCount > 0 ? '#ef4444' : undefined}} /> : <FaShoppingBag />}
            <span>{appMode === "SHOP" ? "Wishlist" : "Orders"}</span>
            {appMode === "SHOP" && wishlistCount > 0 && (
              <span className="bottom-badge" style={{background: '#ef4444'}}>{wishlistCount}</span>
            )}
          </div>
          <div className="bottom-nav-item" onClick={() => setIsCartOpen(true)}>
            <FaShoppingCart />
            <span>Cart</span>
            {cartCount > 0 && <span className="bottom-badge">{cartCount}</span>}
          </div>
          <div className="bottom-nav-item" onClick={() => navigate("/profile")}>
            <FaUser />
            <span>Account</span>
          </div>
        </nav>
      </div>

      {/* ==============================================================
          4. CART DRAWER OVERLAY
          ============================================================== */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <h2>Your Cart ({cartCount})</h2>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="cart-drawer-body">
              {products.length === 0 ? (
                <div className="empty-cart-msg">
                  <FaShoppingCart size={48} color="#cbd5e1" />
                  <p>Your cart is empty.</p>
                  <button className="continue-shopping-btn" onClick={() => { setIsCartOpen(false); navigate("/products"); }}>
                    Start {appMode === "SHOP" ? "Shopping" : "Ordering"}
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {products.map((item, idx) => (
                    <div key={item._id || idx} className={`drawer-cart-item ${appMode === "FOOD" ? "food-layout" : ""}`}>
                      <img
                        src={item.thumbnail || item.images?.[0]}
                        alt={item.title || "Product"}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/60x60?text=?"; }}
                      />
                      <div className="item-details">
                        {appMode === "FOOD" && item.restaurant && <small className="restaurant-name">{item.restaurant}</small>}
                        <h4>{item.title}</h4>
                        <p className="item-price">₹{(item.discountPrice ?? item.price ?? 0).toLocaleString()}</p>

                        {/* Qty + Remove controls */}
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
                {appMode === "SHOP" ? (
                  <>
                    <div className="delivery-progress">
                      <p>You're ₹{Math.max(0, 999 - cartTotal)} away from <strong>FREE DELIVERY</strong></p>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min(100, (cartTotal / 999) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div className="drawer-totals">
                      <span>Subtotal</span>
                      <strong>₹{cartTotal.toLocaleString()}</strong>
                    </div>
                    <div className="drawer-totals">
                      <span>Delivery</span>
                      <strong>{cartTotal > 999 ? "FREE" : "₹40"}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="drawer-totals">
                      <span>Subtotal</span>
                      <strong>₹{cartTotal.toLocaleString()}</strong>
                    </div>
                    <div className="drawer-totals">
                      <span>Taxes & Charges</span>
                      <strong>₹45</strong>
                    </div>
                    <div className="drawer-totals">
                      <span>Delivery Fee</span>
                      <strong>₹30</strong>
                    </div>
                  </>
                )}
                
                <div className="drawer-totals grand-total">
                  <span>Total</span>
                  <strong>₹{(cartTotal + (appMode === "FOOD" ? 75 : (cartTotal > 999 ? 0 : 40))).toLocaleString()}</strong>
                </div>

                <button className={`checkout-btn ${appMode === "FOOD" ? "food-btn" : ""}`} onClick={() => { setIsCartOpen(false); navigate("/checkout"); }}>
                  {appMode === "SHOP" ? "Proceed to Checkout" : "Place Order"}
                </button>
              </div>
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