import React from "react";
import { Link } from "react-router-dom";
import "../style/Sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>E-Commerce</h2>

      <ul>
        <li>
          <Link to="/">Dashboard</Link>
        </li>

        <li>
          <Link to="/categories">Categories</Link>
        </li>
      </ul>
    </div>
  );
}
