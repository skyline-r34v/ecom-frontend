import React, { useEffect, useState } from "react";
import "../../styles/AddProduct.css";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const MAX_IMAGE_SIZE = 100 * 1024; // 100 KB

export default function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    brand: "",
    category: "",
    price: "",
    discountPrice: "",
    description: "",
    specifications: "",
    stock: "",
    warranty: "",
    returnPolicy: "",
    pickupAddresses: [
      { street: "", city: "", state: "", country: "", postalCode: "" }
    ],
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.post("/categories/list", {
        page: 1,
        size: 100,
      });
      setCategories(res.data.data || []);
    } catch {
      message.error("Failed to load categories");
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await api.post("/brands/list", {
        page: 1,
        size: 100,
      });
      setBrands(res.data.data || []);
    } catch {
      message.error("Failed to load brands");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* Pickup Address Handlers */
  const handlePickupChange = (index, field, value) => {
    const updated = [...form.pickupAddresses];
    updated[index][field] = value;
    setForm({ ...form, pickupAddresses: updated });
  };

  
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      message.error("Thumbnail must be less than 100 KB");
      e.target.value = null;
      return;
    }

    setThumbnail(file);
  };

  const handleImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    for (let file of selectedFiles) {
      if (file.size > MAX_IMAGE_SIZE) {
        message.error("Each image must be less than 100 KB");
        e.target.value = null;
        return;
      }
    }

    setImages(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return message.error("Title is required");
    if (!form.brand) return message.error("Brand is required");
    if (!form.category) return message.error("Category is required");
    if (!form.price) return message.error("Price is required");
    if (!form.stock) return message.error("Stock is required");
    if (!thumbnail) return message.error("Thumbnail is required");

    if (
      form.discountPrice &&
      Number(form.discountPrice) >= Number(form.price)
    ) {
      return message.error("Discount price must be less than price");
    }

    try {
      setLoading(true);

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (key === "pickupAddresses") {
          formData.append(
            "pickupAddresses",
            JSON.stringify(form.pickupAddresses)
          );
        } else {
          formData.append(key, form[key]);
        }
      });

      formData.append("thumbnail", thumbnail);

      images.forEach((img) => {
        formData.append("images", img);
      });

      await api.post("/products/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Product created successfully");
      navigate("/products");
    } catch (err) {
      message.error(
        err.response?.data?.message || "Server error while creating product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>Add New Product</h2>
      </div>

      <form className="add-product-form" onSubmit={handleSubmit}>

        {/* ================= BASIC INFO ================= */}
        <h3 className="section-title">Basic Information</h3>
        <div className="grid-2">
          <div className="form-group">
            <label>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Brand *</label>
            <select name="brand" value={form.brand} onChange={handleChange} required>
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ================= PRICING ================= */}
        <h3 className="section-title">Pricing & Inventory</h3>
        <div className="grid-2">
          <div className="form-group">
            <label>Price *</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Discount Price</label>
            <input type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Stock *</label>
            <input type="number" name="stock" value={form.stock} onChange={handleChange} required />
          </div>
        </div>

        {/* ================= PRODUCT DETAILS ================= */}
        <h3 className="section-title">Product Details</h3>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Specifications (JSON or Text)</label>
          <textarea name="specifications" value={form.specifications} onChange={handleChange} />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Warranty</label>
            <input name="warranty" value={form.warranty} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Return Policy</label>
            <textarea name="returnPolicy" value={form.returnPolicy} onChange={handleChange} />
          </div>
        </div>

        {/* ================= PICKUP ADDRESSES ================= */}
        <h3 className="section-title">Pickup Addresses</h3>

        {form.pickupAddresses.map((addr, index) => (
          <div key={index} className="address-card">
            <h4>Address {index + 1}</h4>

            <div className="grid-2">
              <input
                type="text"
                placeholder="Street"
                value={addr.street}
                onChange={(e) =>
                  handlePickupChange(index, "street", e.target.value)
                }
              />

              <input
                type="text"
                placeholder="City"
                value={addr.city}
                onChange={(e) =>
                  handlePickupChange(index, "city", e.target.value)
                }
              />

              <input
                type="text"
                placeholder="State"
                value={addr.state}
                onChange={(e) =>
                  handlePickupChange(index, "state", e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Country"
                value={addr.country}
                onChange={(e) =>
                  handlePickupChange(index, "country", e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Postal Code"
                value={addr.postalCode}
                onChange={(e) =>
                  handlePickupChange(index, "postalCode", e.target.value)
                }
              />
            </div>

           
          </div>
        ))}

      

        {/* ================= MEDIA ================= */}
        <h3 className="section-title">Media</h3>

        <div className="form-group">
          <label>Thumbnail (Max 100 KB) *</label>
          <input type="file" accept="image/*" onChange={handleThumbnailChange} />
        </div>

        <div className="form-group">
          <label>Product Images (Each Max 100 KB)</label>
          <input type="file" multiple accept="image/*" onChange={handleImagesChange} />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Creating..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}