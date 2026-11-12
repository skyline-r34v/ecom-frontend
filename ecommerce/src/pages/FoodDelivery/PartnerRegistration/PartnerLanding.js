import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStore,
  FaArrowRight,
  FaShieldAlt,
  FaMoneyBillWave,
  FaClock,
  FaFileAlt,
  FaMobileAlt,
  FaSearch,
  FaAward,
  FaCheckCircle,
  FaChartLine
} from "react-icons/fa";
import FoodRoleSwitcher from "../../../components/FoodRoleSwitcher";
import Navbar from "../../../components/Navbar";
import useFoodDeliveryStore from "../../../store/foodDeliveryStore";
import "../../../styles/partnerRegistration.css";

export default function PartnerLanding() {
  const navigate = useNavigate();
  const partnerApplications = useFoodDeliveryStore((state) => state.partnerApplications);
  const [trackAppId, setTrackAppId] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    setTrackError("");
    setTrackResult(null);

    const cleanId = trackAppId.trim().toUpperCase();
    if (!cleanId) return;

    const found = partnerApplications.find(
      (a) =>
        a.applicationNumber.toUpperCase() === cleanId ||
        a.id.toUpperCase() === cleanId ||
        a.restaurant.name.toLowerCase().includes(trackAppId.trim().toLowerCase()) ||
        a.owner.mobile.includes(trackAppId.trim())
    );

    if (found) {
      setTrackResult(found);
    } else {
      setTrackError(`No registration application found matching "${trackAppId}". Please check your Application ID (e.g. REST-2026-00125) or mobile number.`);
    }
  };

  const faqs = [
    {
      q: "What documents are required for restaurant registration?",
      a: "Depending on your entity type and local regulations, standard required documents include: (1) FSSAI Food License / Registration, (2) Business or Address Proof (Electricity bill / Rent agreement), (3) PAN Card of authorized person/business, and (4) GST Certificate (if applicable). Admin compliance will review all documents before granting go-live approval."
    },
    {
      q: "How long does the verification and approval process take?",
      a: "Once you submit your completed application with all required documents and bank payout details, our compliance audit team reviews the details. You can track real-time progress on your partner dashboard."
    },
    {
      q: "Can I accept orders before my documents are verified?",
      a: "No. In strict compliance with food safety and marketplace regulations, a restaurant cannot receive customer orders until its verification status is marked APPROVED by the platform administration and operational status is ACTIVE."
    },
    {
      q: "How do restaurant payouts work?",
      a: "Payouts are directly credited to your verified bank account via automated settlements. Your sensitive financial information is encrypted and masked for maximum security."
    },
    {
      q: "What happens if a document is rejected during review?",
      a: "If any document is unclear or requires correction, the admin specifies a clear reason and your dashboard will show 'Action Required'. You can easily upload a replacement document directly from your dashboard without restarting the registration process."
    }
  ];

  return (
    <div className="food-portal-container partner-landing-page">
      <FoodRoleSwitcher />
      <Navbar />

      {/* Hero Section */}
      <section className="partner-hero-section">
        <div className="partner-hero-content">
          <div className="partner-badge-chip">
            <span className="live-pulse-dot" style={{ background: "#10b981" }} />
            <span>0% Commission for First 30 Days • Instant Onboarding</span>
          </div>

          <h1 className="partner-hero-title">
            Partner with <span className="highlight-text">OneKart Food</span> & Grow Your Restaurant 3X
          </h1>

          <p className="partner-hero-subtitle">
            Join thousands of premier restaurants, cafes, cloud kitchens, and bakeries. Connect directly to food lovers, receive verified orders, and manage live dispatches seamlessly.
          </p>

          <div className="partner-hero-actions">
            <button
              className="btn-partner-primary"
              onClick={() => navigate("/food/partner-register")}
            >
              <FaStore />
              <span>Register Your Restaurant</span>
              <FaArrowRight />
            </button>

            <a href="#track-section" className="btn-partner-secondary">
              <FaSearch />
              <span>Track Application Status</span>
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="partner-metrics-bar">
            <div className="metric-item">
              <strong>12,000+</strong>
              <span>Verified Outlets</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <strong>4.8 ★</strong>
              <span>Partner Satisfaction</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <strong>₹0</strong>
              <span>Setup / Onboarding Fee</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <strong>24–48 hrs</strong>
              <span>Fast Track Audit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Step Journey Roadmap */}
      <section className="partner-roadmap-section">
        <div className="section-header-center">
          <span className="section-eyebrow">Seamless 6-Step Onboarding</span>
          <h2>How Restaurant Verification Works</h2>
          <p>A transparent, compliance-first verification pipeline ensuring top safety & trust for customers.</p>
        </div>

        <div className="roadmap-grid">
          <div className="roadmap-card">
            <div className="step-num">01</div>
            <div className="step-icon"><FaMobileAlt /></div>
            <h3>Account & OTP</h3>
            <p>Create authorized owner account and verify mobile number with a secure 6-digit OTP.</p>
          </div>

          <div className="roadmap-card">
            <div className="step-num">02</div>
            <div className="step-icon"><FaStore /></div>
            <h3>Restaurant Info & Map</h3>
            <p>Enter outlet name, cuisine, operational hours, GPS coordinates, and upload kitchen/front photos.</p>
          </div>

          <div className="roadmap-card">
            <div className="step-num">03</div>
            <div className="step-icon"><FaAward /></div>
            <h3>Business Details</h3>
            <p>Provide legal entity name, FSSAI license number, GSTIN, and business address details.</p>
          </div>

          <div className="roadmap-card">
            <div className="step-num">04</div>
            <div className="step-icon"><FaFileAlt /></div>
            <h3>Document Upload</h3>
            <p>Upload FSSAI certificate, address proof, and PAN card via private encrypted storage.</p>
          </div>

          <div className="roadmap-card">
            <div className="step-num">05</div>
            <div className="step-icon"><FaMoneyBillWave /></div>
            <h3>Payout Details</h3>
            <p>Enter bank account and IFSC code with auto-lookup and masked security preview.</p>
          </div>

          <div className="roadmap-card">
            <div className="step-num">06</div>
            <div className="step-icon"><FaShieldAlt /></div>
            <h3>Admin Approval & Go-Live</h3>
            <p>Admin verifies documents. Once approved, the Verified Partner badge unlocks and orders go live!</p>
          </div>
        </div>
      </section>

      {/* Benefits & Value Proposition */}
      <section className="partner-benefits-section">
        <div className="section-header-center">
          <span className="section-eyebrow">Why Partner With Us?</span>
          <h2>Everything You Need to Scale Your Food Brand</h2>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
              <FaShieldAlt />
            </div>
            <h3>✓ Verified Restaurant Badge</h3>
            <p>Gain customer trust instantly with official compliance verification badges displayed on your menu page.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: "#eff6ff", color: "#3b82f6" }}>
              <FaClock />
            </div>
            <h3>Automated Dispatch Engine</h3>
            <p>Smart dual-OTP dispatch system assigns the nearest verified delivery rider automatically upon food readiness.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
              <FaMoneyBillWave />
            </div>
            <h3>Encrypted Payouts & Daily Settlements</h3>
            <p>Transparent accounting with masked account numbers, zero hidden charges, and instant withdrawal triggers.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: "#f5f3ff", color: "#8b5cf6" }}>
              <FaChartLine />
            </div>
            <h3>Live Menu & Inventory Control</h3>
            <p>Enable/disable dishes on the fly, adjust preparation times, run special discounts, and manage daily stock.</p>
          </div>
        </div>
      </section>

      {/* Application Status Tracker Section */}
      <section id="track-section" className="partner-track-section">
        <div className="track-container-card">
          <div className="track-header">
            <FaSearch size={24} color="#ff5200" />
            <div>
              <h3>Track Your Verification Application</h3>
              <p>Already submitted? Enter your Application ID (e.g. <code>REST-2026-00125</code>) or registered phone number.</p>
            </div>
          </div>

          <form onSubmit={handleTrackSubmit} className="track-form">
            <input
              type="text"
              placeholder="Enter Application ID (e.g. REST-2026-00125) or Mobile..."
              value={trackAppId}
              onChange={(e) => setTrackAppId(e.target.value)}
              className="track-input"
            />
            <button type="submit" className="btn-track-submit">
              Track Status
            </button>
          </form>

          {trackError && (
            <div className="track-error-box">
              <span>⚠️</span>
              <div>{trackError}</div>
            </div>
          )}

          {trackResult && (
            <div className="track-result-card">
              <div className="track-result-header">
                <div>
                  <span className="app-id-label">{trackResult.applicationNumber}</span>
                  <h4>{trackResult.restaurant.name}</h4>
                  <div className="owner-sub">{trackResult.owner.name} • {trackResult.restaurant.city}</div>
                </div>

                <div className={`status-pill status-${trackResult.verificationStatus.toLowerCase()}`}>
                  {trackResult.verificationStatus === "APPROVED" && "🟢 VERIFIED & ACTIVE"}
                  {trackResult.verificationStatus === "UNDER_REVIEW" && "🟡 UNDER REVIEW"}
                  {trackResult.verificationStatus === "ACTION_REQUIRED" && "🔴 ACTION REQUIRED"}
                  {trackResult.verificationStatus === "REJECTED" && "❌ REJECTED"}
                  {trackResult.verificationStatus === "SUSPENDED" && "⛔ SUSPENDED"}
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="verification-timeline-mini">
                <div className="timeline-step done">
                  <div className="step-circle"><FaCheckCircle /></div>
                  <span>Account</span>
                </div>
                <div className="timeline-line done" />
                <div className="timeline-step done">
                  <div className="step-circle"><FaCheckCircle /></div>
                  <span>Restaurant</span>
                </div>
                <div className="timeline-line done" />
                <div className="timeline-step done">
                  <div className="step-circle"><FaCheckCircle /></div>
                  <span>Business</span>
                </div>
                <div className="timeline-line done" />
                <div className="timeline-step done">
                  <div className="step-circle"><FaCheckCircle /></div>
                  <span>Documents</span>
                </div>
                <div className="timeline-line active" />
                <div className={`timeline-step ${trackResult.verificationStatus === "APPROVED" ? "done" : "active"}`}>
                  <div className="step-circle">
                    {trackResult.verificationStatus === "APPROVED" ? <FaCheckCircle /> : "⏳"}
                  </div>
                  <span>Admin Review</span>
                </div>
              </div>

              {trackResult.verificationStatus === "ACTION_REQUIRED" && (
                <div className="action-required-alert">
                  <strong>⚠️ Correction Required:</strong>
                  <p>{trackResult.rejectionReason || "One or more documents require correction."}</p>
                  <button
                    onClick={() => {
                      useFoodDeliveryStore.getState().setSelectedRestaurant(trackResult.restaurantId);
                      useFoodDeliveryStore.getState().setActiveRole("RESTAURANT");
                      navigate("/food/restaurant");
                    }}
                    className="btn-correct-docs"
                  >
                    Replace Document in Partner Dashboard →
                  </button>
                </div>
              )}

              {trackResult.verificationStatus === "APPROVED" && (
                <div className="approved-alert">
                  <strong>🎉 Verified Restaurant Partner:</strong>
                  <p>Your restaurant is active and ready to accept customer orders.</p>
                  <button
                    onClick={() => {
                      useFoodDeliveryStore.getState().setSelectedRestaurant(trackResult.restaurantId);
                      useFoodDeliveryStore.getState().setActiveRole("RESTAURANT");
                      navigate("/food/restaurant");
                    }}
                    className="btn-go-to-dashboard"
                  >
                    Open Restaurant Dashboard →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="partner-faq-section">
        <div className="section-header-center">
          <span className="section-eyebrow">Frequently Asked Questions</span>
          <h2>Got Questions? We’ve Got Answers.</h2>
        </div>

        <div className="faq-accordion-list">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`faq-accordion-item ${openFaq === idx ? "open" : ""}`}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                <span className="faq-icon">{openFaq === idx ? "−" : "+"}</span>
              </div>
              {openFaq === idx && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="partner-cta-banner">
        <div className="cta-banner-content">
          <h2>Ready to Launch Your Kitchen on OneKart?</h2>
          <p>Complete the 6-step registration and get your verified partner badge today.</p>
          <button
            className="btn-partner-cta-large"
            onClick={() => navigate("/food/partner-register")}
          >
            Start Partner Registration Now →
          </button>
        </div>
      </section>
    </div>
  );
}
