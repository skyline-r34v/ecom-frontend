import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/User.css";
import api from "../api";
import { useNavigate } from "react-router-dom";

/* ================= API CALLS ================= */

// Fetch users
export const fetchAllUsers = async (searchTerm = "", page = 1, size = 10) => {
  const response = await api.post("/users/list", {
    page,
    size,
    search: searchTerm,
  });

  return response.data;
};

// Update user
export const updateUser = async (id, update) => {
  return api.post("/users/update", {
    id,
    update,
  });
};

/* ================= PAGE ================= */

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  /* ================= LOAD USERS ================= */

  const loadUsers = async () => {
    try {
      setLoading(true);

      const res = await fetchAllUsers(searchTerm, 1, 10);

      setUsers(res?.data || []);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm]);

  /* ================= VIEW USER ================= */

  const viewUser = (id) => {
    navigate(`/users/${id}`);
  };

  /* ================= TOGGLE USER STATUS ================= */

  const handleToggleStatus = async (user) => {
    try {
      await updateUser(user._id, {
        isActive: !user.isActive,
      });

      loadUsers();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  /* ================= UI ================= */

  return (
    <div>
      <Navbar />

      <div className="category-page-row-container">
        <aside className="category-sidebar">
          <Sidebar />
        </aside>

        <main className="category-row-content">

          {/* HEADER */}
          <div className="category-header-row">
            <h1>Users</h1>
          </div>

          {/* SEARCH */}
          <input
            type="text"
            className="category-search"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* USER GRID */}
          <div className="category-grid">
            {loading ? (
              <div className="grid-loader-container">
                <div className="grid-loader"></div>
              </div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div
                  className="category-card user-card"
                  key={user._id}
                  onClick={() => viewUser(user._id)}
                >
                  <h3>{user.name}</h3>

                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>

                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`user-status ${
                        user.isActive ? "active" : "inactive"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>

                  <p>
                    <strong>Joined:</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>

                  {/* ACTION BUTTON */}
                  <button
                    className={`user-toggle-btn ${
                      user.isActive ? "deactivate" : "activate"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(user);
                    }}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))
            ) : (
              <p>No users found</p>
            )}
          </div>

          {error && <p className="error-state-container">{error}</p>}
        </main>
      </div>
    </div>
  );
}