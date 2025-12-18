import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/categories.css";
import api from "../api";
import { useNavigate } from "react-router-dom";

// FETCH USERS
export const fetchAllUsers = async (searchTerm = "", page = 1, size = 10) => {
  const data = { page, size, search: searchTerm };
  const response = await api.post("/users/list", data);
  return response.data;
};

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const loadUsers = async () => {
    try {
      setLoading(true);

      const res = await fetchAllUsers(searchTerm, 1, 10);

      // ✅ IMPORTANT FIX (based on backend response)
      setUsers(res?.data?.users || []);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm]);

  const viewUser = (id) => {
    navigate(`/users/${id}`);
  };

  return (
    <div>
      <Navbar />

      <div className="category-page-row-container">
        <aside className="category-sidebar">
          <Sidebar />
        </aside>

        <main className="category-row-content">
          <div className="category-header-row">
            <h1>Users</h1>
          </div>

          <input
            type="text"
            className="category-search"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="category-grid">
            {loading ? (
              <div className="grid-loader-container">
                <div className="grid-loader"></div>
              </div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div
                  className="category-card"
                  key={user._id}
                  onClick={() => viewUser(user._id)}
                  style={{ cursor: "pointer" }}
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
                    {user.isActive ? "Active" : "Inactive"}
                  </p>

                  <p>
                    <strong>Joined:</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
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
