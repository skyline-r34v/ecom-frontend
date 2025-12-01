import React from "react";
import { Modal, Form, Input, InputNumber, Button } from "antd";

export default function CreateProduct({ open, onClose, addProduct }) {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    addProduct(values);        // 👈 Sending product to parent
    form.resetFields();
  };

  return (
    <Modal
      title="Add Product"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="Product Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price"
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Create
        </Button>
      </Form>
    </Modal>
  );
}
