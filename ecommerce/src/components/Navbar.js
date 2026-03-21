import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // search states
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // check login status
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && token !== "undefined" && token !== "null") {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // search suggestions
  useEffect(() => {
    if (!search || search.length < 2) {
      setSuggestions([]);
      return;
    }

    const debounce = setTimeout(() => {
      api
        .post("/products/list", { page: 1, size: 5, search })
        .then((res) => {
          setSuggestions(res.data?.data || []);
        })
        .catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(debounce);
  }, [search]);

  const handleSelect = (id) => {
    setSearch("");
    setSuggestions([]);
    navigate(`/products/${id}`);
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

      {/* Search
      <div className="nav-search">
        <FaSearch />
        <input
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSuggestions([]);
              navigate(`/products?search=${search}`);
            }
          }}
        />

        {Array.isArray(suggestions) && suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((p) => (
              <div
                key={p._id}
                className="suggestion-item"
                onClick={() => handleSelect(p._id)}
              >
                <img
                  src={p.images?.[0] || "/placeholder.png"}
                  alt={p.title || "Product"}
                />
                <span>{p.title || "Untitled Product"}</span>
              </div>
            ))}
          </div>
        )}
      </div> */}

      {/* Right Actions */}
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