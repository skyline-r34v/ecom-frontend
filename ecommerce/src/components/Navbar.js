import React, { useState, useEffect } from "react";
import { Layout, Avatar, Dropdown } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

const { Header } = Layout;

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // User info
  const user = {
    name: localStorage.getItem("name") || "User",
    email: localStorage.getItem("email") || "user@example.com",
  };

  // Dropdown menu items for user
  const userItems = [
    {
      key: "userInfo",
      label: (
        <div className="dropdown-user-info">
          <p className="user-name">{user.name}</p>
          <p className="user-email">{user.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    { label: "My Profile", key: "profile" },
    { label: "Logout", key: "logout" },
  ];

  const handleUserMenuClick = (info) => {
    if (info.key === "profile") navigate("/profile");
    if (info.key === "logout") {
      localStorage.clear();
      navigate("/");
    }
  };

  // Dropdown items for "Categories"
  const categoryItems = [
    { key: "mobiles", label: "Mobiles", onClick: () => navigate("/category/mobiles") },
    { key: "clothes", label: "Clothes", onClick: () => navigate("/category/clothes") },
    { key: "furniture", label: "Furniture", onClick: () => navigate("/category/furniture") },
    { key: "electronics", label: "Electronics", onClick: () => navigate("/category/electronics") },
    { key: "books", label: "Books", onClick: () => navigate("/category/books") },
  ];

  // Dropdown items for "More"
  const moreItems = [
    { key: "about", label: "About", onClick: () => navigate("/about") },
    { key: "contact", label: "Contact", onClick: () => navigate("/contact") },
    { key: "faq", label: "FAQ", onClick: () => navigate("/faq") },
  ];

  return (
    <Header className={`navbar glass ${scrolled ? "scrolled" : ""}`}>
      {/* Logo */}
      <div className="navbar-left" onClick={() => navigate("/")}>
        <h2 className="logo">
          ReUse<span>Hub</span>
        </h2>
      </div>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li onClick={() => navigate("/")}>Home</li>

        <Dropdown menu={{ items: categoryItems }} trigger={["hover"]} placement="bottomLeft">
          <li className="dropdown-link">Categories</li>
        </Dropdown>

        <li onClick={() => navigate("/products")}>Products</li>

        <Dropdown menu={{ items: moreItems }} trigger={["hover"]} placement="bottomLeft">
          <li className="dropdown-link">More</li>
        </Dropdown>
      </ul>

      {/* User Avatar */}
      <div className="navbar-right">
        <Dropdown menu={{ items: userItems, onClick: handleUserMenuClick }} placement="bottomRight" trigger={["click"]}>
          <div className="user-avatar">
            <Avatar size="large" icon={<UserOutlined />} />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}
