import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Upload, Button, Row, Col, Alert, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import moment from 'moment';

const SendOfferModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  loading,
  candidate,
  existingOffer 
}) => {
  const [form] = Form.useForm();
  const [uploadedContract, setUploadedContract] = useState(null);

  // Set initial values when existing offer is present
  useEffect(() => {
    if (existingOffer && visible) {
      form.setFieldsValue({
        salary: existingOffer.salary,
        currency: existingOffer.currency,
        joiningDate: moment(existingOffer.joiningDate)
      });
    }
  }, [existingOffer, visible, form]);

  const handleCancel = () => {
    form.resetFields();
    setUploadedContract(null);
    onCancel();
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    
    // Append form fields to FormData
    formData.append('candidateId', candidate._id);
    formData.append('salary', Number(values.salary)); // Convert to number
    formData.append('currency', values.currency);
    formData.append('joiningDate', values.joiningDate.format('YYYY-MM-DD'));
    
    // Only append contract if one is uploaded or exists
    if (uploadedContract) {
      formData.append('contract', uploadedContract);
    }

    onSubmit(formData);
  };

  const handleContractUpload = ({ file }) => {
    if (file.status === 'done' || file.status === 'uploading') {
      setUploadedContract(file.originFileObj);
    }
  };

  // Validate file size and type
  const beforeUpload = (file) => {
    const isValidType = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.type);
    
    if (!isValidType) {
      message.error('You can only upload PDF or Word documents!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB!');
      return false;
    }

    return false; // Return false to prevent auto upload
  };

  return (
    <Modal
      title={existingOffer ? "Update Offer" : "Send Offer"}
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="offer-modal"
    >
      {existingOffer && (
        <Alert
          message="Updating Existing Offer"
          description="You are updating an existing offer. The candidate will be notified of these changes."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="salary"
              label="Salary"
              rules={[
                { required: true, message: 'Please enter salary' },
                { validator: (_, value) => value > 0 ? Promise.resolve() : Promise.reject('Salary must be greater than 0') }
              ]}
            >
              <Input type="number" placeholder="Enter salary amount" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="currency"
              label="Currency"
              rules={[{ required: true, message: 'Please select currency' }]}
              initialValue="PKR"
            >
              <Select>
                <Select.Option value="PKR">PKR</Select.Option>
                <Select.Option value="USD">USD</Select.Option>
                <Select.Option value="EUR">EUR</Select.Option>
                <Select.Option value="GBP">GBP</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="joiningDate"
          label="Joining Date"
          rules={[{ required: true, message: 'Please select joining date' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="DD-MM-YYYY"
            disabledDate={(current) => current && current < moment().startOf('day')}
          />
        </Form.Item>

        <Form.Item
          name="contract"
          label={
            <span>
              Contract Document <span style={{ color: '#888' }}>(Optional)</span>
            </span>
          }
          extra="Supported formats: PDF, DOC, DOCX. Max file size: 5MB"
        >
          <Upload.Dragger
            name="contract"
            maxCount={1}
            accept=".pdf,.doc,.docx"
            onChange={handleContractUpload}
            beforeUpload={beforeUpload}
            showUploadList={{ showRemoveIcon: true }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag contract document to upload</p>
            <p className="ant-upload-hint">
              {existingOffer ? 'Upload new contract or keep existing' : 'Upload contract document (optional)'}
            </p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item className="mb-0">
          <div style={{ textAlign: 'right' }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
            >
              {existingOffer ? 'Update Offer' : 'Send Offer'}
            </Button>
          </div>
        </Form.Item>
      </Form>

      <style jsx>{`
        :global(.offer-modal .ant-modal-content) {
          border-radius: 8px;
          overflow: hidden;
        }

        :global(.offer-modal .ant-modal-header) {
          padding: 20px 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        :global(.offer-modal .ant-modal-body) {
          padding: 24px;
        }

        :global(.offer-modal .ant-form-item-label > label) {
          font-weight: 500;
        }

        :global(.offer-modal .ant-input),
        :global(.offer-modal .ant-select-selector),
        :global(.offer-modal .ant-picker) {
          border-radius: 4px;
          border-color: #e3e3e3;
        }

        :global(.offer-modal .ant-input:hover),
        :global(.offer-modal .ant-select-selector:hover),
        :global(.offer-modal .ant-picker:hover) {
          border-color: #ff9b44;
        }

        :global(.offer-modal .ant-input:focus),
        :global(.offer-modal .ant-select-selector:focus),
        :global(.offer-modal .ant-picker-focused) {
          border-color: #ff9b44;
          box-shadow: 0 0 0 2px rgba(255, 155, 68, 0.2);
        }

        :global(.offer-modal .ant-upload-drag) {
          border: 2px dashed #e3e3e3;
          border-radius: 4px;
          background: #fafafa;
          transition: all 0.3s;
        }

        :global(.offer-modal .ant-upload-drag:hover) {
          border-color: #ff9b44;
        }

        :global(.offer-modal .ant-upload-drag-icon) {
          color: #ff9b44;
          font-size: 48px;
          margin-bottom: 16px;
        }

        :global(.offer-modal .ant-upload-text) {
          color: #666;
          font-size: 16px;
          margin-bottom: 8px;
        }

        :global(.offer-modal .ant-upload-hint) {
          color: #999;
        }

        :global(.offer-modal .ant-btn-primary) {
          background: #ff9b44;
          border-color: #ff9b44;
        }

        :global(.offer-modal .ant-btn-primary:hover) {
          background: #ff8629;
          border-color: #ff8629;
        }
      `}</style>
    </Modal>
  );
};

export default SendOfferModal; 