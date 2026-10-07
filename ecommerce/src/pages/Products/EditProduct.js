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

  const [existingThumbnail, setExistingThumbnail] = useState("");
  const [existingImages, setExistingImages] = useState([]);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchCategories();
    fetchBrands();
  }, [id]);

  // =========================================================
  // FETCH PRODUCT
  // =========================================================

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);

      const product = res.data.data;
      const detail = product.detail || {};

      setForm({
        title: product.title || "",
        brand: product.brand?._id || "",
        category: product.category?._id || "",
        price: product.price ?? "",
        discountPrice: product.discountPrice ?? "",

        description: detail.description || "",

        specifications:
          Array.isArray(detail.specifications) &&
          detail.specifications.length > 0
            ? detail.specifications.map((spec) => ({
                key: spec.key || "",
                value: spec.value || "",
              }))
            : [{ key: "", value: "" }],

        stock: detail.stock ?? "",
        warranty: detail.warranty || "",
        returnPolicy: detail.returnPolicy || "",

        pickUpaddresses: {
          street: detail.pickUpaddresses?.street || "",
          city: detail.pickUpaddresses?.city || "",
          state: detail.pickUpaddresses?.state || "",
          country: detail.pickUpaddresses?.country || "",
          postalCode: detail.pickUpaddresses?.postalCode || "",
        },
      });

      // Existing images
      setExistingThumbnail(product.thumbnail || "");
      setExistingImages(
        Array.isArray(product.images) ? product.images : []
      );
    } catch (err) {
      console.error("Fetch product error:", err);
      message.error(
        err.response?.data?.message || "Failed to load product"
      );
    }
  };

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  const fetchCategories = async () => {
    try {
      const res = await api.post("/categories/list", {
        page: 1,
        size: 100,
      });

      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Fetch categories error:", err);
      message.error("Failed to load categories");
    }
  };

  // =========================================================
  // FETCH BRANDS
  // =========================================================

  const fetchBrands = async () => {
    try {
      const res = await api.post("/brands/list", {
        page: 1,
        size: 100,
      });

      setBrands(res.data.data || []);
    } catch (err) {
      console.error("Fetch brands error:", err);
      message.error("Failed to load brands");
    }
  };

  // =========================================================
  // BASIC FORM HANDLER
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // SPECIFICATIONS
  // =========================================================

  const handleSpecChange = (index, field, value) => {
    setForm((prev) => {
      const updatedSpecs = [...prev.specifications];

      updatedSpecs[index] = {
        ...updatedSpecs[index],
        [field]: value,
      };

      return {
        ...prev,
        specifications: updatedSpecs,
      };
    });
  };

  const addSpec = () => {
    setForm((prev) => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        {
          key: "",
          value: "",
        },
      ],
    }));
  };

  const removeSpec = (index) => {
    setForm((prev) => {
      const updatedSpecs = prev.specifications.filter(
        (_, i) => i !== index
      );

      return {
        ...prev,
        specifications:
          updatedSpecs.length > 0
            ? updatedSpecs
            : [{ key: "", value: "" }],
      };
    });
  };

  // =========================================================
  // PICKUP ADDRESS
  // =========================================================

  const handlePickupChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      pickUpaddresses: {
        ...prev.pickUpaddresses,
        [field]: value,
      },
    }));
  };

  // =========================================================
  // THUMBNAIL
  // =========================================================

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      message.error("Thumbnail must be less than 100 KB");
      e.target.value = "";
      return;
    }

    setThumbnail(file);
  };

  // =========================================================
  // PRODUCT IMAGES
  // =========================================================

  const handleImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    for (const file of selectedFiles) {
      if (file.size > MAX_IMAGE_SIZE) {
        message.error("Each image must be less than 100 KB");
        e.target.value = "";
        return;
      }
    }

    setImages(selectedFiles);
  };

  // =========================================================
  // UPDATE PRODUCT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      message.error("Title is required");
      return;
    }

    if (!form.price) {
      message.error("Price is required");
      return;
    }

    if (!form.stock) {
      message.error("Stock is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // -----------------------------------------------------
      // PRODUCT FIELDS
      // -----------------------------------------------------

      formData.append("title", form.title);
      formData.append("brand", form.brand);
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append("discountPrice", form.discountPrice);

      // -----------------------------------------------------
      // DETAIL FIELDS
      // -----------------------------------------------------

      formData.append("description", form.description);

      formData.append(
        "specifications",
        JSON.stringify(form.specifications)
      );

      formData.append("stock", form.stock);
      formData.append("warranty", form.warranty);
      formData.append("returnPolicy", form.returnPolicy);

      // -----------------------------------------------------
      // PICKUP ADDRESS
      // -----------------------------------------------------

      formData.append(
        "pickUpaddresses[street]",
        form.pickUpaddresses.street
      );

      formData.append(
        "pickUpaddresses[city]",
        form.pickUpaddresses.city
      );

      formData.append(
        "pickUpaddresses[state]",
        form.pickUpaddresses.state
      );

      formData.append(
        "pickUpaddresses[country]",
        form.pickUpaddresses.country
      );

      formData.append(
        "pickUpaddresses[postalCode]",
        form.pickUpaddresses.postalCode
      );

      // -----------------------------------------------------
      // NEW THUMBNAIL
      // -----------------------------------------------------

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      // -----------------------------------------------------
      // NEW PRODUCT IMAGES
      // -----------------------------------------------------

      images.forEach((image) => {
        formData.append("images", image);
      });

      // -----------------------------------------------------
      // API REQUEST
      // -----------------------------------------------------

      await api.put(`/products/update/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Product updated successfully");

      navigate("/products");
    } catch (err) {
      console.error("Update product error:", err);

      message.error(
        err.response?.data?.message ||
          "Server error while updating product"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="add-product-container">

      {/* HEADER */}

      <div className="add-product-header">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h2>Edit Product</h2>
      </div>

      <form
        className="add-product-form"
        onSubmit={handleSubmit}
      >

        {/* ================================================= */}
        {/* BASIC INFORMATION */}
        {/* ================================================= */}

        <h3 className="section-title">
          Basic Information
        </h3>

        <div className="grid-2">

          <div className="form-group">
            <label>
              Title *
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Brand
            </label>

            <select
              name="brand"
              value={form.brand}
              onChange={handleChange}
            >
              <option value="">
                Select Brand
              </option>

              {brands.map((brand) => (
                <option
                  key={brand._id}
                  value={brand._id}
                >
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Category *
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Category
              </option>

              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* ================================================= */}
        {/* PRICING & INVENTORY */}
        {/* ================================================= */}

        <h3 className="section-title">
          Pricing & Inventory
        </h3>

        <div className="grid-2">

          <div className="form-group">
            <label>
              Price *
            </label>

            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Discount Price
            </label>

            <input
              type="number"
              name="discountPrice"
              value={form.discountPrice}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Stock *
            </label>

            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>

        </div>

        {/* ================================================= */}
        {/* PRODUCT DETAILS */}
        {/* ================================================= */}

        <h3 className="section-title">
          Product Details
        </h3>

        <div className="form-group">

          <label>
            Description
          </label>

          <textarea
            name="description"
            placeholder="Product description"
            value={form.description}
            onChange={handleChange}
          />

        </div>

        {/* ================================================= */}
        {/* SPECIFICATIONS */}
        {/* ================================================= */}

        <h3 className="section-title">
          Specifications
        </h3>

        {form.specifications.map((spec, index) => (
          <div
            key={index}
            className="spec-row"
          >

            <input
              placeholder="Key (e.g. RAM)"
              value={spec.key}
              onChange={(e) =>
                handleSpecChange(
                  index,
                  "key",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Value (e.g. 16GB)"
              value={spec.value}
              onChange={(e) =>
                handleSpecChange(
                  index,
                  "value",
                  e.target.value
                )
              }
            />

            <button
              type="button"
              onClick={() => removeSpec(index)}
            >
              ❌
            </button>

          </div>
        ))}

        <button
          type="button"
          onClick={addSpec}
        >
          + Add Specification
        </button>

        {/* ================================================= */}
        {/* WARRANTY & RETURN */}
        {/* ================================================= */}

        <h3 className="section-title">
          Warranty & Return Policy
        </h3>

        <div className="grid-2">

          <div className="form-group">

            <label>
              Warranty
            </label>

            <input
              name="warranty"
              placeholder="e.g. 1 Year Manufacturer Warranty"
              value={form.warranty}
              onChange={handleChange}
            />

          </div>

          <div className="form-group">

            <label>
              Return Policy
            </label>

            <input
              name="returnPolicy"
              placeholder="e.g. 7 Days Return"
              value={form.returnPolicy}
              onChange={handleChange}
            />

          </div>

        </div>

        {/* ================================================= */}
        {/* PICKUP ADDRESS */}
        {/* ================================================= */}

        <h3 className="section-title">
          Pickup Address
        </h3>

        <div className="grid-2">

          <input
            placeholder="Street"
            value={form.pickUpaddresses.street}
            onChange={(e) =>
              handlePickupChange(
                "street",
                e.target.value
              )
            }
          />

          <input
            placeholder="City"
            value={form.pickUpaddresses.city}
            onChange={(e) =>
              handlePickupChange(
                "city",
                e.target.value
              )
            }
          />

          <input
            placeholder="State"
            value={form.pickUpaddresses.state}
            onChange={(e) =>
              handlePickupChange(
                "state",
                e.target.value
              )
            }
          />

          <input
            placeholder="Country"
            value={form.pickUpaddresses.country}
            onChange={(e) =>
              handlePickupChange(
                "country",
                e.target.value
              )
            }
          />

          <input
            placeholder="Postal Code"
            value={form.pickUpaddresses.postalCode}
            onChange={(e) =>
              handlePickupChange(
                "postalCode",
                e.target.value
              )
            }
          />

        </div>

        {/* ================================================= */}
        {/* EXISTING MEDIA */}
        {/* ================================================= */}

        <h3 className="section-title">
          Existing Media
        </h3>

        <div className="form-group">

          <label>
            Current Thumbnail
          </label>

          {existingThumbnail ? (
            <div>
              <img
                src={existingThumbnail}
                alt="Current thumbnail"
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginTop: "10px",
                }}
              />
            </div>
          ) : (
            <p>
              No thumbnail available
            </p>
          )}

        </div>

        <div className="form-group">

          <label>
            Current Product Images
          </label>

          {existingImages.length > 0 ? (
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "10px",
              }}
            >
              {existingImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Product ${index + 1}`}
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              ))}
            </div>
          ) : (
            <p>
              No product images available
            </p>
          )}

        </div>

        {/* ================================================= */}
        {/* CHANGE THUMBNAIL */}
        {/* ================================================= */}

        <h3 className="section-title">
          Update Media
        </h3>

        <div className="form-group">

          <label>
            Change Thumbnail (Max 100KB)
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
          />

          {thumbnail && (
            <p>
              Selected: {thumbnail.name}
            </p>
          )}

        </div>

        {/* ================================================= */}
        {/* NEW IMAGES */}
        {/* ================================================= */}

        <div className="form-group">

          <label>
            Upload New Images (Max 100KB each)
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
          />

          {images.length > 0 && (
            <p>
              {images.length} new image(s) selected
            </p>
          )}

        </div>

        {/* ================================================= */}
        {/* SUBMIT */}
        {/* ================================================= */}

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading
            ? "Updating..."
            : "Update Product"}
        </button>

      </form>
    </div>
  );
}
