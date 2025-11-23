import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./register";
import Login from "./Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
