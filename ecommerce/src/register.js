import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./style/register.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://s657g66h-7045.inc1.devtunnels.ms/api/users/create",
        {
          name,
          email,
          password,
          role,
        }
      );

      alert("User Registered Successfully!");
      console.log(res.data);

      navigate("/login"); // Redirect to login after success
    } catch (error) {
      alert("Registration Failed!");
      console.log(error);
    }
  };

  return (
    <div className="register-container">
      <h2>Create an Account</h2>

      <form onSubmit={handleRegister} className="register-form">
        <input
          type="text"
          placeholder="Enter Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Role (User/Admin)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <button type="submit">Register</button>
      </form>

      {/* 🔽 Login button below register */}
      <p>
        Already have an account?{" "}
        <button
          onClick={() => navigate("/login")}
          className="login-link-btn"
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default Signup;
