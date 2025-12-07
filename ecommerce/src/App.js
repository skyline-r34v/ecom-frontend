import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";

import Product from "./pages/Products.js"
import Category from "./pages/Categories/Categories.js"
import Profile from "./pages/Profile/Profile.js"
import Createcategory from "./pages/Categories/CreateCategory.js"

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
