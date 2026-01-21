import React from "react";
import {
  FaBars,
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar({ search, setSearch }) {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="noon-navbar">
      <FaBars className="menu-icon" />

      <div className="logo" onClick={() => navigate("/")}>
        OneKart
      </div>

      <div className="nav-search">
        <FaSearch />
        <input
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            navigate(`/products?search=${search}`)
          }
        />
      </div>

      <div className="nav-actions">
        {/* About */}
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
            <FaShoppingCart
              title="Cart"
              onClick={() => navigate("/cart")}
              className="nav-icon"
            />
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
