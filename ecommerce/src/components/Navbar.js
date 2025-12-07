import React from "react";
import { Layout, Avatar, Dropdown } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

export default function Navbar() {
  const navigate = useNavigate();

  // User data
  const user = {
    name: localStorage.getItem("name") || "User",
    email: localStorage.getItem("email") || "user@example.com",
  };

  // Handle dropdown clicks
  const handleMenuClick = (info) => {
    if (info.key === "profile") {
      navigate("/profile");
    }

    if (info.key === "logout") {
      localStorage.clear();
      navigate("/");
    }
  };

  // Dropdown menu items
  const items = [
    {
      key: "userInfo",
      label: (
        <div style={{ padding: "8px 12px" }}>
          <p style={{ margin: 0, fontWeight: "bold" }}>{user.name}</p>
          <p style={{ margin: 0, fontSize: "12px", color: "gray" }}>{user.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    { label: "My Profile", key: "profile" },
    { label: "Logout", key: "logout" },
  ];

  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingRight: "20px",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        zIndex: 100,
      }}
    >
      <Dropdown
        menu={{ items, onClick: handleMenuClick }}
        placement="bottomRight"
        trigger={["click"]}
      >
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <Avatar size="large" icon={<UserOutlined />} style={{ marginRight: "10px" }} />
        </div>
      </Dropdown>
    </Header>
  );
}
