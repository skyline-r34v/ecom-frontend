import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import User from "./pages/User";
import UserDetails from "./pages/UserDetails";

// Products
import Product from "./pages/Products/Products";
import ProductDetails from "./pages/Products/ProductDetails";
import Createproduct from "./pages/Products/CreateProduct";

// Categories
import Category from "./pages/Categories/Categories";
import Createcategory from "./pages/Categories/CreateCategory";
import EditCategory from "./pages/Categories/Editcategory";

// User
import Profile from "./pages/Profile/Profile";

// Cart & Orders
import Cart from "./pages/Profile/Cart";
import Wishlist from "./pages/Profile/Wishlist";
import MyOrders from "./pages/Profile/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Checkout from "./pages/Profile/Checkout";

// Admin
import AdminOrders from "./pages/Admin/User-Management/AdminOrders.js";

// Brands
import BrandCreate from "./pages/Brands/Create";
import BrandList from "./pages/Brands/Lists";
import BrandEdit from "./pages/Brands/Update";
import ForgotPassword from "./pages/ForgotPassword.js";
import EditProduct from "./pages/Products/EditProduct.js";

// Transport
import TransporterDashboard from "./pages/Transport/TransporterDashboard";
import DriverDashboard from "./pages/Transport/DriverDashboard";

// ================= FOOD DELIVERY & PARTNER SYSTEM =================
import FoodBrowse from "./pages/FoodDelivery/Customer/FoodBrowse";
import RestaurantDetail from "./pages/FoodDelivery/Customer/RestaurantDetail";
import FoodCheckout from "./pages/FoodDelivery/Customer/FoodCheckout";
import CustomerOrderTracking from "./pages/FoodDelivery/Customer/CustomerOrderTracking";
import CustomerOrdersList from "./pages/FoodDelivery/Customer/CustomerOrdersList";
import RestaurantDashboard from "./pages/FoodDelivery/Restaurant/RestaurantDashboard";
import DriverApp from "./pages/FoodDelivery/Driver/DriverApp";
import AdminFoodDashboard from "./pages/FoodDelivery/Admin/AdminFoodDashboard";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    const handleRoleChange = () => {
      setRole(localStorage.getItem("role"));
    };

    window.addEventListener("roleChanged", handleRoleChange);
    return () => window.removeEventListener("roleChanged", handleRoleChange);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* ================= HOME ================= */}
        <Route path="/" element={<Home />} />

        {/* ================= AUTH ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ================= PRODUCTS ================= */}
        <Route path="/products" element={<Product />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/products/add" element={<Createproduct />} />
        <Route path="/products/edit/:id" element={<EditProduct />} />

        {/* ================= CATEGORIES ================= */}
        <Route path="/category" element={<Category />} />
        <Route path="/create-category" element={<Createcategory />} />
        <Route path="/edit-category/:id" element={<EditCategory />} />

        {/* ================= USER ================= */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<User />} />
        <Route path="/users/:id" element={<UserDetails />} />

        {/* ================= CART ================= */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />

        {/* ================= ORDERS ================= */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />

        {/* ================= BRANDS ================= */}
        <Route path="/brands" element={<BrandList />} />
        <Route path="/brands/create" element={<BrandCreate />} />
        <Route path="/brands/edit/:slug" element={<BrandEdit />} />

        {/* ================= FOOD DELIVERY SYSTEM (4 CONNECTED ROLES) ================= */}
        {/* 1. Customer Food Portal */}
        <Route path="/food" element={<FoodBrowse />} />
        <Route path="/food/restaurant-menu/:id" element={<RestaurantDetail />} />
        <Route path="/food/checkout" element={<FoodCheckout />} />
        <Route path="/food/track/:id" element={<CustomerOrderTracking />} />
        <Route path="/food-orders" element={<CustomerOrdersList />} />

        {/* 2. Restaurant / Vendor Panel */}
        <Route path="/food/restaurant" element={<RestaurantDashboard />} />

        {/* 3. Delivery Partner / Driver Mobile App */}
        <Route path="/food/driver" element={<DriverApp />} />
        <Route path="/food/delivery-partner" element={<DriverApp />} />

        {/* 4. Admin Live Dispatch & Fleet Command Center */}
        <Route path="/food/admin" element={<AdminFoodDashboard />} />
        <Route path="/admin/food-delivery" element={<AdminFoodDashboard />} />

        {/* ================= ADMIN ================= */}
        {role === "admin" && (
          <Route path="/admin/orders" element={<AdminOrders />} />
        )}

        {/* ================= TRANSPORT ================= */}
        {role === "transporter" && (
          <Route path="/transporter-dashboard" element={<TransporterDashboard />} />
        )}
        {role === "delivery" && (
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
