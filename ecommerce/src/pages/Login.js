import { Button, Form, Input, message } from "antd";
import axios from "axios";
import React, { useState } from "react";
import Navbar from "../components/NavbarL";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    try {
      setLoading(true);

      const res = await axios.post(
        "https://92hktjzx-7045.inc1.devtunnels.ms/api/users/login",
        {
          email: values.email,
          password: values.password,
        }
      );

      const data = res?.data?.data;

      // Check login response
      if (!data || !data.token || !data.user) {
        message.error("Invalid login response");
        return;
      }

      // Check if account is inactive BEFORE storing user data
      if (data.user?.isActive === false) {
        message.error(
          "Your account is inactive. Please contact support."
        );
        return;
      }

      // Save user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.user?.name || "");
      localStorage.setItem("role", data.user?.role || "");
      localStorage.setItem("email", data.user?.email || "");
      localStorage.setItem("userId", data.user?._id || "");
      localStorage.setItem("mobile", data.user?.mobile || "");

      message.success("Login successful");

      // Role-based navigation
      if (data.user.role === "transporter") {
        navigate("/transporter-dashboard");
      } else if (data.user.role === "delivery") {
        navigate("/driver-dashboard");
      } else {
        // Default route for other roles
        navigate("/");
      }
    } catch (err) {
      console.error("Login Error:", err);

      message.error(
        err.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Navbar />

      <div className="login-wrapper">
        <div className="login-container">

          {/* LEFT SECTION */}
          <div className="login-left">
            <h1>Welcome Back</h1>

            <p>
              Login to continue shopping premium products, manage your
              orders, wishlist, and enjoy exclusive offers.
            </p>

            <div className="login-features">
              <div>
                <span>✔</span> Secure Login
              </div>

              <div>
                <span>✔</span> Fast Checkout
              </div>

              <div>
                <span>✔</span> Easy Order Tracking
              </div>

              <div>
                <span>✔</span> Wishlist & Offers
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="login-right">
            <h2>Login</h2>

            <p className="login-subtitle">
              Enter your credentials to access your account
            </p>

            <Form
              onFinish={handleLogin}
              layout="vertical"
            >
              {/* EMAIL */}
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Enter email",
                  },
                  {
                    type: "email",
                    message: "Enter valid email",
                  },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>

              {/* PASSWORD */}
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: true,
                    message: "Enter password",
                  },
                ]}
              >
                <Input.Password
                  placeholder="Enter password"
                />
              </Form.Item>

              {/* FORGOT PASSWORD */}
              <div
                style={{
                  textAlign: "right",
                  marginBottom: "15px",
                }}
              >
                <Link
                  to="/forgot-password"
                  className="forgot-link"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* LOGIN BUTTON */}
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
              >
                Login
              </Button>
            </Form>

            {/* REGISTER */}
            <p className="login-register-text">
              New user?{" "}
              <Link to="/register">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}