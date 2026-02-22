import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    try {
      setLoading(true);

      const res = await axios.post(
        "https://ecom-backend-awcn.onrender.com/api/users/login",
        {
          email: values.email,
          password: values.password,
        }
      );

      const data = res?.data?.data;

      if (!data) {
        message.error("Invalid server response");
        return;
      }

      if (data.isActive == true) {
        message.success("Login successful!");

        // Save user data safely
        localStorage.setItem("token", data.token);
        localStorage.setItem("name", data.user?.name || "");
        localStorage.setItem("role", data.user?.role || "");
        localStorage.setItem("email", data.user?.email || "");
        localStorage.setItem("userId", data.user?._id || "");
        localStorage.setItem("mobile", data.user?.mobile || "");

        navigate("/");
      } else {
        message.error(
          "Your account is deactivated. Please contact support."
        );
      }
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

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Enter password" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={loading}>
          Login
        </Button>
      </Form>

      <p className="login-register-text">
        New user? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
