import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();   // ✅ added

  // STEP 1 → SEND OTP
  const handleSendOtp = async (values) => {
    try {
      setLoading(true);

      const res = await axios.post(
        "https://s657g66h-7045.inc1.devtunnels.ms/api/users/forget-password",
        { email: values.email }
      );

      if (res.data.success) {
        message.success("OTP sent to your email");
        setEmail(values.email);
        setStep(2);
      } else {
        message.error(res.data.message);
      }

    } catch (err) {
      message.error(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 → VERIFY OTP & RESET PASSWORD
  const handleResetPassword = async (values) => {
    try {
      setLoading(true);

      const res = await axios.post(
        "https://s657g66h-7045.inc1.devtunnels.ms/api/users/reset-password",
        {
          email,
          otp: values.otp,
          newPassword: values.newPassword,
        }
      );

      if (res.data.success) {
        message.success("Password reset successfully");

        // ✅ Redirect to Login after 1.5 seconds
        setTimeout(() => {
          navigate("/login");
        }, 1500);

      } else {
        message.error(res.data.message);
      }

    } catch (err) {
      message.error(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Forgot Password</h2>

      {step === 1 && (
        <Form onFinish={handleSendOtp} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Enter email" },
              { type: "email", message: "Enter valid email" },
            ]}
          >
            <Input placeholder="Enter your registered email" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Send OTP
          </Button>
        </Form>
      )}

      {step === 2 && (
        <Form onFinish={handleResetPassword} layout="vertical">
          <Form.Item
            name="otp"
            label="Enter OTP"
            rules={[{ required: true, message: "Enter OTP" }]}
          >
            <Input placeholder="Enter OTP" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[{ required: true, message: "Enter new password" }]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Reset Password
          </Button>
        </Form>
      )}
    </div>
  );
}