import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/categories.css";

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
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="category-page-row-container">
      <aside className="category-sidebar">
        <Sidebar />
      </aside>

      <main className="category-row-content">
        <div className="category-header">
          <h1>Explore All Categories</h1>
          <p>{filteredCategories.length} Categories Available</p>
        </div>

        <input
          type="text"
          className="category-search"
          placeholder="Search category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Grid View */}
        <div className="category-grid">
          {filteredCategories.map((cat, index) => (
            <div className="category-card" key={index}>
              <img src={cat.image} alt={cat.name} className="category-card-image" />
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
