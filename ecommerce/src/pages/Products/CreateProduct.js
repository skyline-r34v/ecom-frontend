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
    shippingInfo: "",
    returnPolicy: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH CATEGORIES & BRANDS ================= */
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

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

    const invalidFile = selectedFiles.find(
      (file) => file.size > MAX_IMAGE_SIZE
    );

    if (invalidFile) {
      message.error("Each image must be less than 100 KB");
      e.target.value = null;
      return;
    }

    setImages(selectedFiles);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!thumbnail) {
      message.error("Thumbnail is required");
      return;
    }

    if (!form.brand) {
      message.error("Brand is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
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
      message.error(err.response?.data?.message || "Error creating product");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>Add New Product</h2>
      </div>

      <form className="add-product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Brand</label>
          <select
            name="brand"
            value={form.brand}
            onChange={handleChange}
            required
          >
            <option value="">Select Brand</option>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Discount Price</label>
          <input
            type="number"
            name="discountPrice"
            value={form.discountPrice}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Specifications</label>
          <textarea
            name="specifications"
            value={form.specifications}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Stock</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Warranty</label>
          <input
            name="warranty"
            value={form.warranty}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Shipping Info</label>
          <textarea
            name="shippingInfo"
            value={form.shippingInfo}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Return Policy</label>
          <textarea
            name="returnPolicy"
            value={form.returnPolicy}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Thumbnail (Max 100 KB)</label>
          <input type="file" accept="image/*" onChange={handleThumbnailChange} />
          {thumbnail && (
            <img
              src={URL.createObjectURL(thumbnail)}
              alt="thumb"
              className="preview-img"
            />
          )}
        </div>

        <div className="form-group">
          <label>Product Images (Each Max 100 KB)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagesChange}
          />
          <div className="image-preview">
            {images.map((img, i) => (
              <img key={i} src={URL.createObjectURL(img)} alt="preview" />
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Creating..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
