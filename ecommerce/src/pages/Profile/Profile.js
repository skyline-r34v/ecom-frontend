import React, { useEffect, useState } from "react";
import "../../styles/profile.css";
import api from "../../api";
import Navbar from "../../components/Navbar";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);

  const emptyAddress = {
    label: "",
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    isDefault: false,
  };

  const [form, setForm] = useState({});
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editAddressIndex, setEditAddressIndex] = useState(null);

  // LOAD PROFILE
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setError("User not logged in.");
      return;
    }

    api
      .post("/users/profile", { userId })
      .then((res) => {
        if (res.data?.data) {
          setProfile(res.data.data);
          setForm(res.data.data);
        } else {
          setError("Profile not found.");
        }
      })
      .catch(() => setError("Failed to fetch profile."));
  }, []);

  // PROFILE INPUT CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ADDRESS INPUT CHANGE
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;

    setAddressForm({
      ...addressForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // SAVE PROFILE
  const handleSave = async () => {
    try {
      const userId = localStorage.getItem("userId");

      const payload = {
        userId,
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        bio: form.bio,
        addresses: profile.addresses || [],
      };

      const res = await api.post("/users/profile", payload);

      if (res.data.success) {
        setProfile(res.data.data);
        setIsEditing(false);
      }
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  // SAVE ADDRESS
  const handleSaveAddress = async () => {
    if (!addressForm.label || !addressForm.street) {
      alert("Label and Street are required");
      return;
    }

    let updatedAddresses = [...(profile.addresses || [])];

    if (editAddressIndex !== null) {
      updatedAddresses[editAddressIndex] = addressForm;
    } else {
      updatedAddresses.push(addressForm);
    }

    if (addressForm.isDefault) {
      updatedAddresses = updatedAddresses.map((addr, idx) => ({
        ...addr,
        isDefault: idx === (editAddressIndex ?? updatedAddresses.length - 1),
      }));
    }

    const userId = localStorage.getItem("userId");

    try {
      const res = await api.post("/users/profile", {
        userId,
        addresses: updatedAddresses,
      });

      if (res.data.success) {
        setProfile(res.data.data);
        setShowAddressForm(false);
        setAddressForm(emptyAddress);
        setEditAddressIndex(null);
      }
    } catch (err) {
      alert("Failed to save address.");
    }
  };

  // DELETE ADDRESS
  const handleDeleteAddress = async (index) => {
    if (!window.confirm("Delete this address?")) return;

    const updatedAddresses = profile.addresses.filter((_, i) => i !== index);

    const userId = localStorage.getItem("userId");

    try {
      const res = await api.post("/users/profile", {
        userId,
        addresses: updatedAddresses,
      });

      if (res.data.success) setProfile(res.data.data);
    } catch {
      alert("Failed to delete address.");
    }
  };

  // EDIT ADDRESS
  const handleEditAddress = (index) => {
    setAddressForm(profile.addresses[index]);
    setEditAddressIndex(index);
    setShowAddressForm(true);
  };

  // SET DEFAULT ADDRESS
  const handleDefaultAddress = async (index) => {
    const updatedAddresses = profile.addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index,
    }));

    const userId = localStorage.getItem("userId");

    try {
      const res = await api.post("/users/profile", {
        userId,
        addresses: updatedAddresses,
      });

      if (res.data.success) setProfile(res.data.data);
    } catch {
      alert("Failed to update default address.");
    }
  };

  if (error) return <p className="loading">{error}</p>;
  if (!profile) return <p className="loading">Loading profile...</p>;

  return (
    <div>
      <Navbar />

      <div className="account-wrapper">

        {/* SIDEBAR */}
        <div className="account-sidebar">
          <h3>Your Account</h3>
          <ul>
            <li className="active">Profile</li>
            <li>Addresses</li>
            <li>Security</li>
            <li>Orders</li>
          </ul>
        </div>

        {/* CONTENT */}
        <div className="account-content">

          {/* PROFILE */}
          <div className="account-card">
            <div className="card-header">
              <h2>Profile Information</h2>

              <button
                className="link-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            <div className="profile-section">
              <img
                src={
                  profile.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="avatar"
                className="avatar"
              />

              <div className="profile-details">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <h3>{profile.name}</h3>
                )}

                <p>{profile.email}</p>
                <span className="role-badge">{profile.role}</span>
              </div>
            </div>
          </div>

          {/* BASIC DETAILS */}
          <div className="account-card">
            <h3 className="section-title">Basic Details</h3>

            <div className="info-grid">
              <div>
                <label>Phone</label>

                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={form.phone || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile.phone || "Not added"}</p>
                )}
              </div>

              <div>
                <label>Gender</label>

                {isEditing ? (
                  <select
                    name="gender"
                    value={form.gender || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                ) : (
                  <p>{profile.gender || "Not added"}</p>
                )}
              </div>

              <div>
                <label>Date of Birth</label>

                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={
                      form.dateOfBirth
                        ? form.dateOfBirth.substring(0, 10)
                        : ""
                    }
                    onChange={handleChange}
                  />
                ) : (
                  <p>
                    {profile.dateOfBirth
                      ? profile.dateOfBirth.substring(0, 10)
                      : "Not added"}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <button className="primary-btn" onClick={handleSave}>
                Save Changes
              </button>
            )}
          </div>

          {/* ADDRESSES */}
          <div className="account-card">
            <div className="card-header">
              <h3>Saved Addresses</h3>

              <button
                className="primary-btn small"
                onClick={() => {
                  setAddressForm(emptyAddress);
                  setEditAddressIndex(null);
                  setShowAddressForm(true);
                }}
              >
                + Add Address
              </button>
            </div>

            <div className="address-grid">
              {(profile.addresses || []).map((addr, i) => (
                <div key={i} className="address-card">
                  <h4>
                    {addr.label}
                    {addr.isDefault && (
                      <span className="default-chip">Default</span>
                    )}
                  </h4>

                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state}</p>
                  <p>{addr.country} - {addr.postalCode}</p>

                  <div className="card-actions">
                    <button onClick={() => handleEditAddress(i)}>
                      Edit
                    </button>

                    <button onClick={() => handleDeleteAddress(i)}>
                      Delete
                    </button>

                    {!addr.isDefault && (
                      <button onClick={() => handleDefaultAddress(i)}>
                        Set Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ADDRESS FORM */}
            {showAddressForm && (
              <div className="address-form">

                <h3>
                  {editAddressIndex !== null
                    ? "Edit Address"
                    : "Add Address"}
                </h3>

                <input
                  type="text"
                  name="label"
                  placeholder="Label (Home/Work)"
                  value={addressForm.label}
                  onChange={handleAddressChange}
                />

                <input
                  type="text"
                  name="street"
                  placeholder="Street"
                  value={addressForm.street}
                  onChange={handleAddressChange}
                />

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                />

                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={addressForm.state}
                  onChange={handleAddressChange}
                />

                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={addressForm.country}
                  onChange={handleAddressChange}
                />

                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={addressForm.postalCode}
                  onChange={handleAddressChange}
                />

                <label>
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleAddressChange}
                  />
                  Set as Default
                </label>

                <div className="form-actions">
                  <button
                    className="primary-btn"
                    onClick={handleSaveAddress}
                  >
                    Save Address
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setShowAddressForm(false);
                      setAddressForm(emptyAddress);
                      setEditAddressIndex(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}