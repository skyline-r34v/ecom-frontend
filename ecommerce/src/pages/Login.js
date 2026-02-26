import { Button, Form, Input, message } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    try {
      setLoading(true);

      const res = await axios.post(
        "https://s657g66h-7045.inc1.devtunnels.ms/api/users/login",
        {
          email: values.email,
          password: values.password,
        }
      );

      const data = res?.data?.data;

      if (!data || !data.token) {
        message.error("Invalid login response");
        return;
      }

      // Save user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.user?.name || "");
      localStorage.setItem("role", data.user?.role || "");
      localStorage.setItem("email", data.user?.email || "");
      localStorage.setItem("userId", data.user?._id || "");
      localStorage.setItem("mobile", data.user?.mobile || "");
      if(data.user?.isActive === false){
        message.error("Your account is inactive. Please contact support.");
        return;
      }

      message.success("Login successful");
      navigate("/");

    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <Form onFinish={handleLogin} layout="vertical">
        {/* Email */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Enter email" },
            { type: "email", message: "Enter valid email" },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        {/* Password */}
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Enter password" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        {/* Forgot Password */}
        <div style={{ textAlign: "right", marginBottom: "15px" }}>
          <Link to="/forgot-password" className="forgot-link">
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <Button type="primary" htmlType="submit" block loading={loading}>
          Login
        </Button>
      </Form>

      {/* Register Link */}
      <p className="login-register-text">
        New user? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}