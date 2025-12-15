import React, { useState } from "react";
import "../styles/products.css";
import api from "../api"; // axios instance
import { useNavigate } from "react-router-dom";
import { message } from "antd";

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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleImagesChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!thumbnail) {
      message.error("Thumbnail is required");
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    formData.append("thumbnail", thumbnail);
    images.forEach((img) => formData.append("images", img));

    try {
      setLoading(true);
      const res = await api.post("/products/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success(res.data.message || "Product created successfully");
      navigate("/products"); // redirect to product listing
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Error creating product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add New Product</h2>
      <form className="add-product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Brand</label>
          <input type="text" name="brand" value={form.brand} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input type="text" name="category" value={form.category} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Price</label>
          <input type="number" name="price" value={form.price} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Discount Price</label>
          <input type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Specifications (JSON or text)</label>
          <textarea name="specifications" value={form.specifications} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Stock</label>
          <input type="number" name="stock" value={form.stock} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Warranty</label>
          <input type="text" name="warranty" value={form.warranty} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Shipping Info</label>
          <textarea name="shippingInfo" value={form.shippingInfo} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Return Policy</label>
          <textarea name="returnPolicy" value={form.returnPolicy} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Thumbnail Image</label>
          <input type="file" accept="image/*" onChange={handleThumbnailChange} required />
        </div>

        <div className="form-group">
          <label>Additional Images</label>
          <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
