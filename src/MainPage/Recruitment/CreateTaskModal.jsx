import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Upload, Button, Select, Empty, message, InputNumber } from 'antd';
import { UploadOutlined, CloseOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed'
];

const CreateTaskModal = ({ visible, onCancel, onSubmit, candidate, authState }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchEmployees();
    }
  }, [visible]);

  const fetchEmployees = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Authentication required');
      return;
    }

    const roles = ["employee", "interviewer", "admin"];

    try {
      const response = await apiServices(
        "GET", 
        `user/all-employees?roles=${JSON.stringify(roles)}`, 
        null, 
        {
          access_token: {
            accessToken: token
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response?.data?.success === true) {
        const emps = response?.data?.data || [];
        const sortedData = emps
          .slice()
          .sort((a, b) => a.fullName.localeCompare(b.fullName));
        setEmployees(sortedData);
      } else {
        throw new Error(response?.data?.message || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error(
        error?.response?.data?.message || 
        error?.message || 
        'Error getting employees'
      );
    }
  };

  const validateFile = (file) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      message.error('File size should not exceed 10MB');
      return false;
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      message.error('Only PDF, DOC, DOCX, and ZIP files are allowed');
      return false;
    }

    return true;
  };

  const handleSubmit = async (values) => {
    try {
      await form.validateFields();
      onSubmit(values);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title="Create a Task"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      closeIcon={<CloseOutlined style={{ color: '#333' }} />}
      className="custom-modal task-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          candidateName: `${candidate?.firstName} ${candidate?.lastName}`,
          candidateEmail: candidate?.email
        }}
      >
        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="candidateName"
              label={<>Candidate Name <span className="text-danger">*</span></>}
              rules={[{ required: true, message: 'Please enter candidate name' }]}
            >
              <Input placeholder="Enter Name" disabled />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="candidateEmail"
              label={<>Candidate Email <span className="text-danger">*</span></>}
              rules={[{ required: true, message: 'Please enter candidate email' }]}
            >
              <Input placeholder="Enter Email" disabled />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="taskName"
              label={<>Task Name <span className="text-danger">*</span></>}
              rules={[{ required: true, message: 'Please enter task name' }]}
            >
              <Input placeholder="Enter Task Name" />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="taskFile"
              label="Task File"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e;
                }
                return e?.fileList || [];
              }}
            >
              <Upload
                maxCount={1}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={(file) => {
                  const isValid = validateFile(file);
                  if (!isValid) {
                    return false;
                  }
                  return false; // Return false to prevent auto upload
                }}
              >
                <div className="upload-box">
                  <span className="choose-text">Choose File</span>
                  {fileList[0]?.name && <span className="file-name">{fileList[0].name}</span>}
                </div>
              </Upload>
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="taskReviewer"
              label={<>Task Reviewer <span className="text-danger">*</span></>}
              rules={[{ required: true, message: 'Please select task reviewer' }]}
            >
              <Select
                mode="multiple"
                showSearch
                filterOption={(input, option) => 
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                optionFilterProp="children"
                notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                placeholder="Select Reviewer"
                className="customselect-height custom-select"
              >
                {employees?.map((employee) => (
                  <Select.Option
                    key={employee._id}
                    value={employee._id}
                  >
                    {employee.fullName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="lastDateOfSubmission"
              label={<>Last Date of Submission <span className="text-danger">*</span></>}
              rules={[{ required: true, message: 'Please select submission date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Select Date"
                format="DD-MM-YYYY"
              />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="taskDuration"
              label={<>Task Duration <span className="text-danger">*</span></>}
              rules={[
                { required: true, message: 'Please enter task duration' },
                { 
                  validator: async (_, value) => {
                    if (value && value < 1) {
                      return Promise.reject('Duration must be at least 1 day');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber 
                placeholder="Number of Days"
                style={{ width: '100%' }}
                min={1}
                precision={0}
                parser={value => parseInt(value || '0', 10)}
                formatter={value => `${value}`}
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          name="interviewLink"
          label={<>Interview Link <span className="text-danger">*</span></>}
          rules={[{ required: true, message: 'Please enter interview link' }]}
        >
          <Input.TextArea 
            placeholder="Enter Description"
            autoSize={{ minRows: 4, maxRows: 6 }}
          />
        </Form.Item>

        <div className="text-end mt-4">
          <Button 
            onClick={handleCancel}
            style={{ 
              marginRight: 12,
              padding: '6px 24px',
              height: '40px',
              borderRadius: '20px',
              background: '#F8F9FA',
              border: 'none'
            }}
          >
            Reset
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
          >
            Create Task
          </Button>
        </div>
      </Form>

      <style jsx>{`
        .task-modal .ant-modal-header {
          border-bottom: none;
          padding: 24px 24px 0;
        }
        
        .task-modal .ant-modal-title {
          font-size: 24px;
          font-weight: 600;
        }
        
        .task-modal .ant-form-item-label > label {
          font-weight: 500;
        }
        
        .task-modal .ant-input,
        .task-modal .ant-select-selector,
        .task-modal .ant-picker {
          border-radius: 8px;
          padding: 8px 12px;
          height: 40px;
        }
        
        .task-modal .ant-select-selection-placeholder,
        .task-modal .ant-input::placeholder {
          color: #6C757D;
        }
        
        .upload-box {
          border: 1px dashed #d9d9d9;
          border-radius: 8px;
          padding: 8px 12px;
          height: 40px;
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .upload-box:hover {
          border-color: #F4A261;
        }
        
        .choose-text {
          color: #6C757D;
        }
        
        .file-name {
          margin-left: 12px;
          color: #333;
        }
        
        .ant-upload-list {
          display: none;
        }
        
        .customselect-height .ant-select-selection-search-input {
          height: 32px !important;
        }
        
        .custom-select .ant-select-selector {
          height: 40px !important;
          padding: 4px 11px !important;
        }
        
        .custom-select .ant-select-selection-placeholder,
        .custom-select .ant-select-selection-item {
          line-height: 32px !important;
        }
      `}</style>
    </Modal>
  );
};

export default CreateTaskModal; 