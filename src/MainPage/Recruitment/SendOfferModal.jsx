import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Upload, Button, Alert, message } from 'antd';
import uploadIcon from '../../assets/iconsRecruitment/cloud.svg';
import deleteIcon from '../../assets/iconsRecruitment/deleteIcon.svg';

const SendOfferModal = ({ visible, onCancel, onSubmit, loading, candidate, offerStatus, existingOffer }) => {
  const [form] = Form.useForm();
  const [uploadedContract, setUploadedContract] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [hasExistingOffer, setHasExistingOffer] = useState(false);

  useEffect(() => {
    console.log("whats inside existing Offer",existingOffer)
    if (visible) {
      if (offerStatus === 'OFFERED') {
        setHasExistingOffer(true);
        form.setFieldsValue({
          title: existingOffer.title,
          description: existingOffer.description,
        });
      } else {
        setHasExistingOffer(false);
        form.resetFields();
      }
    }
  }, [existingOffer, visible, form]);

  const handleSubmit = async (values) => {
    try {
      if (!uploadedContract && !hasExistingOffer) {
        message.error('Please upload a contract file');
        return;
      }

      const formData = new FormData();
      formData.append('candidateId', candidate._id);
      formData.append('title', values.title);
      formData.append('description', values.description);
      if (uploadedContract) {
        formData.append('contract', uploadedContract);
      }

      // if (hasExistingOffer) {
      //   formData.append('isUpdate', true);
      // }

      await onSubmit(formData);
      message.success(hasExistingOffer ? 'Offer updated successfully' : 'Offer sent successfully');
      handleCancel();
    } catch (error) {
      console.error('Error in form submission:', error);
      message.error('Error submitting form');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setUploadedContract(null);
    setFileInfo(null);
    onCancel();
  };

  const handleFileUpload = (file) => {
    const isValidType = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.type);

    if (!isValidType) {
      message.error('Please upload a PDF or Word document');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB');
      return false;
    }

    setUploadedContract(file);
    setFileInfo({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    });

    return false;
  };

  return (
    <Modal
      title={hasExistingOffer ? "Update Offer" : "Send Offer"}
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="custom-modal"
    >
      {hasExistingOffer && (
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
        <div style={{ height: "20px", width: "100%", display: "flex", justifyContent: "center", borderTop: "1px solid #E2E8F0" }}></div>

        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter the Title' }]}
        >
          <Input placeholder="Enter Title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter the Description' }]}
        >
          <Input.TextArea
            placeholder="Enter Description"
            autoSize={{ minRows: 4, maxRows: 6 }}
          />
        </Form.Item>

        <Form.Item
          label="Contract"
          required
          // help="Supported formats: PDF, DOC, DOCX. Max size: 5MB"
        >
          <Upload.Dragger
            accept=".pdf,.doc,.docx"
            beforeUpload={handleFileUpload}
            showUploadList={false}
            maxCount={1}
          >
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img src={uploadIcon} style={{ height: "25px", width: "25px", marginRight: "10px" }} alt="upload" />
              <p>{hasExistingOffer ? 'Upload new contract or keep existing' : 'Drag and Drop your Files'}</p>
            </div>
          </Upload.Dragger>
        </Form.Item>

        {fileInfo && (
          <div className='pt-2 pb-2 ps-3 pe-3 mb-3' style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#cfd4d8",
            borderRadius: "8px"
          }}>
            <div style={{ display: "flex", flexDirection: 'column' }}>
              <span>{fileInfo.name}</span>
              <span style={{ marginTop: "6px" }}>{fileInfo.size}</span>
            </div>
            <img
              onClick={() => {
                setUploadedContract(null);
                setFileInfo(null);
              }}
              src={deleteIcon}
              style={{ height: '20px', width: "20px", cursor: "pointer" }}
              alt="delete"
            />
          </div>
        )}

        <div className="text-end mb-4 mt-4">
          <Button
            onClick={handleCancel}
            style={{
              marginRight: '12px',
              padding: '6px 24px',
              height: '40px',
              borderRadius: '20px',
              background: '#F8F9FA',
              border: 'none'
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              padding: '6px 24px',
              height: '40px',
              borderRadius: '20px',
              background: '#F4A261',
              border: 'none'
            }}
            loading={loading}
          >
            {hasExistingOffer ? 'Update Offer' : 'Send Offer'}
          </Button>
        </div>
      </Form>

      <style jsx>{`
        .custom-modal .ant-modal-header {
          border-bottom: none;
          padding: 24px 24px 0;
        }
        .custom-modal .ant-modal-title {
          font-size: 24px;
          font-weight: 600;
        }
        .custom-modal .ant-modal-close {
          background-color: #F8F9FA;
          border-radius: 50%;
          border: 1px solid #F8F9FA;
          margin: 16px 16px 0 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .custom-modal .ant-input {
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 16px;
          font-weight: 450;
        }
      `}</style>
    </Modal>
  );
};

export default SendOfferModal; 