import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Home from "./pages/Home.js";
import User from "./pages/User.js";
import Product from "./pages/Products/Products.js";
import Category from "./pages/Categories/Categories.js";
import Profile from "./pages/Profile/Profile.js";
import Createcategory from "./pages/Categories/CreateCategory.js";
import ProductDetails from "./pages/Products/ProductDetails";
import Createpoduct from "./pages/Products/CreateProduct.js";
import EditCategory from "./pages/Categories/Editcategory.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Home Page */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Pages */}
        <Route path="/products" element={<Product />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/products/add" element={<Createpoduct />} />

        <Route path="/category" element={<Category />} />
        <Route path="/create-category" element={<Createcategory />} />
        <Route path="/edit-category/:id" element={<EditCategory />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/users" element={<User />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
