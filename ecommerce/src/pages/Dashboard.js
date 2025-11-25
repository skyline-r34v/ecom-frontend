import React from "react";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "20px", flexGrow: 1 }}>
        <h1>Dashboard</h1>
        <p>Welcome to your admin dashboard.</p>
      </div>
    </div>
  );
}
