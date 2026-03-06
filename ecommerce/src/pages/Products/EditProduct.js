import React, { useEffect, useState } from "react";
import "../../styles/AddProduct.css";
import api from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";

const MAX_IMAGE_SIZE = 100 * 1024;

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

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
    fetchProduct();
    fetchCategories();
    fetchBrands();
  }, []);

  /* ================= FETCH PRODUCT ================= */

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const product = res.data.data;

      setForm({
        title: product.title || "",
        brand: product.brand?._id || "",
        category: product.category?._id || "",
        price: product.price || "",
        discountPrice: product.discountPrice || "",
        description: product.description || "",
        specifications: product.specifications || "",
        stock: product.stock || "",
        warranty: product.warranty || "",
        returnPolicy: product.returnPolicy || "",
        pickupAddresses:
          product.pickupAddresses?.length > 0
            ? product.pickupAddresses
            : [{ street: "", city: "", state: "", country: "", postalCode: "" }],
      });
    } catch (err) {
      message.error("Failed to load product");
    }
  };

  /* ================= FETCH DROPDOWN DATA ================= */

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

  /* ================= FORM HANDLERS ================= */

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePickupChange = (index, field, value) => {
    const updated = [...form.pickupAddresses];
    updated[index][field] = value;
    setForm({ ...form, pickupAddresses: updated });
  };

  /* ================= IMAGE HANDLING ================= */

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      message.error("Thumbnail must be less than 100 KB");
      return;
    }

    setThumbnail(file);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);

    for (let file of files) {
      if (file.size > MAX_IMAGE_SIZE) {
        message.error("Each image must be less than 100 KB");
        return;
      }
    }

    setImages(files);
  };

  /* ================= UPDATE PRODUCT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      images.forEach((img) => {
        formData.append("images", img);
      });

      await api.put(`/products/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Product updated successfully");
      navigate("/products");
    } catch (err) {
      message.error(
        err.response?.data?.message || "Server error while updating product"
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
        <h2>Edit Product</h2>
      </div>

      <form className="add-product-form" onSubmit={handleSubmit}>
        <h3 className="section-title">Basic Information</h3>

        <div className="grid-2">
          <div className="form-group">
            <label>Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Brand</label>
            <select name="brand" value={form.brand} onChange={handleChange}>
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
        </div>

        <h3 className="section-title">Pricing & Inventory</h3>

        <div className="grid-2">
          <div className="form-group">
            <label>Price *</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
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
            <label>Stock *</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
            />
          </div>
        </div>

        <h3 className="section-title">Media</h3>

        <div className="form-group">
          <label>Change Thumbnail</label>
          <input type="file" accept="image/*" onChange={handleThumbnailChange} />
        </div>

        <div className="form-group">
          <label>Upload New Images</label>
          <input type="file" multiple onChange={handleImagesChange} />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}