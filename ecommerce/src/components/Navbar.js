import React, { useState, useEffect, useRef } from "react";
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
  FaFire,
  FaSignInAlt,
  FaPlusCircle
} from "react-icons/fa";
import useCartStore from "../pages/Profile/cartStore";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import useAppStore from "../store/appStore";
import "../styles/navbar.css";

// Dynamic Category Dropdown — Strictly based on real backend categories (NO mock categories)
const getCategoryDropdown = (cat, allCategories = []) => {
  const catName = typeof cat === "string" ? cat : (cat?.name || "Category");
  const catId = typeof cat === "object" ? cat?._id : null;

  // Real child subcategories from backend data (where parentCategory matches this category)
  const childCategories = Array.isArray(allCategories)
    ? allCategories.filter((c) => c && c.parentCategory && String(c.parentCategory) === String(catId))
    : [];

  const columns = [];

  // Column 1: Real Subcategories from backend (if any exist)
  if (childCategories.length > 0) {
    columns.push({
      title: `${catName} Subcategories`,
      items: childCategories.map((c) => ({
        label: c.name,
        action: `/products?category=${c._id}`,
      })),
    });
  }

  // Column 2: Direct Category Links
  columns.push({
    title: `Explore ${catName}`,
    items: [
      { label: `All ${catName} Products`, action: catId ? `/products?category=${catId}` : `/products?search=${encodeURIComponent(catName)}` },
      { label: `Featured ${catName}`, action: catId ? `/products?category=${catId}&featured=true` : `/products?search=${encodeURIComponent(catName)}` },
      { label: `Best Sellers in ${catName}`, action: catId ? `/products?category=${catId}&sort=bestselling` : `/products?search=${encodeURIComponent(catName)}` },
      { label: `New Arrivals`, action: catId ? `/products?category=${catId}&sort=newest` : `/products?search=${encodeURIComponent(catName)}` },
    ],
  });

  // Column 3: Price Ranges
  columns.push({
    title: "Price Ranges",
    items: [
      { label: "Under ₹499", action: `/products?category=${catId || ""}&maxPrice=499` },
      { label: "Under ₹999", action: `/products?category=${catId || ""}&maxPrice=999` },
      { label: "Under ₹1,999", action: `/products?category=${catId || ""}&maxPrice=1999` },
      { label: "Special Offers", action: `/products?category=${catId || ""}&discount=true` },
    ],
  });

  return { columns };
};

export default function Navbar() {
  const appMode = useAppStore((state) => state.appMode);
  const setAppMode = useAppStore((state) => state.setAppMode);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(() => localStorage.getItem("name") || "");
  const [userRole, setUserRole] = useState(() => localStorage.getItem("role") || "");
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("email") || "");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  // Categories from backend (cached to prevent flicker)
  const [navCategories, setNavCategories] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("cachedNavCategories") || "[]");
      return Array.isArray(cached) && cached.length > 0 ? cached : [];
    } catch {
      return [];
    }
  });
  const [activeNavCategory, setActiveNavCategory] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const closeTimeoutRef = useRef(null);
  const accountCloseTimeoutRef = useRef(null);

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

  // Sync authentication state across tabs & custom events
  const syncAuthState = () => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      setIsLoggedIn(true);
      setUserName(localStorage.getItem("name") || "");
      setUserRole(localStorage.getItem("role") || "");
      setUserEmail(localStorage.getItem("email") || "");
      fetchCartStore();
    } else {
      setIsLoggedIn(false);
      setUserName("");
      setUserRole("");
      setUserEmail("");
    }
  };

  const fetchCategories = () => {
    api.post("/categories/list", { page: 1, size: 50 })
      .then((res) => {
        const fetched = res.data?.data || [];
        if (Array.isArray(fetched) && fetched.length > 0) {
          setNavCategories(fetched);
          localStorage.setItem("cachedNavCategories", JSON.stringify(fetched));
        }
      })
      .catch((err) => {
        console.log("Category fetch error:", err);
      });
  };

  useEffect(() => {
    syncAuthState();
    window.addEventListener("roleChanged", syncAuthState);
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("categoriesUpdated", fetchCategories);

    // Fetch categories directly from backend API only
    fetchCategories();

    return () => {
      window.removeEventListener("roleChanged", syncAuthState);
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("categoriesUpdated", fetchCategories);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (accountCloseTimeoutRef.current) clearTimeout(accountCloseTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Account & Lists Hover Handlers
  const handleAccountMouseEnter = () => {
    if (accountCloseTimeoutRef.current) {
      clearTimeout(accountCloseTimeoutRef.current);
    }
    // Immediately close and suppress category mega dropdown!
    setIsDropdownOpen(false);
    setActiveNavCategory(null);
    setIsAccountDropdownOpen(true);
  };

  const handleAccountMouseLeave = () => {
    if (accountCloseTimeoutRef.current) {
      clearTimeout(accountCloseTimeoutRef.current);
    }
    accountCloseTimeoutRef.current = setTimeout(() => {
      setIsAccountDropdownOpen(false);
    }, 220);
  };

  // Category Tab Hover Handlers — Suppressed when interacting with Account
  const handleNavTabMouseEnter = (cat) => {
    if (isAccountDropdownOpen) return;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setActiveNavCategory(cat);
    setIsDropdownOpen(true);
  };

  const handleNavMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
      setActiveNavCategory(null);
    }, 180);
  };

  const handleDropdownMouseEnter = () => {
    if (isAccountDropdownOpen) return;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleSubItemClick = (subItem, parentCat) => {
    setIsDropdownOpen(false);
    setActiveNavCategory(null);
    if (typeof subItem === "object" && subItem.action) {
      navigate(subItem.action);
    } else if (typeof subItem === "string") {
      navigate(`/products?search=${encodeURIComponent(subItem)}`);
    } else if (parentCat?._id) {
      navigate(`/products?category=${parentCat._id}`);
    }
  };

  const handleCategoryTabClick = (cat) => {
    setIsDropdownOpen(false);
    setActiveNavCategory(null);
    if (cat?._id) {
      navigate(`/products?category=${cat._id}`);
    } else if (cat?.name) {
      navigate(`/products?search=${encodeURIComponent(cat.name)}`);
    }
  };


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
      {/* 1. ANNOUNCEMENT BAR */}
      <div className="announcement-bar">
        <span className="announcement-nav-arrow">‹</span>
        <span className="announcement-sparkle">✦</span>
        <span>ONE-CART GRAND FESTIVAL: EXTRA 20% OFF ON CARDS | CODE: <strong>FESTIVE20</strong> | FREE EXPRESS DISPATCH TODAY!</span>
        <span className="announcement-nav-arrow">›</span>
      </div>

      <div className={`navbar-wrapper ${isSticky ? "sticky" : ""} ${isHome && !isSticky ? "transparent-nav" : ""}`}>
        <div className="navbar-capsule">
          {/* ==============================================================
              2. MAIN DESKTOP HEADER 
              ============================================================== */}
          <header className="main-header desktop-only">
            <div className="header-left">
              <div className="navbar-brand-logo" onClick={() => navigate("/")}>
                <div className="brand-icon-pill">🛍️</div>
                <div className="brand-logo-text-group">
                  <span className="brand-logo-text">
                    One<span className="brand-highlight">Cart</span><span className="brand-gold-spark">+</span>
                  </span>
                  <span className="brand-tagline">SHOP SMARTER</span>
                </div>
              </div>

              {/* LOCATION */}
              <div className="nav-action-item location-item" onClick={() => setIsLocationModalOpen(true)}>
                <FaMapMarkerAlt className="nav-icon location-icon" />
                <div className="nav-action-text">
                  <small>Deliver to</small>
                  <strong>Mumbai 400001 <FaChevronDown size={8} style={{ opacity: 0.7, marginLeft: 2 }} /></strong>
                </div>
              </div>
            </div>

            <div className="header-center">
              <form className="search-bar-container" onSubmit={handleSearch}>
                <div className="search-dropdown">
                  <span>All Categories</span>
                  <FaChevronDown size={10} />
                </div>
                <input
                  type="text"
                  placeholder={appMode === "FOOD" ? "Search dishes, restaurants, cuisines..." : "Search 10,000+ products, top brands, deals..."}
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
                <strong>EN <FaChevronDown size={10} /></strong>
              </div>

              {/* UNIFIED ACCOUNT & LISTS WITH SEAMLESS MEGA-DROPDOWN */}
              <div
                className="nav-action-item account-trigger"
                onMouseEnter={handleAccountMouseEnter}
                onMouseLeave={handleAccountMouseLeave}
              >
                <div
                  className="nav-action-text"
                  onClick={() => {
                    if (!isLoggedIn) {
                      navigate("/login");
                    } else {
                      navigate("/profile");
                    }
                  }}
                >
                  <small>
                    {isLoggedIn
                      ? `Hello, ${(userName || "User").split(" ")[0]}`
                      : "Hello, sign in"}
                  </small>
                  <strong>
                    Account & Lists <FaChevronDown size={10} style={{ marginLeft: "2px" }} />
                  </strong>
                </div>

                {isAccountDropdownOpen && (
                  <div
                    className="account-dropdown"
                    onMouseEnter={handleAccountMouseEnter}
                    onMouseLeave={handleAccountMouseLeave}
                  >
                    {isLoggedIn ? (
                      <>
                        {/* LOGGED IN USER PROFILE HEADER */}
                        <div className="account-dropdown-user-header">
                          <div className="account-user-avatar">
                            {(userName || userEmail || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="account-user-meta">
                            <div className="account-user-name">
                              {userName || "Valued Customer"}
                              {userRole && (
                                <span className="account-role-badge">
                                  {userRole.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="account-user-email">
                              {userEmail || "Signed in"}
                            </div>
                          </div>
                        </div>

                        <div className="account-dropdown-divider" />

                        <div className="account-dropdown-section-title">Your Account</div>

                        <div className="account-dropdown-list">
                          <div className="account-dropdown-item" onClick={() => { setIsAccountDropdownOpen(false); navigate("/profile"); }}>
                            <FaUser className="dropdown-item-icon" />
                            <div className="dropdown-item-content">
                              <span className="dropdown-item-title">Your Profile</span>
                              <small className="dropdown-item-sub">Personal details & preferences</small>
                            </div>
                          </div>

                          <div className="account-dropdown-item" onClick={() => { setIsAccountDropdownOpen(false); navigate("/orders"); }}>
                            <FaBoxOpen className="dropdown-item-icon" />
                            <div className="dropdown-item-content">
                              <span className="dropdown-item-title">Shopping Orders</span>
                              <small className="dropdown-item-sub">Track deliveries & view history</small>
                            </div>
                          </div>

                          <div className="account-dropdown-item" onClick={() => { setIsAccountDropdownOpen(false); navigate("/food-orders"); }}>
                            <FaUtensils className="dropdown-item-icon" />
                            <div className="dropdown-item-content">
                              <span className="dropdown-item-title">Food Orders</span>
                              <small className="dropdown-item-sub">Restaurant meals & delivery status</small>
                            </div>
                          </div>

                          <div className="account-dropdown-item" onClick={() => { setIsAccountDropdownOpen(false); navigate("/wishlist"); }}>
                            <FaHeart className="dropdown-item-icon" />
                            <div className="dropdown-item-content">
                              <span className="dropdown-item-title">Your Wishlist</span>
                              <small className="dropdown-item-sub">
                                {wishlistCount > 0 ? `${wishlistCount} saved products` : "Saved favorites"}
                              </small>
                            </div>
                            {wishlistCount > 0 && <span className="dropdown-badge-counter">{wishlistCount}</span>}
                          </div>

                          <div className="account-dropdown-item" onClick={() => { setIsAccountDropdownOpen(false); setIsLocationModalOpen(true); }}>
                            <FaMapMarkerAlt className="dropdown-item-icon" />
                            <div className="dropdown-item-content">
                              <span className="dropdown-item-title">Saved Addresses</span>
                              <small className="dropdown-item-sub">Manage delivery addresses</small>
                            </div>
                          </div>

                          {/* Admin / Seller Quick Management */}
                          {(userRole === "admin" || userRole === "seller" || userRole === "vendor") && (
                            <>
                              <div className="account-dropdown-divider" />
                              <div className="account-dropdown-section-title admin-title">Store Management</div>
                              <div className="account-dropdown-item" onClick={() => { setIsAccountDropdownOpen(false); navigate("/create-category"); }}>
                                <FaPlusCircle className="dropdown-item-icon" style={{ color: "#2563eb" }} />
                                <div className="dropdown-item-content">
                                  <span className="dropdown-item-title">Add Category</span>
                                  <small className="dropdown-item-sub">Create new catalogue category</small>
                                </div>
                              </div>
                              <div className="account-dropdown-item" onClick={() => { setIsAccountDropdownOpen(false); navigate("/category"); }}>
                                <FaList className="dropdown-item-icon" style={{ color: "#2563eb" }} />
                                <div className="dropdown-item-content">
                                  <span className="dropdown-item-title">All Categories</span>
                                  <small className="dropdown-item-sub">View & manage categories</small>
                                </div>
                              </div>
                              <div className="account-dropdown-item" onClick={() => { setIsAccountDropdownOpen(false); navigate("/create-product"); }}>
                                <FaShoppingBag className="dropdown-item-icon" style={{ color: "#2563eb" }} />
                                <div className="dropdown-item-content">
                                  <span className="dropdown-item-title">Add Product</span>
                                  <small className="dropdown-item-sub">List new products to store</small>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="account-dropdown-divider" />

                        <div
                          className="account-dropdown-item logout-item"
                          onClick={() => {
                            setIsAccountDropdownOpen(false);
                            handleLogout();
                          }}
                        >
                          <FaSignOutAlt className="dropdown-item-icon" />
                          <span className="dropdown-item-title">Sign Out</span>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* GUEST SIGN IN CTA */}
                        <div className="account-dropdown-guest-header">
                          <button
                            className="account-dropdown-signin-btn"
                            onClick={() => {
                              setIsAccountDropdownOpen(false);
                              navigate("/login");
                            }}
                          >
                            <FaSignInAlt style={{ marginRight: "6px" }} /> Sign In
                          </button>
                          <div className="account-dropdown-signup-prompt">
                            <span>New customer?</span>{" "}
                            <span
                              className="account-dropdown-link"
                              onClick={() => {
                                setIsAccountDropdownOpen(false);
                                navigate("/register");
                              }}
                            >
                              Start here.
                            </span>
                          </div>
                        </div>

                        <div className="account-dropdown-divider" />

                        <div className="account-dropdown-section-title">Your Lists & Account</div>

                        <div className="account-dropdown-list">
                          <div className="account-dropdown-item" onClick={() => { setIsAccountDropdownOpen(false); navigate("/login"); }}>
                            <FaBoxOpen className="dropdown-item-icon" />
                            <div className="dropdown-item-content">
                              <span className="dropdown-item-title">Your Orders</span>
                              <small className="dropdown-item-sub">Track, return or buy again</small>
                            </div>
                          </div>

                          <div className="account-dropdown-item" onClick={() => { setIsAccountDropdownOpen(false); navigate("/wishlist"); }}>
                            <FaHeart className="dropdown-item-icon" />
                            <div className="dropdown-item-content">
                              <span className="dropdown-item-title">Your Wishlist</span>
                              <small className="dropdown-item-sub">Saved products & alerts</small>
                            </div>
                            {wishlistCount > 0 && <span className="dropdown-badge-counter">{wishlistCount}</span>}
                          </div>

                          <div className="account-dropdown-item" onClick={() => {
                            setIsAccountDropdownOpen(false);
                            const dealsEl = document.getElementById("flash-sale-section");
                            if (dealsEl) dealsEl.scrollIntoView({ behavior: "smooth" });
                            else navigate("/products");
                          }}>
                            <FaFire className="dropdown-item-icon deals-icon" />
                            <div className="dropdown-item-content">
                              <span className="dropdown-item-title">Deals & Offers</span>
                              <small className="dropdown-item-sub">Daily discounts & coupons</small>
                            </div>
                          </div>

                          <div className="account-dropdown-item" onClick={() => { setIsAccountDropdownOpen(false); setIsLocationModalOpen(true); }}>
                            <FaMapMarkerAlt className="dropdown-item-icon" />
                            <div className="dropdown-item-content">
                              <span className="dropdown-item-title">Delivery Location</span>
                              <small className="dropdown-item-sub">Select or change pincode</small>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* WISHLIST BUTTON */}
              <div className="nav-action-item orders-item" onClick={() => navigate("/wishlist")} style={{ display: 'flex', alignItems: 'center', gap: '5px', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <FaHeart size={20} style={{ color: wishlistCount > 0 ? '#ef4444' : '#ef4444' }} />
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

              {/* CART BUTTON */}
              <div className="nav-action-item cart-trigger" onClick={() => setIsCartOpen(true)}>
                <div className="cart-icon-wrapper-amazon">
                  <span className="cart-count-amazon">{cartCount}</span>
                  <FaShoppingCart className="nav-icon cart-icon" size={26} />
                </div>
                <strong className="cart-label">Cart</strong>
              </div>
            </div>
          </header>

          {/* ==============================================================
            2. SECONDARY NAVIGATION (DESKTOP - MEESHO STYLE)
            ============================================================== */}
          <nav
            className="secondary-nav desktop-only meesho-nav-wrapper"
            onMouseLeave={handleNavMouseLeave}
          >
            <div className="navbar-secondary-container">
              {/* SEGMENTED SWITCHER (LEFT ALIGNED) */}
              <div className="nav-item-left-align" style={{ marginRight: '14px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <div className="segmented-switcher-small">
                  <button
                    className={`switch-btn-small ${appMode === "SHOP" ? "active" : ""}`}
                    onClick={() => {
                      setAppMode("SHOP");
                      navigate("/");
                    }}
                  >
                    Shop
                  </button>
                  <button
                    className={`switch-btn-small ${appMode === "FOOD" ? "active" : ""}`}
                    onClick={() => {
                      setAppMode("FOOD");
                      navigate("/");
                    }}
                  >
                    Food
                  </button>
                </div>
              </div>

              {appMode === "SHOP" ? (
                <div
                  className="meesho-nav-tabs"
                  style={{ pointerEvents: isAccountDropdownOpen ? 'none' : 'auto' }}
                >
                  {navCategories.map((cat) => {
                    const isActive = isDropdownOpen && (activeNavCategory?._id ? activeNavCategory._id === cat._id : activeNavCategory?.name === cat.name);
                    return (
                      <div
                        key={cat._id || cat.name}
                        className={`meesho-nav-tab ${isActive ? "active" : ""}`}
                        onMouseEnter={() => handleNavTabMouseEnter(cat)}
                        onClick={() => handleCategoryTabClick(cat)}
                      >
                        <span>{cat.name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="meesho-nav-tabs">
                  {["Pizza", "Burgers", "Biryani", "North Indian", "Chinese", "Healthy", "Desserts"].map((fItem) => (
                    <div key={fItem} className="meesho-nav-tab" onClick={() => navigate(`/?food=${fItem.toLowerCase()}`)}>
                      <span>{fItem}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* QUICK LINK TO TODAY'S DEALS */}
              <div
                className="meesho-nav-deals-btn"
                onClick={() => {
                  const dealsEl = document.getElementById("flash-sale-section");
                  if (dealsEl) dealsEl.scrollIntoView({ behavior: "smooth" });
                  else navigate("/products");
                }}
              >
                <FaFire style={{ color: "#f5940bff", fontSize: "13px" }} />
                <span>Deals</span>
              </div>
            </div>

            {/* MEESHO MULTI-COLUMN MEGA MENU DROPDOWN */}
            {isDropdownOpen && activeNavCategory && appMode === "SHOP" && (
              <div
                className="meesho-mega-dropdown"
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleNavMouseLeave}
              >
                <div className="meesho-mega-inner">
                  <div className="meesho-mega-columns">
                    {getCategoryDropdown(activeNavCategory, navCategories).columns.map((col, idx) => (
                      <div key={idx} className="meesho-mega-col">
                        <h4 className="meesho-mega-col-title">{col.title}</h4>
                        <ul className="meesho-mega-list">
                          {col.items.map((item, itemIdx) => {
                            const label = typeof item === "string" ? item : item.label;
                            return (
                              <li
                                key={itemIdx}
                                className="meesho-mega-item"
                                onClick={() => handleSubItemClick(item, activeNavCategory)}
                              >
                                {label}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div> {/* end .navbar-capsule */}

        {/* ==============================================================
            3. MOBILE NAVIGATION (3 ROWS)
            ============================================================== */}
        <header className="mobile-header mobile-only">
          <div className="mobile-row-1">
            <FaBars className="menu-icon" />
            <div className="navbar-brand-logo" onClick={() => navigate("/")}>
              <div className="brand-icon-pill" style={{ width: 28, height: 28, fontSize: 14 }}>🛍️</div>
              <span className="brand-logo-text" style={{ fontSize: 20 }}>
                One<span className="brand-highlight">Cart</span>
              </span>
            </div>
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
              <button className={`switch-btn ${appMode === "SHOP" ? "active" : ""}`} onClick={() => { setAppMode("SHOP"); navigate("/"); }}>
                🛍 SHOP
              </button>
              <button className={`switch-btn ${appMode === "FOOD" ? "active" : ""}`} onClick={() => { setAppMode("FOOD"); navigate("/"); }}>
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
          <div className="bottom-nav-item" onClick={() => navigate(appMode === "SHOP" ? "/wishlist" : "/food-orders")} style={{ position: 'relative' }}>
            {appMode === "SHOP" ? <FaHeart style={{ color: wishlistCount > 0 ? '#ef4444' : undefined }} /> : <FaShoppingBag />}
            <span>{appMode === "SHOP" ? "Wishlist" : "Orders"}</span>
            {appMode === "SHOP" && wishlistCount > 0 && (
              <span className="bottom-badge" style={{ background: '#ef4444' }}>{wishlistCount}</span>
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