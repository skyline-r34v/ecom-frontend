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
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // Internal state for search
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!search || search.length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      api
        .post("/products/list", { page: 1, size: 5, search })
        .then((res) => setSuggestions(res.data?.data || []))
        .catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleSelect = (id) => {
    setSearch("");
    setSuggestions([]);
    navigate(`/products/${id}`);
  };

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
                <img src={p.images?.[0] || "/placeholder.png"} alt={p.title || "Product"} />
                <span>{p.title || "Untitled Product"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="nav-actions">
        <FaInfoCircle title="About Us" onClick={() => navigate("/about")} className="nav-icon" />

        {isLoggedIn ? (
          <>
            <FaUser title="Profile" onClick={() => navigate("/profile")} className="nav-icon" />
            <FaShoppingCart title="Cart" onClick={() => navigate("/cart")} className="nav-icon" />
            <FaSignOutAlt title="Logout" onClick={handleLogout} className="logout-icon" />
          </>
        ) : (
          <button className="login-link" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>
    </header>
  );
}