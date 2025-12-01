import React from "react";
import Sidebar from "../components/Sidebar";
import "../styles/products.css";

// Import all product images
import smartphone from "../assets/smartphone.jpeg";
import shoes from "../assets/Running Shoes.jpeg";
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
  const products = [
    { name: "Smartphone", price: "$499", image: smartphone },
    { name: "Running Shoes", price: "$79", image: shoes },
    { name: "Laptop", price: "$999", image: laptop },
    { name: "Headphones", price: "$149", image: headphones },
    { name: "Wrist Watch", price: "$199", image: watch },
    { name: "Backpack", price: "$59", image: backpack },
    { name: "Camera", price: "$599", image: camera },
    { name: "Sunglasses", price: "$89", image: sunglasses },
    { name: "Gaming Console", price: "$399", image: console },
    { name: "Bookshelf", price: "$120", image: bookshelf },
    { name: "Tablet", price: "$299", image: tablet },
    { name: "Fitness Tracker", price: "$129", image: tracker },
  ];

  return (
    <div className="product-page-container">
      {/* Sidebar */}
      <div className="product-sidebar">
        <Sidebar />
      </div>

      {/* Content */}
      <div className="product-content">
        <h2>Products</h2>

        <div className="product-grid">
          {products.map((product, index) => (
            <div className="product-item" key={index}>
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
