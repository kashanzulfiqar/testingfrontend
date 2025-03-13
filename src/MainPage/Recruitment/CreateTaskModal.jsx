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

const CreateTaskModal = ({ isVisible, onCancel, onSubmit, candidate, authState }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (isVisible) {
      fetchEmployees();
    }
  }, [isVisible]);

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

  const handleFinish = (values) => {
    console.log('Form submitted with values:', values); // Debug log
    onSubmit(values); // Call the onSubmit function passed as a prop
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title="Create a Task"
      visible={isVisible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className="custom-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          candidateName: candidate ? `${candidate?.firstName} ${candidate?.lastName}` : '',
          candidateEmail: candidate ? candidate.email : '',
        }}
      >
        <div className="row">
        <div style={{height:"20px", width:"100%", display:"flex", justifyContent:"center", borderTop:"1px solid #E2E8F0"}}></div>
          <div className="col-md-6">
            <Form.Item
              name="candidateName"
              label={<>Candidate Name <span className="text-danger">*</span></>}
              rules={[{ required: true, message: 'Please enter candidate name' }]}
            >
              <Input placeholder="Enter Name" />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="candidateEmail"
              label={<>Candidate Email <span className="text-danger">*</span></>}
              rules={[{ required: true, message: 'Please enter candidate email' }]}
            >
              <Input placeholder="Enter Email"/>
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
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList || [])}
            >
              <Upload
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={(file) => {
                if (!validateFile(file)) {
                  return false;
                }
                return false; // Prevent auto upload
              }}
              showUploadList={false} // Hide default Ant Design file list
              >
                <div className="custom-upload">
                  <button type="button" className="upload-button">Choose File</button>
                  <input
                  type="text"
                  value={fileList[0]?.name || ""}
                  placeholder="No file chosen"
                  readOnly
                  className="file-input"
                  />
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
                className='custom-datepicker'
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

        {/* <Form.Item
          name="interviewLink"
          label={<>Interview Link <span className="text-danger">*</span></>}
          rules={[{ required: true, message: 'Please enter interview link' }]}
        >
          <Input.TextArea 
            placeholder="Enter Description"
            autoSize={{ minRows: 4, maxRows: 6 }}
          />
        </Form.Item> */}

        <div className="text-end mt-4 pt-2 pb-4">
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

      <style jsx global>{`
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
          border:"1px solid #F8F9FA";
          margin:16px 16px 0 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .custom-modal .ant-input,
        .custom-modal .ant-select-selector,
        .custom-modal .ant-input-number {
          border-radius: 8px;
          padding: 8px 12px;
          height: 56px;
          font-size: 16px;
          font-weight: 450;
        }
        .custom-timepicker, .custom-datepicker{
          border-radius: 8px;
          padding: 8px 12px;
          height: 56px;
          font-size: 16px;
          font-weight: 450;
        }

        .customized .ant-select-selector{
        height: 56px !important;
        border-radius: 8px !important;
        display: flex;
        align-items: center;
        padding-left: 10px;
        }

        .custom-tag{
        height: 35px !important;
        display: flex;
        align-items: center;
        width: 110px !important;
        }

        .add-candidate-btn{
          border-radius: 40px !important;
          height: 44px !important;
          background-color: #ff9244 !important;
          color: white !important;
          font-weight: 500 !important;
          font-size: 16px !important;
          border: 2px solid #ff9244 !important;
          width: 185px !important;
        }
        
        .btn-content{
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .custom-upload {
          display: flex;
          align-items: center;
          border: 1px solid #ccc;
          border-radius: 5px;
          overflow: hidden;
          height: 55px;
          width: 364px;
        }

        .file-input {
          flex-grow: 1;
          padding: 8px;
          border: none;
          outline: none;
          background: white;
          height: 100%;
        }

        .upload-button {
          padding: 8px 12px;
          background: #f7f7f8;
          color: #a5adb6;
          border: none;
          cursor: pointer;
          height: 100%;
        }

      `}</style>
    </Modal>
  );
};

export default CreateTaskModal; 