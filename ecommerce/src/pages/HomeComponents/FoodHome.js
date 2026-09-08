import React from "react";
import { useNavigate } from "react-router-dom";
import useFoodDeliveryStore from "../../store/foodDeliveryStore";
import FoodRoleSwitcher from "../../components/FoodRoleSwitcher";

export default function FoodHome() {
  const navigate = useNavigate();
  const restaurants = useFoodDeliveryStore((state) => state.restaurants);

  const handleOrderNow = () => {
    navigate("/food");
  };

  const handleRestaurantClick = (restId) => {
    navigate(`/food/restaurant-menu/${restId}`);
  };

  return (
    <>
      <FoodRoleSwitcher />

      <section className="food-top-section">
        <div className="food-hero">
          <div className="food-hero-content">
            <h1>Good Food. Delivered Fast in 25 Mins.</h1>
            <p>Discover top-rated restaurants, authentic wood-fired pizzas, juicy burgers, and royal biryanis with live GPS delivery tracking.</p>
            <button className="btn-primary" onClick={handleOrderNow}>Order Food Now →</button>
          </div>
        </div>
      </section>

      <section className="section-container">
        <h2 className="section-title">What are you craving?</h2>
        <div className="food-categories-scroll">
          {[
            { name: "Pizzas", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400" },
            { name: "Burgers", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400" },
            { name: "Biryani", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400" },
            { name: "Sushi & Asian", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400" },
            { name: "Healthy Bowls", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400" },
            { name: "Desserts", img: "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?q=80&w=400" }
          ].map((c, i) => (
            <div className="food-cat-circle" key={i} onClick={handleOrderNow} style={{ cursor: "pointer" }}>
              <img src={c.img} alt={c.name} />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container">
        <h2 className="section-title">🔥 Best Offers Near You</h2>
        <div className="food-offers-grid">
          <div className="food-offer-card" onClick={handleOrderNow} style={{ background: 'linear-gradient(135deg, #f87171, #ef4444)', cursor: "pointer" }}>
            <h3>50% OFF</h3>
            <p>Code: WELCOME50</p>
          </div>
          <div className="food-offer-card" onClick={handleOrderNow} style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', cursor: "pointer" }}>
            <h3>FREE DELIVERY</h3>
            <p>Code: FREEDEL</p>
          </div>
          <div className="food-offer-card" onClick={handleOrderNow} style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', cursor: "pointer" }}>
            <h3>20% OFF</h3>
            <p>Code: PIZZA20</p>
          </div>
        </div>
      </section>

      <section className="section-container bg-light">
        <h2 className="section-title">Restaurants Near You</h2>
        <div className="restaurants-grid">
          {restaurants.map((r) => (
            <div className="restaurant-card" key={r.id} onClick={() => handleRestaurantClick(r.id)} style={{ cursor: "pointer" }}>
              <div className="rest-img">
                <img src={r.image} alt={r.name} />
                <span className="rest-offer">{r.offer}</span>
              </div>
              <div className="rest-info">
                <div className="rest-header">
                  <h3>{r.name}</h3>
                  <span className="rest-rating">⭐ {r.rating}</span>
                </div>
                <p className="rest-cuisine">{r.cuisine}</p>
                <div className="rest-meta">
                  <span>{r.prepTime}</span>
                  <span>•</span>
                  <span>Delivery: ₹{r.deliveryFee}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mega-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>OneKart Food</h3>
            <p>About Us</p>
            <p>Contact Us</p>
            <p>Partner with us</p>
            <p>Ride with us</p>
          </div>
          <div className="footer-col">
            <h3>CUSTOMER SERVICE</h3>
            <p>Help Center</p>
            <p>Live GPS Tracking</p>
            <p>Refunds & Cancellations</p>
          </div>
          <div className="footer-col">
            <h3>CONNECTED ROLES</h3>
            <p style={{ cursor: "pointer" }} onClick={() => navigate("/food")}>1. Customer Food Portal</p>
            <p style={{ cursor: "pointer" }} onClick={() => navigate("/food/restaurant")}>2. Restaurant Vendor Panel</p>
            <p style={{ cursor: "pointer" }} onClick={() => navigate("/food/driver")}>3. Delivery Partner App</p>
            <p style={{ cursor: "pointer" }} onClick={() => navigate("/food/admin")}>4. Admin Live Dispatch</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 OneKart Food Delivery Management & Delivery Partner Cloud System.</p>
        </div>
      </footer>
    </>
  );
}
