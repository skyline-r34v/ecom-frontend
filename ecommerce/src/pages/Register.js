import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { message, Form, Input, Button } from "antd";
import axios from "axios";

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
    <div style={styles.container}>
      <h2>Register</h2>

      <Form onFinish={handleRegister} layout="vertical">
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: "Enter name" }]}
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
          label="mobile"
          rules={[{ required: true, message: "Enter Number" }]}
        >
          <Input placeholder="Enter Number" />
        </Form.Item>
        <Form.Item
          name="password"
          label="password"
          rules={[{ required: true, message: "Enter password" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Register
        </Button>
      </Form>

      <p style={{ marginTop: 10 }}>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}

const styles = {
  container: {
    width: "350px",
    margin: "80px auto",
    padding: "25px",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
  },
};
