import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import CreateCategoryDrawer from "../components/CreateCategoryDrawer";

export default function CategoryList() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const addCategory = (name) => {
    setCategories([...categories, name]);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "20px", flexGrow: 1 }}>
        <h1>Categories</h1>

        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "10px 20px",
            marginBottom: "20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          + Create Category
        </button>

        <ul>
          {categories.map((c, index) => (
            <li key={index} style={{ fontSize: "18px", marginBottom: "8px" }}>
              {c}
            </li>
          ))}
        </ul>

        <CreateCategoryDrawer
          open={open}
          onClose={() => setOpen(false)}
          addCategory={addCategory}
        />
      </div>
    </div>
  );
}
