import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Register from "./register";
import Dashboard from "./pages/Dashboard";
import CategoryList from "./pages/CategoryList";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default page → Registration */}
        <Route path="/" element={<Register />} />

        {/* Registration page */}
        <Route path="/register" element={<Register />} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* After Login → Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Category List Page */}
        <Route path="/categories" element={<CategoryList />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
