import React from "react";
import { Layout, Avatar, Dropdown } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

export default function Navbar() {
  const navigate = useNavigate();

  // 1. Retrieve user data from localStorage
  const user = {
    name: localStorage.getItem("name") || "User",
    email: localStorage.getItem("email") || "user@example.com",
  };

  const handleMenuClick = ({ key }) => {
    if (key === "profile") navigate("/profile");
    if (key === "logout") {
      localStorage.clear(); // clears ALL localStorage entries (be mindful if you have other keys)
      navigate("/");
    }
  };

  // 2. Create a custom header item for the user info
  const userInfoItem = {
    key: "userInfo",
    label: (
      <div style={{ padding: "8px 12px" }}>
        <p style={{ margin: 0, fontWeight: "bold" }}>{user.name}</p>
        <p style={{ margin: 0, fontSize: "12px", color: "gray" }}>{user.email}</p>
      </div>
    ),
    type: 'group', // Use 'group' to make it non-clickable
  };

  // 3. Define the menu items, including a separator and the user actions
  const items = [
    userInfoItem,
    { type: 'divider' }, // Visual separator
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
      }}
    >
      <Dropdown
        menu={{ items, onClick: handleMenuClick }}
        placement="bottomRight"
        trigger={['click']} // Good practice to use click for dropdown menus
      >
        {/* Container for the avatar and name/email if you wanted them visible outside the dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <Avatar
            size="large"
            icon={<UserOutlined />}
            style={{ marginRight: '10px' }} // Added a small margin for spacing
          />
          {/* Optionally show the name next to the avatar (uncomment below if desired) */}
          {/* <span style={{ fontWeight: '500' }}>{user.name}</span> */}
        </div>
      </Dropdown>
    </Header>
  );
}