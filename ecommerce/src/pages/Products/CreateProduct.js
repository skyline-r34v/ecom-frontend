import React, { useEffect, useState } from "react";
import "../../styles/AddProduct.css";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const MAX_IMAGE_SIZE = 100 * 1024; // 100KB

export default function AddProduct() {
  const navigate = useNavigate();

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
  /* Pickup Address Change */
  const handlePickupChange = (field, value) => {
    setForm({
      ...form,
      pickUpaddresses: {
        ...form.pickUpaddresses,
        [field]: value,
      },
    });
  };

  /* Thumbnail Upload */
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      message.error("Thumbnail must be less than 100 KB");
      return;
    }

    setThumbnail(file);
  };

  /* Multiple Images Upload */
  const handleImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    for (let file of selectedFiles) {
      if (file.size > MAX_IMAGE_SIZE) {
        message.error("Each image must be less than 100 KB");
        return;
      }
    }

    setImages(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return message.error("Title is required");
    if (!form.price) return message.error("Price is required");
    if (!form.stock) return message.error("Stock is required");
    if (!thumbnail) return message.error("Thumbnail is required");

    try {
      setLoading(true);

      const formData = new FormData();

      /* Basic fields */
      formData.append("title", form.title);
      formData.append("brand", form.brand);
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append("discountPrice", form.discountPrice);
      formData.append("description", form.description);
      formData.append(
        "specifications",
        JSON.stringify(form.specifications)
      );
      formData.append("stock", form.stock);
      formData.append("warranty", form.warranty);
      formData.append("returnPolicy", form.returnPolicy);

      /* Pickup Address (MATCHES BACKEND MODEL) */
      formData.append("pickUpaddresses[street]", form.pickUpaddresses.street);
      formData.append("pickUpaddresses[city]", form.pickUpaddresses.city);
      formData.append("pickUpaddresses[state]", form.pickUpaddresses.state);
      formData.append("pickUpaddresses[country]", form.pickUpaddresses.country);
      formData.append("pickUpaddresses[postalCode]", form.pickUpaddresses.postalCode);

      /* Images */
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

        <h3 className="section-title">Basic Information</h3>

        <div className="grid-2">
          <div className="form-group">
            <label>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} />
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

        <h3 className="section-title">Pricing</h3>

        <div className="grid-2">
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
          />

          <input
            type="number"
            name="discountPrice"
            placeholder="Discount Price"
            value={form.discountPrice}
            onChange={handleChange}
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
          />
        </div>

        <h3 className="section-title">Product Details</h3>

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <h3 className="section-title">Specifications</h3>

        {form.specifications.map((spec, index) => (
          <div key={index} className="spec-row">
            <input
              placeholder="Key (e.g. RAM)"
              value={spec.key}
              onChange={(e) =>
                handleSpecChange(index, "key", e.target.value)
              }
            />

            <input
              placeholder="Value (e.g. 16GB)"
              value={spec.value}
              onChange={(e) =>
                handleSpecChange(index, "value", e.target.value)
              }
            />

            <button type="button" onClick={() => removeSpec(index)}>
              ❌
            </button>
          </div>
        ))}

        <button type="button" onClick={addSpec}>
          + Add Specification
        </button>


        <h3 className="section-title">Pickup Address</h3>

        <div className="grid-2">

          <input
            placeholder="Street"
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

        <h3 className="section-title">Images</h3>

        <div className="form-group">
          <label>Thumbnail (Max 100KB)</label>
          <input type="file" onChange={handleThumbnailChange} />
        </div>

        <div className="form-group">
          <label>Product Images</label>
          <input type="file" multiple onChange={handleImagesChange} />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Creating..." : "Add Product"}
        </button>

      </form>
    </div>
  );
}