import React from "react";
import { FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

export default function NavbarL() {
  const navigate = useNavigate();

  return (
    <header className="main-header" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 32px' }}>
      <div className="navbar-brand-logo" onClick={() => navigate("/")}>
        <div className="brand-icon-pill">🛍️</div>
        <span className="brand-logo-text">
          One<span className="brand-highlight">Cart</span><span className="brand-gold-spark">✦</span>
        </span>
      </div>

      <div className="header-right">
        <button 
          className="btn-secondary" 
          onClick={() => navigate("/")}
          style={{ padding: '6px 14px', fontSize: '13px' }}
        >
          Return to Shop
        </button>
        <FaInfoCircle
          title="About Us"
          onClick={() => navigate("/")}
          style={{ color: '#64748b', fontSize: '18px', cursor: 'pointer', marginLeft: '12px' }}
        />
      </div>
    </header>
  );
}