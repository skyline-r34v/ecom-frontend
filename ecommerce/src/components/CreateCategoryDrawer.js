import React from "react";
import { Drawer, Form, Input, Button } from "antd";

export default function CreateCategoryDrawer({ open, onClose, addCategory }) {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    addCategory(values.name);
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title="Create Category"
      placement="right"
      onClose={onClose}
      open={open}
      width={350}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Category Name"
          name="name"
          rules={[{ required: true, message: "Please enter a category name" }]}
        >
          <Input placeholder="Enter category" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Create
        </Button>
      </Form>
    </Drawer>
  );
}
