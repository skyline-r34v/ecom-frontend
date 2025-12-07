import React, { useEffect, useState } from "react";
import axios from "axios";
import "/Users/govind/eventfronted/event/ecomm fi/ecom-frontend/ecommerce/src/styles/profile.css";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axios
      .get("https://s657g66h-7045.inc1.devtunnels.ms/api/profile/me", {
        withCredentials: true,
      })
      .then((res) => setProfile(res.data))
      .catch((err) => {
        console.log("API Error:", err);

        // Dummy fallback data
        setProfile({
          avatar: "",
          bio: "Passionate about ecommerce.",
          kycVerified: false,
          phone: "9876543210",
          gender: "male",
          dateOfBirth: "2000-05-15",

          addresses: [
            {
              label: "Home",
              street: "B-22 Sample Street",
              city: "Surat",
              state: "Gujarat",
              country: "India",
              postalCode: "395006",
              isDefault: true,
            },
            {
              label: "Work",
              street: "Office Tower 18",
              city: "Surat",
              state: "Gujarat",
              country: "India",
              postalCode: "395002",
              isDefault: false,
            },
          ],

          wishlist: ["Diamond Ring", "Gold Chain", "Smart Watch"],
        });
      });
  }, []);

  if (!profile) return <p className="loading">Loading...</p>;

  return (
    <div className="profile-container">
      
      {/* 🔙 Back Button */}
      <button className="back-btn" onClick={() => window.history.back()}>
        ← Back
      </button>

      {/* HEADER */}
      <div className="profile-header">
        <img
          src={profile.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
          alt="Avatar"
          className="profile-avatar"
        />

        <div>
          <h2 className="profile-title">User Profile</h2>
          <p className="profile-bio">{profile.bio || "No bio added"}</p>
          <p className="profile-kyc">
            {profile.kycVerified ? "✔ KYC Verified" : "❌ KYC Not Verified"}
          </p>
        </div>
      </div>

      {/* BASIC INFO */}
      <div className="profile-card">
        <h3 className="card-title">Basic Information</h3>
        <p><strong>Phone:</strong> {profile.phone || "Not added"}</p>
        <p><strong>Gender:</strong> {profile.gender}</p>
        <p>
          <strong>Date of Birth:</strong>{" "}
          {profile.dateOfBirth
            ? profile.dateOfBirth.substring(0, 10)
            : "Not added"}
        </p>
      </div>

      {/* ADDRESSES */}
      <div className="profile-card">
        <h3 className="card-title">Addresses</h3>

        {profile.addresses.length === 0 ? (
          <p>No addresses added.</p>
        ) : (
          profile.addresses.map((addr, i) => (
            <div key={i} className="address-box">
              <p className="address-label">
                {addr.label}{" "}
                {addr.isDefault && <span className="default-tag">Default</span>}
              </p>
              <p>{addr.street}</p>
              <p>
                {addr.city}, {addr.state} — {addr.country}
              </p>
              <p>Postal Code: {addr.postalCode}</p>
            </div>
          ))
        )}
      </div>

      {/* WISHLIST */}
      <div className="profile-card">
        <h3 className="card-title">Wishlist</h3>

        {profile.wishlist.length === 0 ? (
          <p>No items in wishlist.</p>
        ) : (
          <ul className="wishlist-list">
            {profile.wishlist.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
