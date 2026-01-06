import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import User from "./pages/User";

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
import Cart from "./components/Cart";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Checkout from "./pages/Checkout";   // ✅ ADD THIS

// Admin
import AdminOrders from "./pages/AdminOrders";

// Brands
import BrandCreate from "./pages/Brands/Create";
import BrandList from "./pages/Brands/Lists";
import BrandEdit from "./pages/Brands/Update";

function App() {
  const role = localStorage.getItem("role"); // admin / customer

  return (
    <BrowserRouter>
      <Routes>

        {/* ================= HOME ================= */}
        <Route path="/" element={<Home />} />

        {/* ================= AUTH ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= PRODUCTS ================= */}
        <Route path="/products" element={<Product />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/products/add" element={<Createproduct />} />

        {/* ================= CATEGORIES ================= */}
        <Route path="/category" element={<Category />} />
        <Route path="/create-category" element={<Createcategory />} />
        <Route path="/edit-category/:id" element={<EditCategory />} />

        {/* ================= USER ================= */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<User />} />

        {/* ================= CART ================= */}
        <Route path="/cart" element={<Cart />} />

        {/* ================= ORDERS ================= */}
        <Route path="/checkout" element={<Checkout />} />  {/* ✅ REQUIRED */}
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />

        {/* ================= BRANDS ================= */}
        <Route path="/brands" element={<BrandList />} />
        <Route path="/brands/create" element={<BrandCreate />} />
        <Route path="/brands/edit/:slug" element={<BrandEdit />} />

        {/* ================= ADMIN ================= */}
        {role === "admin" && (
          <Route path="/admin/orders" element={<AdminOrders />} />
        )}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
