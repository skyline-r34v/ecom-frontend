import React, { useEffect, useState } from "react";
import "../../styles/profile.css";
import api from "../../api";

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

  // Load Profile
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
        addresses: profile.addresses,
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

  // ADD OR EDIT ADDRESS
  const handleSaveAddress = async () => {
    if (!addressForm.label || !addressForm.street) {
      alert("Label and Street are required");
      return;
    }

    let updatedAddresses = [...profile.addresses];

    // If editing existing address
    if (editAddressIndex !== null) {
      updatedAddresses[editAddressIndex] = addressForm;
    } else {
      updatedAddresses.push(addressForm);
    }

    // Ensure only one default address
    if (addressForm.isDefault) {
      updatedAddresses = updatedAddresses.map((addr, idx) => ({
        ...addr,
        isDefault: idx === (editAddressIndex ?? updatedAddresses.length - 1),
      }));
    }

    const userId = localStorage.getItem("userId");
    const payload = { userId, addresses: updatedAddresses };

    try {
      const res = await api.post("/users/profile", payload);
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
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    const updatedAddresses = profile.addresses.filter((_, i) => i !== index);

    const userId = localStorage.getItem("userId");
    try {
      const res = await api.post("/users/profile", { userId, addresses: updatedAddresses });
      if (res.data.success) setProfile(res.data.data);
    } catch (err) {
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
      const res = await api.post("/users/profile", { userId, addresses: updatedAddresses });
      if (res.data.success) setProfile(res.data.data);
    } catch (err) {
      alert("Failed to update default address.");
    }
  };

  if (error) return <p className="loading">{error}</p>;
  if (!profile) return <p className="loading">Loading profile...</p>;

  return (
    <div className="profile-container">
      <button className="back-btn" onClick={() => window.history.back()}>
        ← Back
      </button>

      {/* HEADER */}
      <div className="profile-header">
        <img
          src={
            profile.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt="Avatar"
          className="profile-avatar"
        />

        <div>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="edit-input"
            />
          ) : (
            <h2 className="profile-title">{profile.name}</h2>
          )}

          <p className="profile-bio">{profile.email}</p>
          <p className="profile-kyc capitalize">{profile.role}</p>
        </div>

        <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {/* BASIC INFO */}
      <div className="profile-card">
        <h3 className="card-title">Basic Information</h3>

        <p>
          <strong>Phone:</strong>{" "}
          {isEditing ? (
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="edit-input"
            />
          ) : (
            profile.phone || "Not added"
          )}
        </p>

        <p>
          <strong>Gender:</strong>{" "}
          {isEditing ? (
            <select
              name="gender"
              value={form.gender || ""}
              onChange={handleChange}
              className="edit-select"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          ) : (
            profile.gender || "Not added"
          )}
        </p>

        <p>
          <strong>Date of Birth:</strong>{" "}
          {isEditing ? (
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth ? form.dateOfBirth.substring(0, 10) : ""}
              onChange={handleChange}
              className="edit-input"
            />
          ) : profile.dateOfBirth ? (
            profile.dateOfBirth.substring(0, 10)
          ) : (
            "Not added"
          )}
        </p>

        <p>
          <strong>Bio:</strong>{" "}
          {isEditing ? (
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="edit-textarea"
            />
          ) : (
            profile.bio || "Not added"
          )}
        </p>
      </div>

      {/* ADDRESSES */}
      <div className="profile-card">
        <h3 className="card-title">Addresses</h3>

        {profile.addresses.length === 0 && <p>No addresses added.</p>}

        {profile.addresses.map((addr, i) => (
          <div key={i} className="address-box">
            <p className="address-label">
              {addr.label}{" "}
              {addr.isDefault && <span className="default-tag">Default</span>}
            </p>
            <p>{addr.street}</p>
            <p>
              {addr.city}, {addr.state}, {addr.country}
            </p>
            <p>Postal Code: {addr.postalCode}</p>

            <div style={{ marginTop: "8px" }}>
              <button
                className="edit-btn"
                onClick={() => handleEditAddress(i)}
              >
                Edit
              </button>
              <button
                className="edit-btn cancel-btn"
                onClick={() => handleDeleteAddress(i)}
                style={{ marginLeft: "8px" }}
              >
                Delete
              </button>
              {!addr.isDefault && (
                <button
                  className="edit-btn"
                  onClick={() => handleDefaultAddress(i)}
                  style={{ marginLeft: "8px" }}
                >
                  Set Default
                </button>
              )}
            </div>
          </div>
        ))}

        {/* ADD NEW ADDRESS */}
        {!showAddressForm && (
          <button
            className="edit-btn"
            style={{ marginTop: "15px" }}
            onClick={() => {
              setAddressForm(emptyAddress);
              setShowAddressForm(true);
              setEditAddressIndex(null);
            }}
          >
            + Add Address
          </button>
        )}

        {/* ADDRESS FORM */}
        {showAddressForm && (
          <div className="address-form">
            <input
              type="text"
              name="label"
              placeholder="Label (Home, Work)"
              value={addressForm.label}
              onChange={handleAddressChange}
              className="edit-input"
            />
            <input
              type="text"
              name="street"
              placeholder="Street"
              value={addressForm.street}
              onChange={handleAddressChange}
              className="edit-input"
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={addressForm.city}
              onChange={handleAddressChange}
              className="edit-input"
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={addressForm.state}
              onChange={handleAddressChange}
              className="edit-input"
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={addressForm.country}
              onChange={handleAddressChange}
              className="edit-input"
            />
            <input
              type="text"
              name="postalCode"
              placeholder="Postal Code"
              value={addressForm.postalCode}
              onChange={handleAddressChange}
              className="edit-input"
            />
            <label style={{ display: "block", marginTop: "10px" }}>
              <input
                type="checkbox"
                name="isDefault"
                checked={addressForm.isDefault}
                onChange={handleAddressChange}
              />
              &nbsp; Set as default address
            </label>

            <button className="save-btn" onClick={handleSaveAddress}>
              {editAddressIndex !== null ? "Save Changes" : "Add Address"}
            </button>
          </div>
        )}
      </div>

      {/* SAVE PROFILE BUTTON */}
      {isEditing && (
        <button className="save-btn" onClick={handleSave}>
          Save Profile Changes
        </button>
      )}
    </div>
  );
}
