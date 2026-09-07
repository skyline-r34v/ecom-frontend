import React from "react";

const foodCategories = [
  { name: "Pizza", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400" },
  { name: "Burgers", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400" },
  { name: "Chinese", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=400" },
  { name: "Indian", img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=400" },
  { name: "Sushi", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400" },
  { name: "Healthy", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400" },
  { name: "Desserts", img: "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?q=80&w=400" },
];

const restaurants = [
  { name: "The Urban Kitchen", cuisine: "Indian • North Indian", rating: "4.6", time: "25–30 min", fee: "₹40", img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800", offer: "50% OFF" },
  { name: "Sushi & Co.", cuisine: "Japanese • Asian", rating: "4.8", time: "35–40 min", fee: "Free", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800", offer: "20% OFF" },
  { name: "Burger Station", cuisine: "American • Fast Food", rating: "4.3", time: "20–25 min", fee: "₹25", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800", offer: "BUY 1 GET 1" },
  { name: "Pizza Paradiso", cuisine: "Italian • Pizza", rating: "4.5", time: "30–35 min", fee: "₹50", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800", offer: "FREE DESSERT" },
];

const popularDishes = [
  { name: "Paneer Butter Masala", rest: "The Urban Kitchen", price: 249, rating: "4.7", img: "https://images.unsplash.com/photo-1631452180519-c014fe946cea?q=80&w=500", veg: true },
  { name: "Spicy Chicken Burger", rest: "Burger Station", price: 189, rating: "4.5", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500", veg: false },
  { name: "Margherita Pizza", rest: "Pizza Paradiso", price: 399, rating: "4.6", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=500", veg: true },
  { name: "Dragon Roll Sushi", rest: "Sushi & Co.", price: 549, rating: "4.9", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500", veg: false },
];

export default function FoodHome() {
  return (
    <>
      <section className="food-top-section">
        <div className="food-hero">
          <div className="food-hero-content">
            <h1>Good Food. Delivered Fast.</h1>
            <p>Discover restaurants, order your favorite dishes and enjoy delicious food at your doorstep.</p>
            <button className="btn-primary">Order Now</button>
          </div>
        </div>
      </section>

      <section className="section-container">
        <h2 className="section-title">What are you craving?</h2>
        <div className="food-categories-scroll">
          {foodCategories.map((c, i) => (
            <div className="food-cat-circle" key={i}>
              <img src={c.img} alt={c.name} />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container">
        <h2 className="section-title">🔥 Best Offers Near You</h2>
        <div className="food-offers-grid">
          <div className="food-offer-card" style={{background: 'linear-gradient(135deg, #f87171, #ef4444)'}}>
            <h3>50% OFF</h3>
            <p>On your first order</p>
          </div>
          <div className="food-offer-card" style={{background: 'linear-gradient(135deg, #fbbf24, #f59e0b)'}}>
            <h3>FREE DELIVERY</h3>
            <p>On orders above ₹199</p>
          </div>
          <div className="food-offer-card" style={{background: 'linear-gradient(135deg, #34d399, #10b981)'}}>
            <h3>BUY 1 GET 1</h3>
            <p>On select pizzas</p>
          </div>
        </div>
      </section>

      <section className="section-container bg-light">
        <h2 className="section-title">Restaurants Near You</h2>
        <div className="restaurants-grid">
          {restaurants.map((r, i) => (
            <div className="restaurant-card" key={i}>
              <div className="rest-img">
                <img src={r.img} alt={r.name} />
                <span className="rest-offer">{r.offer}</span>
              </div>
              <div className="rest-info">
                <div className="rest-header">
                  <h3>{r.name}</h3>
                  <span className="rest-rating">⭐ {r.rating}</span>
                </div>
                <p className="rest-cuisine">{r.cuisine}</p>
                <div className="rest-meta">
                  <span>{r.time}</span>
                  <span>•</span>
                  <span>Delivery: {r.fee}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container">
        <h2 className="section-title">Popular Near You</h2>
        <div className="dishes-grid">
          {popularDishes.map((d, i) => (
            <div className="dish-card" key={i}>
              <div className="dish-img-container">
                <img src={d.img} alt={d.name} />
              </div>
              <div className="dish-info">
                <span className={d.veg ? 'veg-icon' : 'nonveg-icon'}></span>
                <h4>{d.name}</h4>
                <p className="dish-rest">{d.rest}</p>
                <div className="dish-footer">
                  <span className="dish-price">₹{d.price}</span>
                  <button className="add-dish-btn">+ Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <footer className="mega-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>NOVAA</h3>
            <p>About Us</p>
            <p>Contact Us</p>
            <p>Careers</p>
            <p>Our Stores</p>
          </div>
          <div className="footer-col">
            <h3>CUSTOMER SERVICE</h3>
            <p>Help Center</p>
            <p>Shipping Information</p>
            <p>Returns & Refunds</p>
            <p>Track Order</p>
          </div>
          <div className="footer-col">
            <h3>POLICIES</h3>
            <p>Privacy Policy</p>
            <p>Terms & Conditions</p>
            <p>Refund Policy</p>
            <p>Cookie Policy</p>
          </div>
          <div className="footer-col">
            <h3>CONNECT</h3>
            <p>Instagram</p>
            <p>Facebook</p>
            <p>YouTube</p>
            <p>LinkedIn</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 NOVAA. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}
