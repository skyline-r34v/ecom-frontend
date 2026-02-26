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

  /* ================= FETCH DATA ================= */
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
    } catch (err) {
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
    } catch (err) {
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

    for (let file of selectedFiles) {
      if (file.size > MAX_IMAGE_SIZE) {
        message.error("Each image must be less than 100 KB");
        e.target.value = null;
        return;
      }
    }

    setImages(selectedFiles);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validations
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

      formData.append("title", form.title.trim());
      formData.append("brand", form.brand);
      formData.append("category", form.category);
      formData.append("price", Number(form.price));
      formData.append(
        "discountPrice",
        form.discountPrice ? Number(form.discountPrice) : 0
      );
      formData.append("description", form.description);
      formData.append("specifications", form.specifications);
      formData.append("stock", Number(form.stock));
      formData.append("warranty", form.warranty);
      formData.append("shippingInfo", form.shippingInfo);
      formData.append("returnPolicy", form.returnPolicy);

      formData.append("thumbnail", thumbnail);

      images.forEach((img) => {
        formData.append("images", img);
      });

      await api.post("/products/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Product created successfully");
      navigate("/products");
    } catch (err) {
      console.log("CREATE PRODUCT ERROR:", err);
      message.error(
        err.response?.data?.message || "Server error while creating product"
      );
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
        {/* Title */}
        <div className="form-group">
          <label>Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Brand */}
        <div className="form-group">
          <label>Brand *</label>
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

        {/* Category */}
        <div className="form-group">
          <label>Category *</label>
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

        {/* Price */}
        <div className="form-group">
          <label>Price *</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>

        {/* Discount */}
        <div className="form-group">
          <label>Discount Price</label>
          <input
            type="number"
            name="discountPrice"
            value={form.discountPrice}
            onChange={handleChange}
          />
        </div>

        {/* Stock */}
        <div className="form-group">
          <label>Stock *</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            required
          />
        </div>

        {/* Thumbnail */}
        <div className="form-group">
          <label>Thumbnail (Max 100 KB) *</label>
          <input type="file" accept="image/*" onChange={handleThumbnailChange} />
        </div>

        {/* Images */}
        <div className="form-group">
          <label>Product Images (Each Max 100 KB)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagesChange}
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Creating..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}