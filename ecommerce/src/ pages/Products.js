import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/products.css";

// Product Images
import smartphone from "../assets/smartphone.jpeg";
import shoes from "../assets/Running_Shoes-removebg-preview.png";
import laptop from "../assets/Laptop.jpeg";
import headphones from "../assets/Headphones.jpeg";
import watch from "../assets/Wrist Watch.jpeg";
import backpack from "../assets/Backpack.jpeg";
import camera from "../assets/Camera.jpeg";
import sunglasses from "../assets/Sunglasses.jpeg";
import console from "../assets/Gaming Console.jpeg";
import bookshelf from "../assets/Bookshelf.jpeg";
import tablet from "../assets/Tablet.jpeg";
import tracker from "../assets/Fitness Tracker.jpeg";

export default function Product() {
  const allProducts = [
    { name: "Smartphone", price: "$499", category: "Electronics", image: smartphone, desc: "High-performance smartphone with fast processing and HD camera.", rating: "4.5 ★" },
    { name: "Running Shoes", price: "$79", category: "Fashion", image: shoes, desc: "Lightweight and durable shoes perfect for all terrains.", rating: "4.2 ★" },
    { name: "Laptop", price: "$999", category: "Electronics", image: laptop, desc: "High-speed laptop ideal for work, study, and gaming.", rating: "4.7 ★" },
    { name: "Headphones", price: "$149", category: "Electronics", image: headphones, desc: "Noise-cancellation headphones with deep bass.", rating: "4.6 ★" },
    { name: "Wrist Watch", price: "$199", category: "Fashion", image: watch, desc: "Premium wrist watch with stainless steel body.", rating: "4.3 ★" },
    { name: "Backpack", price: "$59", category: "Accessories", image: backpack, desc: "Waterproof backpack with multi-pocket storage.", rating: "4.1 ★" },
    { name: "Camera", price: "$599", category: "Electronics", image: camera, desc: "Professional DSLR with 24MP lens quality.", rating: "4.8 ★" },
    { name: "Sunglasses", price: "$89", category: "Fashion", image: sunglasses, desc: "UV-protected sunglasses with stylish frames.", rating: "4.4 ★" },
    { name: "Gaming Console", price: "$399", category: "Electronics", image: console, desc: "Next-gen console with ultra-fast loading.", rating: "4.9 ★" },
    { name: "Bookshelf", price: "$120", category: "Furniture", image: bookshelf, desc: "Modern wooden bookshelf with premium finish.", rating: "4.2 ★" },
    { name: "Tablet", price: "$299", category: "Electronics", image: tablet, desc: "Lightweight tablet with smooth performance.", rating: "4.5 ★" },
    { name: "Fitness Tracker", price: "$129", category: "Health", image: tracker, desc: "Track your steps, sleep, and heart rate easily.", rating: "4.4 ★" },
  ];

  const categories = ["All", "Electronics", "Fashion", "Accessories", "Furniture", "Health"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts =
    selectedCategory === "All"
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  const openModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setShowModal(false);
  };

  return (
    <div className="product-page-container">
      {/* Sidebar */}
      <div className="product-sidebar">
        <Sidebar />
      </div>

      {/* Content */}
      <div className="product-content">
        <h2 className="page-title">Products</h2>

        {/* Category Filter */}
        <div className="category-filter">
          {categories.map((cat, index) => (
            <button
              key={index}
              className={`filter-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {filteredProducts.map((product, index) => (
            <div className="product-item" key={index}>
              <div className="product-card">

                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                  onClick={() => openModal(product)}
                  style={{ cursor: "pointer" }}
                />

                <div className="product-info">
                  <p className="product-rating">{product.rating}</p>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.desc}</p>
                  <p className="product-price">{product.price}</p>

                  <button className="add-cart-btn">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedProduct.image} alt={selectedProduct.name} className="modal-image" />
            <h2>{selectedProduct.name}</h2>
            <p>{selectedProduct.desc}</p>
            <p className="product-price">{selectedProduct.price}</p>
            <p className="product-rating">{selectedProduct.rating}</p>
            <button className="add-cart-btn">Add to Cart</button>
            <button className="close-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
