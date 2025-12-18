import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";

import Product from "./pages/Products.js"
import Category from "./pages/Categories/Categories.js"
import Profile from "./pages/Profile/Profile.js"
import Createcategory from "./pages/Categories/CreateCategory.js"
import ProductDetails from "./pages/ProductDetails";
import Createpoduct from "./pages/CreateProduct.js";
import EditCategory from "./pages/Categories/Editcategory.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* First Page */}
        <Route path="/" element={<Login />} />

        {/* Registration */}
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Product  />} />
        <Route path="/category" element={<Category  />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/create-category" element={<Createcategory />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/products/add" element={<Createpoduct />} />
        <Route path="/edit-category/:id" element={<EditCategory />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
