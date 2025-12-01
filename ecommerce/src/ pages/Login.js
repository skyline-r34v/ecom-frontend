import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button } from "antd";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/category"); // redirect to Home
  };

  return (
    <div style={styles.container}>
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

      <p style={{ marginTop: 10 }}>
        New user? <Link to="/register">Register here</Link>
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
