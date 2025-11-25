import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = { email, password };
      const res = await axios.post(
        "http://10.254.92.201:7045/api/users/login",
        data
      );

      alert("Login Successful!");
      console.log(res.data.data);

      if (res.data.data.token) {
        localStorage.setItem("token", res.data.data.token);
      }
      if (res.data.data.user.role) {
        localStorage.setItem("role", res.data.data.user.role);
      }
      if (res.data.data.user.name) {
        localStorage.setItem("userName", res.data.data.user.name);
      }
      if (res.data.data.user.email) {
        localStorage.setItem("userEmail", res.data.data.user.email);
      }

      // ✅ Redirect correctly to Category List page
      navigate("/dashboard");

    } catch (error) {
      alert("Invalid Credentials!");
      console.log(error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
