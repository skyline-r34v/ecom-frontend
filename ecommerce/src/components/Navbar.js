import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
  FaInfoCircle,
} from "react-icons/fa";
import useCartStore from "../pages/Profile/cartStore";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Zustand
  const setCart = useCartStore((state) => state.setCart);
  const products = useCartStore((state) => state.products);

  // ✅ derive count from products (safe + reactive)
  const cartCount = products.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  // ✅ check login + fetch cart
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && token !== "undefined" && token !== "null") {
      setIsLoggedIn(true);

      fetchCart();
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // ✅ separate function (clean + reusable)
  const fetchCart = async () => {
    try {
      const res = await api.post("/users/cart", {});

      const items = res?.data?.cart?.items || [];

      if (!Array.isArray(items)) return;

      setCart(items); // 🔥 hydrate Zustand
    } catch (err) {
      console.log("Cart fetch error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <header className="noon-navbar">
      <FaBars className="menu-icon" />

      <div className="logo" onClick={() => navigate("/")}>
        OneKart
      </div>

      <div className="nav-actions">
        <FaInfoCircle
          title="About Us"
          onClick={() => navigate("/about")}
          className="nav-icon"
        />

        {isLoggedIn ? (
          <>
            <FaUser
              title="Profile"
              onClick={() => navigate("/profile")}
              className="nav-icon"
            />
            {/* / ================= CART ICON WITH COUNT ================= */}
            <div className="cart-container" onClick={() => navigate("/cart")}>
              <FaShoppingCart className="cart-main-icon" />

              {/* <span className="cart-text">Cart</span> */}

              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </div>

            <FaSignOutAlt
              title="Logout"
              onClick={handleLogout}
              className="logout-icon"
            />
          </>
        ) : (
          <button
            className="login-link"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}