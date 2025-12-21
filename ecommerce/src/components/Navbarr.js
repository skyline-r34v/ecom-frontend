import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/navbarr.css";

const categories = ["Mobiles", "Clothes", "Furniture", "Electronics", "Books"];

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for darker glass
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`home-navbar glass ${scrolled ? "scrolled" : ""}`}>
      <h2 className="logo" onClick={() => navigate("/")}>
        ReUse<span>Hub</span>
      </h2>

      <ul className="nav-links">
        <li onClick={() => navigate("/")}>Home</li>

        <li
          className="dropdown"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          Categories
          {open && (
            <div className="dropdown-menu">
              {categories.map((cat, i) => (
                <span
                  key={i}
                  onClick={() => navigate(`/category/${cat.toLowerCase()}`)}
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </li>

        <li onClick={() => navigate("/products")}>Products</li>
      </ul>

      <div className="nav-buttons">
        <button onClick={() => navigate("/login")}>Login</button>
        <button className="register" onClick={() => navigate("/register")}>
          Sell Item
        </button>
      </div>
    </nav>
  );
}
