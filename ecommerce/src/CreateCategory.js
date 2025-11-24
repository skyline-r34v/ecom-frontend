import React, { useState } from "react";
import { Drawer, Button, Form, Input, message } from "antd";
import api from "./api.js";   // <-- use the helper instead of axios

const { TextArea } = Input;

export default function CreateCategoryDrawer({ open, onClose, refreshList }) {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description || "",
        image: values.image || "",
      };

      // 🔥 token will be auto-added from interceptor
      await api.post("/categories/create", payload);

      message.success("Category Created Successfully!");

      onClose();
      refreshList();
    } catch (error) {
      console.log(error.response?.data || error);
      message.error("Failed to create category. Check API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="Create New Category"
      placement="right"
      onClose={onClose}
      open={open}
      width={380}
    >
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Category Name" />
        </Form.Item>

        <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
          <Input placeholder="slug-example" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={3} placeholder="Category description" />
        </Form.Item>

        <Form.Item label="Image URL" name="image">
          <Input placeholder="https://example.com/image.png" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading} block>
          Create Category
        </Button>
      </Form>
    </Drawer>
  );
}
