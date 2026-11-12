import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaStore,
  FaAward,
  FaFileAlt,
  FaMoneyBillWave,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaSave,
  FaMapMarkerAlt,
  FaCamera,
  FaTrash,
  FaEye,
  FaExchangeAlt,
  FaInfoCircle,
  FaLock,
  FaClock,
  FaTimes,
  FaCloudUploadAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaIdCard,
  FaShieldAlt
} from "react-icons/fa";
import FoodRoleSwitcher from "../../../components/FoodRoleSwitcher";
import Navbar from "../../../components/Navbar";
import useFoodDeliveryStore, { LOCATIONS } from "../../../store/foodDeliveryStore";
import "../../../styles/partnerRegistration.css";

const RESTAURANT_TYPES = ["Restaurant", "Cafe", "Bakery", "Cloud Kitchen", "Fast Food", "Diner", "Other"];

const CUISINE_OPTIONS = [
  "North Indian",
  "South Indian",
  "Biryani",
  "Chinese",
  "Italian & Pizza",
  "Burgers & Fast Food",
  "Continental",
  "Desserts & Shakes",
  "Bakery",
  "Healthy & Salads",
  "Beverages",
  "Other"
];

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const SAMPLE_PHOTO_PRESETS = {
  logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400",
  cover: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
  front: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800",
  kitchen: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800",
  interior: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=800"
};

export default function RestaurantPartnerRegistration() {
  const navigate = useNavigate();

  const submitPartnerApplication = useFoodDeliveryStore((state) => state.submitPartnerApplication);
  const saveDraftPartnerApplication = useFoodDeliveryStore((state) => state.saveDraftPartnerApplication);
  const getDraftPartnerApplication = useFoodDeliveryStore((state) => state.getDraftPartnerApplication);
  const verifyPartnerMobileOTP = useFoodDeliveryStore((state) => state.verifyPartnerMobileOTP);
  const adminDocumentRequirements = useFoodDeliveryStore((state) => state.adminDocumentRequirements);

  // Wizard Step (1: Account, 2: Restaurant, 3: Business, 4: Documents, 5: Payout, 6: Review, 7: Success)
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Account
    ownerName: "",
    ownerMobile: "",
    ownerEmail: "",
    password: "",
    confirmPassword: "",
    isMobileVerified: false,
    isEmailVerified: false,

    // Step 2: Restaurant
    restaurantName: "",
    displayName: "",
    restaurantType: "Restaurant",
    cuisine: "North Indian • Fast Food",
    selectedCuisines: ["North Indian"],
    restaurantPhone: "",
    restaurantEmail: "",
    addressLine: "",
    area: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "",
    latitude: 19.0596,
    longitude: 72.8295,
    locationLabel: "Bandra West, Mumbai",
    openingHours: {
      monday: "10:00 AM - 11:00 PM",
      tuesday: "10:00 AM - 11:00 PM",
      wednesday: "10:00 AM - 11:00 PM",
      thursday: "10:00 AM - 11:00 PM",
      friday: "10:00 AM - 11:30 PM",
      saturday: "10:00 AM - 11:30 PM",
      sunday: "10:00 AM - 11:30 PM"
    },
    photos: {
      logo: SAMPLE_PHOTO_PRESETS.logo,
      cover: SAMPLE_PHOTO_PRESETS.cover,
      front: SAMPLE_PHOTO_PRESETS.front,
      kitchen: SAMPLE_PHOTO_PRESETS.kitchen,
      interior: SAMPLE_PHOTO_PRESETS.interior
    },

    // Step 3: Business
    legalBusinessName: "",
    fssaiNumber: "",
    gstin: "",
    pan: "",
    registrationType: "Proprietorship",
    businessAddress: "",

    // Step 4: Documents (Array of objects)
    documents: [
      {
        id: "doc-fssai",
        type: "FSSAI_LICENSE",
        name: "FSSAI Food License / Registration Certificate",
        required: true,
        fileName: "fssai_cert_sample.pdf",
        fileUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800",
        fileSize: "1.4 MB",
        status: "UPLOADED",
        rejectionReason: "",
        issueDate: "2025-01-15",
        expiryDate: "2028-01-14"
      },
      {
        id: "doc-address",
        type: "ADDRESS_PROOF",
        name: "Business / Address Proof (Electricity Bill / Lease)",
        required: true,
        fileName: "electricity_bill_2026.pdf",
        fileUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800",
        fileSize: "890 KB",
        status: "UPLOADED",
        rejectionReason: "",
        issueDate: "2026-02-01",
        expiryDate: null
      },
      {
        id: "doc-pan",
        type: "PAN_CARD",
        name: "Authorized Signatory PAN Card",
        required: true,
        fileName: "pan_card_signatory.jpg",
        fileUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800",
        fileSize: "450 KB",
        status: "UPLOADED",
        rejectionReason: "",
        issueDate: "2020-03-15",
        expiryDate: null
      }
    ],

    // Step 5: Payout / Bank
    accountHolderName: "",
    bankAccountNumber: "",
    confirmAccountNumber: "",
    ifsc: "HDFC0001234",
    bankName: "HDFC Bank - Bandra West Branch",

    // Step 6: Confirmation
    agreementChecked: false
  });

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState(["1", "2", "3", "4", "5", "6"]);
  const [otpCountdown, setOtpCountdown] = useState(45);
  const [otpError, setOtpError] = useState("");
  const [isOtpSending, setIsOtpSending] = useState(false);

  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  // Save progress toast notification
  const [saveToast, setSaveToast] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Load draft on mount if exists
  useEffect(() => {
    const draft = getDraftPartnerApplication();
    if (draft) {
      setFormData((prev) => ({ ...prev, ...draft }));
    }
  }, [getDraftPartnerApplication]);

  // Handle OTP countdown timer
  useEffect(() => {
    let timer;
    if (showOtpModal && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpModal, otpCountdown]);

  // Form input change handlers
  const handleInputChange = (field, value) => {
    setValidationError("");
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCuisineToggle = (cuisineName) => {
    setFormData((prev) => {
      const current = prev.selectedCuisines || [];
      const updated = current.includes(cuisineName)
        ? current.filter((c) => c !== cuisineName)
        : [...current, cuisineName];
      return {
        ...prev,
        selectedCuisines: updated,
        cuisine: updated.join(" • ") || "Multi-Cuisine"
      };
    });
  };

  const handleHoursChange = (day, value) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: value
      }
    }));
  };

  const handlePhotoUpdate = (slot, url) => {
    setFormData((prev) => ({
      ...prev,
      photos: {
        ...prev.photos,
        [slot]: url
      }
    }));
  };

  // IFSC Auto Bank Lookup Simulation
  const handleIfscChange = (code) => {
    const cleanCode = code.toUpperCase();
    let detectedBank = formData.bankName;

    if (cleanCode.startsWith("HDFC")) detectedBank = "HDFC Bank - Commercial Branch";
    else if (cleanCode.startsWith("SBIN")) detectedBank = "State Bank of India - Main Branch";
    else if (cleanCode.startsWith("ICIC")) detectedBank = "ICICI Bank - City Center Branch";
    else if (cleanCode.startsWith("AXIS") || cleanCode.startsWith("UTIB")) detectedBank = "Axis Bank - Corporate Branch";
    else if (cleanCode.startsWith("KKBK")) detectedBank = "Kotak Mahindra Bank - Express Towers";

    setFormData((prev) => ({
      ...prev,
      ifsc: cleanCode,
      bankName: detectedBank
    }));
  };

  // Location selector presets
  const handleSelectMapLocation = (locKey) => {
    const loc = LOCATIONS[locKey];
    if (loc) {
      setFormData((prev) => ({
        ...prev,
        latitude: loc.lat,
        longitude: loc.lng,
        locationLabel: loc.label,
        area: loc.label.split(",")[0],
        city: "Mumbai"
      }));
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            latitude: Number(pos.coords.latitude.toFixed(4)),
            longitude: Number(pos.coords.longitude.toFixed(4)),
            locationLabel: "Current GPS Position (Verified)"
          }));
        },
        () => {
          // Fallback to Bandra
          handleSelectMapLocation("BANDRA");
        }
      );
    } else {
      handleSelectMapLocation("BANDRA");
    }
  };

  // OTP Verification Handlers
  const handleSendOtp = () => {
    if (!formData.ownerMobile || formData.ownerMobile.length < 10) {
      setValidationError("Please enter a valid 10-digit mobile number before sending OTP.");
      return;
    }
    setIsOtpSending(true);
    setTimeout(() => {
      setIsOtpSending(false);
      setShowOtpModal(true);
      setOtpCountdown(60);
      setOtpError("");
    }, 600);
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otpInput.join("");
    const res = verifyPartnerMobileOTP(formData.ownerMobile, enteredOtp);
    if (res.success) {
      setFormData((prev) => ({ ...prev, isMobileVerified: true }));
      setShowOtpModal(false);
      setValidationError("");
    } else {
      setOtpError(res.message);
    }
  };

  // Document Upload / Replace Simulation
  const handleDocFileUpload = (docType, docName) => {
    const fakeFileName = `${docType.toLowerCase()}_${Date.now().toString().slice(-4)}.pdf`;
    const updatedDocs = (formData.documents || []).map((d) => {
      if (d.type === docType) {
        return {
          ...d,
          fileName: fakeFileName,
          fileUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800",
          fileSize: "1.2 MB",
          status: "UPLOADED",
          uploadedAt: new Date().toISOString()
        };
      }
      return d;
    });

    // If doc was not in list, add it
    if (!updatedDocs.some((d) => d.type === docType)) {
      updatedDocs.push({
        id: `doc-${Date.now()}`,
        type: docType,
        name: docName,
        fileName: fakeFileName,
        fileUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800",
        fileSize: "1.2 MB",
        status: "UPLOADED",
        required: true,
        uploadedAt: new Date().toISOString()
      });
    }

    setFormData((prev) => ({ ...prev, documents: updatedDocs }));
  };

  const handleDocRemove = (docType) => {
    const updatedDocs = (formData.documents || []).filter((d) => d.type !== docType);
    setFormData((prev) => ({ ...prev, documents: updatedDocs }));
  };

  // Save Progress & Continue Later
  const handleSaveDraft = () => {
    saveDraftPartnerApplication(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Step Validation & Navigation
  const validateAndProceed = (nextStep) => {
    setValidationError("");

    if (currentStep === 1 && nextStep > 1) {
      if (!formData.ownerName.trim()) {
        setValidationError("Please enter the Owner / Authorized Person Name.");
        return;
      }
      if (!formData.ownerMobile.trim()) {
        setValidationError("Please enter a valid Mobile Number.");
        return;
      }
      if (!formData.ownerEmail.trim() || !formData.ownerEmail.includes("@")) {
        setValidationError("Please enter a valid Email Address.");
        return;
      }
      if (!formData.isMobileVerified) {
        setValidationError("Please verify your Mobile Number with OTP before continuing.");
        return;
      }
    }

    if (currentStep === 2 && nextStep > 2) {
      if (!formData.restaurantName.trim()) {
        setValidationError("Please enter the Restaurant Legal Name.");
        return;
      }
      if (!formData.addressLine.trim() || !formData.pincode.trim()) {
        setValidationError("Please enter complete Restaurant Address, Area, and Pincode.");
        return;
      }
    }

    if (currentStep === 3 && nextStep > 3) {
      if (!formData.fssaiNumber.trim()) {
        setValidationError("FSSAI License / Registration Number is required for food verification.");
        return;
      }
    }

    if (currentStep === 4 && nextStep > 4) {
      const hasFssai = formData.documents.some((d) => d.type === "FSSAI_LICENSE");
      const hasAddress = formData.documents.some((d) => d.type === "ADDRESS_PROOF");
      if (!hasFssai || !hasAddress) {
        setValidationError("Please upload both FSSAI License and Address Proof documents.");
        return;
      }
    }

    if (currentStep === 5 && nextStep > 5) {
      if (!formData.accountHolderName.trim()) {
        setValidationError("Please enter the Bank Account Holder Name.");
        return;
      }
      if (!formData.bankAccountNumber.trim()) {
        setValidationError("Please enter the Bank Account Number.");
        return;
      }
      if (formData.confirmAccountNumber && formData.bankAccountNumber !== formData.confirmAccountNumber) {
        setValidationError("Bank Account Number and Confirmation Account Number do not match.");
        return;
      }
    }

    // Auto-save draft on step transition
    saveDraftPartnerApplication(formData);
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Submission
  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreementChecked) {
      setValidationError("Please check the confirmation declaration box before submitting.");
      return;
    }

    const res = submitPartnerApplication(formData);
    if (res.success) {
      setSubmittedApp(res.application);
      setIsSubmitted(true);
      setCurrentStep(7);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Quick fill sample for fast review & testing
  const handleFillDemoData = () => {
    setFormData((prev) => ({
      ...prev,
      ownerName: "Rahul Sharma",
      ownerMobile: "+91 98200 12345",
      ownerEmail: "rahul.sharma@spicehouse.in",
      isMobileVerified: true,
      restaurantName: "Spice House & Curry Bowl",
      displayName: "Spice House",
      restaurantType: "Restaurant",
      selectedCuisines: ["North Indian", "Biryani"],
      cuisine: "North Indian • Biryani",
      restaurantPhone: "+91 98200 12345",
      restaurantEmail: "contact@spicehouse.in",
      addressLine: "Shop 12, Ground Floor, Silver Square, Linking Road",
      area: "Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      latitude: 19.0596,
      longitude: 72.8295,
      legalBusinessName: "Spice House Hospitality LLP",
      fssaiNumber: "11523024000125",
      gstin: "27AABCS1429B1Z8",
      pan: "AABCS1429B",
      registrationType: "LLP",
      businessAddress: "Shop 12, Silver Square, Linking Road, Bandra West, Mumbai - 400050",
      accountHolderName: "Spice House Hospitality LLP",
      bankAccountNumber: "9876543210984521",
      confirmAccountNumber: "9876543210984521",
      ifsc: "HDFC0000123",
      bankName: "HDFC Bank - Bandra West Branch",
      agreementChecked: true
    }));
    setValidationError("");
  };

  return (
    <div className="food-portal-container partner-registration-page">
      <FoodRoleSwitcher />
      <Navbar />

      <main className="partner-wizard-container">
        {/* Wizard Header */}
        <div className="wizard-header">
          <div className="wizard-header-title">
            <span className="live-pulse-dot" style={{ background: "#ff5200" }} />
            <h1>Restaurant Partner Onboarding & Verification</h1>
            <p>Complete all 6 steps to submit your compliance portfolio for Admin Verification.</p>
          </div>

          <div className="wizard-header-actions">
            <button onClick={handleFillDemoData} className="btn-wizard-demo" title="Auto-fill sample valid restaurant information">
              ⚡ 1-Click Demo Fill
            </button>
            <button onClick={handleSaveDraft} className="btn-wizard-save">
              <FaSave />
              <span>Save Progress</span>
            </button>
          </div>
        </div>

        {/* Save Toast */}
        {saveToast && (
          <div className="save-toast-banner">
            <FaCheckCircle /> Progress saved locally! You can continue anytime.
          </div>
        )}

        {/* Multi-Step Progress Indicator */}
        {!isSubmitted && (
          <div className="wizard-stepper-bar">
            {[
              { num: 1, label: "Account", icon: <FaUser /> },
              { num: 2, label: "Restaurant", icon: <FaStore /> },
              { num: 3, label: "Business", icon: <FaAward /> },
              { num: 4, label: "Documents", icon: <FaFileAlt /> },
              { num: 5, label: "Payout", icon: <FaMoneyBillWave /> },
              { num: 6, label: "Review", icon: <FaCheckCircle /> }
            ].map((step) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div
                  key={step.num}
                  className={`stepper-node ${isDone ? "completed" : ""} ${isCurrent ? "current" : ""}`}
                  onClick={() => {
                    if (isDone || step.num < currentStep) {
                      setCurrentStep(step.num);
                    }
                  }}
                >
                  <div className="stepper-circle">
                    {isDone ? <FaCheckCircle size={14} /> : step.icon}
                  </div>
                  <span className="stepper-label">{step.num}. {step.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Validation Error Message Box */}
        {validationError && (
          <div className="wizard-validation-error">
            <FaInfoCircle size={18} />
            <span>{validationError}</span>
          </div>
        )}

        {/* STEP 1: ACCOUNT INFORMATION */}
        {currentStep === 1 && (
          <div className="wizard-card-step">
            <div className="step-card-header">
              <h2>Step 1 — Restaurant Owner Account</h2>
              <p>Create the authorized partner credentials and verify your mobile number.</p>
            </div>

            <div className="form-grid-2">
              <div className="form-field-group">
                <label>Owner / Authorized Person Name <span className="req">*</span></label>
                <div className="input-with-icon">
                  <FaUser className="field-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange("ownerName", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label>Email Address <span className="req">*</span></label>
                <div className="input-with-icon">
                  <FaEnvelope className="field-icon" />
                  <input
                    type="email"
                    placeholder="e.g. partner@spicehouse.in"
                    value={formData.ownerEmail}
                    onChange={(e) => handleInputChange("ownerEmail", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2" style={{ marginTop: "16px" }}>
              <div className="form-field-group">
                <label>Mobile Number <span className="req">*</span></label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div className="input-with-icon" style={{ flex: 1 }}>
                    <FaPhoneAlt className="field-icon" />
                    <input
                      type="tel"
                      placeholder="+91 98200 12345"
                      value={formData.ownerMobile}
                      onChange={(e) => handleInputChange("ownerMobile", e.target.value)}
                    />
                  </div>

                  {!formData.isMobileVerified ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isOtpSending}
                      className="btn-send-otp"
                    >
                      {isOtpSending ? "Sending..." : "Send OTP"}
                    </button>
                  ) : (
                    <div className="verified-status-chip">
                      <FaCheckCircle color="#10b981" />
                      <span>Verified ✓</span>
                    </div>
                  )}
                </div>
                <small className="field-helper">A 6-digit OTP will be dispatched to this mobile for verification.</small>
              </div>

              <div className="form-field-group">
                <label>Account Password <span className="req">*</span></label>
                <div className="input-with-icon">
                  <FaLock className="field-icon" />
                  <input
                    type="password"
                    placeholder="Create secure password..."
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Verification Alert */}
            {formData.isMobileVerified && (
              <div className="account-verified-callout">
                <FaCheckCircle size={20} color="#10b981" />
                <div>
                  <strong>✓ Account Verified Successfully</strong>
                  <p>Mobile number {formData.ownerMobile} is confirmed for critical operational alerts.</p>
                </div>
              </div>
            )}

            <div className="step-footer-actions">
              <button onClick={() => navigate("/food/partner-with-us")} className="btn-step-prev">
                <FaArrowLeft /> Back to Overview
              </button>
              <button onClick={() => validateAndProceed(2)} className="btn-step-next">
                Next: Restaurant Info <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: RESTAURANT INFORMATION */}
        {currentStep === 2 && (
          <div className="wizard-card-step">
            <div className="step-card-header">
              <h2>Step 2 — Restaurant Information & Operating Hours</h2>
              <p>Enter your kitchen details, cuisine specialities, location coordinates, and operational schedules.</p>
            </div>

            <div className="form-grid-2">
              <div className="form-field-group">
                <label>Restaurant Legal / Registered Name <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Spice House & Curry Bowl"
                  value={formData.restaurantName}
                  onChange={(e) => handleInputChange("restaurantName", e.target.value)}
                />
              </div>

              <div className="form-field-group">
                <label>Restaurant Display Name (Shown to Customers)</label>
                <input
                  type="text"
                  placeholder="e.g. Spice House"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2" style={{ marginTop: "16px" }}>
              <div className="form-field-group">
                <label>Restaurant Entity Type <span className="req">*</span></label>
                <select
                  value={formData.restaurantType}
                  onChange={(e) => handleInputChange("restaurantType", e.target.value)}
                >
                  {RESTAURANT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-field-group">
                <label>Restaurant Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98200 12345"
                  value={formData.restaurantPhone}
                  onChange={(e) => handleInputChange("restaurantPhone", e.target.value)}
                />
              </div>
            </div>

            {/* Cuisine Multi-Selector */}
            <div className="form-field-group" style={{ marginTop: "16px" }}>
              <label>Select Primary Cuisines & Offerings <span className="req">*</span></label>
              <div className="cuisine-chips-grid">
                {CUISINE_OPTIONS.map((c) => {
                  const isSelected = (formData.selectedCuisines || []).includes(c);
                  return (
                    <button
                      type="button"
                      key={c}
                      className={`cuisine-chip-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => handleCuisineToggle(c)}
                    >
                      {isSelected ? "✓ " : "+ "} {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Address & Interactive Map Picker */}
            <div className="section-divider-label">
              <FaMapMarkerAlt /> Restaurant Address & GPS Location
            </div>

            <div className="form-grid-3">
              <div className="form-field-group" style={{ gridColumn: "span 2" }}>
                <label>Address Line / Unit Number <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Shop 12, Ground Floor, Silver Square, Linking Road"
                  value={formData.addressLine}
                  onChange={(e) => handleInputChange("addressLine", e.target.value)}
                />
              </div>

              <div className="form-field-group">
                <label>Area / Locality <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Bandra West"
                  value={formData.area}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-3" style={{ marginTop: "12px" }}>
              <div className="form-field-group">
                <label>City <span className="req">*</span></label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>

              <div className="form-field-group">
                <label>State <span className="req">*</span></label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
              </div>

              <div className="form-field-group">
                <label>Pincode <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="400050"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                />
              </div>
            </div>

            {/* Location Selector Toolbar */}
            <div className="map-picker-box">
              <div className="map-picker-header">
                <div>
                  <strong>📍 Pinpoint Outlet Location</strong>
                  <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "10px" }}>
                    Lat: {formData.latitude}, Lng: {formData.longitude} ({formData.locationLabel})
                  </span>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" onClick={handleUseCurrentLocation} className="btn-loc-preset">
                    <FaMapMarkerAlt /> Use Current GPS
                  </button>
                  <button type="button" onClick={() => handleSelectMapLocation("BANDRA")} className="btn-loc-preset">
                    Bandra West
                  </button>
                  <button type="button" onClick={() => handleSelectMapLocation("ANDHERI")} className="btn-loc-preset">
                    Andheri East
                  </button>
                  <button type="button" onClick={() => handleSelectMapLocation("BKC")} className="btn-loc-preset">
                    BKC
                  </button>
                  <button type="button" onClick={() => handleSelectMapLocation("POWAI")} className="btn-loc-preset">
                    Powai
                  </button>
                </div>
              </div>
            </div>

            {/* Day-Wise Operating Hours */}
            <div className="section-divider-label" style={{ marginTop: "24px" }}>
              <FaClock /> Operational Timings (7-Day Schedule)
            </div>

            <div className="operating-hours-grid">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="day-hours-row">
                  <span className="day-name">{day.toUpperCase()}</span>
                  <input
                    type="text"
                    value={formData.openingHours[day] || "10:00 AM - 11:00 PM"}
                    onChange={(e) => handleHoursChange(day, e.target.value)}
                    className="hours-input"
                  />
                </div>
              ))}
            </div>

            {/* Restaurant Photos Upload Section */}
            <div className="section-divider-label" style={{ marginTop: "24px" }}>
              <FaCamera /> Restaurant & Kitchen Photos (For Verification & App Display)
            </div>

            <div className="photo-uploads-grid">
              {[
                { slot: "cover", label: "Cover Banner Image", desc: "Main storefront banner in app" },
                { slot: "front", label: "Restaurant Frontage", desc: "Exterior signboard & entrance" },
                { slot: "kitchen", label: "Kitchen & Hygiene", desc: "Food prep & cooking area" },
                { slot: "interior", label: "Dining / Packing Area", desc: "Internal seating or pickup zone" }
              ].map((p) => (
                <div key={p.slot} className="photo-upload-card">
                  <div className="photo-preview-wrap">
                    <img src={formData.photos[p.slot]} alt={p.label} />
                  </div>
                  <div className="photo-meta">
                    <strong>{p.label}</strong>
                    <p>{p.desc}</p>
                    <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handlePhotoUpdate(p.slot, SAMPLE_PHOTO_PRESETS[p.slot])}
                        className="btn-photo-action"
                      >
                        <FaExchangeAlt /> Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePhotoUpdate(p.slot, "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400")}
                        className="btn-photo-action"
                      >
                        Default
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="step-footer-actions">
              <button onClick={() => setCurrentStep(1)} className="btn-step-prev">
                <FaArrowLeft /> Previous: Account
              </button>
              <button onClick={() => validateAndProceed(3)} className="btn-step-next">
                Next: Business Details <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BUSINESS INFORMATION */}
        {currentStep === 3 && (
          <div className="wizard-card-step">
            <div className="step-card-header">
              <h2>Step 3 — Business & Regulatory Verification</h2>
              <p>Provide verified tax, registration, and food safety details to ensure regulatory compliance.</p>
            </div>

            <div className="form-grid-2">
              <div className="form-field-group">
                <label>Legal Business Name <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Spice House Hospitality LLP"
                  value={formData.legalBusinessName}
                  onChange={(e) => handleInputChange("legalBusinessName", e.target.value)}
                />
                <small className="field-helper">Official entity name as registered with government authorities.</small>
              </div>

              <div className="form-field-group">
                <label>Entity Registration Type <span className="req">*</span></label>
                <select
                  value={formData.registrationType}
                  onChange={(e) => handleInputChange("registrationType", e.target.value)}
                >
                  <option value="Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership Firm</option>
                  <option value="LLP">Limited Liability Partnership (LLP)</option>
                  <option value="Private Limited">Private Limited Company</option>
                  <option value="Public Limited">Public Limited Company</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2" style={{ marginTop: "16px" }}>
              <div className="form-field-group">
                <label>
                  FSSAI License / Registration Number <span className="req">*</span>
                  <span className="field-tag-badge">Mandatory</span>
                </label>
                <div className="input-with-icon">
                  <FaAward className="field-icon" color="#ff5200" />
                  <input
                    type="text"
                    placeholder="14-digit FSSAI number (e.g. 11523024000125)"
                    value={formData.fssaiNumber}
                    onChange={(e) => handleInputChange("fssaiNumber", e.target.value)}
                    maxLength={14}
                  />
                </div>
                <small className="field-helper" style={{ color: "#c2410c" }}>
                  "Required for food-business verification and safety regulatory standards in India."
                </small>
              </div>

              <div className="form-field-group">
                <label>GSTIN (GST Identification Number) <span style={{ fontSize: "11px", color: "#64748b" }}>(If Applicable)</span></label>
                <div className="input-with-icon">
                  <FaIdCard className="field-icon" />
                  <input
                    type="text"
                    placeholder="15-character GSTIN (e.g. 27AABCS1429B1Z8)"
                    value={formData.gstin}
                    onChange={(e) => handleInputChange("gstin", e.target.value.toUpperCase())}
                    maxLength={15}
                  />
                </div>
                <small className="field-helper">Required if your restaurant annual turnover exceeds GST threshold.</small>
              </div>
            </div>

            <div className="form-grid-2" style={{ marginTop: "16px" }}>
              <div className="form-field-group">
                <label>Business PAN Number <span className="req">*</span></label>
                <div className="input-with-icon">
                  <FaIdCard className="field-icon" />
                  <input
                    type="text"
                    placeholder="10-digit PAN (e.g. AABCS1429B)"
                    value={formData.pan}
                    onChange={(e) => handleInputChange("pan", e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                </div>
                <small className="field-helper">PAN of proprietor or corporate entity for tax withholding.</small>
              </div>

              <div className="form-field-group">
                <label>Registered Business Office Address</label>
                <input
                  type="text"
                  placeholder="Address as recorded in official business documents"
                  value={formData.businessAddress}
                  onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                />
              </div>
            </div>

            {/* Admin Configurable Requirements Note */}
            <div className="regulatory-callout-box">
              <FaShieldAlt size={22} color="#2563eb" />
              <div>
                <strong>Platform Compliance Governance</strong>
                <p>
                  Document and tax requirements are dynamically monitored. Every uploaded certificate will be verified individually by our compliance officer.
                </p>
              </div>
            </div>

            <div className="step-footer-actions">
              <button onClick={() => setCurrentStep(2)} className="btn-step-prev">
                <FaArrowLeft /> Previous: Restaurant Info
              </button>
              <button onClick={() => validateAndProceed(4)} className="btn-step-next">
                Next: Document Verification <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DOCUMENT VERIFICATION */}
        {currentStep === 4 && (
          <div className="wizard-card-step">
            <div className="step-card-header">
              <h2>Step 4 — Secure Document Verification Pipeline</h2>
              <p>Upload clear copies of required licenses and identity proofs. Files are stored securely with strict role-based access.</p>
            </div>

            {/* Security Disclaimer */}
            <div className="private-storage-notice">
              <FaLock />
              <span><strong>Private Encrypted Storage:</strong> Documents are accessible exclusively by authorized platform compliance auditors and yourself.</span>
            </div>

            <div className="documents-upload-list">
              {adminDocumentRequirements.map((req) => {
                const existingDoc = (formData.documents || []).find((d) => d.type === req.type);
                const isUploaded = Boolean(existingDoc);

                return (
                  <div key={req.id} className={`doc-item-row ${isUploaded ? "uploaded" : ""}`}>
                    <div className="doc-info-col">
                      <div className="doc-title-line">
                        <strong>{req.name}</strong>
                        {req.required && <span className="doc-req-pill">Required</span>}
                        <span className="doc-cat-tag">{req.category}</span>
                      </div>
                      <p className="doc-desc">{req.description}</p>
                      <div className="doc-meta-info">
                        <span>Formats: {req.acceptedFormats.join(", ")}</span>
                        <span>• Max size: 5 MB</span>
                        {existingDoc?.issueDate && <span>• Issued: {existingDoc.issueDate}</span>}
                        {existingDoc?.expiryDate && <span style={{ color: "#d97706" }}>• Expiry: {existingDoc.expiryDate}</span>}
                      </div>
                    </div>

                    <div className="doc-action-col">
                      {isUploaded ? (
                        <div className="doc-uploaded-box">
                          <div className="doc-status-badge">
                            <FaCheckCircle color="#10b981" />
                            <span>✓ Uploaded ({existingDoc.fileName})</span>
                          </div>

                          <div className="doc-btn-group">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(existingDoc)}
                              className="btn-doc-preview"
                            >
                              <FaEye /> Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDocFileUpload(req.type, req.name)}
                              className="btn-doc-replace"
                            >
                              <FaExchangeAlt /> Replace
                            </button>
                            {!req.required && (
                              <button
                                type="button"
                                onClick={() => handleDocRemove(req.type)}
                                className="btn-doc-remove"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDocFileUpload(req.type, req.name)}
                          className="btn-doc-upload-now"
                        >
                          <FaCloudUploadAlt /> Upload Document
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="step-footer-actions">
              <button onClick={() => setCurrentStep(3)} className="btn-step-prev">
                <FaArrowLeft /> Previous: Business
              </button>
              <button onClick={() => validateAndProceed(5)} className="btn-step-next">
                Next: Payout & Bank Details <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: PAYOUT / BANK DETAILS */}
        {currentStep === 5 && (
          <div className="wizard-card-step">
            <div className="step-card-header">
              <h2>Step 5 — Payout & Settlement Information</h2>
              <p>Configure the verified bank account where customer order earnings and weekly payouts will be credited.</p>
            </div>

            <div className="form-grid-2">
              <div className="form-field-group">
                <label>Account Holder Name <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Spice House Hospitality LLP"
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                />
                <small className="field-helper">Must match legal business name or authorized signatory name.</small>
              </div>

              <div className="form-field-group">
                <label>IFSC Code <span className="req">*</span></label>
                <div className="input-with-icon">
                  <FaMoneyBillWave className="field-icon" />
                  <input
                    type="text"
                    placeholder="e.g. HDFC0000123"
                    value={formData.ifsc}
                    onChange={(e) => handleIfscChange(e.target.value)}
                    maxLength={11}
                  />
                </div>
                <small className="field-helper" style={{ color: "#10b981", fontWeight: 600 }}>
                  Bank: {formData.bankName}
                </small>
              </div>
            </div>

            <div className="form-grid-2" style={{ marginTop: "16px" }}>
              <div className="form-field-group">
                <label>Bank Account Number <span className="req">*</span></label>
                <input
                  type="password"
                  placeholder="Enter full bank account number"
                  value={formData.bankAccountNumber}
                  onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                />
              </div>

              <div className="form-field-group">
                <label>Confirm Bank Account Number <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="Re-enter bank account number"
                  value={formData.confirmAccountNumber}
                  onChange={(e) => handleInputChange("confirmAccountNumber", e.target.value)}
                />
              </div>
            </div>

            {/* Masked Sensitive Information Preview Box */}
            <div className="bank-masking-card">
              <div className="masking-header">
                <FaLock color="#10b981" />
                <strong>Masked Account Security Preview:</strong>
              </div>
              <div className="masked-digits">
                {formData.bankAccountNumber
                  ? `XXXX XXXX ${formData.bankAccountNumber.slice(-4)}`
                  : "XXXX XXXX 4521"}
              </div>
              <p className="masking-disclaimer">
                "These details are used exclusively for restaurant payouts. Full account numbers are encrypted at rest and never returned through normal public APIs."
              </p>
            </div>

            <div className="step-footer-actions">
              <button onClick={() => setCurrentStep(4)} className="btn-step-prev">
                <FaArrowLeft /> Previous: Documents
              </button>
              <button onClick={() => validateAndProceed(6)} className="btn-step-next">
                Next: Review Application <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW APPLICATION */}
        {currentStep === 6 && (
          <div className="wizard-card-step">
            <div className="step-card-header">
              <h2>Step 6 — Review Application & Final Declaration</h2>
              <p>Review all details across Account, Restaurant, Business, Documents, and Payout before submitting to Admin.</p>
            </div>

            <div className="review-cards-container">
              {/* Card 1: Account */}
              <div className="review-section-card">
                <div className="review-card-top">
                  <h3>1. Account Details</h3>
                  <button onClick={() => setCurrentStep(1)} className="btn-review-edit">Edit</button>
                </div>
                <div className="review-data-grid">
                  <div><span>Owner Name:</span> <strong>{formData.ownerName || "Rahul Sharma"}</strong></div>
                  <div><span>Mobile:</span> <strong>{formData.ownerMobile || "+91 98200 12345"} (Verified ✓)</strong></div>
                  <div><span>Email:</span> <strong>{formData.ownerEmail || "partner@restaurant.in"}</strong></div>
                </div>
              </div>

              {/* Card 2: Restaurant */}
              <div className="review-section-card">
                <div className="review-card-top">
                  <h3>2. Restaurant Profile & Location</h3>
                  <button onClick={() => setCurrentStep(2)} className="btn-review-edit">Edit</button>
                </div>
                <div className="review-data-grid">
                  <div><span>Restaurant Name:</span> <strong>{formData.restaurantName}</strong></div>
                  <div><span>Type & Cuisines:</span> <strong>{formData.restaurantType} • {formData.cuisine}</strong></div>
                  <div><span>Address:</span> <strong>{formData.addressLine}, {formData.area}, {formData.city} - {formData.pincode}</strong></div>
                  <div><span>GPS Location:</span> <strong>{formData.latitude}, {formData.longitude}</strong></div>
                </div>
              </div>

              {/* Card 3: Business */}
              <div className="review-section-card">
                <div className="review-card-top">
                  <h3>3. Business & Regulatory</h3>
                  <button onClick={() => setCurrentStep(3)} className="btn-review-edit">Edit</button>
                </div>
                <div className="review-data-grid">
                  <div><span>Legal Name:</span> <strong>{formData.legalBusinessName || formData.restaurantName}</strong></div>
                  <div><span>FSSAI License:</span> <strong style={{ color: "#ff5200" }}>{formData.fssaiNumber}</strong></div>
                  <div><span>GSTIN:</span> <strong>{formData.gstin || "N/A"}</strong></div>
                  <div><span>PAN:</span> <strong>{formData.pan}</strong></div>
                </div>
              </div>

              {/* Card 4: Documents */}
              <div className="review-section-card">
                <div className="review-card-top">
                  <h3>4. Uploaded Verification Documents</h3>
                  <button onClick={() => setCurrentStep(4)} className="btn-review-edit">Edit</button>
                </div>
                <div className="review-docs-list">
                  {formData.documents.map((doc) => (
                    <div key={doc.id} className="review-doc-pill">
                      <FaCheckCircle color="#10b981" />
                      <span>{doc.name} ({doc.fileName})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 5: Payout */}
              <div className="review-section-card">
                <div className="review-card-top">
                  <h3>5. Payout Details</h3>
                  <button onClick={() => setCurrentStep(5)} className="btn-review-edit">Edit</button>
                </div>
                <div className="review-data-grid">
                  <div><span>Account Holder:</span> <strong>{formData.accountHolderName}</strong></div>
                  <div><span>Bank Name:</span> <strong>{formData.bankName}</strong></div>
                  <div><span>IFSC Code:</span> <strong>{formData.ifsc}</strong></div>
                  <div>
                    <span>Masked Account:</span>{" "}
                    <strong>{formData.bankAccountNumber ? `XXXX XXXX ${formData.bankAccountNumber.slice(-4)}` : "XXXX XXXX 4521"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Confirmation Declaration */}
            <div className="legal-declaration-box">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={formData.agreementChecked}
                  onChange={(e) => handleInputChange("agreementChecked", e.target.checked)}
                />
                <span>
                  <strong>I confirm that the information provided is accurate and all food licenses are valid.</strong> I acknowledge that restaurant onboarding is subject to Admin Verification and orders cannot be received until approved.
                </span>
              </label>
            </div>

            <div className="step-footer-actions">
              <button onClick={() => setCurrentStep(5)} className="btn-step-prev">
                <FaArrowLeft /> Previous: Payout
              </button>
              <button onClick={handleFinalSubmit} className="btn-submit-final">
                SUBMIT FOR VERIFICATION ✓
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: APPLICATION SUBMITTED SUCCESS */}
        {isSubmitted && submittedApp && (
          <div className="submission-success-card">
            <div className="success-icon-large">
              <FaCheckCircle />
            </div>

            <h1>Application Submitted Successfully ✓</h1>
            <p className="success-subtitle">
              Your restaurant verification application has been received and routed to our admin compliance team.
            </p>

            <div className="app-summary-banner">
              <div className="banner-item">
                <span>Application ID</span>
                <strong>{submittedApp.applicationNumber}</strong>
              </div>
              <div className="banner-divider" />
              <div className="banner-item">
                <span>Current Status</span>
                <strong style={{ color: "#d97706" }}>🟡 UNDER REVIEW</strong>
              </div>
              <div className="banner-divider" />
              <div className="banner-item">
                <span>Submitted Outlet</span>
                <strong>{submittedApp.restaurant.name}</strong>
              </div>
            </div>

            <div className="review-progress-indicator">
              <h3>Verification Progress</h3>
              <div className="progress-steps-row">
                <div className="p-step done">Account ✓</div>
                <div className="p-step done">Restaurant ✓</div>
                <div className="p-step done">Business ✓</div>
                <div className="p-step done">Documents ✓</div>
                <div className="p-step in-review">Admin Review ⏳</div>
              </div>
            </div>

            <p className="status-disclaimer-note">
              Expected review status will update automatically. You will receive live notifications when individual documents are verified or if additional info is requested.
            </p>

            <div className="success-action-buttons">
              <button
                onClick={() => {
                  useFoodDeliveryStore.getState().setSelectedRestaurant(submittedApp.restaurantId);
                  useFoodDeliveryStore.getState().setActiveRole("RESTAURANT");
                  navigate("/food/restaurant");
                }}
                className="btn-success-dashboard"
              >
                Go to Restaurant Dashboard →
              </button>

              <button
                onClick={() => {
                  useFoodDeliveryStore.getState().setActiveRole("ADMIN");
                  navigate("/food/admin");
                }}
                className="btn-success-admin"
              >
                Switch to Admin Verification Panel ⚡
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 6-Digit OTP Modal */}
      {showOtpModal && (
        <div className="modal-backdrop" onClick={() => setShowOtpModal(false)}>
          <div className="modal-content-otp" onClick={(e) => e.stopPropagation()}>
            <div className="otp-modal-header">
              <h3>Enter 6-Digit Verification Code</h3>
              <button onClick={() => setShowOtpModal(false)} className="btn-modal-close"><FaTimes /></button>
            </div>

            <p className="otp-modal-subtitle">
              Sent 6-digit OTP to <strong>{formData.ownerMobile}</strong>
            </p>

            <div className="otp-inputs-row">
              {otpInput.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-box-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value;
                    const next = [...otpInput];
                    next[idx] = val;
                    setOtpInput(next);
                    if (val && idx < 5) {
                      document.getElementById(`otp-box-${idx + 1}`)?.focus();
                    }
                  }}
                  className="otp-digit-box"
                />
              ))}
            </div>

            {otpError && <div className="otp-error-text">{otpError}</div>}

            <div className="otp-timer-text">
              {otpCountdown > 0 ? (
                <span>Resend OTP in <strong>{otpCountdown}s</strong></span>
              ) : (
                <button onClick={() => setOtpCountdown(60)} className="btn-resend-otp">Resend OTP Now</button>
              )}
            </div>

            <button onClick={handleVerifyOtp} className="btn-verify-otp-submit">
              Verify & Confirm Mobile
            </button>
          </div>
        </div>
      )}

      {/* Document In-App Previewer Modal */}
      {previewDoc && (
        <div className="modal-backdrop" onClick={() => setPreviewDoc(null)}>
          <div className="modal-content-doc" onClick={(e) => e.stopPropagation()}>
            <div className="doc-modal-header">
              <div>
                <h3>{previewDoc.name}</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  File: {previewDoc.fileName} • Status: {previewDoc.status}
                </span>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="btn-modal-close"><FaTimes /></button>
            </div>

            <div className="doc-preview-body">
              <img src={previewDoc.fileUrl} alt={previewDoc.name} className="doc-preview-img" />
            </div>

            <div className="doc-modal-footer">
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                🔒 Document secured in compliance storage.
              </span>
              <button onClick={() => setPreviewDoc(null)} className="btn-close-preview">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
