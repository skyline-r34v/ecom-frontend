import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import axios from "axios"                     // axios instance
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    try {
      // POST Login API
      const res = await axios.post("https://s657g66h-7045.inc1.devtunnels.ms/api/users/login", {
        email: values.email,
        password: values.password,
      });

      // Show success message
      message.success("Login successful!");

      // Save token
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("name", res.data.data.user.name);
      localStorage.setItem("role", res.data.data.user.role);
      localStorage.setItem("email", res.data.data.user.email);
      localStorage.setItem("userId", res.data.data.user._id);
      localStorage.setItem("mobile",res.data.data.user.mobile)
      
      // Redirect
      navigate("/");

    } catch (err) {
      console.error(err);

      // Show backend error message
      message.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <Form onFinish={handleLogin} layout="vertical">
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: "Enter email" }]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Enter password" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Login
        </Button>
      </Form>

      <p className="login-register-text">
        New user? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
