import React, { useEffect, useState } from "react";
import "../../styles/AddProduct.css";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { FaArrowLeft, FaPen, FaFileExcel } from "react-icons/fa";
import ProductExcelUpload from "../../components/ExcelUpload/ProductExcelUpload";

const MAX_IMAGE_SIZE = 15000 * 1024; // 15MB

export default function CreateProduct() {
  const navigate = useNavigate();

  /* ---------------- FORM STATE ---------------- */
  const [form, setForm] = useState({
    title: "",
    brand: "",
    category: "",
    price: "",
    discountPrice: "",
    description: "",
    specifications: [{ key: "", value: "" }],
    stock: "",
    warranty: "",
    returnPolicy: "",
    pickUpaddresses: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("manual"); // "manual" | "excel"

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.post("/categories/list", { page: 1, size: 100 });
      setCategories(res.data.data || []);
    } catch {
      message.error("Failed to load categories");
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await api.post("/brands/list", { page: 1, size: 100 });
      setBrands(res.data.data || []);
    } catch {
      message.error("Failed to load brands");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSpecChange = (index, field, value) => {
    const updatedSpecs = [...form.specifications];
    updatedSpecs[index][field] = value;
    setForm({ ...form, specifications: updatedSpecs });
  };

  const addSpec = () => {
    setForm({
      ...form,
      specifications: [...form.specifications, { key: "", value: "" }],
    });
  };

  const removeSpec = (index) => {
    const updatedSpecs = form.specifications.filter((_, i) => i !== index);
    setForm({ ...form, specifications: updatedSpecs });
  };

  const handlePickupChange = (field, value) => {
    setForm({
      ...form,
      pickUpaddresses: {
        ...form.pickUpaddresses,
        [field]: value,
      },
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      message.error("Thumbnail must be less than 15 MB");
      return;
    }
    setThumbnail(file);
  };

  const handleImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    for (let file of selectedFiles) {
      if (file.size > MAX_IMAGE_SIZE) {
        message.error("Each image must be less than 15 MB");
        return;
      }
    }
    setImages(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || token === "undefined" || token === "null") {
      message.error("Please login as an Admin to create products");
      navigate("/login");
      return;
    }

    if (role && role !== "admin") {
      message.error("Access denied: You are signed in as a '" + role + "'. Admin privileges are required to create products.");
      return;
    }

    if (!form.title.trim()) return message.error("Title is required");
    if (!form.price) return message.error("Price is required");
    if (!form.stock) return message.error("Stock is required");
    if (!thumbnail) return message.error("Product thumbnail image file is required");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("brand", form.brand);
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append("discountPrice", form.discountPrice || form.price);
      formData.append("description", form.description);
      formData.append("specifications", JSON.stringify(form.specifications));
      formData.append("stock", form.stock);
      formData.append("warranty", form.warranty);
      formData.append("returnPolicy", form.returnPolicy);

      formData.append("pickUpaddresses[street]", form.pickUpaddresses.street);
      formData.append("pickUpaddresses[city]", form.pickUpaddresses.city);
      formData.append("pickUpaddresses[state]", form.pickUpaddresses.state);
      formData.append("pickUpaddresses[country]", form.pickUpaddresses.country);
      formData.append("pickUpaddresses[postalCode]", form.pickUpaddresses.postalCode);

      formData.append("thumbnail", thumbnail);

      images.forEach((img) => {
        formData.append("images", img);
      });

      const res = await api.post("/products/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Also persist to local catalog cache
      const importedProducts = JSON.parse(localStorage.getItem("importedProducts") || "[]");
      const matchedCat = categories.find((c) => c._id === form.category);
      const matchedBrand = brands.find((b) => b._id === form.brand);

      importedProducts.unshift({
        _id: res.data?.data?._id || `manual_${Date.now()}`,
        title: form.title,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice || form.price),
        stock: Number(form.stock || 10),
        description: form.description,
        thumbnail: thumbnail ? URL.createObjectURL(thumbnail) : res.data?.data?.thumbnail || "",
        images: [],
        category: {
          _id: form.category,
          name: matchedCat?.name || "General",
        },
        brand: {
          _id: form.brand,
          name: matchedBrand?.name || "OneCart",
        },
        rating: 4.8,
        numReviews: 12,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("importedProducts", JSON.stringify(importedProducts));

      message.success("Product created successfully! 🎉");
      navigate("/products");
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || "Server error while creating product";
      if (
        errMsg.toLowerCase().includes("forbidden") ||
        errMsg.toLowerCase().includes("insufficient permissions")
      ) {
        message.error("Access denied: Admin privileges required to create products.");
      } else if (
        errMsg.toLowerCase().includes("access denied") ||
        errMsg.toLowerCase().includes("no token") ||
        errMsg.toLowerCase().includes("invalid token")
      ) {
        message.error("Session expired or not logged in. Please log in as Admin.");
        navigate("/login");
      } else {
        message.error(errMsg);
      }
      console.error("Product creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      {/* Header */}
      <div className="add-product-header">
        <button className="back-btn" onClick={() => navigate("/products")}>
          <FaArrowLeft size={12} style={{ marginRight: 6 }} /> Back to Products
        </button>
        <h2>Create Product</h2>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="excel-mode-switcher">
        <button
          type="button"
          className={`excel-mode-tab ${activeTab === "manual" ? "active" : ""}`}
          onClick={() => setActiveTab("manual")}
        >
          <FaPen size={13} />
          Manual Entry Form
        </button>
        <button
          type="button"
          className={`excel-mode-tab ${activeTab === "excel" ? "active" : ""}`}
          onClick={() => setActiveTab("excel")}
        >
          <FaFileExcel size={15} color="#16a34a" />
          Upload Excel File
          <span className="excel-tab-badge">Excel Only</span>
        </button>
      </div>

      {activeTab === "excel" ? (
        <ProductExcelUpload
          categories={categories}
          brands={brands}
          onUploadSuccess={() => navigate("/products")}
        />
      ) : (
        <form className="add-product-form" onSubmit={handleSubmit}>
          <h3 className="section-title">Basic Information</h3>

          <div className="grid-2">
            <div className="form-group">
              <label>Title *</label>
              <input
                name="title"
                placeholder="Product Title"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Brand</label>
              <select name="brand" value={form.brand} onChange={handleChange}>
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h3 className="section-title">Pricing & Stock</h3>

          <div className="grid-2">
            <div className="form-group">
              <label>Regular Price (₹) *</label>
              <input
                type="number"
                name="price"
                placeholder="e.g. 1999"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Discounted Price (₹)</label>
              <input
                type="number"
                name="discountPrice"
                placeholder="e.g. 1499"
                value={form.discountPrice}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Available Stock Units *</label>
              <input
                type="number"
                name="stock"
                placeholder="e.g. 50"
                value={form.stock}
                onChange={handleChange}
              />
            </div>
          </div>

          <h3 className="section-title">Product Details</h3>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Detailed description of features, materials, and benefits..."
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <h3 className="section-title">Specifications</h3>

          {form.specifications.map((spec, index) => (
            <div key={index} className="spec-row">
              <input
                placeholder="Key (e.g. RAM)"
                value={spec.key}
                onChange={(e) => handleSpecChange(index, "key", e.target.value)}
              />

              <input
                placeholder="Value (e.g. 16GB)"
                value={spec.value}
                onChange={(e) => handleSpecChange(index, "value", e.target.value)}
              />

              <button type="button" onClick={() => removeSpec(index)}>
                ❌
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addSpec}
            className="back-btn"
            style={{ width: "fit-content", marginTop: "4px" }}
          >
            + Add Specification Field
          </button>

          <h3 className="section-title">Pickup & Fulfillment Address</h3>

          <div className="grid-2">
            <input
              placeholder="Street Address"
              value={form.pickUpaddresses.street}
              onChange={(e) => handlePickupChange("street", e.target.value)}
            />

            <input
              placeholder="City"
              value={form.pickUpaddresses.city}
              onChange={(e) => handlePickupChange("city", e.target.value)}
            />

            <input
              placeholder="State"
              value={form.pickUpaddresses.state}
              onChange={(e) => handlePickupChange("state", e.target.value)}
            />

            <input
              placeholder="Country"
              value={form.pickUpaddresses.country}
              onChange={(e) => handlePickupChange("country", e.target.value)}
            />

            <input
              placeholder="Postal Code"
              value={form.pickUpaddresses.postalCode}
              onChange={(e) => handlePickupChange("postalCode", e.target.value)}
            />
          </div>

          <h3 className="section-title">Product Thumbnail Image</h3>

          <div className="form-group">
            <label>Choose Image File (JPG, PNG, WEBP - Max 15MB) *</label>
            <input type="file" accept="image/*" onChange={handleThumbnailChange} />
            {thumbnail && (
              <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src={URL.createObjectURL(thumbnail)}
                  alt="Preview"
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1.5px solid #2563eb",
                  }}
                />
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
                    {thumbnail.name}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>
                    ✓ Image File Ready ({(thumbnail.size / 1024).toFixed(0)} KB)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginTop: "18px" }}>
            <label>Additional Gallery Images (Optional)</label>
            <input type="file" multiple accept="image/*" onChange={handleImagesChange} />
          </div>

          <button type="submit" disabled={loading} className="submit-btn" style={{ marginTop: "24px" }}>
            {loading ? "Creating..." : "Add Product to Store"}
          </button>
        </form>
      )}
    </div>
  );
}