import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { message, Form, Input, Button } from "antd";
import Navbar from "../components/NavbarL";
import axios from "axios";
import "../styles/register.css";

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    try {
      const res = await axios.post(
        "https://s657g66h-7045.inc1.devtunnels.ms/api/users/create",
        {
          name: values.name,
          email: values.email,
          password: values.password,
          mobile: values.mobile
        }
      );

      message.success("Registration successful. Please login.");
      navigate("/");

    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-page">
      <Navbar />

      <div className="register-wrapper">
        <div className="register-container">
          <div className="register-left">
            <h1>Create Account</h1>
            <p>
              Join OneKart and explore premium products, fast delivery,
              secure checkout, and exclusive shopping offers.
            </p>

            <div className="register-features">
              <div><span>✔</span> Premium Products</div>
              <div><span>✔</span> Easy Checkout</div>
              <div><span>✔</span> Secure Payments</div>
              <div><span>✔</span> Fast Delivery</div>
            </div>
          </div>

          <div className="register-right">
            <h2>Register</h2>
            <p className="register-subtitle">
              Create your account to start shopping
            </p>

            <Form onFinish={handleRegister} layout="vertical">
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Enter full name" }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Enter email" },
                  { type: "email", message: "Enter valid email" }
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>

              <Form.Item
                name="mobile"
                label="Mobile Number"
                rules={[{ required: true, message: "Enter mobile number" }]}
              >
                <Input placeholder="Enter mobile number" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: "Enter password" }]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>

              <Button type="primary" htmlType="submit" block>
                Register
              </Button>
            </Form>

            <p className="register-login-text">
              Already have an account? <Link to="/">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>

  );
}
