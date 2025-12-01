import React from "react";
import Sidebar from "../components/Sidebar";
import "../styles/categories.css";

// Import images
// Import images
import electronicsImg from "../assets/electronicsImg .jpeg";
import clothingImg from "../assets/clothingImg .jpeg";
import booksImg from "../assets/books.jpeg";
import homeImg from "../assets/homeImg.jpeg";
import beautyImg from "../assets/beauty.jpeg";
import sportsImg from "../assets/sportsImg.jpeg";
import toysImg from "../assets/toy.jpeg";
import automotiveImg from "../assets/automotiveImg .jpeg";
import jewelryImg from "../assets/jewelry.jpeg";
import musicImg from "../assets/musicImg .jpeg";

export default function CategoryPage() {
  const categories = [
    { name: "Electronics", image: electronicsImg },
    { name: "Clothing", image: clothingImg },
    { name: "Books", image: booksImg },
    { name: "Home & Kitchen", image: homeImg },
    { name: "Beauty & Personal Care", image: beautyImg },
    { name: "Sports & Fitness", image: sportsImg },
    { name: "Toys & Games", image: toysImg },
    { name: "Automotive", image: automotiveImg },
    { name: "Jewelry", image: jewelryImg },
    { name: "Music & Instruments", image: musicImg },
  ];

  return (
    <div className="category-page-row-container">
      <aside className="category-sidebar">
        <Sidebar />
      </aside>

      <main className="category-row-content">
        <h1>All Categories</h1>

        <div className="category-row-list">
          {categories.map((cat, index) => (
            <div className="category-row-item" key={index}>
              <img src={cat.image} alt={cat.name} className="category-row-image" />
              <span className="category-row-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
