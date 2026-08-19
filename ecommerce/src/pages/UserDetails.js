import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api";
import "../styles/UserDetails.css";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "",
    isActive: true,
  });

  /* ================= FETCH USER ================= */

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.post("/users/profile", { userId: id });
      const userData = res.data?.data;

      if (!userData) {
        message.error("User not found");
        navigate("/users");
        return;
      }

      setUser(userData);
      setForm({
        name: userData.name || "",
        email: userData.email || "",
        mobile: userData.mobile || "",
        role: userData.role || "customer",
        isActive: userData.isActive !== false,
      });
    } catch (err) {
      console.error(err);
      message.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  /* ================= SAVE CHANGES ================= */

  const handleSave = async () => {
    try {
      setSaving(true);

      await api.post("/users/update", {
        id: user._id,
        update: {
          name: form.name,
          email: form.email,
          mobile: form.mobile,
          role: form.role,
          isActive: form.isActive,
        },
      });

      message.success("User updated successfully");
      setEditing(false);
      fetchUser();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  /* ================= TOGGLE STATUS ================= */

  const handleToggleStatus = async () => {
    try {
      await api.post("/users/update", {
        id: user._id,
        update: { isActive: !user.isActive },
      });

      message.success(
        `User ${user.isActive ? "deactivated" : "activated"} successfully`
      );
      fetchUser();
    } catch (err) {
      message.error("Failed to update status");
    }
  };

  /* ================= INPUT HANDLER ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="ud-page">
          <Sidebar />
          <div className="ud-content">
            <p className="ud-loading">Loading user details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <Navbar />

      <div className="ud-page">
        <aside className="ud-sidebar">
          <Sidebar />
        </aside>

        <main className="ud-content">
          {/* HEADER */}
          <div className="ud-header">
            <button className="ud-back-btn" onClick={() => navigate("/users")}>
              ← Back to Users
            </button>
            <h1 className="ud-title">User Details</h1>
          </div>

          {/* USER PROFILE CARD */}
          <div className="ud-profile-card">
            {/* Avatar & Name Header */}
            <div className="ud-profile-top">
              <div className="ud-avatar">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="ud-name-section">
                <h2>{user.name}</h2>
                <p className="ud-email-display">{user.email}</p>
                <span
                  className={`ud-status-pill ${
                    user.isActive ? "active" : "inactive"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="ud-info-grid">
              <div className="ud-info-item">
                <label>User ID</label>
                <p>{user._id}</p>
              </div>
              <div className="ud-info-item">
                <label>Role</label>
                <p className="ud-role-badge">{user.role}</p>
              </div>
              <div className="ud-info-item">
                <label>Mobile</label>
                <p>{user.mobile || "Not provided"}</p>
              </div>
              <div className="ud-info-item">
                <label>Joined</label>
                <p>{new Date(user.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}</p>
              </div>
            </div>
          </div>

          {/* EDIT SECTION */}
          <div className="ud-edit-section">
            <div className="ud-edit-header">
              <h3>Manage User</h3>
              {!editing ? (
                <button
                  className="ud-edit-btn"
                  onClick={() => setEditing(true)}
                >
                  ✏️ Edit User
                </button>
              ) : (
                <button
                  className="ud-cancel-btn"
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      name: user.name || "",
                      email: user.email || "",
                      mobile: user.mobile || "",
                      role: user.role || "customer",
                      isActive: user.isActive !== false,
                    });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>

            {editing ? (
              <div className="ud-form">
                <div className="ud-form-group">
                  <label>Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full name"
                  />
                </div>

                <div className="ud-form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email address"
                  />
                </div>

                <div className="ud-form-group">
                  <label>Mobile</label>
                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Mobile number"
                  />
                </div>

                <div className="ud-form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="transporter">Transporter</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                <button
                  className="ud-save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : (
              /* Quick Actions */
              <div className="ud-quick-actions">
                <button
                  className={`ud-status-toggle ${
                    user.isActive ? "deactivate" : "activate"
                  }`}
                  onClick={handleToggleStatus}
                >
                  {user.isActive ? "🚫 Deactivate User" : "✅ Activate User"}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
