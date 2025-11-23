import React, { useState } from "react";
import axios from "axios";
import "./style/login.css";   // <-- Correct CSS import

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = {email,password}
      const res = await axios.post(
        "https://s657g66h-7045.inc1.devtunnels.ms/api/users/login",data
      );

      alert("Login Successful!");
      console.log(res.data);

      // Store token if backend sends one
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
    
      }
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
