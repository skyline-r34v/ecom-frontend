import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/productDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.message); // EXACT match to backend
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Unable to load product details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  if (loading) return <h2>Loading product details...</h2>;
  if (error) return <h2>{error}</h2>;
  if (!product) return <h2>Product not found</h2>;

  const { detail } = product;

  return (
    <div className="product-details-page">

      {/* TOP SECTION */}
      <div className="product-details-wrapper">

        {/* IMAGES */}
        <div className="product-images-section">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="main-image"
          />

          <div className="image-gallery">
            {product.images?.map((img, index) => (
              <img key={index} src={img} alt={`img-${index}`} />
            ))}
          </div>
        </div>

        {/* BASIC INFO */}
        <div className="product-info-section">
          <h1>{product.title}</h1>
          <p className="slug">Slug: {product.slug}</p>

          <p><strong>Brand:</strong> {product.brand}</p>
          <p><strong>Category:</strong> {product.category?.name}</p>

          <p className="price">
            ₹{product.discountPrice}
            <del> ₹{product.price}</del>
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {product.isActive ? "Available" : "Unavailable"}
          </p>

          <button className="add-cart-btn">
            Add to Cart
          </button>
        </div>
      </div>

      {/* DESCRIPTION */}
      {detail?.description && (
        <section className="details-section">
          <h3>Product Description</h3>
          <p>{detail.description}</p>
        </section>
      )}

      {/* SPECIFICATIONS */}
      {detail?.specifications && (
        <section className="details-section">
          <h3>Specifications</h3>
          <table className="spec-table">
            <tbody>
              {Object.entries(detail.specifications).map(([key, value]) => (
                <tr key={key}>
                  <td className="spec-key">{key}</td>
                  <td className="spec-value">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* STOCK & POLICIES */}
      <section className="details-section">
        <h3>Purchase & Warranty</h3>
        <ul>
          <li><strong>Stock Available:</strong> {detail?.stock}</li>
          <li><strong>Warranty:</strong> {detail?.warranty}</li>
          <li><strong>Shipping:</strong> {detail?.shippingInfo}</li>
          <li><strong>Return Policy:</strong> {detail?.returnPolicy}</li>
        </ul>
      </section>

      {/* CATEGORY DETAILS */}
      <section className="details-section">
        <h3>Category Details</h3>
        <ul>
          <li><strong>Name:</strong> {product.category?.name}</li>
          <li><strong>Description:</strong> {product.category?.description}</li>
          <li><strong>Active:</strong> {product.category?.isActive ? "Yes" : "No"}</li>
        </ul>

        {product.category?.image && (
          <img
            src={product.category.image}
            alt={product.category.name}
            className="category-image"
          />
        )}
      </section>

      {/* CREATED BY */}
      <section className="details-section">
        <h3>Created By</h3>
        <ul>
          <li><strong>Name:</strong> {product.createdBy?.name}</li>
          <li><strong>Email:</strong> {product.createdBy?.email}</li>
          <li><strong>Role:</strong> {product.createdBy?.role}</li>
        </ul>
      </section>

    
    </div>
  );
}
