import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";

import Product from "./pages/Products.js"
import Category from "./pages/Categories.js"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* First Page */}
        <Route path="/" element={<Login />} />

        {/* Registration */}
        <Route path="/register" element={<Register />} />

        {/* Dashboard Home */}
        
        <Route path="/product" element={<Product  />} />
        <Route path="/category" element={<Category  />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
